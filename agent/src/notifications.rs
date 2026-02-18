// ============================================================
// notifications.rs — Notificações Windows para o Utilizador
// ============================================================

use windows::UI::Notifications::{
    ToastNotification, ToastNotificationManager, ToastTemplateType,
};
use windows::Data::Xml::Dom::XmlDocument;

/// Mostra notificação de app bloqueada
pub fn show_blocked_app_notification(app_name: &str, reason: &str) {
    let title = "⛔ Aplicação Bloqueada";
    let message = format!("{} foi bloqueada.\nRazão: {}", app_name, reason);

    if let Err(e) = show_toast(title, &message) {
        eprintln!("[Notificação] Erro ao mostrar: {}", e);
    }
}

/// Notifica múltiplas apps bloqueadas
pub fn notify_blocked_apps(count: usize) {
    if count == 0 {
        return;
    }

    let message = if count == 1 {
        "1 aplicação foi bloqueada pelo administrador.".to_string()
    } else {
        format!("{} aplicações foram bloqueadas pelo administrador.", count)
    };

    let _ = show_toast("🛡️ AssetScan", &message);
}

/// Mostra toast notification genérica
fn show_toast(title: &str, body: &str) -> Result<(), Box<dyn std::error::Error>> {
    unsafe {
        let toast_xml = XmlDocument::new()?;
        
        let template = format!(
            r#"
            <toast>
                <visual>
                    <binding template="ToastText02">
                        <text id="1">{}</text>
                        <text id="2">{}</text>
                    </binding>
                </visual>
                <audio src="ms-winsoundevent:Notification.Default"/>
            </toast>
            "#,
            escape_xml(title),
            escape_xml(body)
        );

        toast_xml.LoadXml(&template.into())?;

        let toast = ToastNotification::CreateToastNotification(&toast_xml)?;
        let notifier = ToastNotificationManager::CreateToastNotifierWithId(
            &"AssetScan.Agent".into()
        )?;

        notifier.Show(&toast)?;
    }

    Ok(())
}

fn escape_xml(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}