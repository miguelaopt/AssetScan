// ============================================================
// main.rs — Entry point do Dashboard Tauri v2.0
// ============================================================

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod database;
mod auth;
mod server;
mod commands;

use std::sync::{Arc, Mutex};
use tauri::Manager;

fn main() {
    println!("═══════════════════════════════════════════════════");
    println!("  AssetScan Dashboard v2.0");
    println!("═══════════════════════════════════════════════════\n");

    // Abre o banco de dados
    let conn = database::open_database()
        .expect("Falha ao abrir banco de dados");

    let pool: database::DbPool = Arc::new(Mutex::new(conn));

    // Gera API Key inicial se não existir
    if let Ok(keys) = auth::list_api_keys(&pool) {
        if keys.is_empty() {
            match auth::create_api_key(&pool, "default") {
                Ok(key) => {
                    println!("[Setup] API Key gerada:");
                    println!("        {}", key);
                    println!("        Guarde esta chave! Necessária para os agentes.\n");
                }
                Err(e) => eprintln!("[Setup] Erro ao gerar API Key: {}", e),
            }
        }
    }

    let pool_for_server = Arc::clone(&pool);

    // Inicia servidor HTTP em thread separada
    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new()
            .expect("Falha ao criar runtime Tokio");
        rt.block_on(server::start_server(pool_for_server));
    });

    // Inicia aplicação Tauri
    tauri::Builder::default()
        .setup(move |app| {
            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_machines,
            commands::get_disks,
            commands::get_software,
            commands::get_processes,
            commands::rename_machine,
            commands::get_dashboard_stats,
            commands::create_policy,
            commands::list_policies,
            commands::delete_policy,
            commands::get_audit_logs,
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao iniciar AssetScan Dashboard");
}