mod logging;
mod state;
mod ws;
mod mobile_assets;
mod fonts;
mod input;
mod journal;
mod widget;
mod locations;
mod commands;

use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::net::TcpListener;
use log::info;
use tauri::Manager;
use tokio::sync::Mutex;
use crate::state::{AppState, MobileEvent, ServerEvent};
use crate::input::input_worker;
use crate::journal::{JournalHandle, detect_elite_dangerous_journal_path};

pub async fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(commands::command_handlers())
        .setup(move |app| {
            locations::initialize();

            let (mobile_tx, mobile_rx) = tokio::sync::mpsc::channel::<MobileEvent>(32);
            let (server_tx, _) = tokio::sync::broadcast::channel::<ServerEvent>(32);

            let app_handle = app.handle();

            logging::setup_logging(app_handle.clone());

            // TODO: load settings first to get journal settings

            let state = AppState {
                mobile_tx,
                server_tx: server_tx.clone(),
                app_handle: app_handle.clone(),
                mobile_clients: Arc::new(Mutex::new(vec![])),
                journal: Arc::new(Mutex::new(None)),
            };

            app.manage(state);

            let state_clone = app.state::<AppState>().inner().clone();

            // Try to auto-start journal watching if we can detect the path
            {
                let journal_state = state_clone.clone();
                tokio::spawn(async move {
                    if let Some(journal_path) = detect_elite_dangerous_journal_path() {
                        info!("Auto-detected Elite Dangerous journal path, starting watcher...");
                        match JournalHandle::start(PathBuf::from(journal_path), journal_state.server_tx.clone()).await {
                            Ok(handle) => {
                                *journal_state.journal.lock().await = Some(handle);
                                info!("Journal watcher started successfully");
                            }
                            Err(e) => {
                                info!("Failed to start journal watcher: {}", e);
                            }
                        }
                    } else {
                        info!("Could not auto-detect Elite Dangerous journal path");
                    }
                });
            }

            tokio::spawn(input_worker(mobile_rx, server_tx.clone()));

            tokio::spawn(async move {
                let app = axum::Router::new()
                    .route("/ws", axum::routing::get(ws::ws_handler))
                    .route("/audio", axum::routing::get(mobile_assets::list_audio_clips))
                    .route("/audio/{source}/{sound}", axum::routing::get(mobile_assets::audio_handler))
                    .route("/fonts/{font}", axum::routing::get(mobile_assets::font_handler))
                    .route("/screen-sets", axum::routing::get(mobile_assets::screen_set_handler))
                    .fallback(axum::routing::get(mobile_assets::static_handler))
                    .with_state(state_clone);

                info!("Serving mobile client on http://0.0.0.0:11011/");
                let listener = TcpListener::bind("0.0.0.0:11011").await.unwrap();
                axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await.unwrap();
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
