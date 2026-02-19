import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import MachineDetail from "./pages/MachineDetail";
import Policies from "./pages/Policies";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";

export default function App() {
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const saved = localStorage.getItem("theme") as "dark" | "light" | null;
        if (saved) {
            setTheme(saved);
            document.documentElement.setAttribute("data-theme", saved);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
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
                    </Routes>
                </main>
            </div>
        </div>
    );
}