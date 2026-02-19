// ============================================================
// collector.rs — Coleta de informações do sistema
// ============================================================


use anyhow::Result;
use serde::{Deserialize, Serialize};
use sysinfo::{Disks, System, Pid, ProcessesToUpdate};
use winreg::enums::*;
use winreg::RegKey;
use chrono::Utc;

// Importa as estruturas do teu novo módulo
use crate::network_collector::NetworkConnection;

#[derive(Serialize, Deserialize, Debug)]
pub struct SystemReport {
    pub agent_version: String,
    pub hostname: String,
    pub machine_id: String,           // UUID único persistente
    pub collected_at: String,
    pub hardware: HardwareInfo,
    pub software: Vec<SoftwareEntry>,
    pub processes: Vec<ProcessInfo>,  // NOVO
    pub network: Vec<NetworkConnection>, // NOVO v3.0: Dados de rede
    pub os: OsInfo,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct HardwareInfo {
    pub cpu_name: String,
    pub cpu_cores: usize,
    pub cpu_threads: usize,
    pub cpu_usage_percent: f32,
    pub ram_total_mb: u64,
    pub ram_used_mb: u64,
    pub disks: Vec<DiskInfo>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_gb: f64,
    pub free_gb: f64,
    pub fs_type: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SoftwareEntry {
    pub name: String,
    pub version: String,
    pub publisher: String,
    pub install_date: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub exe_path: String,
    pub memory_mb: f64,
    pub cpu_percent: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OsInfo {
    pub name: String,
    pub version: String,
    pub kernel_version: String,
    pub uptime_hours: u64,
}

// -------------------------------------------------
// Coleta completa
// -------------------------------------------------

pub fn collect_full_report(config: &crate::config::Config) -> Result<SystemReport> {
    let mut sys = System::new_all();
    sys.refresh_all();

    std::thread::sleep(std::time::Duration::from_secs(1));
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    sys.refresh_cpu_usage();
    sys.refresh_processes(ProcessesToUpdate::All, true);

    let hostname = System::host_name().unwrap_or_else(|| "Unknown".to_string());
    let machine_id = get_or_create_machine_id()?;

    Ok(SystemReport {
        agent_version: "3.0.0".to_string(), // Actualizei para a v3.0!
        hostname,
        machine_id,
        collected_at: Utc::now().to_rfc3339(),
        hardware: collect_hardware(&sys),
        os: collect_os(&sys),
        software: collect_software()?,
        processes: collect_processes(&sys),
        network: crate::network_collector::collect_network_stats(), // Chamada ao novo módulo
    })
}

// -------------------------------------------------
// Hardware
// -------------------------------------------------

fn collect_hardware(sys: &System) -> HardwareInfo {
    let cpus = sys.cpus();
    let cpu_name = cpus
        .first()
        .map(|c| c.brand().to_string())
        .unwrap_or_else(|| "Unknown".to_string());

    let cpu_cores = sys.physical_core_count().unwrap_or(0);
    let cpu_threads = cpus.len();

    let cpu_usage_percent = if cpu_threads == 0 {
        0.0
    } else {
        cpus.iter().map(|c| c.cpu_usage()).sum::<f32>() / cpu_threads as f32
    };

    let ram_total_mb = sys.total_memory() / 1024 / 1024;
    let ram_used_mb = sys.used_memory() / 1024 / 1024;

    let disks_list = Disks::new_with_refreshed_list();
    let disks: Vec<DiskInfo> = disks_list
        .iter()
        .map(|d| DiskInfo {
            name: d.name().to_string_lossy().to_string(),
            mount_point: d.mount_point().to_string_lossy().to_string(),
            total_gb: d.total_space() as f64 / 1_073_741_824.0,
            free_gb: d.available_space() as f64 / 1_073_741_824.0,
            fs_type: d.file_system().to_string_lossy().to_string(),
        })
        .collect();

    HardwareInfo {
        cpu_name,
        cpu_cores,
        cpu_threads,
        cpu_usage_percent,
        ram_total_mb,
        ram_used_mb,
        disks,
    }
}

// -------------------------------------------------
// Sistema Operacional
// -------------------------------------------------

fn collect_os(_sys: &System) -> OsInfo {
    OsInfo {
        name: System::name().unwrap_or_else(|| "Windows".to_string()),
        version: System::os_version().unwrap_or_else(|| "Unknown".to_string()),
        kernel_version: System::kernel_version().unwrap_or_else(|| "Unknown".to_string()),
        uptime_hours: System::uptime() / 3600,
    }
}

// -------------------------------------------------
// Software Instalado
// -------------------------------------------------

fn collect_software() -> Result<Vec<SoftwareEntry>> {
    let mut list: Vec<SoftwareEntry> = Vec::new();

    let paths = [
        (HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
        (HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"),
        (HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
    ];

    for (hive, path) in &paths {
        let root = RegKey::predef(*hive);
        let Ok(key) = root.open_subkey(path) else { continue };

        for subkey_name in key.enum_keys().flatten() {
            let Ok(sub) = key.open_subkey(&subkey_name) else { continue };

            let Ok(name): Result<String, _> = sub.get_value("DisplayName") else { continue };
            if name.is_empty() { continue; }

            let version: String = sub.get_value("DisplayVersion").unwrap_or_default();
            let publisher: String = sub.get_value("Publisher").unwrap_or_default();
            let install_date: String = sub.get_value("InstallDate").unwrap_or_default();

            list.push(SoftwareEntry {
                name,
                version,
                publisher,
                install_date,
            });
        }
    }

    list.sort_by(|a, b| a.name.cmp(&b.name));
    list.dedup_by(|a, b| a.name == b.name);

    Ok(list)
}

// -------------------------------------------------
// Processos Ativos (NOVO)
// -------------------------------------------------

fn collect_processes(sys: &System) -> Vec<ProcessInfo> {
    sys.processes()
        .iter()
        .map(|(pid, process)| {
            let exe_path = process.exe()
                .and_then(|p| p.to_str())
                .unwrap_or("")
                .to_string();

            ProcessInfo {
                pid: pid.as_u32(),
                name: process.name().to_string_lossy().to_string(),
                exe_path,
                memory_mb: process.memory() as f64 / 1_048_576.0,
                cpu_percent: process.cpu_usage(),
            }
        })
        .filter(|p| !p.name.is_empty())
        .collect()
}

// -------------------------------------------------
// Machine ID único e persistente
// -------------------------------------------------

fn get_or_create_machine_id() -> Result<String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    
    // Tenta ler ID existente
    if let Ok(key) = hklm.open_subkey(r"SOFTWARE\AssetScan") {
        if let Ok(id) = key.get_value::<String, _>("MachineID") {
            return Ok(id);
        }
    }

    // Cria novo ID
    let new_id = uuid::Uuid::new_v4().to_string();
    
    // Salva no registry
    let (key, _) = hklm.create_subkey(r"SOFTWARE\AssetScan")?;
    key.set_value("MachineID", &new_id)?;

    Ok(new_id)
}