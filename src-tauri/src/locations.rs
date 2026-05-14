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

pub fn sounds_dir() -> PathBuf {
    ec_root().join("sounds")
}

pub fn initialize() {
    let dirs = [ec_root(), log_dir(), screen_img_dir(), save_dir(), sounds_dir()];

    for dir in &dirs {
        if !dir.exists() {
            if let Err(e) = std::fs::create_dir_all(dir) {
                eprintln!("Failed to create directory {}: {}", dir.display(), e);
            }
        }
    }
}
