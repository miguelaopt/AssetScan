use crate::compliance::checks::run_all_checks;
use crate::models::Machine;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ComplianceReport {
    pub generated_at: String,
    pub standard: String,
    pub total_checks: usize,
    pub passed_checks: usize,
    pub failed_checks: usize,
    pub compliance_score: f32,
    pub machines: Vec<MachineComplianceResult>,
}

#[derive(Serialize, Deserialize)]
pub struct MachineComplianceResult {
    pub machine_id: String,
    pub hostname: String,
    pub checks: Vec<ComplianceCheckResult>,
}

#[derive(Serialize, Deserialize)]
pub struct ComplianceCheckResult {
    pub check_id: String,
    pub passed: bool,
    pub details: String,
}

pub fn generate_compliance_report(standard: &str, machines: Vec<Machine>) -> ComplianceReport {
    let mut total_checks = 0;
    let mut passed_checks = 0;
    let mut machine_results = Vec::new();

    for machine in machines {
        let checks = run_all_checks(&machine);

        let check_results: Vec<ComplianceCheckResult> = checks
            .into_iter()
            .map(|(check_id, result)| {
                total_checks += 1;
                if result.passed {
                    passed_checks += 1;
                }

                ComplianceCheckResult {
                    check_id,
                    passed: result.passed,
                    details: result.details,
                }
            })
            .collect();

        machine_results.push(MachineComplianceResult {
            machine_id: machine.machine_id.clone(),
            hostname: machine.hostname.clone(),
            checks: check_results,
        });
    }

    let failed_checks = total_checks - passed_checks;
    let compliance_score = if total_checks > 0 {
        (passed_checks as f32 / total_checks as f32) * 100.0
    } else {
        0.0
    };

    ComplianceReport {
        generated_at: chrono::Utc::now().to_rfc3339(),
        standard: standard.to_string(),
        total_checks,
        passed_checks,
        failed_checks,
        compliance_score,
        machines: machine_results,
    }
}
