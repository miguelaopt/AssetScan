use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use chrono::Utc;
use serde::{Serialize, Deserialize};
use sysinfo::{System, ProcessesToUpdate};
use tokio::time::{interval, Duration};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ScreenTimeEntry {
    pub app_name: String,
    pub total_seconds: u64,
    pub date: String, // YYYY-MM-DD
}

lazy_static::lazy_static! {
    static ref SCREEN_TIME_DATA: Arc<Mutex<HashMap<String, u64>>> = Arc::new(Mutex::new(HashMap::new()));
}

pub async fn start_tracking() {
    let mut ticker = interval(Duration::from_secs(10)); // Check cada 10s
    let mut sys = System::new_all();

    loop {
        ticker.tick().await;
        
        // CORREÇÃO: Removido o argumento `true`
        sys.refresh_processes(ProcessesToUpdate::All);
        
        // Detecta processos activos
        let active_processes: Vec<String> = sys.processes()
            .values()
            .filter(|p| {
                let name = p.name().to_string_lossy().to_string();
                is_relevant_app(&name)
            })
            .map(|p| clean_process_name(p.name().to_string_lossy().to_string()))
            .collect();

        // Incrementa tempo para cada app activa
        let mut data = SCREEN_TIME_DATA.lock().unwrap();
        for app in active_processes {
            *data.entry(app).or_insert(0) += 10; // +10 segundos
        }
    }
}

pub fn get_daily_stats() -> Vec<ScreenTimeEntry> {
    let data = SCREEN_TIME_DATA.lock().unwrap();
    let today = Utc::now().format("%Y-%m-%d").to_string();
    
    data.iter()
        // CORREÇÃO: Declarado explicitamente o tipo (&String, &u64)
        .map(|(app, seconds): (&String, &u64)| ScreenTimeEntry {
            app_name: app.clone(),
            total_seconds: *seconds,
            date: today.clone(),
        })
        .collect()
}

fn is_relevant_app(name: &str) -> bool {
    let name_lower = name.to_lowercase();
    
    // Lista de apps relevantes para tracking
    let relevant = [
        "chrome", "firefox", "edge", "brave", "opera",
        "code", "visual studio", "sublime", "notepad++",
        "word", "excel", "powerpoint", "outlook", "teams", "slack", "discord", "zoom",
        "obs", "spotify", "photoshop", "illustrator", "premiere", "aftereffects"
    ];
    
    relevant.iter().any(|&app| name_lower.contains(app))
}

fn clean_process_name(name: String) -> String {
    name.replace(".exe", "")
        .replace(".bin", "")
        .replace(".app", "")
        .to_uppercase()
}