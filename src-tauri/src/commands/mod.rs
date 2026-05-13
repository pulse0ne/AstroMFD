mod journal;
mod screen_img;
mod fonts;
mod client;
mod screens;
mod input;
mod audio;

use tauri::generate_handler;
use tauri::ipc::Invoke;

pub fn command_handlers() -> (impl Fn(Invoke) -> bool + Send + Sync + 'static) {
    generate_handler![
        journal::set_journal_path,
        journal::get_default_journal_path,
        screen_img::save_screen_img,
        screen_img::get_screen_img,
        client::get_mobile_client_server_address,
        fonts::list_system_fonts,
        screens::list_screen_sets,
        screens::get_screen_set_by_id,
        screens::save_screen_set,
        screens::update_clients,
        screens::delete_screen_set,
        screens::rename_screen_set,
        screens::create_screen_set,
        input::get_available_input_keys,
        audio::get_audio_clips,
    ]
}
