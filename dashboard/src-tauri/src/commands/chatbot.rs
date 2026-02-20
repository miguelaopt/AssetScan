use tauri::State;
use crate::database::DbPool;

#[tauri::command]
pub async fn chatbot_query(
    query: String,
    pool: State<'_, DbPool>,
) -> Result<String, String> {
    let q = query.to_lowercase();
    let conn = pool.lock().unwrap();

    // Lógica básica de NLU (Compreensão de Linguagem Natural)
    if q.contains("quantas máquinas") || q.contains("total de máquinas") {
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM machines", [], |r| r.get(0)).unwrap_or(0);
        return Ok(format!("Atualmente, tens {} máquina(s) registada(s) no sistema.", count));
    } 
    else if q.contains("políticas") {
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM policies", [], |r| r.get(0)).unwrap_or(0);
        return Ok(format!("Existem {} política(s) de segurança aplicadas.", count));
    }
    else if q.contains("olá") || q.contains("ola") {
        return Ok("Olá! Eu sou a IA do AssetScan. Podes perguntar-me coisas como 'Quantas máquinas temos?' ou 'Temos políticas ativas?'. Como posso ajudar-te hoje?".to_string());
    }

    Ok("Não tenho a certeza se compreendi. Tenta perguntar sobre o 'total de máquinas' ou 'políticas'.".to_string())
}