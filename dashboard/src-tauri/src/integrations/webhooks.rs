// src-tauri/src/integrations/webhooks.rs
use crate::database::DbPool;
use crate::models::WebhookEvent;
use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

pub async fn trigger_webhook(event: WebhookEvent, pool: &DbPool) {
    // Na fase final, isto irá buscar os webhooks reais à BD.
    // Para já preparamos a lógica de disparo com HMAC.
    
    tokio::spawn(async move {
        let payload = serde_json::to_string(&event).unwrap_or_default();
        let secret = "my_secret_key".to_string(); // Simulação
        
        // Calcula HMAC signature
        let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
            .expect("HMAC can take key of any size");
        mac.update(payload.as_bytes());
        let signature = hex::encode(mac.finalize().into_bytes());
        
        let client = reqwest::Client::new();
        let _response = client
            .post("http://localhost/dummy-webhook") // URL simulado
            .header("X-AssetScan-Signature", signature)
            .header("X-AssetScan-Event", &event.event_type)
            .json(&event)
            .send()
            .await;
        
        println!("[Webhook] Evento '{}' disparado.", event.event_type);
    });
}