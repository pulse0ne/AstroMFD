use std::path::PathBuf;

pub fn data_dir() -> PathBuf {
    dirs::data_local_dir().unwrap_or_default()
}

pub fn ec_root() -> PathBuf {
    data_dir().join("AstroMFD")
}

pub fn log_dir() -> PathBuf {
    ec_root().join("logs")
}

pub fn screen_img_dir() -> PathBuf {
    ec_root().join("thumbs")
}

pub fn save_dir() -> PathBuf {
    ec_root().join("screen-sets")
}

pub fn screen_set_dir(id: &str) -> PathBuf {
    save_dir().join(id)
}

pub fn screen_set_images_dir(id: &str) -> PathBuf {
    screen_set_dir(id).join("images")
}

pub fn screen_set_sounds_dir(id: &str) -> PathBuf {
    screen_set_dir(id).join("sounds")
}

pub fn initialize() {
    let dirs = [ec_root(), log_dir(), screen_img_dir(), save_dir()];

    for dir in &dirs {
        if !dir.exists() {
            if let Err(e) = std::fs::create_dir_all(dir) {
                eprintln!("Failed to create directory {}: {}", dir.display(), e);
            }
        }
    }
}
