// ============================================================
// wmi_collector.rs — Leitura avançada via WMI (Enterprise)
// ============================================================

use serde::Deserialize;
use wmi::{COMLibrary, WMIConnection};

#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
struct Win32_BIOS {
    serial_number: Option<String>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
struct Win32_BaseBoard {
    product: Option<String>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
struct Win32_VideoController {
    name: Option<String>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
struct Win32_EncryptableVolume {
    protection_status: Option<u32>, // 1 significa protegido (BitLocker ativo)
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
struct Win32_ComputerSystem {
    domain: Option<String>,
    user_name: Option<String>,
}

#[derive(Debug, Default)]
pub struct WmiHardwareInfo {
    pub serial_number: String,
    pub motherboard_model: String,
    pub gpu_name: String,
    pub is_bitlocker_active: bool,
    pub domain_name: String,
    pub current_user: String,
}

pub fn collect_wmi_data() -> WmiHardwareInfo {
    let mut info = WmiHardwareInfo::default();

    // Inicializa a conexão WMI (ignora falhas em PCs que não suportem)
    let com_con = match COMLibrary::new() {
        Ok(c) => c,
        Err(_) => return info,
    };
    
    let wmi_con = match WMIConnection::new(com_con) {
        Ok(c) => c,
        Err(_) => return info,
    };

    // 1. Service Tag / Nº de Série
    if let Ok(bios) = wmi_con.raw_query::<Win32_BIOS>("SELECT SerialNumber FROM Win32_BIOS") {
        if let Some(first) = bios.first() {
            info.serial_number = first.serial_number.clone().unwrap_or_default();
        }
    }

    // 2. Motherboard
    if let Ok(board) = wmi_con.raw_query::<Win32_BaseBoard>("SELECT Product FROM Win32_BaseBoard") {
        if let Some(first) = board.first() {
            info.motherboard_model = first.product.clone().unwrap_or_default();
        }
    }

    // 3. GPU (Placa Gráfica)
    if let Ok(gpu) = wmi_con.raw_query::<Win32_VideoController>("SELECT Name FROM Win32_VideoController") {
        if let Some(first) = gpu.first() {
            info.gpu_name = first.name.clone().unwrap_or_default();
        }
    }

    // 4. BitLocker Status (Procura pelo disco C:)
    if let Ok(volumes) = wmi_con.raw_query::<Win32_EncryptableVolume>("SELECT ProtectionStatus FROM Win32_EncryptableVolume WHERE DriveLetter = 'C:'") {
        if let Some(first) = volumes.first() {
            info.is_bitlocker_active = first.protection_status == Some(1);
        }
    }

    // 5. Domínio e Utilizador Atual
    if let Ok(sys) = wmi_con.raw_query::<Win32_ComputerSystem>("SELECT Domain, UserName FROM Win32_ComputerSystem") {
        if let Some(first) = sys.first() {
            info.domain_name = first.domain.clone().unwrap_or_default();
            info.current_user = first.user_name.clone().unwrap_or_default();
        }
    }

    info
}