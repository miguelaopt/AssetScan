use serde::{Serialize, Deserialize};
use reqwest::Client;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use hex;

type HmacSha256 = Hmac<Sha256>;

#[derive(Serialize, Deserialize, Clone)]
pub struct WebhookEvent {
    pub event_type: String,
    pub timestamp: String,
    pub data: serde_json::Value,
}

pub async fn trigger_webhook(
    url: &str,
    event: WebhookEvent,
    secret: Option<&str>,
) -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let payload = serde_json::to_string(&event)?;
    
    // Calcula signature se secret fornecido
    let signature = if let Some(secret_key) = secret {
        let mut mac = HmacSha256::new_from_slice(secret_key.as_bytes())?;
        mac.update(payload.as_bytes());
        let result = mac.finalize();
        Some(hex::encode(result.into_bytes()))
    } else {
        None
    };
    
    let mut request = client
        .post(url)
        .header("Content-Type", "application/json")
        .header("X-AssetScan-Event", &event.event_type)
        .body(payload);
    
    if let Some(sig) = signature {
        request = request.header("X-AssetScan-Signature", format!("sha256={}", sig));
    }
    
    let response = request.send().await?;
    
    if !response.status().is_success() {
        return Err(format!("Webhook failed: {}", response.status()).into());
    }
    
    Ok(())
}

// Helper para criar eventos comuns
pub fn create_machine_online_event(machine_id: &str, hostname: &str) -> WebhookEvent {
    WebhookEvent {
        event_type: "machine.online".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
        data: serde_json::json!({
            "machine_id": machine_id,
            "hostname": hostname,
        }),
    }
}

pub fn create_machine_offline_event(machine_id: &str, hostname: &str) -> WebhookEvent {
    WebhookEvent {
        event_type: "machine.offline".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
        data: serde_json::json!({
            "machine_id": machine_id,
            "hostname": hostname,
        }),
    }
}

pub fn create_vulnerability_found_event(
    machine_id: &str,
    cve_id: &str,
    severity: &str,
) -> WebhookEvent {
    WebhookEvent {
        event_type: "vulnerability.found".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
        data: serde_json::json!({
            "machine_id": machine_id,
            "cve_id": cve_id,
            "severity": severity,
        }),
    }
}