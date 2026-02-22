use crate::database::{self, DbPool};
use crate::models::ProcessInfo;
use tauri::State;

#[tauri::command]
pub async fn get_processes(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<ProcessInfo>, String> {
    database::get_processes(&pool, &machine_id).map_err(|e| e.to_string())
}
