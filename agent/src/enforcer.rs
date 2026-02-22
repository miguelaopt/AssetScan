use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Read;
use std::process::Command;
use sha2::{Sha256, Digest};
use windows::Win32::Foundation::{HANDLE, CloseHandle};
use windows::Win32::System::Threading::{
    OpenProcess, TerminateProcess, 
    PROCESS_TERMINATE, PROCESS_QUERY_INFORMATION
};

use crate::collector::ProcessInfo;
use crate::notifications;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Policy {
    pub policy_type: String, // "app", "web", "device"
    pub target: String,
    pub action: String, // "block", "alert"
    pub reason: String,
    pub config_json: String,
}

#[derive(Deserialize, Debug)]
struct AppConfig {
    match_type: String, // "name", "path", "hash"
    hash_value: Option<String>,
}

#[derive(Deserialize, Debug)]
struct WebConfig {
    domains: Vec<String>,
    block_method: String, // "firewall", "hosts"
}

pub fn enforce_policies(policies: &[Policy], running_processes: &[ProcessInfo]) -> Result<usize> {
    let mut total_blocked = 0;

    // 1. App Control
    let app_policies: Vec<&Policy> = policies
        .iter()
        .filter(|p| p.policy_type == "app")
        .collect();
    total_blocked += enforce_app_policies(&app_policies, running_processes)?;

    // 2. Web Filtering
    let web_policies: Vec<&Policy> = policies
        .iter()
        .filter(|p| p.policy_type == "web")
        .collect();
    enforce_website_policies(&web_policies)?;

    Ok(total_blocked)
}

// ✅ FIX: Retry logic e melhor logging
fn enforce_app_policies(policies: &[&Policy], running_processes: &[ProcessInfo]) -> Result<usize> {
    let mut blocked_count = 0;

    for policy in policies {
        if policy.action != "block" {
            continue;
        }

        let config: AppConfig = serde_json::from_str(&policy.config_json)
            .unwrap_or_else(|e| {
                eprintln!("[Enforcer] ⚠ ERRO ao parsear config: {} - Usando defaults", e);
                AppConfig {
                    match_type: "name".to_string(),
                    hash_value: None,
                }
            });

        let target_lower = policy.target.to_lowercase();

        for process in running_processes {
            let mut is_match = false;
            let process_name_lower = process.name.to_lowercase();
            let exe_path_lower = process.exe_path.to_lowercase();

            match config.match_type.as_str() {
                "hash" => {
                    if let Some(target_hash) = &config.hash_value {
                        if let Ok(file_hash) = calculate_file_hash(&process.exe_path) {
                            is_match = file_hash.eq_ignore_ascii_case(target_hash);
                        }
                    }
                }
                "path" => {
                    is_match = exe_path_lower.contains(&target_lower);
                }
                _ => {
                    // Match por nome OU caminho
                    is_match = process_name_lower.contains(&target_lower)
                        || exe_path_lower.contains(&target_lower);
                }
            }

            if is_match {
                println!("  [Bloqueio] 🎯 Tentando terminar: {} (PID: {})", process.name, process.pid);

                // ✅ FIX: Retry com fallback
                match terminate_process_with_retry(process.pid, 3) {
                    Ok(_) => {
                        blocked_count += 1;
                        notifications::show_blocked_app_notification(&process.name, &policy.reason);
                        println!("  [OK] ✅ Processo terminado com sucesso!");
                    }
                    Err(e) => {
                        eprintln!("  [ERRO] ❌ Falha ao terminar: {} - Tentando fallback...", e);

                        // ✅ FIX: Fallback com taskkill
                        if let Err(e2) = force_kill_with_taskkill(process.pid) {
                            eprintln!("  [ERRO] ❌ Fallback taskkill também falhou: {}", e2);
                        } else {
                            blocked_count += 1;
                            println!("  [OK] ✅ Processo terminado via taskkill!");
                        }
                    }
                }
            }
        }
    }

    Ok(blocked_count)
}

// ✅ FIX: Retry logic
fn terminate_process_with_retry(pid: u32, max_retries: u32) -> Result<()> {
    for attempt in 1..=max_retries {
        match terminate_process(pid) {
            Ok(_) => return Ok(()),
            Err(e) => {
                if attempt == max_retries {
                    return Err(e);
                }
                eprintln!(
                    "  [RETRY] 🔄 Tentativa {}/{} falhou, tentando novamente...",
                    attempt, max_retries
                );
                std::thread::sleep(std::time::Duration::from_millis(500));
            }
        }
    }
    Err(anyhow::anyhow!("Todas as tentativas falharam"))
}

fn terminate_process(pid: u32) -> Result<()> {
    unsafe {
        // O "?" no final extrai o HANDLE do Result e passa o Erro para cima se falhar
        let handle = OpenProcess(PROCESS_TERMINATE, false, pid)?;
        
        if handle.is_invalid() { 
            anyhow::bail!("Handle inválido"); 
        }
        
        TerminateProcess(handle, 1)?;
        
        // Fechar o handle usando a biblioteca windows
        let _ = CloseHandle(handle);
        
        Ok(())
    }
}

// ✅ FIX: Fallback com taskkill
fn force_kill_with_taskkill(pid: u32) -> Result<()> {
    let output = Command::new("taskkill")
        .args(&["/F", "/PID", &pid.to_string()])
        .output()
        .context("Falha ao executar taskkill")?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(anyhow::anyhow!("taskkill falhou: {}", stderr))
    }
}

fn calculate_file_hash(path: &str) -> Result<String> {
    if path.is_empty() {
        anyhow::bail!("Caminho vazio");
    }

    let mut file = File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0; 4096];

    loop {
        let count = file.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }

    Ok(hex::encode(hasher.finalize()))
}

// ✅ FIX: Melhor logging para web blocking
fn enforce_website_policies(policies: &[&Policy]) -> Result<()> {
    for policy in policies {
        if policy.action != "block" {
            continue;
        }

        let config: WebConfig = match serde_json::from_str(&policy.config_json) {
            Ok(c) => c,
            Err(e) => {
                eprintln!("[Enforcer] ⚠ ERRO ao parsear web config: {}", e);
                continue;
            }
        };

        if config.block_method == "firewall" {
            for domain in config.domains {
                println!("  [Web Blocking] 🌐 Bloqueando domínio: {}", domain);

                match dns_lookup::lookup_host(&domain) {
                    Ok(ips) => {
                        for ip in ips {
                            let ip_str = ip.to_string();
                            let rule_name = format!("AssetScan_Block_{}", domain.replace(".", "_"));

                            let output = Command::new("netsh")
                                .args(&[
                                    "advfirewall",
                                    "firewall",
                                    "add",
                                    "rule",
                                    &format!("name={}", rule_name),
                                    "dir=out",
                                    "action=block",
                                    &format!("remoteip={}", ip_str),
                                ])
                                .output();

                            match output {
                                Ok(o) if o.status.success() => {
                                    println!("  [OK] ✅ Regra firewall criada: {}", rule_name);
                                }
                                Ok(o) => {
                                    let stderr = String::from_utf8_lossy(&o.stderr);
                                    eprintln!("  [ERRO] ❌ Firewall falhou: {}", stderr);
                                }
                                Err(e) => {
                                    eprintln!("  [ERRO] ❌ Falha ao executar netsh: {}", e);
                                }
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("  [ERRO] ❌ DNS lookup falhou para {}: {}", domain, e);
                    }
                }
            }
        }
    }

    Ok(())
}