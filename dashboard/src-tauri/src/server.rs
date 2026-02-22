// ============================================================
// server.rs — Servidor HTTP Axum v3.0 (Enterprise)
// ============================================================

use crate::api;
use axum::{
    extract::{Request, State},
    http::{HeaderMap, StatusCode},
    middleware::{self, Next},
    response::Response,
    routing::post,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};

use crate::auth;
use crate::database::{self, DbPool};
use crate::models::*;
use axum::response::sse::{Event, Sse};
use futures::stream::Stream;
use std::convert::Infallible;

// -------------------------------------------------
// Estrutura de dados recebidas do agente v3.0
// -------------------------------------------------

#[derive(Deserialize, Debug)]
pub struct AgentReport {
    pub agent_version: String,
    pub hostname: String,
    pub machine_id: String,
    pub local_ip: String,
    pub collected_at: String,
    pub hardware: HardwarePayload,
    pub hardware_details: HardwareDetailsPayload, // NOVO!
    pub network_details: NetworkDetailsPayload,   // NOVO!
    pub security_status: SecurityStatusPayload,   // NOVO!
    pub software: Vec<SoftwarePayload>,
    pub processes: Vec<ProcessPayload>,
    pub network_connections: Option<Vec<NetworkConnectionPayload>>,
    pub screen_time: Vec<ScreenTimePayload>,
    pub current_user: Option<String>,
    pub os: OsPayload,
}

#[derive(Deserialize, Debug)]
pub struct HardwareDetailsPayload {
    pub serial_number: String,
    pub motherboard_manufacturer: String,
    pub motherboard_model: String,
    pub bios_version: String,
    pub gpu_name: String,
    pub gpu_vram_mb: i64,
    pub total_ram_slots: i64,
    pub used_ram_slots: i64,
    pub ram_type: String,
}

#[derive(Deserialize, Debug)]
pub struct NetworkDetailsPayload {
    pub local_ip: String,
    pub subnet_mask: String,
    pub gateway: String,
    pub dns_primary: String,
    pub dns_secondary: Option<String>,
    pub dhcp_enabled: bool,
    pub domain_name: String,
    pub is_domain_joined: bool,
    pub mac_address: String,
    pub adapter_name: String,
    pub connection_speed_mbps: i64,
    pub wifi_ssid: Option<String>,
    pub wifi_security: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct SecurityStatusPayload {
    pub windows_defender_enabled: bool,
    pub windows_defender_updated: bool,
    pub firewall_enabled: bool,
    pub bitlocker_active: bool,
    pub bitlocker_drives: Vec<String>,
    pub last_windows_update: String,
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
pub struct ScreenTimePayload {
    pub app_name: String,
    pub total_seconds: u64,
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
    policies: Vec<Policy>,
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

    let is_valid =
        auth::validate_api_key(&pool, api_key).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

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
        "[Server] Relatório v{} recebido de: {} (ID: {})",
        report.agent_version, report.hostname, report.machine_id
    );

    // 1. Upsert da máquina (Com a ordem correcta de argumentos)
    let _db_machine_id = database::upsert_machine(
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
        // Enterprise Fields - CORRECTED PATHS
        &report.local_ip,
        &report.network_details.mac_address,
        &report.hardware_details.serial_number,
        &report.hardware_details.motherboard_model,
        &report.hardware_details.gpu_name,
        report.security_status.bitlocker_active,
        &report.network_details.domain_name,
        report.current_user.as_deref().unwrap_or(""), // Handles missing user gracefully
    )
    .map_err(|e| {
        eprintln!("[Server] Erro ao salvar máquina: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let hardware_details = crate::models::HardwareDetails {
        serial_number: report.hardware_details.serial_number.clone(),
        motherboard_manufacturer: report.hardware_details.motherboard_manufacturer.clone(),
        motherboard_model: report.hardware_details.motherboard_model.clone(),
        bios_version: report.hardware_details.bios_version.clone(),
        gpu_name: report.hardware_details.gpu_name.clone(),
        gpu_vram_mb: report.hardware_details.gpu_vram_mb,
        total_ram_slots: report.hardware_details.total_ram_slots,
        used_ram_slots: report.hardware_details.used_ram_slots,
        ram_type: report.hardware_details.ram_type.clone(),
    };
    database::update_hardware_details(&pool, &report.machine_id, &hardware_details).ok();

    // NOVO: Guarda network details
    let network_details = crate::models::NetworkDetails {
        local_ip: report.network_details.local_ip.clone(),
        subnet_mask: report.network_details.subnet_mask.clone(),
        gateway: report.network_details.gateway.clone(),
        dns_primary: report.network_details.dns_primary.clone(),
        dns_secondary: report.network_details.dns_secondary.clone(),
        dhcp_enabled: report.network_details.dhcp_enabled,
        domain_name: report.network_details.domain_name.clone(),
        is_domain_joined: report.network_details.is_domain_joined,
        mac_address: report.network_details.mac_address.clone(),
        adapter_name: report.network_details.adapter_name.clone(),
        connection_speed_mbps: report.network_details.connection_speed_mbps,
        wifi_ssid: report.network_details.wifi_ssid.clone(),
        wifi_security: report.network_details.wifi_security.clone(),
    };
    database::update_network_details(&pool, &report.machine_id, &network_details).ok();

    // NOVO: Guarda security status
    let security_status = crate::models::SecurityStatus {
        windows_defender_enabled: report.security_status.windows_defender_enabled,
        windows_defender_updated: report.security_status.windows_defender_updated,
        firewall_enabled: report.security_status.firewall_enabled,
        bitlocker_active: report.security_status.bitlocker_active,
        bitlocker_drives: report.security_status.bitlocker_drives.clone(),
        last_windows_update: report.security_status.last_windows_update.clone(),
    };
    database::update_security_status(&pool, &report.machine_id, &security_status).ok();

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

    let _ = database::update_disks(&pool, &report.machine_id, &disks);

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

    let _ = database::update_software(&pool, &report.machine_id, &software);

    // 4. Atualiza processos
    let processes: Vec<ProcessInfo> = report
        .processes
        .iter()
        .map(|p| ProcessInfo {
            id: 0,
            machine_id: report.machine_id.clone(),
            pid: p.pid,
            name: p.name.clone(),
            exe_path: p.exe_path.clone(),
            memory_mb: p.memory_mb,
            cpu_percent: p.cpu_percent,
            captured_at: report.collected_at.clone(),
        })
        .collect();

    let _ = database::update_processes(&pool, &report.machine_id, &processes);

    // 5. Busca políticas aplicáveis a esta máquina
    let policies = database::list_policies(&pool, Some(&report.machine_id))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse {
        status: "ok".to_string(),
        message: format!("Dados de '{}' processados com sucesso.", report.hostname),
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
        .layer(middleware::from_fn_with_state(
            pool.clone(),
            auth_middleware,
        ))
        .layer(cors)
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:7474")
        .await
        .expect("[Server] Não foi possível iniciar na porta 7474");

    println!("[Server] AssetScan v3.0 aguardando agentes na porta 7474...");

    axum::serve(listener, app).await.unwrap();
}
