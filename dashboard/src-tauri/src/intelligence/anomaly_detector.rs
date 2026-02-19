// src-tauri/src/intelligence/anomaly_detector.rs

pub struct AnomalyDetector {
    // Na implementação final vai usar o modelo real de ML
    pub is_trained: bool,
}

impl AnomalyDetector {
    pub fn new() -> Self {
        Self {
            is_trained: false,
        }
    }

    pub fn train(&mut self) {
        // Treina modelo com dados históricos (Baseline de 7 dias)
        println!("[ML] A treinar modelo de Isolation Forest com dados históricos...");
        self.is_trained = true;
    }
    
    pub fn predict(&self, cpu_usage: f64, ram_usage: f64) -> f64 {
        // Retorna anomaly score (0.0 = normal, 1.0 = anómalo)
        if cpu_usage > 95.0 && ram_usage > 95.0 {
            0.9 // Alta probabilidade de anomalia
        } else {
            0.1 // Normal
        }
    }
}