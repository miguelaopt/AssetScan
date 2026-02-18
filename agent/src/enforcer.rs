// ============================================================
// enforcer.rs — Enforcement de Políticas de Segurança
// Bloqueia apps e sites conforme políticas do servidor
// ============================================================

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use windows::Win32::Foundation::HANDLE;
use windows::Win32::System::Threading::{
    OpenProcess, TerminateProcess, PROCESS_TERMINATE,
};

use crate::collector::ProcessInfo;
use crate::notifications;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Policy {
    pub policy_type: PolicyType,
    pub target: String,      // Nome da app ou domínio
    pub action: PolicyAction,
    pub reason: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum PolicyType {
    Application,
    Website,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum PolicyAction {
    Allow,
    Block,
}

// -------------------------------------------------
// Entry point para aplicar todas as políticas
// -------------------------------------------------

pub fn enforce_policies(
    policies: &[Policy],
    running_processes: &[ProcessInfo],
) -> Result<usize> {
    let mut total_blocked = 0;

    // 1. Enforcement de aplicações
    let app_policies: Vec<&Policy> = policies
        .iter()
        .filter(|p| p.policy_type == PolicyType::Application)
        .collect();

    total_blocked += enforce_app_policies(&app_policies, running_processes)?;

    // 2. Enforcement de websites (modifica hosts file)
    let website_policies: Vec<&Policy> = policies
        .iter()
        .filter(|p| p.policy_type == PolicyType::Website)
        .collect();

    enforce_website_policies(&website_policies)?;

    Ok(total_blocked)
}

// -------------------------------------------------
// Bloqueio de Aplicações
// -------------------------------------------------

fn enforce_app_policies(
    policies: &[&Policy],
    running_processes: &[ProcessInfo],
) -> Result<usize> {
    let mut blocked_count = 0;

    for policy in policies {
        if policy.action != PolicyAction::Block {
            continue;
        }

        let target_lower = policy.target.to_lowercase();

        // Procura processos que correspondem à política
        for process in running_processes {
            let process_name_lower = process.name.to_lowercase();
            let exe_path_lower = process.exe_path.to_lowercase();

            // Match por nome exacto ou por path
            let is_match = process_name_lower.contains(&target_lower)
                || exe_path_lower.contains(&target_lower);

            if is_match {
                println!(
                    "  [Bloqueio] Terminando processo: {} (PID: {}) - {}",
                    process.name, process.pid, policy.reason
                );

                match terminate_process(process.pid) {
                    Ok(_) => {
                        blocked_count += 1;
                        
                        // Notifica utilizador
                        notifications::show_blocked_app_notification(
                            &process.name,
                            &policy.reason,
                        );

                        // Log local
                        log_blocked_app(&process.name, process.pid, &policy.reason)?;
                    }
                    Err(e) => {
                        eprintln!("  [Erro] Falha ao terminar PID {}: {}", process.pid, e);
                    }
                }
            }
        }
    }

    Ok(blocked_count)
}

// -------------------------------------------------
// Termina processo por PID (Windows API)
// -------------------------------------------------

fn terminate_process(pid: u32) -> Result<()> {
    unsafe {
        let handle = OpenProcess(PROCESS_TERMINATE, false, pid)
            .context("Falha ao abrir processo")?;

        if handle.is_invalid() {
            anyhow::bail!("Handle inválido para PID {}", pid);
        }

        TerminateProcess(handle, 1)
            .context("Falha ao terminar processo")?;

        Ok(())
    }
}

// -------------------------------------------------
// Log de apps bloqueadas (local)
// -------------------------------------------------

fn log_blocked_app(app_name: &str, pid: u32, reason: &str) -> Result<()> {
    let log_dir = Path::new(r"C:\ProgramData\AssetScan");
    fs::create_dir_all(log_dir)?;

    let log_file = log_dir.join("blocked_apps.log");

    let entry = format!(
        "[{}] Bloqueado: {} (PID: {}) - Razão: {}\n",
        chrono::Utc::now().format("%Y-%m-%d %H:%M:%S"),
        app_name,
        pid,
        reason
    );

    use std::fs::OpenOptions;
    use std::io::Write;

    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_file)?;

    file.write_all(entry.as_bytes())?;

    Ok(())
}

// -------------------------------------------------
// Bloqueio de Websites (via hosts file)
// -------------------------------------------------

fn enforce_website_policies(policies: &[&Policy]) -> Result<()> {
    let hosts_path = Path::new(r"C:\Windows\System32\drivers\etc\hosts");

    // Lê conteúdo actual
    let current_content = fs::read_to_string(hosts_path)
        .unwrap_or_else(|_| String::new());

    let mut lines: Vec<String> = current_content
        .lines()
        .filter(|line| !line.contains("# AssetScan"))
        .map(|s| s.to_string())
        .collect();

    // Adiciona cabeçalho AssetScan
    lines.push(String::new());
    lines.push("# AssetScan - Managed Entries".to_string());
    lines.push("# Do not edit below this line".to_string());

    // Adiciona domínios bloqueados
    for policy in policies {
        if policy.action == PolicyAction::Block {
            let entry = format!("127.0.0.1    {}    # AssetScan: {}", 
                policy.target, 
                policy.reason
            );
            lines.push(entry);
        }
    }

    // Escreve de volta (requer admin)
    let new_content = lines.join("\n");
    fs::write(hosts_path, new_content)
        .context("Falha ao escrever no hosts file - são necessários privilégios de Admin")?;

    Ok(())
}