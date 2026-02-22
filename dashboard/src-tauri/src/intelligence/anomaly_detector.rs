use crate::models::Machine;

pub struct AnomalyDetector {
    cpu_threshold: f32,
    ram_threshold: f32,
}

impl AnomalyDetector {
    pub fn new() -> Self {
        Self {
            cpu_threshold: 90.0, // 90% CPU
            ram_threshold: 85.0, // 85% RAM
        }
    }

    pub fn detect_anomalies(&self, machine: &Machine) -> Vec<Anomaly> {
        let mut anomalies = Vec::new();

        // Verifica uso de RAM
        if machine.ram_total_mb > 0 {
            let ram_percent = (machine.ram_used_mb as f32 / machine.ram_total_mb as f32) * 100.0;

            if ram_percent > self.ram_threshold {
                anomalies.push(Anomaly {
                    anomaly_type: AnomalyType::HighRAMUsage,
                    machine_id: machine.machine_id.clone(),
                    severity: if ram_percent > 95.0 {
                        "critical"
                    } else {
                        "warning"
                    }
                    .to_string(),
                    description: format!("RAM usage at {:.1}%", ram_percent),
                    detected_at: chrono::Utc::now().to_rfc3339(),
                });
            }
        }

        // Verifica uptime anormal (>30 dias sem reiniciar)
        if machine.uptime_hours > 720 {
            anomalies.push(Anomaly {
                anomaly_type: AnomalyType::LongUptime,
                machine_id: machine.machine_id.clone(),
                severity: "info".to_string(),
                description: format!("Uptime: {} days", machine.uptime_hours / 24),
                detected_at: chrono::Utc::now().to_rfc3339(),
            });
        }

        anomalies
    }
}

#[derive(Debug, Clone)]
pub struct Anomaly {
    pub anomaly_type: AnomalyType,
    pub machine_id: String,
    pub severity: String,
    pub description: String,
    pub detected_at: String,
}

#[derive(Debug, Clone)]
pub enum AnomalyType {
    HighCPUUsage,
    HighRAMUsage,
    HighDiskUsage,
    LongUptime,
    SuspiciousProcess,
    UnusualNetworkActivity,
}

impl Default for AnomalyDetector {
    fn default() -> Self {
        Self::new()
    }
}
