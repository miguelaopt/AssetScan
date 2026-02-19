// ============================================================
// commands/machines.rs — Comandos relacionados a máquinas
// ============================================================

use tauri::State;
use crate::database::{self, DbPool};
use crate::models::*;

#[tauri::command]
pub async fn list_machines(
    pool: State<'_, DbPool>,
) -> Result<Vec<Machine>, String> {
    database::list_machines(&pool)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_disks(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<DiskInfo>, String> {
    database::get_disks(&pool, &machine_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_software(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<SoftwareEntry>, String> {
    database::get_software(&pool, &machine_id)
        .map_err(|e| e.to_string())
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
pub async fn get_dashboard_stats(
    pool: State<'_, DbPool>,
) -> Result<DashboardStats, String> {
    let machines = database::list_machines(&pool)
        .map_err(|e| e.to_string())?;

    let total_machines = machines.len() as i64;
    let online_machines = machines.iter().filter(|m| m.is_online).count() as i64;

    let total_ram_gb: f64 = machines
        .iter()
        .map(|m| m.ram_total_mb as f64 / 1024.0)
        .sum();

    let avg_cpu_usage: f32 = if total_machines > 0 {
        0.0  // TODO: calcular do histórico
    } else {
        0.0
    };

    let avg_ram_usage_percent: f32 = if total_machines > 0 {
        machines
            .iter()
            .map(|m| (m.ram_used_mb as f32 / m.ram_total_mb as f32) * 100.0)
            .sum::<f32>()
            / total_machines as f32
    } else {
        0.0
    };

    let policies = database::list_policies(&pool, None)
        .map_err(|e| e.to_string())?;

    let total_policies = policies.len() as i64;
    let active_policies = policies.iter().filter(|p| p.enabled).count() as i64;

    Ok(DashboardStats {
        total_machines,
        online_machines,
        total_ram_gb,
        total_storage_gb: 0.0,  // TODO
        avg_cpu_usage,
        avg_ram_usage_percent,
        total_policies,
        active_policies,
    })
}

use crate::models::ComparisonResult;

#[tauri::command]
pub async fn compare_machines(
    machine_ids: Vec<String>,
    pool: tauri::State<'_, crate::database::DbPool>,
) -> Result<ComparisonResult, String> {
    // 1.6 Comparação de Máquinas
    Err("Comparação de máquinas em implementação...".to_string())
}