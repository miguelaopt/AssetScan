use crate::models::Machine;

pub struct CheckResult {
    pub passed: bool,
    pub details: String,
}

pub trait ComplianceCheck {
    fn check_id(&self) -> &str;
    fn description(&self) -> &str;
    fn check(&self, machine: &Machine) -> CheckResult;
}

// Exemplo: ISO 27001 A.12.2.1 - Controlos contra malware (Antivírus instalado)
pub struct ISO27001_A12_2_1;

impl ComplianceCheck for ISO27001_A12_2_1 {
    fn check_id(&self) -> &str {
        "A.12.2.1"
    }

    fn description(&self) -> &str {
        "Controls against malware"
    }

    fn check(&self, machine: &Machine) -> CheckResult {
        // Na implementação final, isto vai verificar o `machine.software` real.
        // Aqui simulamos a verificação da existência de um Antivírus.
        let has_av = machine.tags.contains(&"has_antivirus".to_string());
        
        CheckResult {
            passed: has_av,
            details: if has_av { 
                "Software antivírus detectado.".to_string() 
            } else { 
                "Nenhum antivírus activo encontrado na máquina.".to_string() 
            },
        }
    }
}