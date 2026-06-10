use std::collections::HashMap;
use std::fs;
use std::fs::File;
use std::io::BufReader;
use log::debug;
use serde::Serialize;
use uuid::Uuid;
use crate::locations::{save_dir, screen_img_dir, screen_set_dir, screen_set_images_dir, screen_set_sounds_dir};
use crate::state::{AppState, ServerEvent};
use crate::widget::Widget::Button;
use crate::widget::base::{Position, ShapeAttributes, Size, SvgXmlNode, TextAttributes, WidgetBase};
use crate::widget::button::{ActionSequence, ButtonAttributes, PressedOverrides};
use crate::widget::screen_set::{Screen, ScreenEffects, ScreenSet, ScreenSize};

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScreenSetMeta {
    pub id: String,
    pub name: String,
    pub screen_img_id: Option<String>,
    pub modified_at: u64,
}

#[tauri::command]
pub async fn list_screen_sets() -> Result<Vec<ScreenSetMeta>, String> {
    let entries = fs::read_dir(save_dir())
        .map_err(|e| format!("Failed to list screen sets: {e}"))?;

    let mut screen_sets = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {e}"))?;
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let layout_path = path.join("layout.json");
        if !layout_path.exists() {
            continue;
        }

        let modified_at = layout_path.metadata()
            .and_then(|m| m.modified())
            .map(|t| t.duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs())
            .unwrap_or(0);

        let file = File::open(&layout_path)
            .map_err(|e| format!("Failed to open {:?}: {e}", layout_path))?;

        let reader = BufReader::new(file);

        let screen_set: ScreenSet = serde_json::from_reader(reader)
            .map_err(|e| format!("Failed to deserialize {:?}: {e}", layout_path))?;

        let img_id = screen_set.screens.first().map(|s| s.id.clone());

        screen_sets.push(ScreenSetMeta {
            id: screen_set.id,
            name: screen_set.name,
            screen_img_id: img_id,
            modified_at,
        });
    }

    screen_sets.sort_by(|a, b| b.modified_at.cmp(&a.modified_at));
    Ok(screen_sets)
}

#[tauri::command]
pub async fn get_screen_set_by_id(id: String) -> Result<ScreenSet, String> {
    debug!("loading screen set {}", id);
    let layout_path = screen_set_dir(&id).join("layout.json");
    let file = File::open(&layout_path)
        .map_err(|e| format!("Failed to open {:?}: {e}", layout_path))?;

    let reader = BufReader::new(file);
    let screen_set = serde_json::from_reader(reader)
        .map_err(|e| format!("Failed to deserialize {:?}: {e}", layout_path))?;

    Ok(screen_set)
}

#[tauri::command]
pub async fn save_screen_set(screen_set: ScreenSet) -> Result<(), String> {
    debug!("Saving screen set {} (id: {})", screen_set.name, screen_set.id);

    let dir = screen_set_dir(&screen_set.id);
    fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create screen set directory: {e}"))?;

    let json = serde_json::to_string_pretty(&screen_set)
        .map_err(|e| format!("Failed to serialize screen set {}: {e}", screen_set.id))?;

    let layout_path = dir.join("layout.json");
    fs::write(&layout_path, json)
        .map_err(|e| format!("Failed to write {:?}: {e}", layout_path))?;

    Ok(())
}

