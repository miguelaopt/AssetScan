// ============================================================
// config.rs — Gestão de Configuração do Agente
// Lê do Registry e de variáveis de ambiente
// ============================================================

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use winreg::enums::*;
use winreg::RegKey;
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub server_url: String,
    pub api_key: String,
    pub interval_minutes: u64,
    pub enforcement_enabled: bool,
}

impl Config {
    /// Carrega configuração do Registry ou de variáveis de ambiente
    pub fn load() -> Result<Self> {
        // Tenta carregar do Registry primeiro
        if let Ok(config) = Self::load_from_registry() {
            return Ok(config);
        }

        // Fallback para variáveis de ambiente
        Self::load_from_env()
    }

    fn load_from_registry() -> Result<Self> {
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        let key = hklm.open_subkey(r"SOFTWARE\AssetScan\Config")
            .context("Chave de configuração não encontrada no Registry")?;

        let server_url: String = key.get_value("ServerURL")?;
        let api_key: String = key.get_value("APIKey")?;
        let interval_minutes: u64 = key.get_value::<u32, _>("IntervalMinutes")
            .unwrap_or(60) as u64;
        let enforcement_enabled: u32 = key.get_value("EnforcementEnabled")
            .unwrap_or(1);

        Ok(Config {
            server_url,
            api_key,
            interval_minutes,
            enforcement_enabled: enforcement_enabled != 0,
        })
    }

    fn load_from_env() -> Result<Self> {
        Ok(Config {
            server_url: env::var("ASSETSCAN_SERVER")
                .unwrap_or_else(|_| "http://localhost:7474".to_string()),
            api_key: env::var("ASSETSCAN_API_KEY")
                .context("API Key não configurada")?,
            interval_minutes: env::var("ASSETSCAN_INTERVAL")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(60),
            enforcement_enabled: env::var("ASSETSCAN_ENFORCEMENT")
                .map(|s| s == "1" || s.to_lowercase() == "true")
                .unwrap_or(true),
        })
    }

    /// Salva configuração no Registry
    pub fn save(&self) -> Result<()> {
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        let (key, _) = hklm.create_subkey(r"SOFTWARE\AssetScan\Config")?;

        key.set_value("ServerURL", &self.server_url)?;
        key.set_value("APIKey", &self.api_key)?;
        key.set_value("IntervalMinutes", &(self.interval_minutes as u32))?;
        key.set_value("EnforcementEnabled", &(if self.enforcement_enabled { 1u32 } else { 0u32 }))?;

        Ok(())
    }
}

impl Default for Config {
    fn default() -> Self {
        Config {
            server_url: "http://localhost:7474".to_string(),
            api_key: String::new(),
            interval_minutes: 60,
            enforcement_enabled: true,
        }
    }
}