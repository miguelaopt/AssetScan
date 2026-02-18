import { Machine } from "../App";
import StatusBadge from "./StatusBadge";

interface Props {
    machines: Machine[];
    loading: boolean;
    onSelect: (machine: Machine) => void;
}

function formatRAM(mb: number) {
    return mb >= 1024 ? `${(mb / 1024).toFixed(0)} GB` : `${mb} MB`;
}

function timeAgo(isoDate: string) {
    const diffMin = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60_000);
    if (diffMin < 1) return "Agora mesmo";
    if (diffMin < 60) return `${diffMin}m atrás`;
    const h = Math.floor(diffMin / 60);
    if (h < 24) return `${h}h atrás`;
    return `${Math.floor(h / 24)}d atrás`;
}

export default function MachineList({ machines, loading, onSelect }: Props) {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm">Carregando máquinas...</p>
                </div>
            </div>
        );
    }

    if (machines.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="text-center max-w-sm">
                    <div className="text-5xl mb-4">📡</div>
                    <h2 className="text-lg font-semibold text-white mb-2">Aguardando agentes</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Nenhuma máquina registrada ainda. Instale e execute o{" "}
                        <code className="text-blue-400 bg-slate-800 px-1 rounded">assetscan-agent.exe</code>{" "}
                        nos computadores dos clientes apontando para este servidor.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-white">Inventário de Máquinas</h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {machines.length} máquina{machines.length !== 1 ? "s" : ""} registrada{machines.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700 bg-slate-800/50">
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                                Hostname
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                                Sistema
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                                CPU
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                                RAM
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                                Software
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                                Status
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                                Última vez
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {machines.map((machine) => (
                            <tr
                                key={machine.id}
                                onClick={() => onSelect(machine)}
                                className="hover:bg-slate-700/50 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🖥️</span>
                                        <span className="font-medium text-white text-sm">{machine.hostname}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-300">{machine.os_name}</span>
                                    <br />
                                    <span className="text-xs text-slate-500">{machine.os_version}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-300 line-clamp-1 max-w-[200px]">{machine.cpu_name}</span>
                                    <br />
                                    <span className="text-xs text-slate-500">{machine.cpu_cores} núcleos</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-300">{formatRAM(machine.ram_total_mb)}</span>
                                    <div className="w-24 bg-slate-600 rounded-full h-1.5 mt-1">
                                        <div
                                            className="bg-blue-500 h-1.5 rounded-full"
                                            style={{
                                                width: `${Math.min(100, (machine.ram_used_mb / machine.ram_total_mb) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-300">{machine.software_count}</span>
                                    <span className="text-xs text-slate-500 ml-1">apps</span>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge lastSeen={machine.last_seen} />
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-400">{timeAgo(machine.last_seen)}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}