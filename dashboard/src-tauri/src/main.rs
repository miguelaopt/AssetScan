#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod database;
mod auth;
mod server;
mod aggregator;
mod scheduler;
mod vulnerability_scanner;
mod email_sender;
mod api;
mod commands;
mod compliance;
mod integrations;
mod intelligence;

use std::sync::{Arc, Mutex};
use tauri::Manager;

fn main() {
    println!("═══════════════════════════════════════════════════");
    println!("  AssetScan Dashboard v3.0");
    println!("═══════════════════════════════════════════════════\n");

    // Abre database
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
    let pool_sched = Arc::clone(&pool);
    let pool_agg = Arc::clone(&pool);

    // Inicia servidor HTTP + scheduler + aggregator em thread separada
    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new()
            .expect("Falha ao criar runtime Tokio");
        
        // Inicia aggregator (métricas a cada 1 min)
        rt.spawn(async move {
            aggregator::start_metrics_aggregator(pool_agg).await;
        });
        
        // Inicia scheduler (relatórios diários/semanais)
        rt.spawn(async move {
            scheduler::setup_report_scheduler(pool_sched).await;
        });

        // Inicia servidor HTTP (bloqueia esta thread)
        rt.block_on(server::start_server(pool_for_server));
    });

    // Inicia aplicação Tauri
    tauri::Builder::default()
        .setup(move |app| {
            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Machines
            commands::list_machines,
            commands::get_disks,
            commands::get_software,
            commands::rename_machine,
            commands::get_dashboard_stats,
            commands::compare_machines,
            
            // Processes
            commands::get_processes,
            
            // Policies
            commands::create_policy,
            commands::list_policies,
            commands::delete_policy,
            
            // Audit
            commands::get_audit_logs,
            
            // Vulnerabilities
            commands::get_vulnerabilities,
            commands::scan_vulnerabilities,
            
            // Chatbot
            commands::chatbot_query,
            
            // Screenshots
            commands::request_screenshot,
            commands::get_screen_time,
            commands::create_ip_policy,
            commands::block_software_for_machine,
            commands::kill_process,
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao iniciar AssetScan Dashboard");
}