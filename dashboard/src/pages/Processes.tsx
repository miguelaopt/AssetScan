import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Activity, X } from "lucide-react";
import toast from "react-hot-toast";

interface ProcessInfo {
    id: number;
    machine_id: string;
    pid: number;
    name: string;
    exe_path: string;
    memory_mb: number;
    cpu_percent: number;
    captured_at: string;
}

interface Props {
    machineId: string;
}

export default function ProcessesTab({ machineId }: Props) {
    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProcesses();
        const interval = setInterval(loadProcesses, 5000); // Actualiza cada 5s
        return () => clearInterval(interval);
    }, [machineId]);

    const loadProcesses = async () => {
        try {
            const result = await invoke<ProcessInfo[]>("get_processes", { machineId });
            setProcesses(result.sort((a, b) => b.cpu_percent - a.cpu_percent));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const killProcess = async (proc: ProcessInfo) => {
        if (!confirm(`Terminar ${proc.name} (PID: ${proc.pid})?`)) return;

        try {
            await invoke("kill_process", {
                machineId,
                processName: proc.name,
            });
            toast.success(`${proc.name} será terminado no próximo ciclo!`);
        } catch (err) {
            toast.error(`Erro: ${err}`);
        }
    };

    if (loading) {
        return <div className="animate-pulse text-gray-500">A carregar...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Total</p>
                    <p className="text-2xl font-bold text-white">{processes.length}</p>
                </div>
                <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">CPU Média</p>
                    <p className="text-2xl font-bold text-matrix-green-400">
                        {(processes.reduce((sum, p) => sum + p.cpu_percent, 0) / processes.length).toFixed(1)}%
                    </p>
                </div>
                <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">RAM Total</p>
                    <p className="text-2xl font-bold text-white">
                        {(processes.reduce((sum, p) => sum + p.memory_mb, 0) / 1024).toFixed(1)} GB
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="glass rounded-xl overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>PID</th>
                            <th>Nome</th>
                            <th>CPU %</th>
                            <th>RAM (MB)</th>
                            <th>Caminho</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processes.map((proc) => (
                            <tr key={proc.id}>
                                <td className="font-mono text-gray-400">{proc.pid}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-matrix-green-500" />
                                        <span className="font-medium text-white">{proc.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`font-semibold ${proc.cpu_percent > 50 ? 'text-red-400' :
                                            proc.cpu_percent > 20 ? 'text-amber-400' :
                                                'text-matrix-green-400'
                                        }`}>
                                        {proc.cpu_percent.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="text-gray-400">{proc.memory_mb.toFixed(1)}</td>
                                <td className="text-xs text-gray-500 truncate max-w-xs" title={proc.exe_path}>
                                    {proc.exe_path || 'N/A'}
                                </td>
                                <td>
                                    <button
                                        onClick={() => killProcess(proc)}
                                        className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs"
                                    >
                                        <X className="w-3 h-3" />
                                        Kill
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}