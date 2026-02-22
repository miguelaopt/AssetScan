use tauri::State;
use crate::database::{self, DbPool};
use crate::models::*;

#[tauri::command]
pub async fn create_policy(
    machine_id: Option<String>,
    policy_type: String,
    target: String,
    action: String,
    reason: String,
    pool: State<'_, DbPool>,
) -> Result<String, String> {
    let id = database::create_policy(
        &pool,
        machine_id.as_deref(),
        &policy_type,
        &target,
        &action,
        &reason,
        "admin",
    ).map_err(|e| e.to_string())?;
    
    database::log_audit(
        &pool,
        "create_policy",
        "policy",
        &id,
        "admin",
        &format!("{} {} for {}", action, policy_type, target),
    ).ok();
    
    Ok(id)
}

#[tauri::command]
pub async fn list_policies(
    machine_id: Option<String>,
    pool: State<'_, DbPool>,
) -> Result<Vec<Policy>, String> {
    database::list_policies(&pool, machine_id.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_policy(
    policy_id: String,
    pool: State<'_, DbPool>,
) -> Result<(), String> {
    database::delete_policy(&pool, &policy_id)
        .map_err(|e| e.to_string())?;
    
    database::log_audit(
        &pool,
        "delete_policy",
        "policy",
        &policy_id,
        "admin",
        "Policy deleted",
    ).ok();
    
    Ok(())
}