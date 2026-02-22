use tauri::State;
use crate::database::DbPool;

#[tauri::command]
pub async fn request_screenshot(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<String, String> {
    // Placeholder - screenshot será capturado pelo agente na próxima conexão
    Ok(format!("Screenshot requested for machine {}", machine_id))
}