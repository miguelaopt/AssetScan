#[tauri::command]
pub async fn list_vulnerabilities() -> Result<Vec<crate::models::Vulnerability>, String> {
    // Retorna vazio ou os reais da DB
    Ok(vec![])
}