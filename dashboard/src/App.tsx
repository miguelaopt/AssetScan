// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import MachineDetail from "./pages/MachineDetail";
import Policies from "./pages/Policies";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";
import Vulnerabilities from "./pages/Vulnerabilities";
import Compliance from "./pages/Compliance";
import { Chatbot } from "./components/ChatBot";
import LicenseManager from "./pages/LicenseManager";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Webhooks from "./pages/Webhooks";

// Novos imports v3.0
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/ToastProvider";

function AppContent() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar theme={theme} onToggleTheme={toggleTheme} />

                <main className="flex-1 overflow-auto p-6 bg-[rgb(var(--bg-primary))]">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/machines" element={<Machines />} />
                        <Route path="/machines/:id" element={<MachineDetail />} />
                        <Route path="/policies" element={<Policies />} />
                        <Route path="/audit" element={<Audit />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/vulnerabilities" element={<Vulnerabilities />} />
                        <Route path="/compliance" element={<Compliance />} />
                        <Route path="/licenses" element={<LicenseManager />} />
                        <Route path="/executive" element={<ExecutiveDashboard />} />
                        <Route path="/webhooks" element={<Webhooks />} />
                    </Routes>
                </main>
            </div>
            <Chatbot />
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <ToastProvider />
            <AppContent />
        </ThemeProvider>
    );
}