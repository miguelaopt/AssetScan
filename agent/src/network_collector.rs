use serde::{Deserialize, Serialize};
use std::net::UdpSocket;

#[derive(Serialize, Deserialize, Debug)]
pub struct NetworkConnection {
    pub pid: u32,
    pub local_ip: String,
    pub remote_ip: String,
    pub state: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NetworkInfo {
    pub local_ip: String,
    pub connections: Vec<NetworkConnection>,
}

pub fn collect_network_stats() -> Vec<NetworkConnection> {
    // Placeholder - retorna conexão exemplo
    vec![
        NetworkConnection {
            pid: 1024,
            local_ip: format!("{}:443", get_local_ip()),
            remote_ip: "1.1.1.1:443".to_string(),
            state: "ESTABLISHED".to_string(),
        }
    ]
}

pub fn get_local_ip() -> String {
    // Tenta descobrir IP local fazendo conexão UDP
    if let Ok(socket) = UdpSocket::bind("0.0.0.0:0") {
        if socket.connect("8.8.8.8:80").is_ok() {
            if let Ok(addr) = socket.local_addr() {
                return addr.ip().to_string();
            }
        }
    }
    
    "127.0.0.1".to_string()
}