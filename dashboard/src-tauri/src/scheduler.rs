// src-tauri/src/scheduler.rs
use crate::database::DbPool;
use tokio_cron_scheduler::{Job, JobScheduler};

pub async fn setup_report_scheduler(pool: DbPool) {
    let scheduler: JobScheduler = JobScheduler::new()
        .await
        .expect("Falha ao criar o scheduler");

    let pool_daily = pool.clone();
    // Relatório diário às 08:00
    scheduler
        .add(
            Job::new_async("0 0 8 * * *", move |_uuid, _l| {
                let pool = pool_daily.clone();
                Box::pin(async move {
                    println!("[Scheduler] A gerar relatório diário...");
                    // generate_daily_report(&pool).await;
                })
            })
            .unwrap(),
        )
        .await
        .unwrap();

    let pool_weekly = pool.clone();
    // Relatório semanal (segunda-feira 09:00)
    scheduler
        .add(
            Job::new_async("0 0 9 * * MON", move |_uuid, _l| {
                let pool = pool_weekly.clone();
                Box::pin(async move {
                    println!("[Scheduler] A gerar relatório semanal...");
                    // generate_weekly_report(&pool).await;
                })
            })
            .unwrap(),
        )
        .await
        .unwrap();

    scheduler.start().await.unwrap();
    println!("[Scheduler] Serviço de agendamento de relatórios iniciado.");
}
