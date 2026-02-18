// ============================================================
// database.rs — Gestão do banco de dados SQLite
// ============================================================

use rusqlite::{Connection, Result, params};
use std::sync::{Arc, Mutex};
use chrono::Utc;

use crate::models::*;

pub type DbPool = Arc<Mutex<Connection>>;

// -------------------------------------------------
// Inicialização e Schema v2.0
// -------------------------------------------------

pub fn initialize(conn: &Connection) -> Result<()> {
    conn.execute_batch("
        PRAGMA journal_mode=WAL;
        PRAGMA foreign_keys=ON;

        -- Tabela de máquinas (expandida)
        CREATE TABLE IF NOT EXISTS machines (
            id            TEXT PRIMARY KEY,
            machine_id    TEXT NOT NULL UNIQUE,
            hostname      TEXT NOT NULL,
            custom_name   TEXT,
            tags          TEXT DEFAULT '[]',
            notes         TEXT,
            last_seen     TEXT NOT NULL,
            cpu_name      TEXT NOT NULL DEFAULT '',
            cpu_cores     INTEGER NOT NULL DEFAULT 0,
            cpu_threads   INTEGER NOT NULL DEFAULT 0,
            ram_total_mb  INTEGER NOT NULL DEFAULT 0,
            ram_used_mb   INTEGER NOT NULL DEFAULT 0,
            os_name       TEXT NOT NULL DEFAULT '',
            os_version    TEXT NOT NULL DEFAULT '',
            kernel_version TEXT NOT NULL DEFAULT '',
            uptime_hours  INTEGER NOT NULL DEFAULT 0,
            created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_machine_id ON machines(machine_id);
        CREATE INDEX IF NOT EXISTS idx_last_seen ON machines(last_seen);

        -- Discos
        CREATE TABLE IF NOT EXISTS disks (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id  TEXT NOT NULL REFERENCES machines(machine_id) ON DELETE CASCADE,
            name        TEXT NOT NULL,
            mount_point TEXT NOT NULL,
            total_gb    REAL NOT NULL DEFAULT 0,
            free_gb     REAL NOT NULL DEFAULT 0,
            fs_type     TEXT NOT NULL DEFAULT ''
        );

        CREATE INDEX IF NOT EXISTS idx_disks_machine ON disks(machine_id);

        -- Software instalado
        CREATE TABLE IF NOT EXISTS software (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id   TEXT NOT NULL REFERENCES machines(machine_id) ON DELETE CASCADE,
            name         TEXT NOT NULL,
            version      TEXT NOT NULL DEFAULT '',
            publisher    TEXT NOT NULL DEFAULT '',
            install_date TEXT NOT NULL DEFAULT ''
        );

        CREATE INDEX IF NOT EXISTS idx_software_machine ON software(machine_id);
        CREATE INDEX IF NOT EXISTS idx_software_name ON software(name);

        -- Processos activos (NOVO)
        CREATE TABLE IF NOT EXISTS processes (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id  TEXT NOT NULL REFERENCES machines(machine_id) ON DELETE CASCADE,
            pid         INTEGER NOT NULL,
            name        TEXT NOT NULL,
            exe_path    TEXT NOT NULL DEFAULT '',
            memory_mb   REAL NOT NULL DEFAULT 0,
            cpu_percent REAL NOT NULL DEFAULT 0,
            captured_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_processes_machine ON processes(machine_id);
        CREATE INDEX IF NOT EXISTS idx_processes_time ON processes(captured_at);

        -- Políticas de segurança (NOVO)
        CREATE TABLE IF NOT EXISTS policies (
            id           TEXT PRIMARY KEY,
            machine_id   TEXT REFERENCES machines(machine_id) ON DELETE CASCADE,
            policy_type  TEXT NOT NULL CHECK(policy_type IN ('application', 'website')),
            target       TEXT NOT NULL,
            action       TEXT NOT NULL CHECK(action IN ('allow', 'block')),
            reason       TEXT NOT NULL DEFAULT '',
            created_by   TEXT NOT NULL DEFAULT 'admin',
            created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            enabled      INTEGER NOT NULL DEFAULT 1
        );

        CREATE INDEX IF NOT EXISTS idx_policies_machine ON policies(machine_id);
        CREATE INDEX IF NOT EXISTS idx_policies_enabled ON policies(enabled);

        -- Logs de auditoria (NOVO)
        CREATE TABLE IF NOT EXISTS audit_logs (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            action        TEXT NOT NULL,
            resource_type TEXT NOT NULL,
            resource_id   TEXT NOT NULL,
            user          TEXT NOT NULL DEFAULT 'admin',
            details       TEXT NOT NULL DEFAULT ''
        );

        CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp);
        CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

        -- API Keys (NOVO)
        CREATE TABLE IF NOT EXISTS api_keys (
            id         TEXT PRIMARY KEY,
            key_hash   TEXT NOT NULL UNIQUE,
            name       TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            last_used  TEXT,
            enabled    INTEGER NOT NULL DEFAULT 1
        );
    ")?;

    Ok(())
}

pub fn open_database() -> Result<Connection> {
    let data_dir = dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("assetscan");

    std::fs::create_dir_all(&data_dir)
        .expect("Não foi possível criar pasta de dados");

    let db_path = data_dir.join("assetscan_v2.db");
    println!("[Database] Usando: {:?}", db_path);

    let conn = Connection::open(db_path)?;
    initialize(&conn)?;
    Ok(conn)
}

// -------------------------------------------------
// Máquinas - CRUD
// -------------------------------------------------

pub fn upsert_machine(
    pool: &DbPool,
    machine_id: &str,
    hostname: &str,
    last_seen: &str,
    cpu_name: &str,
    cpu_cores: i64,
    cpu_threads: i64,
    ram_total_mb: i64,
    ram_used_mb: i64,
    os_name: &str,
    os_version: &str,
    kernel_version: &str,
    uptime_hours: i64,
) -> Result<String> {
    let conn = pool.lock().unwrap();

    // Verifica se existe pelo machine_id
    let existing: Option<String> = conn.query_row(
        "SELECT id FROM machines WHERE machine_id = ?1",
        params![machine_id],
        |row| row.get(0),
    ).ok();

    match existing {
        Some(id) => {
            // Atualiza
            conn.execute(
                "UPDATE machines SET
                    hostname = ?1, last_seen = ?2, cpu_name = ?3,
                    cpu_cores = ?4, cpu_threads = ?5, ram_total_mb = ?6,
                    ram_used_mb = ?7, os_name = ?8, os_version = ?9,
                    kernel_version = ?10, uptime_hours = ?11
                WHERE id = ?12",
                params![
                    hostname, last_seen, cpu_name, cpu_cores,
                    cpu_threads, ram_total_mb, ram_used_mb, os_name,
                    os_version, kernel_version, uptime_hours, id
                ],
            )?;
            Ok(id)
        }
        None => {
            // Insere novo
            let id = uuid::Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO machines (
                    id, machine_id, hostname, last_seen, cpu_name,
                    cpu_cores, cpu_threads, ram_total_mb, ram_used_mb,
                    os_name, os_version, kernel_version, uptime_hours
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
                params![
                    id, machine_id, hostname, last_seen, cpu_name,
                    cpu_cores, cpu_threads, ram_total_mb, ram_used_mb,
                    os_name, os_version, kernel_version, uptime_hours
                ],
            )?;
            Ok(id)
        }
    }
}

pub fn update_machine_custom_name(
    pool: &DbPool,
    machine_id: &str,
    custom_name: &str,
) -> Result<()> {
    let conn = pool.lock().unwrap();
    conn.execute(
        "UPDATE machines SET custom_name = ?1 WHERE machine_id = ?2",
        params![custom_name, machine_id],
    )?;
    Ok(())
}

pub fn list_machines(pool: &DbPool) -> Result<Vec<Machine>> {
    let conn = pool.lock().unwrap();

    let mut stmt = conn.prepare("
        SELECT
            m.id, m.machine_id, m.hostname, m.custom_name, m.tags, m.notes,
            m.last_seen, m.cpu_name, m.cpu_cores, m.ram_total_mb, m.ram_used_mb,
            m.os_name, m.os_version, m.uptime_hours,
            COUNT(DISTINCT d.id) AS disk_count,
            COUNT(DISTINCT s.id) AS software_count,
            COUNT(DISTINCT p.id) AS process_count
        FROM machines m
        LEFT JOIN disks d ON d.machine_id = m.machine_id
        LEFT JOIN software s ON s.machine_id = m.machine_id
        LEFT JOIN processes p ON p.machine_id = m.machine_id
        GROUP BY m.id
        ORDER BY m.last_seen DESC
    ")?;

    let machines = stmt.query_map([], |row| {
        let last_seen: String = row.get(6)?;
        let is_online = is_machine_online(&last_seen);

        let tags_json: String = row.get(4).unwrap_or_else(|_| "[]".to_string());
        let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

        Ok(Machine {
            id: row.get(0)?,
            machine_id: row.get(1)?,
            hostname: row.get(2)?,
            custom_name: row.get(3)?,
            tags,
            notes: row.get(5)?,
            last_seen,
            cpu_name: row.get(7)?,
            cpu_cores: row.get(8)?,
            ram_total_mb: row.get(9)?,
            ram_used_mb: row.get(10)?,
            os_name: row.get(11)?,
            os_version: row.get(12)?,
            uptime_hours: row.get(13)?,
            disk_count: row.get(14)?,
            software_count: row.get(15)?,
            process_count: row.get(16)?,
            is_online,
        })
    })?
    .collect::<Result<Vec<Machine>>>()?;

    Ok(machines)
}

fn is_machine_online(last_seen: &str) -> bool {
    if let Ok(last_seen_dt) = chrono::DateTime::parse_from_rfc3339(last_seen) {
        let now = Utc::now();
        let diff = now.signed_duration_since(last_seen_dt);
        diff.num_hours() < 2
    } else {
        false
    }
}

// -------------------------------------------------
// Processos (NOVO)
// -------------------------------------------------

pub fn update_processes(
    pool: &DbPool,
    machine_id: &str,
    processes: &[ProcessInfo],
) -> Result<()> {
    let conn = pool.lock().unwrap();

    // Remove processos antigos desta máquina (mantém histórico de 24h)
    conn.execute(
        "DELETE FROM processes 
         WHERE machine_id = ?1 
         AND captured_at < datetime('now', '-1 day')",
        params![machine_id],
    )?;

    // Insere novos
    for proc in processes {
        conn.execute(
            "INSERT INTO processes (machine_id, pid, name, exe_path, memory_mb, cpu_percent)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                machine_id,
                proc.pid,
                proc.name,
                proc.exe_path,
                proc.memory_mb,
                proc.cpu_percent
            ],
        )?;
    }

    Ok(())
}

pub fn get_processes(
    pool: &DbPool,
    machine_id: &str,
) -> Result<Vec<ProcessInfo>> {
    let conn = pool.lock().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, machine_id, pid, name, exe_path, memory_mb, cpu_percent, captured_at
         FROM processes
         WHERE machine_id = ?1
         ORDER BY captured_at DESC
         LIMIT 1000"
    )?;

    let processes = stmt.query_map(params![machine_id], |row| {
        Ok(ProcessInfo {
            id: row.get(0)?,
            machine_id: row.get(1)?,
            pid: row.get(2)?,
            name: row.get(3)?,
            exe_path: row.get(4)?,
            memory_mb: row.get(5)?,
            cpu_percent: row.get(6)?,
            captured_at: row.get(7)?,
        })
    })?
    .collect::<Result<Vec<ProcessInfo>>>()?;

    Ok(processes)
}

// -------------------------------------------------
// Políticas (NOVO)
// -------------------------------------------------

pub fn create_policy(
    pool: &DbPool,
    machine_id: Option<&str>,
    policy_type: &str,
    target: &str,
    action: &str,
    reason: &str,
    created_by: &str,
) -> Result<String> {
    let conn = pool.lock().unwrap();
    let id = uuid::Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO policies (id, machine_id, policy_type, target, action, reason, created_by)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![id, machine_id, policy_type, target, action, reason, created_by],
    )?;

    Ok(id)
}

