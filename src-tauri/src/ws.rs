use std::net::{IpAddr, SocketAddr};
use axum::extract::{ConnectInfo, State, WebSocketUpgrade};
use axum::extract::ws::{Message, WebSocket};
use axum::response::IntoResponse;
use futures_util::{SinkExt, StreamExt};
use log::{debug, info};
use serde::Serialize;
use tauri::Emitter;
use crate::state::{AppState, MobileClient, MobileEvent, ServerEvent};

#[derive(Serialize, Clone)]
struct DeviceList {
    devices: Vec<MobileClient>,
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state, addr.ip()))
}

async fn handle_socket(
    socket: WebSocket,
    state: AppState,
    addr: IpAddr,
) {
    debug!("New connection attempt from {}", addr);

    {
        let mut clients = state.mobile_clients.lock().await;
        clients.push(MobileClient { ip_addr: addr, viewport_width: 0, viewport_height: 0, device_type: "other".to_string() });
        let _ = state.app_handle.emit("clients-updated-event", DeviceList { devices: clients.clone() });
        info!("Accepted new websocket connection: {:?} ({} total connections)", addr, clients.clone().len());
    }

    let (mut tx, mut rx) = socket.split();

    {
        let journal = state.journal.lock().await;
        if let Some(journal_handle) = &*journal {
            let entries = journal_handle.journal.lock().await.entries();
            let msg = ServerEvent::AllJournalEntries { entries };
            if let Ok(payload) = serde_json::to_string(&msg) {
                let _ = tx.send(Message::Text(axum::extract::ws::Utf8Bytes::from(payload))).await;
            }
        }
    }

    let mut sub = state.server_tx.subscribe();

    let mut sender = tokio::spawn(async move {
        while let Ok(evt) = sub.recv().await {
            if let Ok(txt) = serde_json::to_string(&evt) {
                if tx.send(Message::Text(axum::extract::ws::Utf8Bytes::from(txt))).await.is_err() {
                    // Client disconnected
                    break;
                }
            }
        }
    });

    let state_clone = state.clone();
    let mut receiver = tokio::spawn(async move {
        while let Some(Ok(msg)) = rx.next().await {
            if let Message::Text(txt) = msg {
                if let Ok(evt) = serde_json::from_str::<MobileEvent>(&txt) {
                    match evt {
                        MobileEvent::ClientReport { width, height, device } => {
                            info!("Got clientReport from {:?}: {}x{} ({})", addr, width, height, device);
                            let mut clients = state_clone.mobile_clients.lock().await;
                            if let Some(client) = clients.iter_mut().find(|c| c.ip_addr == addr) {
                                client.viewport_width = width;
                                client.viewport_height = height;
                                client.device_type = device;
                            }
                            let _ = state_clone.app_handle.emit("clients-updated-event", DeviceList { devices: clients.clone() });
                        },
                        _ => {
                            let _ = state_clone.mobile_tx.send(evt).await;
                        }
                    }
                }
            }
        }
    });

    tokio::select! {
        _ = &mut sender => receiver.abort(),
        _ = &mut receiver => sender.abort(),
    }

    debug!("WebSocket disconnection: {:?}", addr);

    {
        let mut clients = state.mobile_clients.lock().await;
        clients.retain(|c| c.ip_addr != addr);
        let _ = state.app_handle.emit("clients-updated-event", DeviceList { devices: clients.clone() });
        info!("Websocket disconnected from {:?} ({} remaining connections)", addr, clients.len());
    }
}
