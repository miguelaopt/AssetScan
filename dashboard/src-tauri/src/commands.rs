// ============================================================
// commands.rs — Comandos Tauri: a ponte entre o React e o Rust.
// ============================================================

use tauri::State;
use crate::database::{self, DbPool, Machine, DiskInfo, SoftwareEntry};

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