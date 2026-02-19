// agent/src/network_collector.rs
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct NetworkConnection {
    pub pid: u32,
    pub local_ip: String,
    pub remote_ip: String,
    pub state: String,
}

pub fn collect_network_stats() -> Vec<NetworkConnection> {
    // Aqui usarias sysinfo ou a API GetExtendedTcpTable do Windows
    // Para simplificar, retornamos dados simulados
    vec![
        NetworkConnection {
            pid: 1024,
            local_ip: "192.168.1.50:443".to_string(),
            remote_ip: "104.18.2.1:443".to_string(),
            state: "ESTABLISHED".to_string(),
        }
    ]
}