import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft } from "lucide-react";
import { useMachines } from "../hooks/useMachines";

// IMPORTANTE: Importação correta dos componentes a partir da pasta "components"
import HardwareTab from "../components/HardwareTab";
import SoftwareTab from "../components/SoftwareTab";

interface ProcessInfo {
    id: number;
    pid: number;
    name: string;
    exe_path: string;
    memory_mb: number;
    cpu_percent: number;
    captured_at: string;
}

export default function MachineDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { machines } = useMachines();

    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const [tab, setTab] = useState<"hardware" | "software" | "processes">("hardware");

    const machine = machines.find((m) => m.machine_id === id || m.id === id);

    useEffect(() => {
        if (machine) {
            const actualId = machine.machine_id || machine.id;
            loadProcesses(actualId);
        }
    }, [machine]);

    const loadProcesses = async (machineId: string) => {
        try {
            const result = await invoke<ProcessInfo[]>("get_processes", { machineId });
            setProcesses(result);
        } catch (err) {
            console.error("Error loading processes:", err);
        }
    };

    if (!machine) return <div className="text-slate-400">Máquina não encontrada</div>;

    return (
        <div className="space-y-6">
            <button onClick={() => navigate("/machines")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" /> Voltar
            </button>

            <h1 className="text-2xl font-bold text-white">{machine.custom_name || machine.hostname}</h1>

            <div className="flex gap-2 border-b border-slate-700">
                {["hardware", "software", "processes"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`px-4 py-2 capitalize transition-colors ${tab === t ? "border-b-2 border-blue-500 text-white" : "text-slate-400 hover:text-slate-200"}`}
                    >
                        {t === "hardware" ? "🖥️ Hardware" : t === "software" ? "📦 Software" : "⚡ Processos"}
                    </button>
                ))}
            </div>

            {/* Renderizar as abas usando os SEUS componentes! */}
            {tab === "hardware" && (
                <HardwareTab machine={machine} />
            )}

            {tab === "software" && (
                <SoftwareTab machineId={machine.machine_id} />
            )}

            {tab === "processes" && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="text-left p-4 text-sm font-semibold text-slate-300">PID</th>
                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Nome</th>
                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Caminho</th>
                                <th className="text-right p-4 text-sm font-semibold text-slate-300">RAM (MB)</th>
                                <th className="text-right p-4 text-sm font-semibold text-slate-300">CPU %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {processes.length > 0 ? processes.slice(0, 50).map((proc) => (
                                <tr key={proc.id} className="hover:bg-slate-700/50">
                                    <td className="p-4 text-sm text-slate-400">{proc.pid}</td>
                                    <td className="p-4 text-sm text-white font-medium">{proc.name}</td>
                                    <td className="p-4 text-xs text-slate-500 font-mono truncate max-w-xs">{proc.exe_path}</td>
                                    <td className="p-4 text-sm text-slate-300 text-right">{proc.memory_mb.toFixed(1)}</td>
                                    <td className="p-4 text-sm text-slate-300 text-right">{proc.cpu_percent.toFixed(1)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        Nenhum processo recebido ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}