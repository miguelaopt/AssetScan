use tauri::State;
use crate::database::DbPool;

#[tauri::command]
pub async fn chatbot_query(
    query: String,
    pool: State<'_, DbPool>,
) -> Result<String, String> {
    // 6.2 Chatbot Assistant
    Ok(format!("Recebi a tua query: '{}'. A IA está em inicialização...", query))
}