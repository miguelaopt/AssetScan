use crate::database::DbPool;
use tauri::State;

#[tauri::command]
pub async fn chatbot_query(query: String, pool: State<'_, DbPool>) -> Result<String, String> {
    // Parse query simples
    let query_lower = query.to_lowercase();

    if query_lower.contains("quantas") && query_lower.contains("máquinas") {
        let machines = crate::database::list_machines(&pool).map_err(|e| e.to_string())?;

        let total = machines.len();
        let online = machines.iter().filter(|m| m.is_online).count();

        return Ok(format!(
            "Tens {} máquinas no total. {} estão online e {} estão offline.",
            total,
            online,
            total - online
        ));
    }

    if query_lower.contains("cpu") || query_lower.contains("processador") {
        return Ok("Para ver informações de CPU, acede à página Dashboard onde podes ver gráficos em tempo real.".to_string());
    }

    if query_lower.contains("vulnerabilidades") {
        return Ok(
            "Acede à página Vulnerabilidades para ver todas as falhas de segurança detectadas."
                .to_string(),
        );
    }

    Ok("Desculpa, ainda não entendo essa pergunta. Tenta perguntar sobre máquinas, CPU ou vulnerabilidades.".to_string())
}
