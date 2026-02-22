import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Clock, MonitorSmartphone, Search } from "lucide-react";
import { useMachines } from "../hooks/useMachines";

interface ScreenTimeEntry {
    machine_id: string;
    app_name: string;
    total_seconds: number;
    date: string;
}

export default function ScreenTime() {
    const { machines } = useMachines();
    const [selectedMachine, setSelectedMachine] = useState<string>("all");
    const [entries, setEntries] = useState<ScreenTimeEntry[]>([]);
    const [searchFilter, setSearchFilter] = useState("");

    useEffect(() => {
        // Num cenário real, "all" iria buscar o agregado ao backend.
        // Aqui chamamos pela máquina selecionada. Se for "all", idealmente o backend suportaria machineId: null.
        const targetId = selectedMachine === "all" ? (machines[0]?.machine_id || "") : selectedMachine;
        if (targetId) {
            loadScreenTime(targetId);
        }
    }, [selectedMachine, machines]);

    const loadScreenTime = async (machineId: string) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const result = await invoke<ScreenTimeEntry[]>("get_screen_time", {
                machineId: machineId,
                date: today,
            });
            setEntries(result.sort((a, b) => b.total_seconds - a.total_seconds));
        } catch (err) {
            console.error(err);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const maxTime = entries.length > 0 ? entries[0].total_seconds : 1;
    const filteredEntries = entries.filter(e => e.app_name.toLowerCase().includes(searchFilter.toLowerCase()));

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Produtividade & Screen Time</h1>
                <p className="text-emerald-400/80 font-medium">Análise de utilização de aplicações hoje</p>
            </div>

            <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Máquina Alvo</label>
                    <select
                        value={selectedMachine}
                        onChange={(e) => setSelectedMachine(e.target.value)}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-colors"
                    >
                        <option value="all">Visão Geral (Todas as Máquinas)</option>
                        {machines.map(m => (
                            <option key={m.id} value={m.machine_id}>{m.hostname}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Filtrar Apps/Sites</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="ex: chrome, excel..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            className="w-full pl-10 p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                    {filteredEntries.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Nenhum dado de ecrã para mostrar hoje.</p>
                    ) : (
                        filteredEntries.map((entry, idx) => {
                            const percentage = (entry.total_seconds / maxTime) * 100;
                            return (
                                <div key={idx} className="flex items-center gap-6">
                                    <div className="w-48 flex justify-between items-center shrink-0">
                                        <div className="flex items-center gap-3">
                                            <MonitorSmartphone className="w-4 h-4 text-emerald-500" />
                                            <span className="font-medium text-white truncate w-28" title={entry.app_name}>{entry.app_name}</span>
                                        </div>
                                        <span className="text-emerald-400 font-medium text-sm">{formatTime(entry.total_seconds)}</span>
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-full h-4 p-1 border border-white/5">
                                        <div
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}