pub fn list_policies(
    pool: &DbPool,
    machine_id: Option<&str>,
) -> Result<Vec<Policy>> {
    let conn = pool.lock().unwrap();

    let query = if let Some(mid) = machine_id {
        format!(
            "SELECT id, machine_id, policy_type, target, action, reason, created_by, created_at, enabled
             FROM policies
             WHERE machine_id = '{}' OR machine_id IS NULL
             ORDER BY created_at DESC",
            mid
        )
    } else {
        "SELECT id, machine_id, policy_type, target, action, reason, created_by, created_at, enabled
         FROM policies
         ORDER BY created_at DESC".to_string()
    };

    let mut stmt = conn.prepare(&query)?;

    let policies = stmt.query_map([], |row| {
        let policy_type_str: String = row.get(2)?;
        let action_str: String = row.get(4)?;

        Ok(Policy {
            id: row.get(0)?,
            machine_id: row.get(1)?,
            policy_type: serde_json::from_str(&format!("\"{}\"", policy_type_str)).unwrap(),
            target: row.get(3)?,
            action: serde_json::from_str(&format!("\"{}\"", action_str)).unwrap(),
            reason: row.get(5)?,
            created_by: row.get(6)?,
            created_at: row.get(7)?,
            enabled: row.get::<_, i32>(8)? != 0,
        })
    })?
    .collect::<Result<Vec<Policy>>>()?;

    Ok(policies)
}

