// ============================================================
// commands/mod.rs — Módulos de comandos Tauri
// ============================================================

pub mod machines;
pub mod policies;
pub mod processes;
pub mod audit;
pub mod screenshots;
pub mod chatbot;
pub use machines::*;
pub use policies::*;
pub use processes::*;
pub use audit::*;
pub use screenshots::*;
pub use chatbot::*;
