mod logging;
mod state;
mod ws;
mod mobile_assets;
mod fonts;
mod vjoystick;
mod journal;
mod widget;
mod locations;
mod commands;

use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use log::info;
use tokio::sync::Mutex;
use crate::state::{AppState, MobileEvent, ServerEvent};
use crate::vjoystick::vjoy_worker;

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
