import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/ToastProvider";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import MachineDetail from "./pages/MachineDetail";
import ScreenTime from "./pages/ScreenTime";
import Policies from "./pages/Policies";
import Vulnerabilities from "./pages/Vulnerabilities";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";

export default function App() {
    return (
        <ThemeProvider>
                <ToastProvider />
                <div className="flex h-screen bg-black">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <TopBar />
                        <main className="flex-1 overflow-y-auto p-8">
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/machines" element={<Machines />} />
                                <Route path="/machines/:id" element={<MachineDetail />} />
                                <Route path="/screen-time" element={<ScreenTime />} />
                                <Route path="/policies" element={<Policies />} />
                                <Route path="/vulnerabilities" element={<Vulnerabilities />} />
                                <Route path="/audit" element={<Audit />} />
                                <Route path="/settings" element={<Settings />} />
                            </Routes>
                        </main>
                    </div>
                </div>
        </ThemeProvider>
    );
}