use std::fs;
use std::fs::File;
use std::io::Read;
use std::path::PathBuf;
use std::str::FromStr;
use axum::extract::{Path, State};
use axum::http::{HeaderValue, Response, StatusCode};
use axum::Json;
use axum::response::IntoResponse;
#[cfg(not(debug_assertions))]
use include_dir::{include_dir, Dir};
use log::error;
use serde::Serialize;
use crate::locations::{save_dir, screen_set_images_dir, screen_set_sounds_dir};
use crate::state::AppState;
use crate::widget::screen_set::ScreenSet;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioEntry {
    pub source: String,
    pub file: String,
}

#[cfg(not(debug_assertions))]
static MOBILE_ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../mobile-client/dist");

#[cfg(not(debug_assertions))]
pub static AUDIO_ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../sfx");

#[cfg(not(debug_assertions))]
pub async fn static_handler(
    State(_state): State<AppState>,
    req: axum::http::Request<axum::body::Body>,
) -> impl IntoResponse {
    let path = req.uri().path().trim_start_matches('/');

    let file = MOBILE_ASSETS.get_file(path).or_else(|| MOBILE_ASSETS.get_file("index.html"));

    if let Some(file) = file {
        let mime = mime_guess::from_path(file.path()).first_or_octet_stream();
        let mut res = Response::new(file.contents().into());
        res.headers_mut().insert(
            "content-type",
            HeaderValue::from_str(mime.as_ref()).unwrap(),
        );
        res
    } else {
        (StatusCode::NOT_FOUND, "Not Found").into_response()
    }
}

#[cfg(debug_assertions)]
pub async fn static_handler(
    State(_state): State<AppState>, // we keep the same state type for sharing channels if needed
    req: axum::http::Request<axum::body::Body>,
) -> impl IntoResponse {
    let path = req.uri().path().trim_start_matches('/');
    let disk_path = format!("{}/{}", env!("CARGO_MANIFEST_DIR"), "../mobile-client/dist");
    let candidate = std::path::Path::new(&disk_path).join(path);

    let file_path = if candidate.exists() && candidate.is_file() {
        candidate
    } else {
        std::path::Path::new(&disk_path).join("index.html")
    };

    match tokio::fs::read(&file_path).await {
        Ok(bytes) => {
            let mime = mime_guess::from_path(&file_path).first_or_octet_stream();
            let mut res = Response::new(bytes.into());
            res.headers_mut()
                .insert("content-type", HeaderValue::from_str(mime.as_ref()).unwrap());
            res
        }
        Err(_) => {
            (StatusCode::NOT_FOUND, "Not Found").into_response()
        },
    }
}

#[cfg(not(debug_assertions))]
pub async fn list_audio_clips(Path(screen_set_id): Path<String>) -> impl IntoResponse {
    let mut clips: Vec<AudioEntry> = Vec::new();

    let sounds_dir = screen_set_sounds_dir(&screen_set_id);
    if let Ok(sound_dir_entries) = fs::read_dir(sounds_dir) {
        for entry in sound_dir_entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                clips.push(AudioEntry {
                    source: "sounds".to_string(),
                    file: entry.file_name().to_string_lossy().to_string(),
                });
            }
        }
    }

    let resource_entries = AUDIO_ASSETS.entries();
    for entry in resource_entries {
        let path = entry.path();
        if path.is_file() {
            if let Some(filename) = path.file_name() {
                clips.push(AudioEntry {
                    source: "resources".to_string(),
                    file: filename.to_string_lossy().to_string(),
                });
            }
        }
    }

    Json(clips)
}

#[cfg(debug_assertions)]
#[axum::debug_handler]
pub async fn list_audio_clips(Path(screen_set_id): Path<String>) -> impl IntoResponse {
    let mut clips: Vec<AudioEntry> = Vec::new();

    let sounds_dir = screen_set_sounds_dir(&screen_set_id);
    if let Ok(sound_dir_entries) = fs::read_dir(sounds_dir) {
        for entry in sound_dir_entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                clips.push(AudioEntry {
                    source: "sounds".to_string(),
                    file: entry.file_name().to_string_lossy().to_string(),
                });
            }
        }
    }

    let disk_path = format!("{}/{}", env!("CARGO_MANIFEST_DIR"), "../sfx");
    if let Ok(disk_entries) = fs::read_dir(disk_path) {
        for entry in disk_entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                clips.push(AudioEntry {
                    source: "resources".to_string(),
                    file: entry.file_name().to_string_lossy().to_string(),
                });
            }
        }
    }

    Json(clips)
}

