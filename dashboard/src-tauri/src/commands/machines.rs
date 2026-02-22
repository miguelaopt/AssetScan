use crate::database::{self, DbPool};
use crate::models::*;
use tauri::State;

#[tauri::command]
pub async fn list_machines(pool: State<'_, DbPool>) -> Result<Vec<Machine>, String> {
    database::list_machines(&pool).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_disks(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<DiskInfo>, String> {
    database::get_disks(&pool, &machine_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_hardware_details(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<HardwareDetails, String> {
    database::get_hardware_details(&pool, &machine_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_network_details(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<NetworkDetails, String> {
    database::get_network_details(&pool, &machine_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_security_status(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<SecurityStatus, String> {
    database::get_security_status(&pool, &machine_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn kill_process_remote(
    machine_id: String,
    process_name: String,
    pool: State<'_, DbPool>,
) -> Result<(), String> {
    // Cria política temporária para matar processo
    database::create_policy(
        &pool,
        Some(&machine_id),
        "process",
        &process_name,
        "kill",
        &format!("Terminado remotamente pelo administrador"),
        "admin",
    )
    .map_err(|e| e.to_string())?;

    database::log_audit(
        &pool,
        "kill_process_remote",
        "process",
        &process_name,
        "admin",
        &format!("Machine: {}", machine_id),
    )
    .ok();

    Ok(())
}

#[tauri::command]
pub async fn block_software(
    machine_id: String,
    software_name: String,
    reason: String,
    pool: State<'_, DbPool>,
) -> Result<String, String> {
    let policy_id = database::create_policy(
        &pool,
        Some(&machine_id),
        "application",
        &software_name,
        "block",
        &reason,
        "admin",
    )
    .map_err(|e| e.to_string())?;

    database::log_audit(
        &pool,
        "block_software",
        "policy",
        &policy_id,
        "admin",
        &format!("Blocked {} on machine {}", software_name, machine_id),
    )
    .ok();

    Ok(policy_id)
}

#[tauri::command]
pub async fn get_metrics_history(
    machine_id: String,
    hours: i64,
    pool: tauri::State<'_, DbPool>,
) -> Result<Vec<(String, f64, f64)>, String> {
    let conn = pool.lock().unwrap();

    // Calcula a data limite subtraindo as horas pedidas
    let time_limit = chrono::Utc::now() - chrono::Duration::hours(hours);

    let mut stmt = conn
        .prepare(
            "SELECT timestamp, cpu_percent, ram_percent 
         FROM historical_metrics 
         WHERE (machine_id = ?1 OR ?1 = 'all') AND timestamp >= ?2 
         ORDER BY timestamp ASC",
        )
        .map_err(|e| e.to_string())?;

    let metrics = stmt
        .query_map(
            rusqlite::params![machine_id, time_limit.to_rfc3339()],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, f64>(1)?,
                    row.get::<_, f64>(2)?,
                ))
            },
        )
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(metrics)
}

#[tauri::command]
pub async fn get_software(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<SoftwareEntry>, String> {
    database::get_software(&pool, &machine_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn rename_machine(
    machine_id: String,
    custom_name: String,
    pool: State<'_, DbPool>,
) -> Result<(), String> {
    database::update_machine_custom_name(&pool, &machine_id, &custom_name)
        .map_err(|e| e.to_string())?;

    database::log_audit(
        &pool,
        "rename_machine",
        "machine",
        &machine_id,
        "admin",
        &format!("Renamed to '{}'", custom_name),
    )
    .ok();

    Ok(())
}

#[tauri::command]
pub async fn get_dashboard_stats(pool: State<'_, DbPool>) -> Result<DashboardStats, String> {
    let machines = database::list_machines(&pool).map_err(|e| e.to_string())?;

    let total_machines = machines.len() as i64;
    let online_machines = machines.iter().filter(|m| m.is_online).count() as i64;

    let total_ram_gb = machines
        .iter()
        .map(|m| m.ram_total_mb as f64 / 1024.0)
        .sum();

    let total_storage_gb = 0.0; // Calcular se necessário

    let avg_cpu_usage = 0.0; // Será preenchido pelo aggregator

    let avg_ram = machines
        .iter()
        .filter(|m| m.ram_total_mb > 0)
        .map(|m| (m.ram_used_mb as f32 / m.ram_total_mb as f32) * 100.0)
        .sum::<f32>();
    let avg_ram_usage_percent = if !machines.is_empty() {
        avg_ram / machines.len() as f32
    } else {
        0.0
    };

    let policies = database::list_policies(&pool, None).map_err(|e| e.to_string())?;
    let total_policies = policies.len() as i64;
    let active_policies = policies.iter().filter(|p| p.enabled).count() as i64;

    Ok(DashboardStats {
        total_machines,
        online_machines,
        total_ram_gb,
        total_storage_gb,
        avg_cpu_usage,
        avg_ram_usage_percent,
        total_policies,
        active_policies,
    })
}

#[tauri::command]
pub async fn compare_machines(
    machine_ids: Vec<String>,
    pool: State<'_, DbPool>,
) -> Result<ComparisonResult, String> {
    if machine_ids.len() != 2 {
        return Err("Exactly 2 machines required for comparison".to_string());
    }

    let machines = database::list_machines(&pool).map_err(|e| e.to_string())?;

    let machine_a = machines
        .iter()
        .find(|m| m.machine_id == machine_ids[0])
        .ok_or("Machine A not found")?
        .clone();

    let machine_b = machines
        .iter()
        .find(|m| m.machine_id == machine_ids[1])
        .ok_or("Machine B not found")?
        .clone();

    let software_a = database::get_software(&pool, &machine_ids[0]).map_err(|e| e.to_string())?;
    let software_b = database::get_software(&pool, &machine_ids[1]).map_err(|e| e.to_string())?;

    let mut diff_software = Vec::new();

    for sw_a in &software_a {
        if !software_b.iter().any(|sw_b| sw_b.name == sw_a.name) {
            diff_software.push(format!("Only in {}: {}", machine_a.hostname, sw_a.name));
        }
    }

    for sw_b in &software_b {
        if !software_a.iter().any(|sw_a| sw_a.name == sw_b.name) {
            diff_software.push(format!("Only in {}: {}", machine_b.hostname, sw_b.name));
        }
    }

    Ok(ComparisonResult {
        machine_a,
        machine_b,
        diff_software,
        diff_policies: vec![],
    })
}

#[tauri::command]
pub async fn get_screen_time(
    machine_id: String,
    date: Option<String>,
    pool: State<'_, DbPool>,
) -> Result<Vec<crate::models::ScreenTimeEntry>, String> {
    database::get_screen_time(&pool, &machine_id, date.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_ip_policy(
    machine_id: Option<String>,
    ip_address: String,
    action: String,
    reason: String,
    pool: State<'_, DbPool>,
) -> Result<String, String> {
    database::create_ip_policy(&pool, machine_id.as_deref(), &ip_address, &action, &reason)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn block_software_for_machine(
    machine_id: String,
    software_name: String,
    reason: String,
    pool: State<'_, DbPool>,
) -> Result<String, String> {
    database::create_policy(
        &pool,
        Some(&machine_id),
        "application",
        &software_name,
        "block",
        &reason,
        "admin",
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn kill_process(
    machine_id: String,
    process_name: String,
    pool: State<'_, DbPool>,
) -> Result<(), String> {
    // Cria política temporária para bloquear processo
    database::create_policy(
        &pool,
        Some(&machine_id),
        "application",
        &process_name,
        "block",
        "Terminado pelo admin",
        "admin",
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
