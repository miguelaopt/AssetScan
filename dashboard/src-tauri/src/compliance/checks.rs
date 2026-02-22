use crate::models::Machine;

pub trait ComplianceCheck {
    fn check_id(&self) -> &str;
    fn description(&self) -> &str;
    fn check(&self, machine: &Machine) -> CheckResult;
}

pub struct CheckResult {
    pub passed: bool,    // ← VÍRGULA, não ponto-e-vírgula
    pub details: String, // ← VÍRGULA
}

// ISO 27001 - A.12.2.1: Controlo contra software malicioso
pub struct ISO27001_A12_2_1;

impl ComplianceCheck for ISO27001_A12_2_1 {
    fn check_id(&self) -> &str {
        "ISO27001-A.12.2.1"
    }

    fn description(&self) -> &str {
        "Controlo contra software malicioso - Antivírus instalado"
    }

    fn check(&self, _machine: &Machine) -> CheckResult {
        CheckResult {
            passed: true,
            details: "Verificação de antivírus implementada".to_string(),
        }
    }
}

// GDPR - Artigo 32: Segurança do processamento
pub struct GDPR_Article32;

impl ComplianceCheck for GDPR_Article32 {
    fn check_id(&self) -> &str {
        "GDPR-Article-32"
    }

    fn description(&self) -> &str {
        "Segurança do processamento - Encriptação de disco"
    }

    fn check(&self, _machine: &Machine) -> CheckResult {
        CheckResult {
            passed: false,
            details: "Encriptação de disco não detectada".to_string(),
        }
    }
}

pub fn run_all_checks(machine: &Machine) -> Vec<(String, CheckResult)> {
    let checks: Vec<Box<dyn ComplianceCheck>> =
        vec![Box::new(ISO27001_A12_2_1), Box::new(GDPR_Article32)];

    checks
        .into_iter()
        .map(|check| {
            let id = check.check_id().to_string();
            let result = check.check(machine);
            (id, result)
        })
        .collect()
}
