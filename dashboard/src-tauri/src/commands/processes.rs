// ============================================================
// commands/processes.rs — Processos activos
// ============================================================

use tauri::State;
use crate::database::{self, DbPool};
use crate::models::*;

#[tauri::command]
pub async fn get_processes(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<ProcessInfo>, String> {
    database::get_processes(&pool, &machine_id)
        .map_err(|e| e.to_string())
}