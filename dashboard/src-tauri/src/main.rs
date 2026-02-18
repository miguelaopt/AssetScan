// ============================================================
// main.rs
// ============================================================

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod server;

use std::sync::{Arc, Mutex};
use tauri::Manager;                    // ← necessário para .manage()

fn main() {
    let conn = database::open_database()
        .expect("Falha ao abrir o banco de dados");

    let pool: database::DbPool = Arc::new(Mutex::new(conn));

    let pool_for_server = Arc::clone(&pool);

    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new()
            .expect("Falha ao criar runtime Tokio");
        // pool_for_server é DbPool (Arc<Mutex<>>) — passa directamente
        rt.block_on(server::start_server(pool_for_server));
    });

    tauri::Builder::default()
        .setup(move |app| {
            app.manage(pool);          // pool é DbPool — sem Arc::new()
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_machines,
            commands::get_disks,
            commands::get_software,
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao iniciar o app AssetScan");
}