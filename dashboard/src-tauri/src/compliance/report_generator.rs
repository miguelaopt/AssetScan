use crate::models::Machine;
use super::checks::{ComplianceCheck, ISO27001_A12_2_1};

pub enum ComplianceStandard {
    ISO27001,
    GDPR,
    SOC2,
}

pub struct ComplianceReport {
    pub standard: String,
    pub total_machines_checked: usize,
    pub passed_checks: usize,
    pub failed_checks: usize,
    // Em produção, guardariamos o detalhe de cada máquina
}

pub async fn generate_compliance_report(
    standard: ComplianceStandard,
    machines: Vec<Machine>,
) -> Result<ComplianceReport, String> {
    println!("[Compliance] A gerar relatório de conformidade...");
    
    let standard_name = match standard {
        ComplianceStandard::ISO27001 => "ISO 27001",
        ComplianceStandard::GDPR => "GDPR",
        ComplianceStandard::SOC2 => "SOC 2",
    };

    let check_av = ISO27001_A12_2_1;
    let mut passed = 0;
    let mut failed = 0;

    for machine in &machines {
        let result = check_av.check(machine);
        if result.passed { passed += 1; } else { failed += 1; }
    }

    Ok(ComplianceReport {
        standard: standard_name.to_string(),
        total_machines_checked: machines.len(),
        passed_checks: passed,
        failed_checks: failed,
    })
}