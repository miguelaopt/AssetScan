// ============================================================
// App.tsx — Componente raiz. Gerencia estado global e roteamento
// simples (lista de máquinas ↔ detalhe de máquina).
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./components/Sidebar";
import MachineList from "./components/MachineList";
import MachineDetail from "./components/MachineDetail";

// Tipos espelhados das structs Rust em database.rs
export interface Machine {
    id: string;
    hostname: string;
    last_seen: string;
    cpu_name: string;
    cpu_cores: number;
    ram_total_mb: number;
    ram_used_mb: number;
    os_name: string;
    os_version: string;
    uptime_hours: number;
    disk_count: number;
    software_count: number;
}

export type View = "machines" | "detail";

export default function App() {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
    const [view, setView] = useState<View>("machines");
    const [loading, setLoading] = useState(true);

    // Carrega a lista de máquinas do backend Rust
    const loadMachines = useCallback(async () => {
        try {
            const result = await invoke<Machine[]>("list_machines");
            setMachines(result);
        } catch (err) {
            console.error("Erro ao carregar máquinas:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carrega ao iniciar e atualiza a cada 30 segundos
    useEffect(() => {
        loadMachines();
        const interval = setInterval(loadMachines, 30_000);
        return () => clearInterval(interval);
    }, [loadMachines]);

    const handleSelectMachine = (machine: Machine) => {
        setSelectedMachine(machine);
        setView("detail");
    };

    const handleBack = () => {
        setSelectedMachine(null);
        setView("machines");
    };

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
            {/* Sidebar lateral */}
            <Sidebar
                machineCount={machines.length}
                currentView={view}
                onGoHome={handleBack}
                onRefresh={loadMachines}
            />

            {/* Conteúdo principal */}
            <main className="flex-1 overflow-auto p-6">
                {view === "machines" ? (
                    <MachineList
                        machines={machines}
                        loading={loading}
                        onSelect={handleSelectMachine}
                    />
                ) : selectedMachine ? (
                    <MachineDetail machine={selectedMachine} onBack={handleBack} />
                ) : null}
            </main>
        </div>
    );
}