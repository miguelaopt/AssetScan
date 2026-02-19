use tauri::State;
use crate::database::DbPool;

#[tauri::command]
pub async fn request_screenshot(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<String, String> {
    // 4.4 Screenshots Remotos
    // 1. Cria requisição na DB
    // 2. Agente vai buscar na próxima conexão
    // 3. Retorna path
    Ok(format!("/screenshots/{}_latest.jpg", machine_id))
}