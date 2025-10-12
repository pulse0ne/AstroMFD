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
use crate::fonts::get_font_path;
use crate::locations::{save_dir, sounds_dir};
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
static AUDIO_ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../sfx");

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
pub async fn list_audio_clips() -> impl IntoResponse {
    let mut clips: Vec<AudioEntry> = Vec::new();

    let sound_dir_entries = fs::read_dir(sounds_dir()).unwrap();

    for entry in sound_dir_entries {
        let entry = entry.unwrap();
        let path = entry.path();

        if !path.is_file() {
            continue;
        }

        let filename = entry.file_name();
        clips.push(
            AudioEntry {
                source: "sounds".to_string(),
                file: filename.to_string_lossy().to_string(),
            }
        );
    }

    let resource_entries = AUDIO_ASSETS.entries();

    for entry in resource_entries {
        let path = entry.path();

        if !path.is_file() {
            continue;
        }

        let filename = path.file_name().unwrap();
        clips.push(
            AudioEntry {
                source: "resources".to_string(),
                file: filename.to_string_lossy().to_string(),
            }
        );
    }

    Json(clips)
}

#[cfg(debug_assertions)]
#[axum::debug_handler]
pub async fn list_audio_clips() -> impl IntoResponse {
    let mut clips: Vec<AudioEntry> = Vec::new();

    let sound_dir_entries = fs::read_dir(sounds_dir()).unwrap();

    for entry in sound_dir_entries {
        let entry = entry.unwrap();
        let path = entry.path();

        if !path.is_file() {
            continue;
        }

        let filename = entry.file_name();
        clips.push(
            AudioEntry {
                source: "sounds".to_string(),
                file: filename.to_string_lossy().to_string(),
            }
        );
    }

    let disk_path = format!("{}/{}", env!("CARGO_MANIFEST_DIR"), "../sfx");

    let disk_entries = fs::read_dir(disk_path).unwrap();

    for entry in disk_entries {
        let entry = entry.unwrap();
        let path = entry.path();

        if !path.is_file() {
            continue;
        }

        let filename = entry.file_name();
        clips.push(
            AudioEntry {
                source: "resources".to_string(),
                file: filename.to_string_lossy().to_string(),
            }
        );
    }

    Json(clips)
}

#[cfg(not(debug_assertions))]
#[axum::debug_handler]
pub async fn audio_handler(Path((source, sound)): Path<(String, String)>) -> impl IntoResponse {
    match source.as_str() {
        "sounds" => {
            let path = sounds_dir().join(sound);
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
pub async fn audio_handler(Path((source, sound)): Path<(String, String)>) -> impl IntoResponse {
    let path = match source.as_str() {
        "sounds" => Some(sounds_dir().join(sound)),
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

// #[axum::debug_handler]
pub async fn font_handler(Path(font): Path<String>) -> impl IntoResponse {
    let last_period = font.rfind(".").unwrap();
    // println!("{:#?}", font);
    let font_path = match get_font_path(&font[0..last_period]) {
        Ok(path) => path,
        Err(_) => return (StatusCode::NOT_FOUND, "Not found").into_response(),
    };
    let file = File::open(font_path.clone());
    if let Ok(mut file) = file {
        let mim = mime_guess::from_path(font_path).first_or_octet_stream();
        let mut contents: Vec<u8> = Vec::new();
        file.read_to_end(&mut contents).unwrap();
        let mut res = Response::new(contents.into());
        res.headers_mut().insert(
            "content-type",
            HeaderValue::from_str(mim.as_ref()).unwrap(),
        );
        res
    } else {
        (StatusCode::NOT_FOUND, "Not Found").into_response()
    }
}

pub async fn screen_set_handler() -> impl IntoResponse {
    let saves_dir = save_dir();

    let mut screen_sets: Vec<ScreenSet> = Vec::new();

    for entry in fs::read_dir(&saves_dir).unwrap() {
        if let Ok(entry) = entry {
            let path = entry.path();

            if path.is_file() && path.extension().and_then(|ext| ext.to_str()) == Some("json") {
                if let Ok(contents) = fs::read_to_string(path) {
                    if let Ok(screen_set) = serde_json::from_str::<ScreenSet>(&contents) {
                        screen_sets.push(screen_set);
                    } else {
                        error!("Failed to parse screen set");
                    }
                } else {
                    error!("Failed to read screen set");
                }
            }
        } else {
            error!("Failed to read path");
        }
    }
    
    Json(screen_sets)
}
