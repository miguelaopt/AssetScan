import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Clock, TrendingUp, Calendar } from "lucide-react";
import { useMachines } from "../hooks/useMachines";

interface ScreenTimeEntry {
    machine_id: string;
    app_name: string;
    total_seconds: number;
    date: string;
}

export default function ScreenTime() {
    const { machines } = useMachines();
    const [selectedMachine, setSelectedMachine] = useState<string>("");
    const [entries, setEntries] = useState<ScreenTimeEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (machines.length > 0 && !selectedMachine) {
            setSelectedMachine(machines[0].machine_id);
        }
    }, [machines]);

    useEffect(() => {
        if (selectedMachine) {
            loadScreenTime();
        }
    }, [selectedMachine]);

    const loadScreenTime = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const result = await invoke<ScreenTimeEntry[]>("get_screen_time", {
                machineId: selectedMachine,
                date: today,
            });
            setEntries(result.sort((a, b) => b.total_seconds - a.total_seconds));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    };

    const totalTime = entries.reduce((sum, e) => sum + e.total_seconds, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Screen Time</h1>
                    <p className="text-gray-500">Tempo de uso por aplicação</p>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">{new Date().toLocaleDateString('pt-PT')}</span>
                </div>
            </div>

            {/* Machine Selector */}
            <div className="glass rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Máquina</label>
                <select
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="select w-full"
                >
                    {machines.map(m => (
                        <option key={m.machine_id} value={m.machine_id}>
                            {m.custom_name || m.hostname} ({m.local_ip || 'IP desconhecido'})
                        </option>
                    ))}
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-matrix-green-500" />
                        <span className="text-sm text-gray-400">Tempo Total</span>
                    </div>
                    <p className="text-3xl font-bold text-gradient">{formatTime(totalTime)}</p>
                </div>

                <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-matrix-green-500" />
                        <span className="text-sm text-gray-400">Apps Activas</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{entries.length}</p>
                </div>

                <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-matrix-green-500" />
                        <span className="text-sm text-gray-400">App Mais Usada</span>
                    </div>
                    <p className="text-lg font-semibold text-white truncate">
                        {entries[0]?.app_name || 'N/A'}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="glass rounded-xl overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Aplicação</th>
                            <th>Tempo de Uso</th>
                            <th>Percentagem</th>
                            <th>Barra</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">A carregar...</td></tr>
                        ) : entries.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">Sem dados para hoje</td></tr>
                        ) : (
                            entries.map((entry, idx) => {
                                const percentage = totalTime > 0 ? (entry.total_seconds / totalTime) * 100 : 0;

                                return (
                                    <tr key={idx}>
                                        <td>
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-matrix-green-500/10 text-matrix-green-400 font-bold">
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="font-medium text-white">{entry.app_name}</td>
                                        <td className="text-matrix-green-400 font-semibold">{formatTime(entry.total_seconds)}</td>
                                        <td className="text-gray-400">{percentage.toFixed(1)}%</td>
                                        <td>
                                            <div className="w-full bg-gray-900 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-matrix-green-500 to-cyber-green-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}