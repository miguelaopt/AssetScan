// ============================================================
// database.rs — Gerencia o banco de dados SQLite local.
// Armazena todos os relatórios recebidos dos agentes.
// ============================================================

use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

// Tipo compartilhado thread-safe para a conexão SQLite
pub type DbPool = Arc<Mutex<Connection>>;

// -------------------------------------------------
// Estruturas retornadas para o frontend React
// -------------------------------------------------

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Machine {
    pub id: String,
    pub hostname: String,
    pub last_seen: String,
    pub cpu_name: String,
    pub cpu_cores: i64,
    pub ram_total_mb: i64,
    pub ram_used_mb: i64,
    pub os_name: String,
    pub os_version: String,
    pub uptime_hours: i64,
    pub disk_count: i64,
    pub software_count: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_gb: f64,
    pub free_gb: f64,
    pub fs_type: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SoftwareEntry {
    pub name: String,
    pub version: String,
    pub publisher: String,
    pub install_date: String,
}

// -------------------------------------------------
// Inicialização do banco — cria tabelas se não existirem
// -------------------------------------------------

pub fn initialize(conn: &Connection) -> Result<()> {
    conn.execute_batch("
        PRAGMA journal_mode=WAL;

        -- Máquinas únicas identificadas pelo hostname
        CREATE TABLE IF NOT EXISTS machines (
            id            TEXT PRIMARY KEY,
            hostname      TEXT NOT NULL UNIQUE,
            last_seen     TEXT NOT NULL,
            cpu_name      TEXT NOT NULL DEFAULT '',
            cpu_cores     INTEGER NOT NULL DEFAULT 0,
            cpu_threads   INTEGER NOT NULL DEFAULT 0,
            ram_total_mb  INTEGER NOT NULL DEFAULT 0,
            ram_used_mb   INTEGER NOT NULL DEFAULT 0,
            os_name       TEXT NOT NULL DEFAULT '',
            os_version    TEXT NOT NULL DEFAULT '',
            kernel_version TEXT NOT NULL DEFAULT '',
            uptime_hours  INTEGER NOT NULL DEFAULT 0
        );

        -- Discos de cada máquina (relacionamento 1:N)
        CREATE TABLE IF NOT EXISTS disks (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id  TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
            name        TEXT NOT NULL,
            mount_point TEXT NOT NULL,
            total_gb    REAL NOT NULL DEFAULT 0,
            free_gb     REAL NOT NULL DEFAULT 0,
            fs_type     TEXT NOT NULL DEFAULT ''
        );

        -- Software instalado em cada máquina
        CREATE TABLE IF NOT EXISTS software (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id   TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
            name         TEXT NOT NULL,
            version      TEXT NOT NULL DEFAULT '',
            publisher    TEXT NOT NULL DEFAULT '',
            install_date TEXT NOT NULL DEFAULT ''
        );
    ")?;

    Ok(())
}

// -------------------------------------------------
// Abre (ou cria) o banco de dados na pasta de dados do app
// -------------------------------------------------

pub fn open_database() -> Result<Connection> {
    // Salva o banco na pasta AppData\Roaming\assetscan\
    let data_dir = dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("assetscan");

    std::fs::create_dir_all(&data_dir)
        .expect("Não foi possível criar a pasta de dados do AssetScan");

    let db_path = data_dir.join("assetscan.db");
    println!("[Database] Usando banco em: {:?}", db_path);

    let conn = Connection::open(db_path)?;
    initialize(&conn)?;
    Ok(conn)
}

// -------------------------------------------------
// Upsert de uma máquina (atualiza se já existir pelo hostname)
// -------------------------------------------------

pub fn upsert_machine(
    pool: &DbPool,
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

    // Verifica se já existe
    let existing_id: Option<String> = conn.query_row(
        "SELECT id FROM machines WHERE hostname = ?1",
        params![hostname],
        |row| row.get(0),
    ).ok();

    let machine_id = match existing_id {
        Some(id) => {
            // Atualiza os dados existentes
            conn.execute(
                "UPDATE machines SET
                    last_seen = ?1, cpu_name = ?2, cpu_cores = ?3,
                    cpu_threads = ?4, ram_total_mb = ?5, ram_used_mb = ?6,
                    os_name = ?7, os_version = ?8, kernel_version = ?9,
                    uptime_hours = ?10
                WHERE id = ?11",
                params![
                    last_seen, cpu_name, cpu_cores, cpu_threads,
                    ram_total_mb, ram_used_mb, os_name, os_version,
                    kernel_version, uptime_hours, id
                ],
            )?;
            id
        }
        None => {
            // Insere nova máquina com UUID
            let id = uuid::Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO machines (id, hostname, last_seen, cpu_name, cpu_cores,
                    cpu_threads, ram_total_mb, ram_used_mb, os_name, os_version,
                    kernel_version, uptime_hours)
                VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                params![
                    id, hostname, last_seen, cpu_name, cpu_cores,
                    cpu_threads, ram_total_mb, ram_used_mb, os_name,
                    os_version, kernel_version, uptime_hours
                ],
            )?;
            id
        }
    };

    Ok(machine_id)
}

// -------------------------------------------------
// Atualiza discos de uma máquina (apaga antigos e insere novos)
// -------------------------------------------------

pub fn update_disks(pool: &DbPool, machine_id: &str, disks: &[DiskInfo]) -> Result<()> {
    let conn = pool.lock().unwrap();

    // Apaga os discos antigos desta máquina
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

// -------------------------------------------------
// Atualiza software de uma máquina
// -------------------------------------------------

pub fn update_software(pool: &DbPool, machine_id: &str, software_list: &[SoftwareEntry]) -> Result<()> {
    let conn = pool.lock().unwrap();

    // Apaga software antigo desta máquina
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

// -------------------------------------------------
// Lista todas as máquinas (para o painel principal)
// -------------------------------------------------

pub fn list_machines(pool: &DbPool) -> Result<Vec<Machine>> {
    let conn = pool.lock().unwrap();

    let mut stmt = conn.prepare("
        SELECT
            m.id, m.hostname, m.last_seen, m.cpu_name, m.cpu_cores,
            m.ram_total_mb, m.ram_used_mb, m.os_name, m.os_version,
            m.uptime_hours,
            COUNT(DISTINCT d.id) AS disk_count,
            COUNT(DISTINCT s.id) AS software_count
        FROM machines m
        LEFT JOIN disks d ON d.machine_id = m.id
        LEFT JOIN software s ON s.machine_id = m.id
        GROUP BY m.id
        ORDER BY m.last_seen DESC
    ")?;

    let machines = stmt.query_map([], |row| {
        Ok(Machine {
            id: row.get(0)?,
            hostname: row.get(1)?,
            last_seen: row.get(2)?,
            cpu_name: row.get(3)?,
            cpu_cores: row.get(4)?,
            ram_total_mb: row.get(5)?,
            ram_used_mb: row.get(6)?,
            os_name: row.get(7)?,
            os_version: row.get(8)?,
            uptime_hours: row.get(9)?,
            disk_count: row.get(10)?,
            software_count: row.get(11)?,
        })
    })?
    .collect::<Result<Vec<Machine>>>()?;

    Ok(machines)
}

// -------------------------------------------------
// Detalhes de discos de uma máquina
// -------------------------------------------------

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
// Lista de software de uma máquina
// -------------------------------------------------

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