use crate::database::DbPool;
use tauri::State;

#[tauri::command]
pub async fn request_screenshot(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<String, String> {
    // Placeholder - screenshot será capturado pelo agente na próxima conexão
    Ok(format!("Screenshot requested for machine {}", machine_id))
}
