use crate::database::DbPool;
use crate::models::Vulnerability;
use rusqlite::Row;
use tauri::State;
use crate::vulnerability_scanner;

// Função helper para mapear rows
fn map_vulnerability_row(row: &Row) -> rusqlite::Result<Vulnerability> {
    Ok(Vulnerability {
        id: row.get(0)?,
        machine_id: row.get(1)?,
        software_name: row.get(2)?,
        software_version: row.get(3)?,
        cve_id: row.get(4)?,
        severity: row.get(5)?,
        description: row.get(6)?,
        published_date: row.get(7)?,
        last_checked: row.get(8)?,
        status: row.get(9)?,
    })
}

#[tauri::command]
pub async fn get_vulnerabilities(
    machine_id: Option<String>,
    severity: Option<String>,
    pool: State<'_, DbPool>,
) -> Result<Vec<Vulnerability>, String> {
    let conn = pool.lock().unwrap();

    // Constrói query dinamicamente
    let mut query = "SELECT * FROM vulnerabilities WHERE 1=1".to_string();
    let mut params: Vec<String> = Vec::new();

    if machine_id.is_some() {
        query.push_str(" AND machine_id = ?");
        params.push(machine_id.unwrap());
    }

    if severity.is_some() {
        query.push_str(" AND severity = ?");
        params.push(severity.unwrap());
    }

    query.push_str(" ORDER BY published_date DESC");

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;

    // Converte Vec<String> para Vec<&dyn ToSql>
    let params_refs: Vec<&dyn rusqlite::ToSql> =
        params.iter().map(|s| s as &dyn rusqlite::ToSql).collect();

    let vulns = stmt
        .query_map(&params_refs[..], map_vulnerability_row)
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(vulns)
}

#[tauri::command]
pub async fn scan_vulnerabilities(
    machine_id: String,
    pool: State<'_, DbPool>,
) -> Result<usize, String> {
    let conn = pool.lock().unwrap();
    let mut total_vulns = 0;

    // Apenas insere um DUMMY genérico no banco de dados para testes visuais
    let cve_id = "CVE-2023-XXXX";
    let desc = "Vulnerabilidade crítica detetada (Simulação). Requer atualização imediata.";
    
    // Insere ou atualiza o scan simulado
    conn.execute(
        "INSERT OR IGNORE INTO vulnerabilities (machine_id, software_name, software_version, cve_id, severity, description, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'open')",
        rusqlite::params![
            if machine_id == "all" { "ALL_MACHINES" } else { &machine_id },
            "Google Chrome",
            "100.0.0",
            cve_id,
            "critical",
            desc
        ],
    ).map_err(|e| e.to_string())?;

    Ok(1)
}
