use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SecurityStatus {
    pub windows_defender_enabled: bool,
    pub windows_defender_updated: bool,
    pub firewall_enabled: bool,
    pub bitlocker_active: bool,
    pub bitlocker_drives: Vec<String>,
    pub last_windows_update: String,
}

pub fn collect_security_status() -> Result<SecurityStatus> {
    Ok(SecurityStatus {
        windows_defender_enabled: check_defender_enabled()?,
        windows_defender_updated: check_defender_updated()?,
        firewall_enabled: check_firewall_enabled()?,
        bitlocker_active: check_bitlocker_active()?,
        bitlocker_drives: get_bitlocker_drives()?,
        last_windows_update: get_last_windows_update()?,
    })
}

fn check_defender_enabled() -> Result<bool> {
    let output = Command::new("powershell")
        .args(&[
            "-Command",
            "Get-MpComputerStatus | Select-Object -ExpandProperty AntivirusEnabled"
        ])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    Ok(result.trim() == "True")
}

fn check_defender_updated() -> Result<bool> {
    let output = Command::new("powershell")
        .args(&[
            "-Command",
            "$status = Get-MpComputerStatus; $age = (Get-Date) - $status.AntivirusSignatureLastUpdated; $age.Days -lt 7"
        ])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    Ok(result.trim() == "True")
}

fn check_firewall_enabled() -> Result<bool> {
    let output = Command::new("netsh")
        .args(&["advfirewall", "show", "allprofiles", "state"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    Ok(result.contains("ON") || result.contains("Ativado"))
}

fn check_bitlocker_active() -> Result<bool> {
    let output = Command::new("powershell")
        .args(&[
            "-Command",
            "(Get-BitLockerVolume | Where-Object {$_.ProtectionStatus -eq 'On'}).Count -gt 0"
        ])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    Ok(result.trim() == "True")
}

fn get_bitlocker_drives() -> Result<Vec<String>> {
    let output = Command::new("powershell")
        .args(&[
            "-Command",
            "Get-BitLockerVolume | Where-Object {$_.ProtectionStatus -eq 'On'} | Select-Object -ExpandProperty MountPoint"
        ])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    let drives: Vec<String> = result
        .lines()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();
    
    Ok(drives)
}

fn get_last_windows_update() -> Result<String> {
    let output = Command::new("powershell")
        .args(&[
            "-Command",
            "(Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 1).InstalledOn.ToString('yyyy-MM-dd')"
        ])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    let date = result.trim();
    
    if date.is_empty() {
        Ok("Unknown".to_string())
    } else {
        Ok(date.to_string())
    }
}