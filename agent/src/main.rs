// ============================================================
// AssetScan Agent v2.0 — Entry Point
// Coleta dados, aplica políticas e comunica com o servidor
// ============================================================

mod collector;
mod enforcer;
mod config;
mod notifications;
mod screenshot;
mod network_collector;

use anyhow::{Context, Result};
use chrono::Utc;
use std::time::Duration;
use tokio::time;

#[tokio::main]
async fn main() -> Result<()> {
    // Banner
    println!("╔═══════════════════════════════════════════════════════╗");
    println!("║         AssetScan Agent v2.0.0                        ║");
    println!("║    Gestão e Segurança de Endpoints                    ║");
    println!("╚═══════════════════════════════════════════════════════╝\n");

    // Carrega configuração
    let config = config::Config::load()
        .context("Falha ao carregar configuração")?;

    println!("[AssetScan] Configuração carregada");
    println!("[AssetScan] Servidor: {}", config.server_url);
    println!("[AssetScan] Intervalo: {}min", config.interval_minutes);
    println!("[AssetScan] Modo: {}\n", 
        if config.enforcement_enabled { "ENFORCEMENT" } else { "MONITOR" }
    );

    // Loop principal
    let mut interval = time::interval(Duration::from_secs(config.interval_minutes * 60));

    loop {
        interval.tick().await;

        if let Err(e) = run_cycle(&config).await {
            eprintln!("[AssetScan] ERRO no ciclo: {}", e);
            // Continua mesmo com erro — não queremos que o agente pare
        }
    }
}

async fn run_cycle(config: &config::Config) -> Result<()> {
    let start = std::time::Instant::now();
    println!("\n[{}] ═══ Iniciando Ciclo ═══", Utc::now().format("%H:%M:%S"));

    // 1. Coleta de dados do sistema
    println!("[Coleta] A recolher informações do sistema...");
    let mut report = collector::collect_full_report(config)?;

    let network_stats = network_collector::collect_network_stats();
    println!("[Coleta] ✓ {} conexões de rede ativas", network_stats.len());
    report.network_connections = network_stats;
    println!("[Coleta] ✓ {} processos | {} apps instaladas", 
        report.processes.len(), 
        report.software.len()
    );

    // 2. Envia dados ao servidor
    println!("[Upload] A enviar dados para o servidor...");
    let policies = send_report_and_get_policies(&report, config).await?;
    println!("[Upload] ✓ Recebidas {} políticas", policies.len());

    // 3. Aplica políticas de segurança (se enforcement activo)
    if config.enforcement_enabled {
        println!("[Enforcement] A aplicar políticas...");
        let blocked = enforcer::enforce_policies(&policies, &report.processes)?;
        
        if blocked > 0 {
            println!("[Enforcement] ⚠ {} processo(s) bloqueado(s)", blocked);
            notifications::notify_blocked_apps(blocked);
        } else {
            println!("[Enforcement] ✓ Nenhuma violação detectada");
        }
    } else {
        println!("[Enforcement] Modo monitor — apenas a reportar");
    }

    let elapsed = start.elapsed();
    println!("[Concluído] Ciclo completado em {:.2}s\n", elapsed.as_secs_f64());

    Ok(())
}

async fn send_report_and_get_policies(
    report: &collector::SystemReport,
    config: &config::Config,
) -> Result<Vec<enforcer::Policy>> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()?;

    let url = format!("{}/api/v2/report", config.server_url);

    let response = client
        .post(&url)
        .header("X-API-Key", &config.api_key)
        .header("X-Agent-Version", "2.0.0")
        .json(report)
        .send()
        .await
        .context("Falha ao contactar o servidor")?;

    if !response.status().is_success() {
        anyhow::bail!(
            "Servidor retornou erro: {} {}",
            response.status().as_u16(),
            response.status().canonical_reason().unwrap_or("Unknown")
        );
    }

    let response_data: ServerResponse = response.json().await?;
    
    Ok(response_data.policies)
}

#[derive(serde::Deserialize)]
struct ServerResponse {
    status: String,
    message: String,
    policies: Vec<enforcer::Policy>,
}