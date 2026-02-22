// ============================================================
// models.rs — Structs partilhadas entre módulos
// ============================================================

use serde::{Deserialize, Serialize};

// -------------------------------------------------
// Máquinas
// -------------------------------------------------

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Machine {
    pub id: String,
    pub machine_id: String,           // UUID do agente
    pub hostname: String,
    pub custom_name: Option<String>,  // NOVO: nome customizável
    pub tags: Vec<String>,            // NOVO: tags
    pub notes: Option<String>,        // NOVO: notas do admin
    pub last_seen: String,
    pub cpu_name: String,
    pub cpu_cores: i64,
    pub ram_total_mb: i64,
    pub ram_used_mb: i64,
    pub os_name: String,
    pub os_version: String,
    pub uptime_hours: i64,
    pub disk_count: i64,
    pub software_count: i64,
    pub process_count: i64,           // NOVO
    pub is_online: bool,              // NOVO: online se last_seen < 2h
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_gb: f64,
    pub free_gb: f64,
    pub fs_type: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SoftwareEntry {
    pub name: String,
    pub version: String,
    pub publisher: String,
    pub install_date: String,
}

// -------------------------------------------------
// Processos (NOVO)
// -------------------------------------------------

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProcessInfo {
    pub id: i64,
    pub machine_id: String,
    pub pid: u32,
    pub name: String,
    pub exe_path: String,
    pub memory_mb: f64,
    pub cpu_percent: f32,
    pub captured_at: String,
}

// -------------------------------------------------
// Políticas (NOVO)
// -------------------------------------------------

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Policy {
    pub id: String,
    pub machine_id: Option<String>,   // null = aplica-se a todas
    pub policy_type: PolicyType,
    pub target: String,
    pub action: PolicyAction,
    pub reason: String,
    pub created_by: String,
    pub created_at: String,
    pub enabled: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum PolicyType {
    Application,
    Website,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum PolicyAction {
    Allow,
    Block,
}

// -------------------------------------------------
// Logs de Auditoria (NOVO)
// -------------------------------------------------

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AuditLog {
    pub id: i64,
    pub timestamp: String,
    pub action: String,
    pub resource_type: String,
    pub resource_id: String,
    pub user: String,
    pub details: String,
}

// -------------------------------------------------
// Estatísticas Agregadas (NOVO)
// -------------------------------------------------

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DashboardStats {
    pub total_machines: i64,
    pub online_machines: i64,
    pub total_ram_gb: f64,
    pub total_storage_gb: f64,
    pub avg_cpu_usage: f32,
    pub avg_ram_usage_percent: f32,
    pub total_policies: i64,
    pub active_policies: i64,
}

// ============================================================
// Modelos v3.0 (Adições)
// ============================================================

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MachineFilters {
    pub os: Option<Vec<String>>,
    pub status: Option<String>,
    pub tags: Option<Vec<String>>,
    pub min_ram: Option<i64>,
    pub max_ram: Option<i64>,
    pub search_term: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Vulnerability {
    pub id: i64,
    pub machine_id: String,
    pub software_name: String,
    pub software_version: String,
    pub cve_id: String,
    pub severity: String,
    pub description: Option<String>,
    pub published_date: Option<String>,
    pub last_checked: Option<String>,
    pub status: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ComparisonResult {
    pub machine_a: Machine,
    pub machine_b: Machine,
    pub diff_software: Vec<String>,
    pub diff_policies: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WebhookEvent {
    pub event_type: String,
    pub timestamp: String,
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenTimeEntry {
    pub machine_id: String,
    pub app_name: String,
    pub total_seconds: u64,
    pub date: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MachineWithIP {
    #[serde(flatten)]
    pub machine: Machine,
    pub local_ip: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IPPolicy {
    pub id: String,
    pub machine_id: Option<String>,
    pub ip_address: String,
    pub action: String, // "block" | "allow"
    pub reason: String,
    pub created_at: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessWithCPU {
    pub id: i64,
    pub machine_id: String,
    pub pid: u32,
    pub name: String,
    pub exe_path: String,
    pub memory_mb: f64,
    pub cpu_percent: f32, // AGORA TEM VALOR REAL
    pub captured_at: String,
}