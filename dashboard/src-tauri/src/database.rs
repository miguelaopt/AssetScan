// ============================================================
// database.rs — Gestão do banco de dados SQLite
// ============================================================

use chrono::Utc;
use rusqlite::{params, Connection, Result};
use std::sync::{Arc, Mutex};

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
        -- ==========================================
        -- TABELAS ASSETSCAN V3.0
        -- ==========================================

        -- 1.1 Gráficos em Tempo Real
        CREATE TABLE IF NOT EXISTS metrics_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            cpu_percent REAL,
            ram_used_mb INTEGER,
            ram_total_mb INTEGER,
            disk_used_gb REAL,
            disk_total_gb REAL,
            network_in_mb REAL,
            network_out_mb REAL
        );
        CREATE INDEX IF NOT EXISTS idx_metrics_machine_time ON metrics_history(machine_id, timestamp);

        -- 3.1 Vulnerabilidades
        CREATE TABLE IF NOT EXISTS vulnerabilities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            software_name TEXT NOT NULL,
            software_version TEXT NOT NULL,
            cve_id TEXT NOT NULL,
            severity TEXT NOT NULL,
            description TEXT,
            published_date TEXT,
            last_checked TEXT,
            status TEXT DEFAULT 'open'
        );

        -- 4.1 Performance Histórica Agregada
        CREATE TABLE IF NOT EXISTS metrics_aggregated (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            granularity TEXT NOT NULL,
            cpu_avg REAL,
            cpu_max REAL,
            ram_avg REAL,
            ram_max REAL,
            disk_usage_avg REAL,
            network_in_total REAL,
            network_out_total REAL
        );

        -- 5.3 Software Licenses
        CREATE TABLE IF NOT EXISTS software_licenses (
            id TEXT PRIMARY KEY,
            software_name TEXT NOT NULL,
            license_key TEXT,
            license_type TEXT,
            seats_total INTEGER,
            seats_used INTEGER,
            cost_per_seat REAL,
            purchase_date TEXT,
            expiry_date TEXT,
            vendor TEXT,
            notes TEXT
        );

        CREATE TABLE IF NOT EXISTS license_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            license_id TEXT NOT NULL REFERENCES software_licenses(id),
            machine_id TEXT NOT NULL REFERENCES machines(machine_id),
            assigned_date TEXT NOT NULL,
            status TEXT DEFAULT 'active'
        );

        -- 7.1 Webhooks
        CREATE TABLE IF NOT EXISTS webhooks (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            secret TEXT,
            events TEXT NOT NULL,
            enabled INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            last_triggered TEXT
        );

        CREATE TABLE IF NOT EXISTS webhook_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            webhook_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            payload TEXT NOT NULL,
            response_status INTEGER,
            response_body TEXT,
            triggered_at TEXT NOT NULL
        );
        -- Screen Time
        CREATE TABLE IF NOT EXISTS screen_time (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            app_name TEXT NOT NULL,
            total_seconds INTEGER NOT NULL,
            date TEXT NOT NULL,
            UNIQUE(machine_id, app_name, date)
        );

        -- CORREÇÃO: Adicionado IF NOT EXISTS
        CREATE INDEX IF NOT EXISTS idx_screen_time_machine ON screen_time(machine_id);
        CREATE INDEX IF NOT EXISTS idx_screen_time_date ON screen_time(date);

        -- Histórico de Métricas
        CREATE TABLE IF NOT EXISTS historical_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            cpu_percent REAL NOT NULL,
            ram_percent REAL NOT NULL,
            disk_percent REAL NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_hist_metrics_machine ON historical_metrics(machine_id);
        CREATE INDEX IF NOT EXISTS idx_hist_metrics_time ON historical_metrics(timestamp);
        ")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS hardware_details (
        machine_id TEXT PRIMARY KEY,
        serial_number TEXT,
        motherboard_manufacturer TEXT,
        motherboard_model TEXT,
        bios_version TEXT,
        gpu_name TEXT,
        gpu_vram_mb INTEGER,
        total_ram_slots INTEGER,
        used_ram_slots INTEGER,
        ram_type TEXT,
        updated_at TEXT
    )",
        [],
    )?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS network_details (
        machine_id TEXT PRIMARY KEY,
        local_ip TEXT,
        subnet_mask TEXT,
        gateway TEXT,
        dns_primary TEXT,
        dns_secondary TEXT,
        dhcp_enabled INTEGER,
        domain_name TEXT,
        is_domain_joined INTEGER,
        mac_address TEXT,
        adapter_name TEXT,
        connection_speed_mbps INTEGER,
        wifi_ssid TEXT,
        wifi_security TEXT,
        updated_at TEXT
    )",
        [],
    )?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS security_status (
        machine_id TEXT PRIMARY KEY,
        windows_defender_enabled INTEGER,
        windows_defender_updated INTEGER,
        firewall_enabled INTEGER,
        bitlocker_active INTEGER,
        bitlocker_drives TEXT,
        last_windows_update TEXT,
        updated_at TEXT
    )",
        [],
    )?;

    let _ = conn.execute(
        "ALTER TABLE machines ADD COLUMN local_ip TEXT DEFAULT '0.0.0.0'",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE machines ADD COLUMN mac_address TEXT DEFAULT ''",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE machines ADD COLUMN serial_number TEXT DEFAULT ''",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE machines ADD COLUMN motherboard_model TEXT DEFAULT ''",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE machines ADD COLUMN gpu_name TEXT DEFAULT ''",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE machines ADD COLUMN is_bitlocker_active BOOLEAN DEFAULT 0",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE machines ADD COLUMN domain_name TEXT DEFAULT ''",
        [],
    );
    let _ = conn.execute(
        "ALTER TABLE machines ADD COLUMN current_user TEXT DEFAULT ''",
        [],
    );
    conn.execute("ALTER TABLE machines ADD COLUMN current_user TEXT", [])
        .ok();
    conn.execute("ALTER TABLE machines ADD COLUMN primary_user TEXT", [])
        .ok();
    conn.execute("ALTER TABLE machines ADD COLUMN department TEXT", [])
        .ok();
    conn.execute("ALTER TABLE machines ADD COLUMN location TEXT", [])
        .ok();
    conn.execute("ALTER TABLE machines ADD COLUMN mac_address TEXT", [])
        .ok();
    conn.execute("ALTER TABLE machines ADD COLUMN domain_name TEXT", [])
        .ok();
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_machines_last_seen ON machines(last_seen)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_processes_machine ON processes(machine_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_software_machine ON software(machine_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_metrics_machine ON metrics_history(machine_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_policies_machine ON policies(machine_id)",
        [],
    )?;
    Ok(())
}

pub fn open_database() -> Result<Connection> {
    let data_dir = dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("assetscan");

    std::fs::create_dir_all(&data_dir).expect("Não foi possível criar pasta de dados");

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
    // NOVOS CAMPOS AQUI
    local_ip: &str,
    mac_address: &str,
    serial_number: &str,
    motherboard_model: &str,
    gpu_name: &str,
    is_bitlocker_active: bool,
    domain_name: &str,
    current_user: &str,
) -> Result<String> {
    let conn = pool.lock().unwrap();

    let existing: Option<String> = conn
        .query_row(
            "SELECT id FROM machines WHERE machine_id = ?1",
            params![machine_id],
            |row| row.get(0),
        )
        .ok();

    match existing {
        Some(id) => {
            // Atualiza
            conn.execute(
                "UPDATE machines SET
                    hostname = ?1, last_seen = ?2, cpu_name = ?3,
                    cpu_cores = ?4, cpu_threads = ?5, ram_total_mb = ?6,
                    ram_used_mb = ?7, os_name = ?8, os_version = ?9,
                    kernel_version = ?10, uptime_hours = ?11,
                    local_ip = ?12, mac_address = ?13, serial_number = ?14,
                    motherboard_model = ?15, gpu_name = ?16, is_bitlocker_active = ?17,
                    domain_name = ?18, current_user = ?19
                WHERE id = ?20",
                params![
                    hostname,
                    last_seen,
                    cpu_name,
                    cpu_cores,
                    cpu_threads,
                    ram_total_mb,
                    ram_used_mb,
                    os_name,
                    os_version,
                    kernel_version,
                    uptime_hours,
                    local_ip,
                    mac_address,
                    serial_number,
                    motherboard_model,
                    gpu_name,
                    is_bitlocker_active,
                    domain_name,
                    current_user,
                    id
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
                    os_name, os_version, kernel_version, uptime_hours,
                    local_ip, mac_address, serial_number, motherboard_model, 
                    gpu_name, is_bitlocker_active, domain_name, current_user
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21)",
                params![
                    id, machine_id, hostname, last_seen, cpu_name,
                    cpu_cores, cpu_threads, ram_total_mb, ram_used_mb,
                    os_name, os_version, kernel_version, uptime_hours,
                    local_ip, mac_address, serial_number, motherboard_model,
                    gpu_name, is_bitlocker_active, domain_name, current_user
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

    let mut stmt = conn.prepare(
        "
        SELECT
            m.id, m.machine_id, m.hostname, m.custom_name, m.tags, m.notes,
            m.last_seen, m.cpu_name, m.cpu_cores, m.ram_total_mb, m.ram_used_mb,
            m.os_name, m.os_version, m.uptime_hours,
            COUNT(DISTINCT d.id) AS disk_count,
            COUNT(DISTINCT s.id) AS software_count,
            COUNT(DISTINCT p.id) AS process_count,
            m.local_ip, m.mac_address, m.serial_number, m.motherboard_model,
            m.gpu_name, m.is_bitlocker_active, m.domain_name, m.current_user
        FROM machines m
        LEFT JOIN disks d ON d.machine_id = m.machine_id
        LEFT JOIN software s ON s.machine_id = m.machine_id
        LEFT JOIN processes p ON p.machine_id = m.machine_id
        GROUP BY m.id
        ORDER BY m.last_seen DESC
    ",
    )?;

    let machines = stmt
        .query_map([], |row| {
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
                local_ip: row.get(17).ok(),
                mac_address: row.get(18).ok(),
                serial_number: row.get(19).ok(),
                motherboard_model: row.get(20).ok(),
                gpu_name: row.get(21).ok(),
                is_bitlocker_active: row.get(22).ok(),
                domain_name: row.get(23).ok(),
                current_user: row.get(24).ok(),
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

pub fn update_processes(pool: &DbPool, machine_id: &str, processes: &[ProcessInfo]) -> Result<()> {
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

pub fn get_processes(pool: &DbPool, machine_id: &str) -> Result<Vec<ProcessInfo>> {
    let conn = pool.lock().unwrap();

    let mut stmt = conn.prepare(
        "SELECT id, machine_id, pid, name, exe_path, memory_mb, cpu_percent, captured_at
         FROM processes
         WHERE machine_id = ?1
         ORDER BY captured_at DESC
         LIMIT 1000",
    )?;

    let processes = stmt
        .query_map(params![machine_id], |row| {
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
        params![
            id,
            machine_id,
            policy_type,
            target,
            action,
            reason,
            created_by
        ],
    )?;

    Ok(id)
}

pub fn list_policies(pool: &DbPool, machine_id: Option<&str>) -> Result<Vec<Policy>> {
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
         ORDER BY created_at DESC"
            .to_string()
    };

    let mut stmt = conn.prepare(&query)?;

    let policies = stmt
        .query_map([], |row| {
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

pub fn update_disks(pool: &DbPool, machine_id: &str, disks: &[DiskInfo]) -> Result<()> {
    let conn = pool.lock().unwrap();
    conn.execute(
        "DELETE FROM disks WHERE machine_id = ?1",
        params![machine_id],
    )?;

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
         FROM disks WHERE machine_id = ?1 ORDER BY mount_point",
    )?;

    let disks = stmt
        .query_map(params![machine_id], |row| {
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

pub fn insert_metric(
    pool: &DbPool,
    machine_id: &str,
    cpu_percent: f32,
    ram_used_mb: i64,
    ram_total_mb: i64,
) -> Result<()> {
    let conn = pool.lock().unwrap();
    conn.execute(
        "INSERT INTO metrics_history (machine_id, timestamp, cpu_percent, ram_used_mb, ram_total_mb)
         VALUES (?1, CURRENT_TIMESTAMP, ?2, ?3, ?4)",
        params![machine_id, cpu_percent, ram_used_mb, ram_total_mb],
    )?;
    Ok(())
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
    conn.execute(
        "DELETE FROM software WHERE machine_id = ?1",
        params![machine_id],
    )?;

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
         FROM software WHERE machine_id = ?1 ORDER BY name",
    )?;

    let software = stmt
        .query_map(params![machine_id], |row| {
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

// -------------------------------------------------
// Filtros Avançados (NOVO v3.0)
// -------------------------------------------------
pub fn list_machines_filtered(pool: &DbPool, filters: MachineFilters) -> Result<Vec<Machine>> {
    let conn = pool.lock().unwrap();
    let mut query = "
        SELECT
            m.id, m.machine_id, m.hostname, m.custom_name, m.tags, m.notes,
            m.last_seen, m.cpu_name, m.cpu_cores, m.ram_total_mb, m.ram_used_mb,
            m.os_name, m.os_version, m.uptime_hours,
            COUNT(DISTINCT d.id) AS disk_count,
            COUNT(DISTINCT s.id) AS software_count,
            COUNT(DISTINCT p.id) AS process_count,
            m.local_ip, m.mac_address, m.serial_number, m.motherboard_model,
            m.gpu_name, m.is_bitlocker_active, m.domain_name, m.current_user
        FROM machines m
        LEFT JOIN disks d ON d.machine_id = m.machine_id
        LEFT JOIN software s ON s.machine_id = m.machine_id
        LEFT JOIN processes p ON p.machine_id = m.machine_id
        WHERE 1=1
    "
    .to_string();

    if let Some(search) = filters.search_term {
        query.push_str(&format!(
            " AND (m.hostname LIKE '%{}%' OR m.custom_name LIKE '%{}%')",
            search, search
        ));
    }

    query.push_str(" GROUP BY m.id ORDER BY m.last_seen DESC");

    let mut stmt = conn.prepare(&query)?;

    let machines = stmt
        .query_map([], |row| {
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
                local_ip: row.get(17).ok(),
                mac_address: row.get(18).ok(),
                serial_number: row.get(19).ok(),
                motherboard_model: row.get(20).ok(),
                gpu_name: row.get(21).ok(),
                is_bitlocker_active: row.get(22).ok(),
                domain_name: row.get(23).ok(),
                current_user: row.get(24).ok(),
            })
        })?
        .collect::<Result<Vec<Machine>>>()?;

    Ok(machines)
}

pub fn get_hardware_details(pool: &DbPool, machine_id: &str) -> Result<HardwareDetails> {
    let conn = pool.lock().unwrap();

    let mut stmt = conn.prepare(
        "SELECT 
            serial_number, motherboard_manufacturer, motherboard_model,
            bios_version, gpu_name, gpu_vram_mb, total_ram_slots,
            used_ram_slots, ram_type
         FROM hardware_details
         WHERE machine_id = ?1",
    )?;

    let details = stmt.query_row([machine_id], |row| {
        Ok(HardwareDetails {
            serial_number: row.get(0)?,
            motherboard_manufacturer: row.get(1)?,
            motherboard_model: row.get(2)?,
            bios_version: row.get(3)?,
            gpu_name: row.get(4)?,
            gpu_vram_mb: row.get(5)?,
            total_ram_slots: row.get(6)?,
            used_ram_slots: row.get(7)?,
            ram_type: row.get(8)?,
        })
    })?;

    Ok(details)
}

pub fn update_hardware_details(
    pool: &DbPool,
    machine_id: &str,
    details: &HardwareDetails,
) -> Result<()> {
    let conn = pool.lock().unwrap();

    conn.execute(
        "INSERT OR REPLACE INTO hardware_details (
            machine_id, serial_number, motherboard_manufacturer,
            motherboard_model, bios_version, gpu_name, gpu_vram_mb,
            total_ram_slots, used_ram_slots, ram_type, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            machine_id,
            &details.serial_number,
            &details.motherboard_manufacturer,
            &details.motherboard_model,
            &details.bios_version,
            &details.gpu_name,
            details.gpu_vram_mb,
            details.total_ram_slots,
            details.used_ram_slots,
            &details.ram_type,
            chrono::Utc::now().to_rfc3339(),
        ],
    )?;

    Ok(())
}

pub fn get_network_details(pool: &DbPool, machine_id: &str) -> Result<NetworkDetails> {
    let conn = pool.lock().unwrap();

    let mut stmt = conn.prepare(
        "SELECT 
            local_ip, subnet_mask, gateway, dns_primary, dns_secondary,
            dhcp_enabled, domain_name, is_domain_joined, mac_address,
            adapter_name, connection_speed_mbps, wifi_ssid, wifi_security
         FROM network_details
         WHERE machine_id = ?1",
    )?;

    let details = stmt.query_row([machine_id], |row| {
        Ok(NetworkDetails {
            local_ip: row.get(0)?,
            subnet_mask: row.get(1)?,
            gateway: row.get(2)?,
            dns_primary: row.get(3)?,
            dns_secondary: row.get(4)?,
            dhcp_enabled: row.get(5)?,
            domain_name: row.get(6)?,
            is_domain_joined: row.get(7)?,
            mac_address: row.get(8)?,
            adapter_name: row.get(9)?,
            connection_speed_mbps: row.get(10)?,
            wifi_ssid: row.get(11)?,
            wifi_security: row.get(12)?,
        })
    })?;

    Ok(details)
}

pub fn update_network_details(
    pool: &DbPool,
    machine_id: &str,
    details: &NetworkDetails,
) -> Result<()> {
    let conn = pool.lock().unwrap();

    conn.execute(
        "INSERT OR REPLACE INTO network_details (
            machine_id, local_ip, subnet_mask, gateway, dns_primary,
            dns_secondary, dhcp_enabled, domain_name, is_domain_joined,
            mac_address, adapter_name, connection_speed_mbps,
            wifi_ssid, wifi_security, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
        params![
            machine_id,
            &details.local_ip,
            &details.subnet_mask,
            &details.gateway,
            &details.dns_primary,
            &details.dns_secondary,
            details.dhcp_enabled,
            &details.domain_name,
            details.is_domain_joined,
            &details.mac_address,
            &details.adapter_name,
            details.connection_speed_mbps,
            &details.wifi_ssid,
            &details.wifi_security,
            chrono::Utc::now().to_rfc3339(),
        ],
    )?;

    Ok(())
}

pub fn get_security_status(
    pool: &DbPool,
    machine_id: &str,
) -> Result<SecurityStatus> {
    let conn = pool.lock().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT 
            windows_defender_enabled, windows_defender_updated,
            firewall_enabled, bitlocker_active, bitlocker_drives,
            last_windows_update
         FROM security_status
         WHERE machine_id = ?1"
    )?;
    
    let status = stmt.query_row([machine_id], |row| {
        let bitlocker_drives_str: String = row.get(4)?;
        let bitlocker_drives: Vec<String> = bitlocker_drives_str
            .split(',')
            .map(|s| s.to_string())
            .collect();
        
        Ok(SecurityStatus {
            windows_defender_enabled: row.get(0)?,
            windows_defender_updated: row.get(1)?,
            firewall_enabled: row.get(2)?,
            bitlocker_active: row.get(3)?,
            bitlocker_drives,
            last_windows_update: row.get(5)?,
        })
    })?;
    
    Ok(status)
}

pub fn update_security_status(
    pool: &DbPool,
    machine_id: &str,
    status: &SecurityStatus,
) -> Result<()> {
    let conn = pool.lock().unwrap();

    let bitlocker_drives_str = status.bitlocker_drives.join(",");

    conn.execute(
        "INSERT OR REPLACE INTO security_status (
            machine_id, windows_defender_enabled, windows_defender_updated,
            firewall_enabled, bitlocker_active, bitlocker_drives,
            last_windows_update, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            machine_id,
            status.windows_defender_enabled,
            status.windows_defender_updated,
            status.firewall_enabled,
            status.bitlocker_active,
            &bitlocker_drives_str,
            &status.last_windows_update,
            chrono::Utc::now().to_rfc3339(),
        ],
    )?;

    Ok(())
}

// ============================================================
// v3.1 - NOVAS FUNÇÕES
// ============================================================

// Screen Time
pub fn insert_screen_time(
    pool: &DbPool,
    machine_id: &str,
    app_name: &str,
    total_seconds: u64,
    date: &str,
) -> Result<()> {
    let conn = pool.lock().unwrap();

    conn.execute(
        "INSERT OR REPLACE INTO screen_time (machine_id, app_name, total_seconds, date)
         VALUES (?1, ?2, ?3, ?4)",
        params![machine_id, app_name, total_seconds as i64, date],
    )?;

    Ok(())
}

pub fn get_screen_time(
    pool: &DbPool,
    machine_id: &str,
    date: Option<&str>,
) -> Result<Vec<ScreenTimeEntry>> {
    let conn = pool.lock().unwrap();

    // Cria query e params baseado em date
    let mut query = String::from(
        "SELECT machine_id, app_name, total_seconds, date FROM screen_time WHERE machine_id = ?1",
    );

    if date.is_some() {
        query.push_str(" AND date = ?2");
    }

    query.push_str(" ORDER BY total_seconds DESC");

    let mut stmt = conn.prepare(&query)?;

    // Executa query com params dinâmicos
    let entries: Result<Vec<ScreenTimeEntry>> = if let Some(d) = date {
        stmt.query_map(params![machine_id, d], |row| {
            Ok(ScreenTimeEntry {
                machine_id: row.get(0)?,
                app_name: row.get(1)?,
                total_seconds: row.get::<_, i64>(2)? as u64,
                date: row.get(3)?,
            })
        })?
        .collect()
    } else {
        stmt.query_map(params![machine_id], |row| {
            Ok(ScreenTimeEntry {
                machine_id: row.get(0)?,
                app_name: row.get(1)?,
                total_seconds: row.get::<_, i64>(2)? as u64,
                date: row.get(3)?,
            })
        })?
        .collect()
    };

    entries
}

// Actualiza máquina com IP
pub fn update_machine_ip(pool: &DbPool, machine_id: &str, local_ip: &str) -> Result<()> {
    let conn = pool.lock().unwrap();

    conn.execute(
        "UPDATE machines SET local_ip = ?1, last_seen = ?2 WHERE machine_id = ?3",
        params![local_ip, chrono::Utc::now().to_rfc3339(), machine_id],
    )?;

    Ok(())
}

// Políticas com IP blocking
pub fn create_ip_policy(
    pool: &DbPool,
    machine_id: Option<&str>,
    ip_address: &str,
    action: &str,
    reason: &str,
) -> Result<String> {
    let conn = pool.lock().unwrap();
    let id = uuid::Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO policies (id, machine_id, policy_type, target, action, reason, created_by, created_at, enabled)
         VALUES (?1, ?2, 'ip', ?3, ?4, ?5, 'admin', ?6, 1)",
        params![
            &id,
            machine_id,
            ip_address,
            action,
            reason,
            chrono::Utc::now().to_rfc3339()
        ],
    )?;

    Ok(id)
}
