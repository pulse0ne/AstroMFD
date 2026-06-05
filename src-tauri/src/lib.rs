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
mod settings;

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
use crate::settings::Settings;

pub async fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(commands::command_handlers());

    #[cfg(feature = "updater")]
    {
        builder = builder
            .plugin(tauri_plugin_process::init())
            .plugin(tauri_plugin_updater::Builder::new().build());
    }

    builder
        .setup(move |app| {
            locations::initialize();

            let settings = Settings::load();
            let port = settings.port;
            let vjoy_device_id = settings.vjoy_device_id;

            let (mobile_tx, mobile_rx) = tokio::sync::mpsc::channel::<MobileEvent>(32);
            let (server_tx, _) = tokio::sync::broadcast::channel::<ServerEvent>(32);

            let app_handle = app.handle();

            logging::setup_logging(app_handle.clone());

            let state = AppState {
                mobile_tx,
                server_tx: server_tx.clone(),
                app_handle: app_handle.clone(),
                mobile_clients: Arc::new(Mutex::new(vec![])),
                journal: Arc::new(Mutex::new(None)),
                port,
            };

            app.manage(state);

            let state_clone = app.state::<AppState>().inner().clone();

            // Start journal watching using configured path or auto-detect
            {
                let journal_state = state_clone.clone();
                let journal_path_setting = settings.journal_path.clone();
                tokio::spawn(async move {
                    let journal_path = journal_path_setting.or_else(|| detect_elite_dangerous_journal_path());
                    if let Some(path) = journal_path {
                        info!("Starting journal watcher at: {}", path);
                        match JournalHandle::start(PathBuf::from(path), journal_state.server_tx.clone()).await {
                            Ok(handle) => {
                                *journal_state.journal.lock().await = Some(handle);
                                info!("Journal watcher started successfully");
                            }
                            Err(e) => {
                                info!("Failed to start journal watcher: {}", e);
                            }
                        }
                    } else {
                        info!("No journal path configured and could not auto-detect");
                    }
                });
            }

            tokio::spawn(input_worker(mobile_rx, server_tx.clone(), vjoy_device_id));

            tokio::spawn(async move {
                let app = axum::Router::new()
                    .route("/ws", axum::routing::get(ws::ws_handler))
                    .route("/audio/{screen_set_id}", axum::routing::get(mobile_assets::list_audio_clips))
                    .route("/audio/{screen_set_id}/{source}/{sound}", axum::routing::get(mobile_assets::audio_handler))
                    .route("/images/{screen_set_id}/{file}", axum::routing::get(mobile_assets::image_handler))
                    .route("/screen-sets", axum::routing::get(mobile_assets::screen_set_handler))
                    .fallback(axum::routing::get(mobile_assets::static_handler))
                    .with_state(state_clone);

                let addr = format!("0.0.0.0:{}", port);
                let listener = match TcpListener::bind(&addr).await {
                    Ok(l) => l,
                    Err(e) => {
                        log::error!("Failed to bind to {}: {}", addr, e);
                        return;
                    }
                };
                info!("Serving mobile client on http://{}/", addr);
                if let Err(e) = axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await {
                    log::error!("Server error: {}", e);
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
