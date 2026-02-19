// ============================================================
// aggregator.rs — Coleta métricas históricas v3.0
// Executa a cada 1 minuto e guarda na database
// ============================================================

use tokio::time::{interval, Duration};
use crate::database::{self, DbPool};

pub async fn start_metrics_aggregator(pool: DbPool) {
    let mut ticker = interval(Duration::from_secs(60)); // A cada 1 minuto

    println!("[Aggregator] Iniciado - coleta métricas a cada 60s");

    loop {
        ticker.tick().await;
        
        if let Err(e) = collect_and_store_metrics(&pool).await {
            eprintln!("[Aggregator] Erro: {}", e);
        }
    }
}

async fn collect_and_store_metrics(pool: &DbPool) -> anyhow::Result<()> {
    // Busca todas as máquinas online
    let machines = database::list_machines(pool)?;

    for machine in machines {
        if !machine.is_online {
            continue;
        }

        // Calcula % de RAM usado
        let ram_percent = if machine.ram_total_mb > 0 {
            (machine.ram_used_mb as f32 / machine.ram_total_mb as f32) * 100.0
        } else {
            0.0
        };

        // Insere métrica
        database::insert_metric(
            pool,
            &machine.machine_id,
            0.0, // CPU será actualizado quando o agente enviar
            machine.ram_used_mb,
            machine.ram_total_mb,
        )?;
    }

    Ok(())
}