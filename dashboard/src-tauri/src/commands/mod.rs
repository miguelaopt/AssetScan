pub mod audit;
pub mod chatbot;
pub mod machines;
pub mod policies;
pub mod processes;
pub mod screenshots;
pub mod vulnerabilities;

// Re-export all command functions
pub use audit::*;
pub use chatbot::*;
pub use machines::*;
pub use policies::*;
pub use processes::*;
pub use screenshots::*;
pub use vulnerabilities::*;
