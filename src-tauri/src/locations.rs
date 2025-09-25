pub fn initialize() {
    let data_dir = dirs::data_local_dir().unwrap_or_default();
    let ec_root = data_dir.join("elite-control");
    let log_dir = ec_root.join("logs");
    let screen_img_dir = ec_root.join("thumbs");
    let dirs = vec![ec_root, log_dir, screen_img_dir];
    
    dirs.iter().for_each(|dir| {
        if !dir.exists() {
            let _ = std::fs::create_dir_all(dir);
        }
    });
}