import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Cpu, Activity, LayoutGrid, Server, Globe } from "lucide-react";
import { useMachines } from "../hooks/useMachines";

import HardwareTab from "../components/HardwareTab";
import SoftwareTab from "../components/SoftwareTab";
import NetworkTab from "../components/NetworkTab"; // NOVA ABA

interface ProcessInfo { id: number; pid: number; name: string; exe_path: string; memory_mb: number; cpu_percent: number; }

export default function MachineDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { machines } = useMachines();

    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const [tab, setTab] = useState<"hardware" | "software" | "processes" | "network">("hardware");

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
            setProcesses(result.sort((a, b) => b.cpu_percent - a.cpu_percent));
        } catch (err) { console.error(err); }
    };

    if (!machine) return <div className="text-emerald-500/70 p-8">Máquina não encontrada...</div>;
    const actualId = machine.machine_id || machine.id;

    return (
        <div className="space-y-6 animate-fade-in">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar à lista
            </button>

            <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <Server className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{machine.custom_name || machine.hostname}</h1>
                        <p className="text-emerald-400/80 font-medium">{machine.os_name} • {machine.os_version}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${machine.is_online ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        <span className={`w-2 h-2 rounded-full ${machine.is_online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-rose-500'}`} />
                        {machine.is_online ? "Online" : "Offline"}
                    </span>
                    <p className="text-sm text-slate-400 mt-2">ID: {actualId.substring(0, 8)}</p>
                </div>
            </div>

            {/* Abas Liquid Glass */}
            <div className="flex gap-2 border-b border-white/10 pb-px overflow-x-auto">
                <button onClick={() => setTab("hardware")} className={`px-6 py-3 font-medium transition-all rounded-t-xl flex items-center gap-2 whitespace-nowrap ${tab === 'hardware' ? 'bg-white/5 border-t border-l border-r border-white/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <Cpu className="w-4 h-4" /> Hardware
                </button>
                <button onClick={() => setTab("network")} className={`px-6 py-3 font-medium transition-all rounded-t-xl flex items-center gap-2 whitespace-nowrap ${tab === 'network' ? 'bg-white/5 border-t border-l border-r border-white/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <Globe className="w-4 h-4" /> Rede & Segurança
                </button>
                <button onClick={() => setTab("software")} className={`px-6 py-3 font-medium transition-all rounded-t-xl flex items-center gap-2 whitespace-nowrap ${tab === 'software' ? 'bg-white/5 border-t border-l border-r border-white/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <LayoutGrid className="w-4 h-4" /> Software
                </button>
                <button onClick={() => setTab("processes")} className={`px-6 py-3 font-medium transition-all rounded-t-xl flex items-center gap-2 whitespace-nowrap ${tab === 'processes' ? 'bg-white/5 border-t border-l border-r border-white/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <Activity className="w-4 h-4" /> Processos
                </button>
            </div>

            {/* Conteúdo das Abas */}
            {tab === "hardware" && <HardwareTab machine={machine} />}
            {tab === "network" && <NetworkTab machine={machine} />}
            {tab === "software" && <SoftwareTab machineId={actualId} />}
            {tab === "processes" && (
                <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl mt-6">
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-black/40 text-slate-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">PID</th>
                                    <th className="px-6 py-4">Processo</th>
                                    <th className="px-6 py-4">Caminho</th>
                                    <th className="px-6 py-4 text-right">RAM (MB)</th>
                                    <th className="px-6 py-4 text-right">CPU %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {processes.length > 0 ? processes.slice(0, 50).map((proc) => (
                                    <tr key={proc.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 font-mono">{proc.pid}</td>
                                        <td className="px-6 py-4 font-medium text-white">{proc.name}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-mono truncate max-w-xs">{proc.exe_path}</td>
                                        <td className="px-6 py-4 text-slate-300 text-right">{proc.memory_mb.toFixed(1)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-semibold ${proc.cpu_percent > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                {proc.cpu_percent.toFixed(1)}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum processo recebido ainda.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}