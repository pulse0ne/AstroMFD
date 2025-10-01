mod logging;
mod state;
mod ws;
mod mobile_assets;
mod fonts;
mod vjoystick;
mod journal;
mod widget;
mod locations;

use std::fs;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use local_ip_address::local_ip;
use log::{debug, error, info};
use tauri::{AppHandle, Emitter};
use tauri::ipc::Response;
use tokio::sync::Mutex;
use crate::journal::Journal;
use crate::state::{AppState, MobileEvent, ServerEvent};
use crate::vjoystick::vjoy_worker;
use crate::widget::screen_set::{ScreenSize, ScreenSet, Screen};

#[tauri::command]
async fn get_mobile_client_server_address() -> String {
    local_ip().unwrap().to_string()
}

#[tauri::command]
async fn list_system_fonts() -> Vec<fonts::FontSpec> {
    fonts::list_fonts()
}

#[tauri::command]
async fn get_screen_set_by_id(id: String) -> Result<ScreenSet, String> {
    debug!("loading screen set {}", id);
    let screen_set = ScreenSet {
        id,
        name: "Test".to_string(),
        screens: vec!(
            Screen {
                id: "123".to_string(),
                name: "TestScreen".to_string(),
                background_color: "black".to_string(),
                widgets: vec![],
            }
        ),
        size: ScreenSize { width: 1200, height: 800 }
    };
    Ok(screen_set)
}

#[tauri::command]
async fn save_screen_img(id: String, data: Vec<u8>, app_handle: AppHandle) -> Result<(), String> {
    debug!("saving screen img for {}", id);
    let file_path = dirs::data_local_dir()
        .unwrap_or_default()
        .join("elite-control")
        .join("thumbs")
        .join(format!("{}.png", id));
    if let Err(e) = fs::write(file_path, data) {
        return Err(e.to_string());
    };
    if let Err(e) = app_handle.emit("screen-image-updated", id) {
        return Err(e.to_string());
    };
    Ok(())
}

#[tauri::command]
async fn get_screen_img(id: String) -> Result<Response, String> {
    debug!("loading screen img for {}", id);
    let file_path = dirs::data_local_dir()
        .unwrap_or_default()
        .join("elite-control")
        .join("thumbs")
        .join(format!("{}.png", id));
    match fs::read(file_path) {
        Ok(data) => {
            Ok(Response::new(data))
        }
        Err(e) => {
            Err(e.to_string())
        }
    }
}

// TODO: command for handling fetching of screen images (singular and all)

pub async fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(
            tauri::generate_handler![
                get_mobile_client_server_address,
                list_system_fonts,
                get_screen_set_by_id,
                save_screen_img,
                get_screen_img
            ])
        .setup(move |app| {
            locations::initialize();
            
            let (mobile_tx, mobile_rx) = tokio::sync::mpsc::channel::<MobileEvent>(32);
            let (server_tx, _) = tokio::sync::broadcast::channel::<ServerEvent>(32);

            let app_handle = app.handle();

            logging::setup_logging(app_handle.clone());

            // TODO: find a good way of getting this from config or UI
            let journal = Arc::new(Mutex::new(Journal::new("../../")));

            let state = AppState {
                mobile_tx,
                server_tx: server_tx.clone(),
                app_handle: app_handle.clone(),
                mobile_clients: Arc::new(Mutex::new(vec![])),
                journal: journal.clone(),
            };

            let (tx, mut rx) = tokio::sync::mpsc::channel(100);
            tokio::spawn({
                let journal = journal.clone();
                let server_tx = server_tx.clone();
                async move {
                    if let Err(e) = journal::watch_journal(journal, tx).await {
                        error!("Failed to watch journal: {}", e);
                    };

                    while let Some(entries) = rx.recv().await {
                        info!("Got new entries: {:?}", entries);
                        let _ = server_tx.send(ServerEvent::NewJournalEntries { entries });
                    }
                }
            });

            tokio::spawn(vjoy_worker(mobile_rx, server_tx.clone()));
            
            tokio::spawn(async move {
                let app = axum::Router::new()
                    .route("/ws", axum::routing::get(ws::ws_handler))
                    .route("/fonts/{font}", axum::routing::get(mobile_assets::font_handler))
                    .fallback(axum::routing::get(mobile_assets::static_handler))
                    .with_state(state);

                info!("Serving mobile client on http://0.0.0.0:11011/");
                let listener = TcpListener::bind("0.0.0.0:11011").await.unwrap();
                axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await.unwrap();
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