pub fn delete_policy(pool: &DbPool, policy_id: &str) -> Result<()> {
    let conn = pool.lock().unwrap();
    conn.execute("DELETE FROM policies WHERE id = ?1", params![policy_id])?;
    Ok(())
}

// -------------------------------------------------
// Discos
// -------------------------------------------------

pub fn update_disks(
    pool: &DbPool,
    machine_id: &str,
    disks: &[DiskInfo],
) -> Result<()> {
    let conn = pool.lock().unwrap();
    conn.execute("DELETE FROM disks WHERE machine_id = ?1", params![machine_id])?;

    for disk in disks {
        conn.execute(
            "INSERT INTO disks (machine_id, name, mount_point, total_gb, free_gb, fs_type)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                machine_id,
                disk.name,
                disk.mount_point,
                disk.total_gb,
                disk.free_gb,
                disk.fs_type
            ],
        )?;
    }
    Ok(())
}

pub fn get_disks(pool: &DbPool, machine_id: &str) -> Result<Vec<DiskInfo>> {
    let conn = pool.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT name, mount_point, total_gb, free_gb, fs_type
         FROM disks WHERE machine_id = ?1 ORDER BY mount_point"
    )?;

    let disks = stmt.query_map(params![machine_id], |row| {
        Ok(DiskInfo {
            name: row.get(0)?,
            mount_point: row.get(1)?,
            total_gb: row.get(2)?,
            free_gb: row.get(3)?,
            fs_type: row.get(4)?,
        })
    })?
    .collect::<Result<Vec<DiskInfo>>>()?;

    Ok(disks)
}

