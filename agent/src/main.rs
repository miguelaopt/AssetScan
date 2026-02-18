// ============================================================
// AssetScan Agent — Coleta informações do sistema e envia
// ao servidor do administrador.
// API compatível com sysinfo 0.33+
// ============================================================

use serde::{Deserialize, Serialize};
// NOTA: Sem traits! Na 0.30+ os métodos são chamados directamente.
use sysinfo::{Disks, System};
use winreg::enums::*;
use winreg::RegKey;
use chrono::Utc;
use std::env;

// -------------------------------------------------
// Estruturas de dados (inalteradas)
// -------------------------------------------------

#[derive(Serialize, Deserialize, Debug)]
struct AssetReport {
    hostname:     String,
    collected_at: String,
    hardware:     HardwareInfo,
    software:     Vec<SoftwareEntry>,
    os:           OsInfo,
}

#[derive(Serialize, Deserialize, Debug)]
struct HardwareInfo {
    cpu_name:          String,
    cpu_cores:         usize,
    cpu_threads:       usize,
    cpu_usage_percent: f32,
    ram_total_mb:      u64,
    ram_used_mb:       u64,
    disks:             Vec<DiskInfo>,
}

#[derive(Serialize, Deserialize, Debug)]
struct DiskInfo {
    name:        String,
    mount_point: String,
    total_gb:    f64,
    free_gb:     f64,
    fs_type:     String,
}

#[derive(Serialize, Deserialize, Debug)]
struct SoftwareEntry {
    name:         String,
    version:      String,
    publisher:    String,
    install_date: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct OsInfo {
    name:           String,
    version:        String,
    kernel_version: String,
    uptime_hours:   u64,
}

// -------------------------------------------------
// Coleta de Hardware
// -------------------------------------------------

fn collect_hardware(sys: &System) -> HardwareInfo {
    // --- CPU ---
    let cpus       = sys.cpus();
    let cpu_name   = cpus.first()
        .map(|c| c.brand().to_string())
        .unwrap_or_else(|| "Desconhecido".to_string());

    let cpu_cores   = sys.physical_core_count().unwrap_or(0);
    let cpu_threads = cpus.len();

    // Uso médio em todos os núcleos
    let cpu_usage_percent = if cpu_threads == 0 {
        0.0
    } else {
        cpus.iter().map(|c| c.cpu_usage()).sum::<f32>() / cpu_threads as f32
    };

    // --- RAM ---
    let ram_total_mb = sys.total_memory()  / 1024 / 1024;
    let ram_used_mb  = sys.used_memory()   / 1024 / 1024;

    // --- Discos ---
    // Na 0.30+ os discos são um tipo separado — instanciamos aqui
    let disks_list = Disks::new_with_refreshed_list();
    let disks: Vec<DiskInfo> = disks_list
        .iter()
        .map(|d| DiskInfo {
            name:        d.name().to_string_lossy().to_string(),
            mount_point: d.mount_point().to_string_lossy().to_string(),
            total_gb:    d.total_space()     as f64 / 1_073_741_824.0,
            free_gb:     d.available_space() as f64 / 1_073_741_824.0,
            // file_system() já retorna &OsStr — não precisamos de iter/map
            fs_type:     d.file_system().to_string_lossy().to_string(),
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
// Coleta de SO
// Na 0.30+ name(), os_version() e kernel_version()
// passaram a ser métodos ESTÁTICOS de System.
// -------------------------------------------------

fn collect_os(sys: &System) -> OsInfo {
    OsInfo {
        // Métodos estáticos — chamados em System::, não em sys.
        name:           System::name()
                            .unwrap_or_else(|| "Windows".to_string()),
        version:        System::os_version()
                            .unwrap_or_else(|| "Desconhecido".to_string()),
        kernel_version: System::kernel_version()
                            .unwrap_or_else(|| "Desconhecido".to_string()),
        // uptime() continua como método de instância
        uptime_hours:   System::uptime() / 3600,
    }
}

// -------------------------------------------------
// Coleta de Software (sem alterações — usa winreg)
// -------------------------------------------------

fn collect_software() -> Vec<SoftwareEntry> {
    let mut list: Vec<SoftwareEntry> = Vec::new();

    let paths = [
        (HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
        (HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"),
        (HKEY_CURRENT_USER,  r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
    ];

    for (hive, path) in &paths {
        let root = RegKey::predef(*hive);
        let Ok(key) = root.open_subkey(path) else { continue };

        for subkey_name in key.enum_keys().flatten() {
            let Ok(sub) = key.open_subkey(&subkey_name) else { continue };

            // Se não tiver DisplayName, não é uma app real — ignora
            let Ok(name): Result<String, _> = sub.get_value("DisplayName") else { continue };
            if name.is_empty() { continue; }

            let version:      String = sub.get_value("DisplayVersion").unwrap_or_default();
            let publisher:    String = sub.get_value("Publisher").unwrap_or_default();
            let install_date: String = sub.get_value("InstallDate").unwrap_or_default();

            list.push(SoftwareEntry { name, version, publisher, install_date });
        }
    }

    // Remove duplicatas pelo nome
    list.sort_by(|a, b| a.name.cmp(&b.name));
    list.dedup_by(|a, b| a.name == b.name);
    list
}

// -------------------------------------------------
// Envio via HTTP (actualizado para reqwest 0.12)
// -------------------------------------------------

fn send_report(report: &AssetReport, server_url: &str) -> Result<(), String> {
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("{}/api/report", server_url);

    let response = client
        .post(&url)
        .json(report)
        .send()
        .map_err(|e| format!("Erro ao conectar: {}", e))?;

    if response.status().is_success() {
        println!("[AssetScan] Enviado com sucesso para {}", server_url);
        Ok(())
    } else {
        Err(format!(
            "Servidor retornou: {} {}",
            response.status().as_u16(),
            response.status().canonical_reason().unwrap_or("Unknown")
        ))
    }
}

// -------------------------------------------------
// Main
// -------------------------------------------------

fn main() {
    let server_url = env::args()
        .nth(1)
        .or_else(|| env::var("ASSETSCAN_SERVER").ok())
        .unwrap_or_else(|| "http://localhost:7474".to_string());

    println!("[AssetScan Agent] Iniciando coleta...");
    println!("[AssetScan Agent] Servidor: {}", server_url);

    // Inicializa o System — na 0.30+ o hostname também é método estático
    let mut sys = System::new_all();
    sys.refresh_all();

    // Pausa para leitura de CPU mais fiável
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);

    // refresh_cpu_usage() substituiu refresh_cpu() na 0.30+
    sys.refresh_cpu_usage();

    let hostname = System::host_name()
        .unwrap_or_else(|| "Desconhecido".to_string());

    println!("[AssetScan Agent] Coletando dados de: {}", hostname);

    let software = collect_software();
    println!("[AssetScan Agent] {} softwares encontrados.", software.len());

    let report = AssetReport {
        hostname,
        collected_at: Utc::now().to_rfc3339(),
        hardware:     collect_hardware(&sys),
        os:           collect_os(&sys),
        software,
    };

    match send_report(&report, &server_url) {
        Ok(_)  => println!("[AssetScan Agent] Concluído com sucesso."),
        Err(e) => {
            eprintln!("[AssetScan Agent] ERRO: {}", e);
            std::process::exit(1);
        }
    }
}