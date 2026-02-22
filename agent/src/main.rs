#![windows_subsystem = "windows"]

mod collector;
mod enforcer;
mod config;
mod notifications;
mod screenshot;
mod network_collector;
mod screen_time_tracker;

use anyhow::{Context, Result};
use chrono::Utc;
use std::time::Duration;
use tokio::time;

#[tokio::main]
async fn main() -> Result<()> {
    println!("╔═══════════════════════════════════════════════════════╗");
    println!("║         AssetScan Agent v3.0.0                        ║");
    println!("╚═══════════════════════════════════════════════════════╝\n");

    let config = config::Config::load()
        .context("Falha ao carregar configuração")?;

    println!("[Agent] Servidor: {}", config.server_url);
    println!("[Agent] Intervalo: {}min\n", config.interval_minutes);

    // Inicia screen time tracker em background
    tokio::spawn(screen_time_tracker::start_tracking());

    // Loop principal
    let mut interval = time::interval(Duration::from_secs(config.interval_minutes * 60));

    loop {
        interval.tick().await;

        if let Err(e) = run_cycle(&config).await {
            eprintln!("[Agent] ERRO: {}", e);
        }
    }
}

async fn run_cycle(config: &config::Config) -> Result<()> {
    println!("\n[{}] ═══ Ciclo Iniciado ═══", Utc::now().format("%H:%M:%S"));

    // 1. Coleta dados
    let mut report = collector::collect_full_report(config)?;
    
    // 2. Adiciona screen time
    report.screen_time = screen_time_tracker::get_daily_stats();
    
    println!("[Coleta] ✓ {} processos | {} apps | {} conexões", 
        report.processes.len(), 
        report.software.len(),
        report.network.len()
    );

    // 3. Envia ao servidor
    let policies = send_report_and_get_policies(&report, config).await?;
    println!("[Server] ✓ {} políticas recebidas", policies.len());

    // 4. Aplica enforcement
    if config.enforcement_enabled {
        let blocked = enforcer::enforce_policies(&policies, &report.processes)?;
        if blocked > 0 {
            println!("[Enforcement] ⚠ {} bloqueado(s)", blocked);
        }
    }

    println!("[Completo] Ciclo OK\n");
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
        .header("X-Agent-Version", "3.0.0")
        .json(report)
        .send()
        .await
        .context("Falha ao contactar servidor")?;

    if !response.status().is_success() {
        anyhow::bail!("Servidor erro: {}", response.status());
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