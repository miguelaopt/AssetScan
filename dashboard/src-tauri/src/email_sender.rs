// src-tauri/src/email_sender.rs
use lettre::message::{Attachment, MultiPart, SinglePart, header::ContentType};
use lettre::{Message, SmtpTransport, Transport};
use lettre::transport::smtp::authentication::Credentials;
use lettre::transport::smtp::Error as SmtpError; // NOVO

pub async fn send_report_email(
    to: &str,
    subject: &str,
    html_body: &str,
    pdf_attachment: Vec<u8>,
) -> Result<(), String> {
    let email = Message::builder()
        .from("assetscan@yourdomain.com".parse().unwrap())
        .to(to.parse().unwrap())
        .subject(subject)
        .multipart(
            MultiPart::mixed()
                .singlepart(SinglePart::html(html_body.to_string()))
                .singlepart(
                    Attachment::new("report.pdf".to_string())
                        .body(pdf_attachment, ContentType::parse("application/pdf").unwrap())
                )
        ).map_err(|e: lettre::error::Error| e.to_string())?; // TIPO EXPLÍCITO AQUI
    
    let creds = Credentials::new("user".to_string(), "pass".to_string());
    let mailer = SmtpTransport::relay("smtp.gmail.com")
        .map_err(|e: lettre::transport::smtp::Error| e.to_string())?
        .credentials(creds)
        .build();
    
    // NOVO: Criamos uma String que é "nossa" (owned) para a thread poder usar em segurança
    let to_email = to.to_string(); 
    
    tokio::task::spawn_blocking(move || {
        match mailer.send(&email) {
            Ok(_) => println!("[Email] Relatório enviado para {}", to_email),
            Err(e) => eprintln!("[Email] Erro ao enviar email: {}", e),
        }
    });

    Ok(())
}