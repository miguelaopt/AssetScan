use anyhow::Result;
use serde::{Serialize, Deserialize};
use std::process::Command;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HardwareDetails {
    pub serial_number: String,
    pub motherboard_manufacturer: String,
    pub motherboard_model: String,
    pub bios_version: String,
    pub gpu_name: String,
    pub gpu_vram_mb: i64,
    pub total_ram_slots: i64,
    pub used_ram_slots: i64,
    pub ram_type: String,
}

pub fn collect_hardware_details() -> Result<HardwareDetails> {
    Ok(HardwareDetails {
        serial_number: get_serial_number()?,
        motherboard_manufacturer: get_motherboard_manufacturer()?,
        motherboard_model: get_motherboard_model()?,
        bios_version: get_bios_version()?,
        gpu_name: get_gpu_name()?,
        gpu_vram_mb: get_gpu_vram()?,
        total_ram_slots: get_total_ram_slots()?,
        used_ram_slots: get_used_ram_slots()?,
        ram_type: get_ram_type()?,
    })
}

fn get_serial_number() -> Result<String> {
    let output = Command::new("wmic")
        .args(&["bios", "get", "serialnumber"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    let serial = result
        .lines()
        .nth(1)
        .unwrap_or("Unknown")
        .trim()
        .to_string();
    
    Ok(if serial.is_empty() { "Not Available".to_string() } else { serial })
}

fn get_motherboard_manufacturer() -> Result<String> {
    let output = Command::new("wmic")
        .args(&["baseboard", "get", "manufacturer"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    Ok(result.lines().nth(1).unwrap_or("Unknown").trim().to_string())
}

fn get_motherboard_model() -> Result<String> {
    let output = Command::new("wmic")
        .args(&["baseboard", "get", "product"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    Ok(result.lines().nth(1).unwrap_or("Unknown").trim().to_string())
}

fn get_bios_version() -> Result<String> {
    let output = Command::new("wmic")
        .args(&["bios", "get", "version"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    Ok(result.lines().nth(1).unwrap_or("Unknown").trim().to_string())
}

fn get_gpu_name() -> Result<String> {
    let output = Command::new("wmic")
        .args(&["path", "win32_VideoController", "get", "name"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    let gpu = result.lines().nth(1).unwrap_or("Unknown").trim();
    Ok(if gpu.is_empty() { "Integrated Graphics".to_string() } else { gpu.to_string() })
}

fn get_gpu_vram() -> Result<i64> {
    let output = Command::new("wmic")
        .args(&["path", "win32_VideoController", "get", "AdapterRAM"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    let vram_str = result.lines().nth(1).unwrap_or("0").trim();
    let vram_bytes: i64 = vram_str.parse().unwrap_or(0);
    
    Ok(vram_bytes / 1024 / 1024) // Convert to MB
}

fn get_total_ram_slots() -> Result<i64> {
    let output = Command::new("wmic")
        .args(&["memphysical", "get", "MemoryDevices"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    let slots_str = result.lines().nth(1).unwrap_or("0").trim();
    Ok(slots_str.parse().unwrap_or(0))
}

fn get_used_ram_slots() -> Result<i64> {
    let output = Command::new("wmic")
        .args(&["memorychip", "get", "capacity"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    let count = result.lines().skip(1).filter(|line| !line.trim().is_empty()).count();
    Ok(count as i64)
}

fn get_ram_type() -> Result<String> {
    let output = Command::new("wmic")
        .args(&["memorychip", "get", "MemoryType"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    let mem_type_code: i32 = result
        .lines()
        .nth(1)
        .unwrap_or("0")
        .trim()
        .parse()
        .unwrap_or(0);
    
    // Memory type codes: https://docs.microsoft.com/en-us/windows/win32/cimwin32prov/win32-physicalmemory
    let ram_type = match mem_type_code {
        24 => "DDR3",
        26 => "DDR4",
        27 => "DDR5",
        _ => "Unknown",
    };
    
    Ok(ram_type.to_string())
}