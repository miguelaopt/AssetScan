// src-tauri/src/aggregator.rs
use crate::database::DbPool;

pub async fn start_metrics_aggregator(pool: DbPool) {
    // Cron job interno que corre periodicamente para agregar dados
    println!("[Aggregator] Serviço de agregação de métricas iniciado.");
    
    tokio::spawn(async move {
        loop {
            // Agrega dados de 1min → 5min
            // Agrega dados de 5min → 1h (após 24h)
            // Agrega dados de 1h → 1d (após 30d)
            
            // Pausa a thread para não consumir CPU (ex: 5 minutos)
            tokio::time::sleep(tokio::time::Duration::from_secs(300)).await;
        }
    });
}