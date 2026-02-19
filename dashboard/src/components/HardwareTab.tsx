import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

// Interface para garantir que o TypeScript conhece o machine_id
interface Machine {
    id: string;
    machine_id: string;
    cpu_name: string;
    cpu_cores: number;
    ram_total_mb: number;
    ram_used_mb: number;
    os_name: string;
    os_version: string;
    uptime_hours: number;
}

interface DiskInfo {
    name: string;
    mount_point: string;
    total_gb: number;
    free_gb: number;
    fs_type: string;
}

interface Props {
    machine: Machine;
}

export default function HardwareTab({ machine }: Props) {
    const [disks, setDisks] = useState<DiskInfo[]>([]);

    // Proteção contra divisão por zero
    const ramTotal = machine.ram_total_mb || 1;
    const ramUsedPercent = Math.round((machine.ram_used_mb / ramTotal) * 100);

    useEffect(() => {
        if (machine?.machine_id) {
            invoke<DiskInfo[]>("get_disks", { machineId: machine.machine_id })
                .then(setDisks)
                .catch(console.error);
        }
    }, [machine.machine_id]);

    return (
        <div className="space-y-5">
            {/* CPU */}
            <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Processador</h3>
                <p className="text-white font-medium text-base mb-1">{machine.cpu_name || "Desconhecido"}</p>
                <p className="text-sm text-slate-400">{machine.cpu_cores} núcleos físicos</p>
            </section>

            {/* RAM */}
            <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Memória RAM</h3>
                <div className="flex items-end justify-between mb-2">
                    <p className="text-white font-medium">
                        {(machine.ram_used_mb / 1024).toFixed(1)} GB usados
                    </p>
                    <p className="text-slate-400 text-sm">
                        de {(machine.ram_total_mb / 1024).toFixed(1)} GB total
                    </p>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all ${ramUsedPercent > 85 ? "bg-red-500" :
                            ramUsedPercent > 65 ? "bg-yellow-500" : "bg-blue-500"
                            }`}
                        style={{ width: `${ramUsedPercent}%` }}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1">{ramUsedPercent}% utilizado</p>
            </section>

            {/* Discos */}
            <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Armazenamento</h3>
                <div className="space-y-4">
                    {/* AQUI ESTÁ A CORREÇÃO: Adicionado o fallback ": <p>..." */}
                    {disks.length > 0 ? disks.map((disk) => {
                        const totalGb = disk.total_gb || 1;
                        const usedGb = totalGb - disk.free_gb;
                        const usedPercent = Math.round((usedGb / totalGb) * 100);
                        return (
                            <div key={disk.mount_point}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span>💿</span>
                                        <span className="text-white text-sm font-medium">{disk.mount_point}</span>
                                        <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">
                                            {disk.fs_type}
                                        </span>
                                    </div>
                                    <span className="text-sm text-slate-400">
                                        {usedGb.toFixed(1)} / {disk.total_gb.toFixed(1)} GB
                                    </span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${usedPercent > 90 ? "bg-red-500" :
                                            usedPercent > 75 ? "bg-yellow-500" : "bg-green-500"
                                            }`}
                                        style={{ width: `${usedPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {disk.free_gb.toFixed(1)} GB livres ({100 - usedPercent}%)
                                </p>
                            </div>
                        );
                    }) : (
                        <p className="text-slate-500 text-sm">Nenhum disco reportado.</p>
                    )}
                </div>
            </section>

            {/* SO */}
            <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Sistema Operacional</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: "Sistema", value: machine.os_name },
                        { label: "Versão", value: machine.os_version },
                        { label: "Uptime", value: `${machine.uptime_hours}h` },
                    ].map((item) => (
                        <div key={item.label} className="bg-slate-700/50 rounded-lg p-3">
                            <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                            <p className="text-sm text-white font-medium">{item.value}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}