// ============================================================
// auth.rs — Autenticação com API Keys
// ============================================================

use anyhow::{Context, Result};
use hex;
use rand::Rng;
use rusqlite::{params, Connection};
use sha2::{Digest, Sha256};

use crate::database::DbPool;

/// Gera uma nova API Key
pub fn generate_api_key() -> String {
    let mut rng = rand::thread_rng();
    let bytes: Vec<u8> = (0..32).map(|_| rng.gen()).collect();
    format!("ask_{}", hex::encode(bytes))
}

/// Hash de uma API Key
fn hash_api_key(key: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(key.as_bytes());
    hex::encode(hasher.finalize())
}

/// Cria e salva uma nova API Key
pub fn create_api_key(pool: &DbPool, name: &str) -> Result<String> {
    let key = generate_api_key();
    let key_hash = hash_api_key(&key);
    let id = uuid::Uuid::new_v4().to_string();

    let conn = pool.lock().unwrap();
    conn.execute(
        "INSERT INTO api_keys (id, key_hash, name) VALUES (?1, ?2, ?3)",
        params![id, key_hash, name],
    )?;

    Ok(key)
}

/// Valida uma API Key
pub fn validate_api_key(pool: &DbPool, key: &str) -> Result<bool> {
    let key_hash = hash_api_key(key);
    let conn = pool.lock().unwrap();

    let exists: i32 = conn.query_row(
        "SELECT COUNT(*) FROM api_keys WHERE key_hash = ?1 AND enabled = 1",
        params![key_hash],
        |row| row.get(0),
    )?;

    if exists > 0 {
        // Atualiza last_used
        conn.execute(
            "UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE key_hash = ?1",
            params![key_hash],
        )?;
    }

    Ok(exists > 0)
}

/// Lista todas as API Keys (sem mostrar a key real)
pub fn list_api_keys(pool: &DbPool) -> Result<Vec<ApiKeyInfo>> {
    let conn = pool.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, name, created_at, last_used, enabled FROM api_keys ORDER BY created_at DESC",
    )?;

    let keys = stmt
        .query_map([], |row| {
            Ok(ApiKeyInfo {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                last_used: row.get(3)?,
                enabled: row.get::<_, i32>(4)? != 0,
            })
        })?
        .collect::<rusqlite::Result<Vec<ApiKeyInfo>>>()?;

    Ok(keys)
}

#[derive(serde::Serialize)]
pub struct ApiKeyInfo {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub last_used: Option<String>,
    pub enabled: bool,
}
