use crate::database::{self, DbPool};
use crate::models::*;
use tauri::State;

#[tauri::command]
pub async fn create_policy(
    machine_id: Option<String>,
    name: String,
    description: String,
    policy_type: String,
    priority: i32,
    target: String,
    action: String,
    config_json: String,
    reason: String,
    pool: State<'_, DbPool>,
) -> Result<String, String> {
    let id = database::create_policy(
        &pool,
        machine_id.as_deref(),
        &name,
        &description,
        &policy_type,
        priority,
        &target,
        &action,
        &config_json,
        &reason,
        "admin",
    ).map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
pub async fn list_policies(
    machine_id: Option<String>,
    pool: State<'_, DbPool>,
) -> Result<Vec<Policy>, String> {
    database::list_policies(&pool, machine_id.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_policy(id: String, pool: State<'_, DbPool>) -> Result<(), String> {
    database::delete_policy(&pool, &id).map_err(|e| e.to_string())
}