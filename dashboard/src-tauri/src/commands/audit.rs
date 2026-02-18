// ============================================================
// commands/audit.rs — Logs de auditoria
// ============================================================

use tauri::State;
use rusqlite::params;
use crate::database::DbPool;
use crate::models::*;

#[tauri::command]
pub async fn get_audit_logs(
    limit: Option<i64>,
    pool: State<'_, DbPool>,
) -> Result<Vec<AuditLog>, String> {
    let conn = pool.lock().unwrap();
    let limit = limit.unwrap_or(100);

    let mut stmt = conn.prepare(
        "SELECT id, timestamp, action, resource_type, resource_id, user, details
         FROM audit_logs
         ORDER BY timestamp DESC
         LIMIT ?1"
    ).map_err(|e| e.to_string())?;

    let logs = stmt.query_map(params![limit], |row| {
        Ok(AuditLog {
            id: row.get(0)?,
            timestamp: row.get(1)?,
            action: row.get(2)?,
            resource_type: row.get(3)?,
            resource_id: row.get(4)?,
            user: row.get(5)?,
            details: row.get(6)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<rusqlite::Result<Vec<AuditLog>>>()
    .map_err(|e| e.to_string())?;

    Ok(logs)
}