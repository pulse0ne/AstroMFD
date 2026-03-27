mod bounded_fifo_vec;
mod status;

use crate::journal::bounded_fifo_vec::BoundedFifoVec;
use crate::state::ServerEvent;
use anyhow::Result;
use log::{debug, error, info, trace};
use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use regex::Regex;
use std::fs::File;
use std::io::{BufRead, BufReader, Error};
use std::path::{Path, PathBuf};
use std::sync::mpsc as std_mpsc;
use std::sync::{Arc, LazyLock};
use tokio::sync::mpsc::Sender;
use tokio::sync::{broadcast, Mutex};

static JOURNAL_RE: LazyLock<Regex, fn() -> Regex> =
    LazyLock::new(|| Regex::new(r#"Journal\.\d{4}-\d{2}-\d{2}T\d+?\.\d+?\.log"#).unwrap());

pub struct JournalHandle {
    pub(crate) journal: Arc<Mutex<Journal>>,
    pub(crate) watcher: Option<RecommendedWatcher>,
}

impl JournalHandle {
    pub async fn start(dir: PathBuf, server_tx: broadcast::Sender<ServerEvent>) -> Result<Self> {
        let journal = Arc::new(Mutex::new(Journal::new(dir)));

        // Tokio mpsc channel
        let (tx, mut rx) = tokio::sync::mpsc::channel::<Vec<String>>(100);

        // Start watching journal
        let watcher = watch_journal(journal.clone(), tx.clone()).await?;

        // Forward entries from mpsc::Receiver -> broadcast::Sender
        tokio::spawn({
            let server_tx = server_tx.clone();
            async move {
                while let Some(entries) = rx.recv().await {
                    let _ = server_tx.send(ServerEvent::NewJournalEntries { entries });
                }
            }
        });

        Ok(Self {
            journal,
            watcher: Some(watcher),
        })
    }

    pub fn stop(&mut self) {
        self.watcher = None; // dropping watcher stops notify
    }
}

#[derive(Clone)]
pub struct Journal {
    journal_dir_path: PathBuf,
    journal_path: Option<PathBuf>,
    offset: usize,
    log: BoundedFifoVec<String>,
}

impl Journal {
    pub fn new<P: Into<PathBuf>>(journal_dir_path: P) -> Self {
        let mut journal = Journal {
            journal_dir_path: journal_dir_path.into(),
            journal_path: None,
            offset: 0,
            log: BoundedFifoVec::new(512),
        };
        journal.preread();
        journal
    }

    // TODO: handle change of dir

    pub fn change_path<P: Into<PathBuf>>(&mut self, journal_path: P) {
        self.journal_path = Some(journal_path.into());
        self.offset = 0;
    }

    pub fn preread(&mut self) {
        self.log.clear();
        self.offset = 0;
        if self.journal_path.is_some() {
            self.read();
        }
    }

    pub fn read(&mut self) -> Vec<String> {
        if let Some(journal_path) = &self.journal_path {
            if let Ok(entries) = read_journal(&journal_path, self.offset) {
                self.offset += entries.len();
                self.log.push_all(entries.clone());
                entries
            } else {
                vec![]
            }
        } else {
            vec![]
        }
    }

    pub fn entries(&self) -> Vec<String> {
        self.log.snapshot()
    }
}

// pub async fn watch_journal(
//     journal: Arc<Mutex<Journal>>,
//     tx: Sender<Vec<String>>,
// ) -> Result<RecommendedWatcher> {
//     let journal_dir_path = journal.lock().await.journal_dir_path.clone();
//     info!("watching journal dir: {}", journal_dir_path.display());
//
//     let (sync_tx, sync_rx) = std_mpsc::channel::<PathBuf>();
//
//     {
//         let journal = Arc::clone(&journal);
//         let tx = tx.clone();
//         tokio::task::spawn_blocking(move || {
//             for changed_file_path in sync_rx.iter() {
//                 let journal = Arc::clone(&journal);
//                 let tx = tx.clone();
//
//                 tokio::spawn(async move {
//                     let journal = Arc::clone(&journal);
//                     let tx = tx.clone();
//                     tokio::spawn(async move {
//                         let mut journal = journal.lock().await;
//                         if let Some(current_journal) = &journal.journal_path {
//                             if *current_journal != changed_file_path {
//                                 journal.change_path(changed_file_path);
//                             }
//                             let entries = journal.read();
//                             if !entries.is_empty() {
//                                 let _ = tx.send(entries.clone()).await;
//                             }
//                         }
//                     });
//                 });
//             }
//         });
//     }
//
//     let mut watcher = notify::recommended_watcher(move |res: notify::Result<Event>| {
//         match res {
//             Ok(event) => {
//                 match event.kind {
//                     EventKind::Modify(_) | EventKind::Create(_) => {
//                         let mut relevant_paths = event.paths
//                             .into_iter()
//                             .filter(|path| {
//                                 path.file_name()
//                                     .map_or(false, |name| JOURNAL_RE.is_match(name.to_str().unwrap()))
//                             })
//                             .collect::<Vec<PathBuf>>();
//                         if !relevant_paths.is_empty() {
//                             relevant_paths.sort_by(|a, b| b.file_name().cmp(&a.file_name()));
//                             let most_recent_journal = relevant_paths.first().unwrap();
//                             let _ = sync_tx.send(most_recent_journal.clone());
//                         }
//                     },
//                     _ => {
//                         trace!("got a file change we don't care about: {:?}", event);
//                     }
//                 }
//             }
//             Err(e) => error!("watch error: {:?}", e),
//         }
//     })?;
//
//     watcher.watch(&journal_dir_path, RecursiveMode::NonRecursive)?;
//     Ok(watcher)
// }

pub async fn watch_journal(
    journal: Arc<Mutex<Journal>>,
    tx: Sender<Vec<String>>,
) -> Result<RecommendedWatcher> {
    let journal_dir_path = journal.lock().await.journal_dir_path.clone();
    info!("watching journal dir: {}", journal_dir_path.display());

    let (sync_tx, sync_rx) = std_mpsc::channel::<PathBuf>();

    // Spawn a single async task to process file change events
    let journal_clone = Arc::clone(&journal);
    let tx_clone = tx.clone();
    tokio::spawn(async move {
        while let Ok(changed_file_path) = sync_rx.recv() {
            let mut journal = journal_clone.lock().await;

            // If new file is different, reset offset + switch
            if journal
                .journal_path
                .as_ref()
                .map(|p| p != &changed_file_path)
                .unwrap_or(true)
            {
                journal.change_path(changed_file_path);
            }

            let entries = journal.read();
            if !entries.is_empty() {
                if let Err(e) = tx_clone.send(entries.clone()).await {
                    error!("failed to forward journal entries: {}", e);
                }
            }
        }
    });

    // Create notify watcher
    let mut watcher = notify::recommended_watcher(move |res: notify::Result<Event>| {
        match res {
            Ok(event) => {
                if matches!(event.kind, EventKind::Modify(_) | EventKind::Create(_)) {
                    let mut relevant_paths: Vec<PathBuf> = event
                        .paths
                        .into_iter()
                        .filter(|path| {
                            path.file_name()
                                .and_then(|name| name.to_str())
                                .map_or(false, |name| JOURNAL_RE.is_match(name))
                        })
                        .collect();

                    if !relevant_paths.is_empty() {
                        // sort newest first
                        relevant_paths.sort_by(|a, b| b.file_name().cmp(&a.file_name()));
                        let most_recent = relevant_paths.first().unwrap().clone();
                        let _ = sync_tx.send(most_recent);
                    }
                } else {
                    trace!("ignoring file event: {:?}", event.kind);
                }
            }
            Err(e) => error!("watch error: {:?}", e),
        }
    })?;

    watcher.watch(&journal_dir_path, RecursiveMode::NonRecursive)?;
    Ok(watcher)
}

fn read_journal(path: &Path, seek_lines: usize) -> Result<Vec<String>, Error> {
    let journal_handle = File::open(path)?;
    let newlines = BufReader::new(journal_handle)
        .lines()
        .skip(seek_lines)
        .filter_map(Result::ok)
        .map(|line| line.trim().to_string())
        .filter(|line| !line.is_empty())
        .collect();
    Ok(newlines)
}

#[test]
fn test_read_journal() {
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    let journal_path = Path::new(manifest_dir).join("tests/fixtures/journal.log");

    let raw_lines_count = BufReader::new(File::open(&journal_path).unwrap())
        .lines()
        .count();

    let journal = read_journal(&journal_path, 0).unwrap();
    assert_eq!(journal.len(), raw_lines_count);

    let journal2 = read_journal(&journal_path, 1).unwrap();
    assert_eq!(journal2.len(), raw_lines_count - 1);
}

/// Attempts to detect the Elite Dangerous journal path for the current platform
pub fn detect_elite_dangerous_journal_path() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        // Windows: C:\Users\<username>\Saved Games\Frontier Developments\Elite Dangerous\
        if let Some(user_profile) = std::env::var_os("USERPROFILE") {
            let path = PathBuf::from(user_profile)
                .join("Saved Games")
                .join("Frontier Developments")
                .join("Elite Dangerous");

            if path.exists() {
                debug!(
                    "Found Elite Dangerous journal path (Windows): {}",
                    path.display()
                );
                return path.to_str().map(|s| s.to_string());
            }
        }
        debug!("Could not find Elite Dangerous journal path on Windows");
        None
    }

    #[cfg(target_os = "linux")]
    {
        // Linux (Proton): ~/.local/share/Steam/steamapps/compatdata/359320/pfx/drive_c/users/steamuser/Saved Games/Frontier Developments/Elite Dangerous/
        if let Some(home) = std::env::var_os("HOME") {
            let proton_path = PathBuf::from(&home)
                .join(".local/share/Steam/steamapps/compatdata/359320/pfx/drive_c/users/steamuser/Saved Games/Frontier Developments/Elite Dangerous");

            if proton_path.exists() {
                debug!(
                    "Found Elite Dangerous journal path (Linux/Proton): {}",
                    proton_path.display()
                );
                return proton_path.to_str().map(|s| s.to_string());
            }

            // Alternative: Try ~/.steam/steam instead of ~/.local/share/Steam
            let alt_path = PathBuf::from(&home)
                .join(".steam/steam/steamapps/compatdata/359320/pfx/drive_c/users/steamuser/Saved Games/Frontier Developments/Elite Dangerous");

            if alt_path.exists() {
                debug!(
                    "Found Elite Dangerous journal path (Linux/Proton alt): {}",
                    alt_path.display()
                );
                return alt_path.to_str().map(|s| s.to_string());
            }
        }
        debug!("Could not find Elite Dangerous journal path on Linux");
        None
    }

    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    {
        None
    }
}