#[tauri::command]
pub async fn update_clients(state: tauri::State<'_, AppState>, screen_set: ScreenSet) -> Result<(), String> {
    debug!("Updating clients");
    let ws_sender = state.server_tx.clone();
    let id = screen_set.id.clone();

    if ws_sender.receiver_count() > 0 {
        let _ = ws_sender
            .send(ServerEvent::LayoutPushed { id, screen_set })
            .map_err(|e| format!("Failed to send LayoutPushed event: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn delete_screen_set(id: String) -> Result<Vec<ScreenSetMeta>, String> {
    let dir = screen_set_dir(&id);
    if dir.exists() {
        let layout_path = dir.join("layout.json");
        if let Ok(file) = File::open(&layout_path) {
            let reader = BufReader::new(file);
            if let Ok(screen_set) = serde_json::from_reader::<_, ScreenSet>(reader) {
                let thumbs_dir = screen_img_dir();
                for screen in &screen_set.screens {
                    let thumb_path = thumbs_dir.join(format!("{}.png", screen.id));
                    let _ = fs::remove_file(thumb_path);
                }
            }
        }
        fs::remove_dir_all(&dir)
            .map_err(|e| format!("Failed to delete screen set directory {:?}: {e}", dir))?;
    }
    list_screen_sets().await
}

#[tauri::command]
pub async fn rename_screen_set(id: String, name: String) -> Result<Vec<ScreenSetMeta>, String> {
    let mut screen_set = get_screen_set_by_id(id.clone()).await?;
    screen_set.name = name;
    save_screen_set(screen_set).await?;
    list_screen_sets().await
}

#[tauri::command]
pub async fn create_screen_set(name: String) -> Result<ScreenSet, String> {
    let id = Uuid::new_v4().to_string();

    fs::create_dir_all(screen_set_images_dir(&id))
        .map_err(|e| format!("Failed to create images dir: {e}"))?;
    fs::create_dir_all(screen_set_sounds_dir(&id))
        .map_err(|e| format!("Failed to create sounds dir: {e}"))?;

    let screen_set = ScreenSet {
        id,
        name,
        screens: vec![
            Screen {
                id: Uuid::new_v4().to_string(),
                name: "Untitled Screen 1".to_string(),
                widgets: vec![
                    Button(
                        ButtonAttributes {
                            widget: WidgetBase {
                                id: Uuid::new_v4().to_string(),
                                shape: ShapeAttributes {
                                    svg: Some(SvgXmlNode {
                                        name: "svg".to_string(),
                                        element_type: "element".to_string(),
                                        value: "".to_string(),
                                        attributes: HashMap::from([
                                            ("viewbox".to_string(), "0 0 24 24".to_string()),
                                            ("height".to_string(), "24px".to_string()),
                                            ("width".to_string(), "24px".to_string()),
                                        ]),
                                        children: vec![
                                            SvgXmlNode {
                                                name: "path".to_string(),
                                                element_type: "element".to_string(),
                                                value: "".to_string(),
                                                attributes: HashMap::from([
                                                    ("fill".to_string(), "rgba(128,128,128,0.6".to_string()),
                                                    ("d".to_string(), "M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm6,12H8.414l2.293,2.293a1,1,0,1,1-1.414,1.414l-4-4a1,1,0,0,1,0-1.414l4-4a1,1,0,1,1,1.414,1.414L8.414,11H18a1,1,0,0,1,0,2Z".to_string()),
                                                ]),
                                                children: vec![],
                                            }
                                        ]
                                    }),
                                    fill: None,
                                    stroke: None,
                                    stroke_width: 0f64,
                                    corner_radius: 0f64,
                                    shadow: None,
                                    position: Position { x: 5f64, y: 5f64 },
                                    size: Size { height: 24f64, width: 24f64 },
                                }
                            },
                            button_type: crate::widget::button::ButtonType::Exit,
                            icon: None,
                            input: ActionSequence { steps: vec![] },
                            nav_target: None,
                            pressed: PressedOverrides {
                                ..Default::default()
                            },
                            text: TextAttributes {
                                ..Default::default()
                            }
                        }
                    )
                ],
                background_color: "rgba(13, 20, 24, 1)".to_string(),
                crt_effect: false,
                effects: ScreenEffects::default(),
            }
        ],
        size: ScreenSize { width: 1200, height: 800 },
    };
    save_screen_set(screen_set.clone()).await?;
    Ok(screen_set)
}

#[tauri::command]
pub async fn duplicate_screen_set(id: String) -> Result<Vec<ScreenSetMeta>, String> {
    let source = get_screen_set_by_id(id.clone()).await?;
    let new_id = Uuid::new_v4().to_string();

    let new_dir = screen_set_dir(&new_id);
    fs::create_dir_all(screen_set_images_dir(&new_id))
        .map_err(|e| format!("Failed to create images dir: {e}"))?;
    fs::create_dir_all(screen_set_sounds_dir(&new_id))
        .map_err(|e| format!("Failed to create sounds dir: {e}"))?;

    // Copy images
    let src_images = screen_set_images_dir(&id);
    if src_images.exists() {
        for entry in fs::read_dir(&src_images).into_iter().flatten().flatten() {
            let dest = new_dir.join("images").join(entry.file_name());
            let _ = fs::copy(entry.path(), dest);
        }
    }

    // Copy sounds
    let src_sounds = screen_set_sounds_dir(&id);
    if src_sounds.exists() {
        for entry in fs::read_dir(&src_sounds).into_iter().flatten().flatten() {
            let dest = new_dir.join("sounds").join(entry.file_name());
            let _ = fs::copy(entry.path(), dest);
        }
    }

    // Copy thumb images (may have opportunity for optimization here)
    let mut screen_id_map = HashMap::new();
    for s in source.screens.iter() {
        screen_id_map.entry(s.id.clone()).or_insert_with(|| Uuid::new_v4().to_string());
    }

    for (s, d) in screen_id_map.iter() {
        let src_file = screen_img_dir().join(format!("{}.png", s));
        if src_file.exists() {
            let dest_file = screen_img_dir().join(format!("{}.png", d));
            let _ = fs::copy(src_file, dest_file);
        }
    }

    let new_set = ScreenSet {
        id: new_id,
        name: format!("{} (Copy)", source.name),
        screens: source.screens.into_iter().map(|s| Screen {
            id: screen_id_map.get(&s.id).unwrap_or(&Uuid::new_v4().to_string()).clone(),
            ..s
        }).collect(),
        size: source.size,
    };
    save_screen_set(new_set).await?;
    list_screen_sets().await
}
