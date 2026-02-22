use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NetworkDetails {
    pub local_ip: String,
    pub subnet_mask: String,
    pub gateway: String,
    pub dns_primary: String,
    pub dns_secondary: Option<String>,
    pub dhcp_enabled: bool,
    pub domain_name: String,
    pub is_domain_joined: bool,
    pub mac_address: String,
    pub adapter_name: String,
    pub connection_speed_mbps: i64,
    pub wifi_ssid: Option<String>,
    pub wifi_security: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NetworkConnection {
    pub pid: u32,
    pub local_ip: String,
    pub remote_ip: String,
    pub state: String,
}

pub fn collect_network_details() -> Result<NetworkDetails> {
    Ok(NetworkDetails {
        local_ip: get_local_ip()?,
        subnet_mask: get_subnet_mask()?,
        gateway: get_gateway()?,
        dns_primary: get_dns_primary()?,
        dns_secondary: get_dns_secondary(),
        dhcp_enabled: is_dhcp_enabled()?,
        domain_name: get_domain_name()?,
        is_domain_joined: check_domain_joined()?,
        mac_address: get_mac_address()?,
        adapter_name: get_adapter_name()?,
        connection_speed_mbps: get_connection_speed()?,
        wifi_ssid: get_wifi_ssid(),
        wifi_security: get_wifi_security(),
    })
}

pub fn get_local_ip() -> Result<String> {
    // Já implementado anteriormente
    if let Ok(socket) = std::net::UdpSocket::bind("0.0.0.0:0") {
        if socket.connect("8.8.8.8:80").is_ok() {
            if let Ok(addr) = socket.local_addr() {
                return Ok(addr.ip().to_string());
            }
        }
    }
    Ok("127.0.0.1".to_string())
}

fn get_subnet_mask() -> Result<String> {
    let output = Command::new("ipconfig").output()?;
    let result = String::from_utf8_lossy(&output.stdout);
    
    for line in result.lines() {
        if line.contains("Subnet Mask") || line.contains("Máscara de Sub-rede") {
            if let Some(mask) = line.split(':').nth(1) {
                return Ok(mask.trim().to_string());
            }
        }
    }
    Ok("255.255.255.0".to_string())
}

fn get_gateway() -> Result<String> {
    let output = Command::new("ipconfig").output()?;
    let result = String::from_utf8_lossy(&output.stdout);
    
    for line in result.lines() {
        if line.contains("Default Gateway") || line.contains("Gateway Predefinido") {
            if let Some(gateway) = line.split(':').nth(1) {
                let gw = gateway.trim();
                if !gw.is_empty() {
                    return Ok(gw.to_string());
                }
            }
        }
    }
    Ok("192.168.1.1".to_string())
}

fn get_dns_primary() -> Result<String> {
    // Usa nslookup para obter DNS
    let output = Command::new("nslookup")
        .arg("google.com")
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    for line in result.lines() {
        if line.contains("Server:") {
            if let Some(dns) = line.split(':').nth(1) {
                return Ok(dns.trim().to_string());
            }
        }
    }
    Ok("8.8.8.8".to_string())
}

fn get_dns_secondary() -> Option<String> {
    // Placeholder - pode ser expandido
    None
}

fn is_dhcp_enabled() -> Result<bool> {
    let output = Command::new("ipconfig").arg("/all").output()?;
    let result = String::from_utf8_lossy(&output.stdout);
    
    Ok(result.contains("DHCP Enabled") && result.contains("Yes"))
}

fn get_domain_name() -> Result<String> {
    let output = Command::new("wmic")
        .args(&["computersystem", "get", "domain"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    let domain = result.lines().nth(1).unwrap_or("WORKGROUP").trim();
    Ok(domain.to_string())
}

fn check_domain_joined() -> Result<bool> {
    let domain = get_domain_name()?;
    Ok(domain.to_uppercase() != "WORKGROUP")
}

fn get_mac_address() -> Result<String> {
    let output = Command::new("getmac").output()?;
    let result = String::from_utf8_lossy(&output.stdout);
    
    for line in result.lines().skip(3) {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() > 0 && parts[0].contains('-') {
            return Ok(parts[0].to_string());
        }
    }
    Ok("00-00-00-00-00-00".to_string())
}

fn get_adapter_name() -> Result<String> {
    let output = Command::new("wmic")
        .args(&["nic", "where", "NetEnabled=true", "get", "name"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    Ok(result.lines().nth(1).unwrap_or("Unknown Adapter").trim().to_string())
}

fn get_connection_speed() -> Result<i64> {
    let output = Command::new("wmic")
        .args(&["nic", "where", "NetEnabled=true", "get", "speed"])
        .output()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    let speed_str = result.lines().nth(1).unwrap_or("0").trim();
    let speed_bps: i64 = speed_str.parse().unwrap_or(0);
    Ok(speed_bps / 1_000_000) // Convert to Mbps
}

fn get_wifi_ssid() -> Option<String> {
    let output = Command::new("netsh")
        .args(&["wlan", "show", "interfaces"])
        .output()
        .ok()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    for line in result.lines() {
        if line.contains("SSID") && !line.contains("BSSID") {
            if let Some(ssid) = line.split(':').nth(1) {
                return Some(ssid.trim().to_string());
            }
        }
    }
    None
}

fn get_wifi_security() -> Option<String> {
    let output = Command::new("netsh")
        .args(&["wlan", "show", "interfaces"])
        .output()
        .ok()?;
    
    let result = String::from_utf8_lossy(&output.stdout);
    for line in result.lines() {
        if line.contains("Authentication") {
            if let Some(auth) = line.split(':').nth(1) {
                return Some(auth.trim().to_string());
            }
        }
    }
    None
}