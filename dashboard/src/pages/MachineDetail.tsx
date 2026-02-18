import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Cpu, HardDrive, Activity } from "lucide-react";
import { useMachines } from "../hooks/useMachines";

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
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { machines } = useMachines();
    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const [tab, setTab] = useState<"hardware" | "software" | "processes">("hardware");

    const machine = machines.find((m) => m.machine_id === id);

    useEffect(() => {
        if (machine) {
            document.title = `${machine.custom_name || machine.hostname} - AssetScan`;
            loadProcesses();
        }
    }, [machine]);

    const loadProcesses = async () => {
        if (!id) return;
        try {
            const result = await invoke<ProcessInfo[]>("get_processes", { machineId: id });
            setProcesses(result);
        } catch (err) {
            console.error("Error loading processes:", err);
        }
    };

    if (!machine) {
        return <div className="text-slate-400">Máquina não encontrada</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/machines")}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {machine.custom_name || machine.hostname}
                    </h1>
                    <p className="text-slate-400">{machine.os_name} {machine.os_version}</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <StatCard icon={Cpu} label="CPU" value={`${machine.cpu_cores} núcleos`} />
                <StatCard
                    icon={HardDrive}
                    label="RAM"
                    value={`${(machine.ram_total_mb / 1024).toFixed(1)} GB`}
                />
                <StatCard icon={Activity} label="Software" value={`${machine.software_count}`} />
                <StatCard icon={Activity} label="Processos" value={`${machine.process_count}`} />
            </div>

            <div className="flex gap-2 border-b border-slate-700">
                {["hardware", "software", "processes"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`px-4 py-2 text-sm font-medium capitalize ${tab === t
                                ? "text-blue-500 border-b-2 border-blue-500"
                                : "text-slate-400 hover:text-white"
                            }`}
                    >
                        {t === "hardware" ? "🖥️ Hardware" : t === "software" ? "📦 Software" : "⚡ Processos"}
                    </button>
                ))}
            </div>

            {tab === "processes" && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="text-left p-3 text-sm font-semibold text-slate-300">PID</th>
                                <th className="text-left p-3 text-sm font-semibold text-slate-300">Nome</th>
                                <th className="text-left p-3 text-sm font-semibold text-slate-300">Caminho</th>
                                <th className="text-right p-3 text-sm font-semibold text-slate-300">RAM (MB)</th>
                                <th className="text-right p-3 text-sm font-semibold text-slate-300">CPU %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {processes.slice(0, 50).map((proc) => (
                                <tr key={proc.id} className="hover:bg-slate-700/50">
                                    <td className="p-3 text-sm text-slate-400">{proc.pid}</td>
                                    <td className="p-3 text-sm text-white font-medium">{proc.name}</td>
                                    <td className="p-3 text-xs text-slate-500 font-mono truncate max-w-xs">
                                        {proc.exe_path}
                                    </td>
                                    <td className="p-3 text-sm text-slate-300 text-right">
                                        {proc.memory_mb.toFixed(1)}
                                    </td>
                                    <td className="p-3 text-sm text-slate-300 text-right">
                                        {proc.cpu_percent.toFixed(1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value }: any) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-blue-500" />
                <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-lg font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}