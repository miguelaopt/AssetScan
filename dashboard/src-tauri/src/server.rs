// ============================================================
// server.rs — Servidor HTTP Axum que recebe dados dos agentes.
// Roda em background na porta 7474.
// ============================================================

use axum::{
    extract::State,
    http::StatusCode,
    routing::post,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};
use std::sync::Arc;

use crate::database::{self, DbPool, DiskInfo, SoftwareEntry};

// -------------------------------------------------
// Estrutura do JSON recebido do agente (deve bater com agent/main.rs)
// -------------------------------------------------

#[derive(Deserialize, Debug)]
pub struct AgentReport {
    pub hostname: String,
    pub collected_at: String,
    pub hardware: HardwarePayload,
    pub software: Vec<SoftwarePayload>,
    pub os: OsPayload,
}

#[derive(Deserialize, Debug)]
pub struct HardwarePayload {
    pub cpu_name: String,
    pub cpu_cores: usize,
    pub cpu_threads: usize,
    pub cpu_usage_percent: f32,
    pub ram_total_mb: u64,
    pub ram_used_mb: u64,
    pub disks: Vec<DiskPayload>,
}

#[derive(Deserialize, Debug)]
pub struct DiskPayload {
    pub name: String,
    pub mount_point: String,
    pub total_gb: f64,
    pub free_gb: f64,
    pub fs_type: String,
}

#[derive(Deserialize, Debug)]
pub struct SoftwarePayload {
    pub name: String,
    pub version: String,
    pub publisher: String,
    pub install_date: String,
}

#[derive(Deserialize, Debug)]
pub struct OsPayload {
    pub name: String,
    pub version: String,
    pub kernel_version: String,
    pub uptime_hours: u64,
}

#[derive(Serialize)]
struct ApiResponse {
    status: String,
    message: String,
}

// -------------------------------------------------
// Handler do endpoint POST /api/report
// -------------------------------------------------

async fn receive_report(
    State(pool): State<DbPool>,
    Json(report): Json<AgentReport>,
) -> Result<Json<ApiResponse>, StatusCode> {

    println!(
        "[Server] Relatório recebido de: {} em {}",
        report.hostname, report.collected_at
    );

    // 1. Upsert da máquina
    let machine_id = database::upsert_machine(
        &pool,
        &report.hostname,
        &report.collected_at,
        &report.hardware.cpu_name,
        report.hardware.cpu_cores as i64,
        report.hardware.cpu_threads as i64,
        report.hardware.ram_total_mb as i64,
        report.hardware.ram_used_mb as i64,
        &report.os.name,
        &report.os.version,
        &report.os.kernel_version,
        report.os.uptime_hours as i64,
    )
    .map_err(|e| {
        eprintln!("[Server] Erro ao salvar máquina: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // 2. Atualiza discos
    let disks: Vec<DiskInfo> = report
        .hardware
        .disks
        .iter()
        .map(|d| DiskInfo {
            name: d.name.clone(),
            mount_point: d.mount_point.clone(),
            total_gb: d.total_gb,
            free_gb: d.free_gb,
            fs_type: d.fs_type.clone(),
        })
        .collect();

    database::update_disks(&pool, &machine_id, &disks)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 3. Atualiza software
    let software: Vec<SoftwareEntry> = report
        .software
        .iter()
        .map(|s| SoftwareEntry {
            name: s.name.clone(),
            version: s.version.clone(),
            publisher: s.publisher.clone(),
            install_date: s.install_date.clone(),
        })
        .collect();

    database::update_software(&pool, &machine_id, &software)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse {
        status: "ok".to_string(),
        message: format!("Dados de '{}' recebidos com sucesso.", report.hostname),
    }))
}

// -------------------------------------------------
// Inicia o servidor HTTP em background
// -------------------------------------------------

pub async fn start_server(pool: DbPool) {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/report", post(receive_report))
        .layer(cors)
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:7474")
        .await
        .expect("[Server] Não foi possível iniciar na porta 7474. Verifique se está em uso.");

    println!("[Server] AssetScan aguardando agentes na porta 7474...");

    axum::serve(listener, app).await.unwrap();
}