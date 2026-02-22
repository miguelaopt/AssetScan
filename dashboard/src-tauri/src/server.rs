// ============================================================
// server.rs — Servidor HTTP Axum v2.0
// ============================================================

use axum::{
    extract::{State, Request},
    http::{StatusCode, HeaderMap},
    routing::post,
    Json, Router,
    middleware::{self, Next},
    response::Response,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};
use crate::api;

use crate::database::{self, DbPool};
use crate::models::*;
use crate::auth;
use axum::response::sse::{Event, Sse};
use futures::stream::Stream;
use tokio_stream::wrappers::BroadcastStream;
use std::convert::Infallible;

// -------------------------------------------------
// Estrutura de dados recebidas do agente v2.0
// -------------------------------------------------

#[derive(Deserialize, Debug)]
pub struct AgentReport {
    pub agent_version: String,
    pub hostname: String,
    pub machine_id: String,
    pub local_ip: String, // NOVO!
    pub collected_at: String,
    pub hardware: HardwarePayload,
    pub software: Vec<SoftwarePayload>,
    pub processes: Vec<ProcessPayload>,
    pub network_connections: Option<Vec<NetworkConnectionPayload>>,
    pub screen_time: Vec<ScreenTimePayload>, // NOVO!
    pub os: OsPayload,
}

#[derive(Deserialize, Debug)]
pub struct ScreenTimePayload {
    pub app_name: String,
    pub total_seconds: u64,
    pub date: String,
}

#[derive(Deserialize, Debug)]
pub struct NetworkConnectionPayload {
    pub pid: u32,
    pub local_ip: String,
    pub remote_ip: String,
    pub state: String,
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
pub struct ProcessPayload {
    pub pid: u32,
    pub name: String,
    pub exe_path: String,
    pub memory_mb: f64,
    pub cpu_percent: f32,
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
    policies: Vec<Policy>,  // NOVO: retorna políticas
}

// -------------------------------------------------
// Middleware de Autenticação
// -------------------------------------------------

async fn auth_middleware(
    State(pool): State<DbPool>,
    headers: HeaderMap,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let api_key = headers
        .get("X-API-Key")
        .and_then(|h| h.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let is_valid = auth::validate_api_key(&pool, api_key)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !is_valid {
        return Err(StatusCode::UNAUTHORIZED);
    }

    Ok(next.run(req).await)
}

// -------------------------------------------------
// Server-Sent Events (SSE) v3.0
// -------------------------------------------------
pub async fn events_stream(
    State(_pool): State<DbPool>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    // Implementação dummy inicial (para satisfazer compilação)
    // O fluxo real virá do channel Tokio quando implementarmos os webhooks
    let stream = futures::stream::iter(vec![]);
    Sse::new(stream).keep_alive(axum::response::sse::KeepAlive::default())
}

// -------------------------------------------------
// Handler do endpoint POST /api/v2/report
// -------------------------------------------------

async fn receive_report(
    State(pool): State<DbPool>,
    Json(report): Json<AgentReport>,
) -> Result<Json<ApiResponse>, StatusCode> {
    println!(
        "[Server] v{} de: {} (IP: {})",
        report.agent_version, report.hostname, report.local_ip
    );

    // Upsert máquina COM IP
    database::upsert_machine(
        &pool,
        &report.machine_id,
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
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Actualiza IP
    database::update_machine_ip(&pool, &report.machine_id, &report.local_ip).ok();

    // Discos
    let disks: Vec<DiskInfo> = report.hardware.disks.iter().map(|d| DiskInfo {
        name: d.name.clone(),
        mount_point: d.mount_point.clone(),
        total_gb: d.total_gb,
        free_gb: d.free_gb,
        fs_type: d.fs_type.clone(),
    }).collect();
    database::update_disks(&pool, &report.machine_id, &disks)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Software
    let software: Vec<SoftwareEntry> = report.software.iter().map(|s| SoftwareEntry {
        name: s.name.clone(),
        version: s.version.clone(),
        publisher: s.publisher.clone(),
        install_date: s.install_date.clone(),
    }).collect();
    database::update_software(&pool, &report.machine_id, &software)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Processos COM CPU
    let processes: Vec<ProcessInfo> = report.processes.iter().map(|p| ProcessInfo {
        id: 0,
        machine_id: report.machine_id.clone(),
        pid: p.pid,
        name: p.name.clone(),
        exe_path: p.exe_path.clone(),
        memory_mb: p.memory_mb,
        cpu_percent: p.cpu_percent, // AGORA TEM VALOR!
        captured_at: report.collected_at.clone(),
    }).collect();
    database::update_processes(&pool, &report.machine_id, &processes)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Screen Time (NOVO)
    for entry in &report.screen_time {
        database::insert_screen_time(
            &pool,
            &report.machine_id,
            &entry.app_name,
            entry.total_seconds,
            &entry.date,
        ).ok();
    }

    // Métricas
    database::insert_metric(
        &pool,
        &report.machine_id,
        report.hardware.cpu_usage_percent,
        report.hardware.ram_used_mb as i64,
        report.hardware.ram_total_mb as i64,
    ).ok();

    // Retorna políticas
    let policies = database::list_policies(&pool, Some(&report.machine_id))
        .unwrap_or_default();

    Ok(Json(ApiResponse {
        status: "ok".to_string(),
        message: format!("Dados de '{}' processados", report.hostname),
        policies,
    }))
}

// -------------------------------------------------
// Inicia o servidor HTTP
// -------------------------------------------------

pub async fn start_server(pool: DbPool) {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/v2/report", post(receive_report))
        .route("/api/v3/events", axum::routing::get(events_stream))
        .merge(api::create_api_router()) 
        .layer(middleware::from_fn_with_state(pool.clone(), auth_middleware))
        .layer(cors)
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:7474")
        .await
        .expect("[Server] Não foi possível iniciar na porta 7474");

    println!("[Server] AssetScan v2.0 aguardando agentes na porta 7474...");

    axum::serve(listener, app).await.unwrap();
}