// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn get_system_platform() -> String {
    std::env::consts::OS.to_string()
}

#[tauri::command]
fn check_desktop_status() -> String {
    "Tauri Desktop Core Ready".to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_platform,
            check_desktop_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
