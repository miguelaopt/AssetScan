#![windows_subsystem = "windows"]

mod collector;
mod enforcer;
mod config;
mod notifications;
mod screenshot;
mod network_collector;
mod screen_time_tracker;
mod wmi_collector;
mod hardware_collector;
mod security_collector;

use anyhow::{Context, Result};
use chrono::Utc;
use std::time::Duration;
use tokio::time;
use std::sync::{Arc, Mutex};

lazy_static::lazy_static! {
    // Guarda a última versão das políticas em memória
    static ref ACTIVE_POLICIES: Arc<Mutex<Vec<enforcer::Policy>>> = Arc::new(Mutex::new(Vec::new()));
}

#[tokio::main]
async fn main() -> Result<()> {
    println!("╔═══════════════════════════════════════════════════════╗");
    println!("║         AssetScan Agent v4.0.0 BETA                   ║");
    println!("╚═══════════════════════════════════════════════════════╝\n");

    let config = config::Config::load()
        .context("Falha ao carregar configuração")?;

    println!("[Agent] Servidor: {}", config.server_url);
    println!("[Agent] Intervalo: {}min\n", config.interval_minutes);

    // Inicia screen time tracker em background
    tokio::spawn(screen_time_tracker::start_tracking());

    // ✅ FIX: Interval máximo 5 minutos (antes era 30)
    let interval_minutes = config.interval_minutes.min(5);
    let mut interval = time::interval(Duration::from_secs(interval_minutes * 60));

    if config.enforcement_enabled {
        tokio::spawn(async move {
            let mut ticker = time::interval(Duration::from_secs(5));
            loop {
                ticker.tick().await;
                let policies = ACTIVE_POLICIES.lock().unwrap().clone();
                if !policies.is_empty() {
                    enforcer::enforce_active_policies(&policies);
                }
            }
        });
    }

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
    
    // 2. Adiciona screen time (atualizado a cada 5 min)
    report.screen_time = screen_time_tracker::get_daily_stats();
    
    println!("[Coleta] ✓ {} processos | {} apps | {} conexões", 
        report.processes.len(), 
        report.software.len(),
        report.network.len()
    );

    // 3. Envia ao servidor e recebe políticas
    let policies = send_report_and_get_policies(&report, config).await?;
    println!("[Server] ✓ {} políticas recebidas", policies.len());

    // Atualiza a memória partilhada para o Enforcer rápido ler
    if config.enforcement_enabled {
        *ACTIVE_POLICIES.lock().unwrap() = policies;
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
        .header("X-Agent-Version", "4.0.0")
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