// -------------------------------------------------
// Software
// -------------------------------------------------

pub fn update_software(
    pool: &DbPool,
    machine_id: &str,
    software_list: &[SoftwareEntry],
) -> Result<()> {
    let conn = pool.lock().unwrap();
    conn.execute("DELETE FROM software WHERE machine_id = ?1", params![machine_id])?;

    for sw in software_list {
        conn.execute(
            "INSERT INTO software (machine_id, name, version, publisher, install_date)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                machine_id,
                sw.name,
                sw.version,
                sw.publisher,
                sw.install_date
            ],
        )?;
    }
    Ok(())
}

pub fn get_software(pool: &DbPool, machine_id: &str) -> Result<Vec<SoftwareEntry>> {
    let conn = pool.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT name, version, publisher, install_date
         FROM software WHERE machine_id = ?1 ORDER BY name"
    )?;

    let software = stmt.query_map(params![machine_id], |row| {
        Ok(SoftwareEntry {
            name: row.get(0)?,
            version: row.get(1)?,
            publisher: row.get(2)?,
            install_date: row.get(3)?,
        })
    })?
    .collect::<Result<Vec<SoftwareEntry>>>()?;

    Ok(software)
}

// -------------------------------------------------
// Auditoria
// -------------------------------------------------

pub fn log_audit(
    pool: &DbPool,
    action: &str,
    resource_type: &str,
    resource_id: &str,
    user: &str,
    details: &str,
) -> Result<()> {
    let conn = pool.lock().unwrap();
    conn.execute(
        "INSERT INTO audit_logs (action, resource_type, resource_id, user, details)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![action, resource_type, resource_id, user, details],
    )?;
    Ok(())
}
