use std::path::PathBuf;

pub fn data_dir() -> PathBuf {
    dirs::data_local_dir().unwrap_or_default()
}

pub fn ec_root() -> PathBuf {
    data_dir().join("elite-control")
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
    let ec_root = ec_root();
    let log_dir = log_dir();
    let screen_img_dir = screen_img_dir();
    let save_dir = save_dir();
    let sounds_dir = sounds_dir();
    let dirs = vec![ec_root, log_dir, screen_img_dir, save_dir, sounds_dir];
    
    dirs.iter().for_each(|dir| {
        if !dir.exists() {
            let _ = std::fs::create_dir_all(dir);
        }
    });
}