#[cfg(not(debug_assertions))]
#[axum::debug_handler]
pub async fn audio_handler(Path((screen_set_id, source, sound)): Path<(String, String, String)>) -> impl IntoResponse {
    match source.as_str() {
        "sounds" => {
            let path = screen_set_sounds_dir(&screen_set_id).join(sound);
            if !path.exists() || path.is_dir() {
                (StatusCode::NOT_FOUND, "Not found").into_response()
            } else {
                let file = File::open(path.clone());
                if let Ok(mut file) = file {
                    let mim = mime_guess::from_path(path).first_or_octet_stream();
                    let mut contents: Vec<u8> = Vec::new();
                    file.read_to_end(&mut contents).unwrap();
                    let mut res = Response::new(contents.into());
                    res.headers_mut().insert(
                        "content-type",
                        HeaderValue::from_str(mim.as_ref()).unwrap(),
                    );
                    res
                } else {
                    (StatusCode::NOT_FOUND, "Not found").into_response()
                }
            }
        },
        "resources" => {
            if let Some(file) = AUDIO_ASSETS.get_file(sound) {
                let mime = mime_guess::from_path(file.path()).first_or_octet_stream();
                let mut res = Response::new(file.contents().into());
                res.headers_mut().insert(
                    "content-type",
                    HeaderValue::from_str(mime.as_ref()).unwrap(),
                );
                res
            } else {
                (StatusCode::NOT_FOUND, "Not found").into_response()
            }
        },
        _ => (StatusCode::NOT_FOUND, "Not found").into_response()
    }
}

#[cfg(debug_assertions)]
#[axum::debug_handler]
pub async fn audio_handler(Path((screen_set_id, source, sound)): Path<(String, String, String)>) -> impl IntoResponse {
    let path = match source.as_str() {
        "sounds" => Some(screen_set_sounds_dir(&screen_set_id).join(sound)),
        "resources" => Some(PathBuf::from_str(format!("{}/{}", env!("CARGO_MANIFEST_DIR"), "../sfx").as_str()).unwrap().join(sound)),
        _ => None
    };
    if let Some(path) = path {
        if !path.exists() || path.is_dir() {
            (StatusCode::NOT_FOUND, "Not found").into_response()
        } else {
            let file = File::open(path.clone());
            if let Ok(mut file) = file {
                let mim = mime_guess::from_path(path).first_or_octet_stream();
                let mut contents: Vec<u8> = Vec::new();
                file.read_to_end(&mut contents).unwrap();
                let mut res = Response::new(contents.into());
                res.headers_mut().insert(
                    "content-type",
                    HeaderValue::from_str(mim.as_ref()).unwrap(),
                );
                res
            } else {
                (StatusCode::NOT_FOUND, "Not found").into_response()
            }
        }
    } else {
        (StatusCode::BAD_REQUEST, "Bad request").into_response()
    }
}


pub async fn image_handler(Path((screen_set_id, file)): Path<(String, String)>) -> impl IntoResponse {
    let path = screen_set_images_dir(&screen_set_id).join(&file);
    match File::open(&path) {
        Ok(mut f) => {
            let mime = mime_guess::from_path(&path).first_or_octet_stream();
            let mut contents: Vec<u8> = Vec::new();
            f.read_to_end(&mut contents).unwrap();
            let mut res = Response::new(contents.into());
            res.headers_mut().insert(
                "content-type",
                HeaderValue::from_str(mime.as_ref()).unwrap(),
            );
            res
        }
        Err(_) => (StatusCode::NOT_FOUND, "Not Found").into_response(),
    }
}

pub async fn screen_set_handler() -> impl IntoResponse {
    let saves_dir = save_dir();

    let mut screen_sets: Vec<ScreenSet> = Vec::new();

    for entry in fs::read_dir(&saves_dir).unwrap() {
        if let Ok(entry) = entry {
            let path = entry.path();

            if path.is_dir() {
                let layout_path = path.join("layout.json");
                if let Ok(contents) = fs::read_to_string(layout_path) {
                    if let Ok(screen_set) = serde_json::from_str::<ScreenSet>(&contents) {
                        screen_sets.push(screen_set);
                    } else {
                        error!("Failed to parse screen set");
                    }
                }
            }
        } else {
            error!("Failed to read path");
        }
    }

    Json(screen_sets)
}
