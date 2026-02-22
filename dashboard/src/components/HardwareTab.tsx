import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Cpu, HardDrive, MemoryStick, Monitor, Server, Wifi } from "lucide-react";
import { Machine } from "../hooks/useMachines";

interface DiskInfo {
    name: string;
    mount_point: string;
    total_gb: number;
    free_gb: number;
    fs_type: string;
    health_status?: string; // Novo!
}

interface HardwareDetails {
    serial_number: string;
    motherboard_manufacturer: string;
    motherboard_model: string;
    bios_version: string;
    gpu_name: string;
    gpu_vram_mb: number;
    total_ram_slots: number;
    used_ram_slots: number;
    ram_type: string;
    network_adapters: NetworkAdapter[];
}

interface NetworkAdapter {
    name: string;
    mac_address: string;
    speed_mbps: number;
    status: string;
}

interface Props {
    machine: Machine;
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-white text-sm font-medium text-right">
            {value || <span className="text-slate-600 italic">Não reportado</span>}
        </span>
    </div>
);

export default function HardwareTab({ machine }: Props) {
    const [disks, setDisks] = useState<DiskInfo[]>([]);
    const [hardware, setHardware] = useState<HardwareDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [machine]);

    const loadData = async () => {
        try {
            setLoading(true);
            const machineId = machine.machine_id || machine.id;

            // Carrega discos
            const disksData = await invoke<DiskInfo[]>("get_disks", { machineId });
            setDisks(disksData);

            // Carrega hardware details
            const hardwareData = await invoke<HardwareDetails>("get_hardware_details", { machineId });
            setHardware(hardwareData);
        } catch (err) {
            console.error("Erro ao carregar hardware:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-6">
            {/* GRID 1: Identificação & SO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-emerald-400" />
                        Identificação do Equipamento
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <InfoRow label="Hostname" value={machine.hostname} />
                        <InfoRow
                            label="Serial Number"
                            value={hardware?.serial_number ? (
                                <span className="font-mono text-emerald-400">{hardware.serial_number}</span>
                            ) : undefined}
                        />
                        <InfoRow
                            label="Motherboard"
                            value={hardware ? `${hardware.motherboard_manufacturer} ${hardware.motherboard_model}` : undefined}
                        />
                        <InfoRow
                            label="BIOS Version"
                            value={hardware?.bios_version}
                        />
                    </div>
                </div>

                <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-emerald-400" />
                        Sistema Operativo
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <InfoRow label="OS" value={`${machine.os_name} ${machine.os_version}`} />
                        <InfoRow label="Arquitetura" value="x64" />
                        <InfoRow label="Uptime" value={`${machine.uptime_hours}h`} />
                        <InfoRow
                            label="Último Boot"
                            value={new Date(Date.now() - machine.uptime_hours * 3600000).toLocaleString('pt-PT')}
                        />
                    </div>
                </div>
            </div>

            {/* GRID 2: CPU, RAM & GPU */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-emerald-400" />
                        Processador
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <InfoRow label="Modelo" value={<span className="text-xs">{machine.cpu_name}</span>} />
                        <InfoRow label="Cores" value={machine.cpu_cores} />
                        <InfoRow label="Threads" value={machine.cpu_threads || machine.cpu_cores * 2} />
                        <InfoRow label="Arquitetura" value="x64" />
                    </div>
                </div>

                <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <MemoryStick className="w-5 h-5 text-emerald-400" />
                        Memória RAM
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <InfoRow label="Total" value={`${(machine.ram_total_mb / 1024).toFixed(1)} GB`} />
                        <InfoRow label="Em Uso" value={`${(machine.ram_used_mb / 1024).toFixed(1)} GB`} />
                        <InfoRow label="Tipo" value={hardware?.ram_type || "DDR4"} />
                        <InfoRow
                            label="Slots"
                            value={hardware ? `${hardware.used_ram_slots}/${hardware.total_ram_slots}` : undefined}
                        />
                    </div>
                </div>

                <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-emerald-400" />
                        Placa Gráfica
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <InfoRow
                            label="GPU"
                            value={hardware?.gpu_name ? (
                                <span className="text-xs">{hardware.gpu_name}</span>
                            ) : machine.gpu_name}
                        />
                        <InfoRow
                            label="VRAM"
                            value={hardware?.gpu_vram_mb ? `${hardware.gpu_vram_mb} MB` : "Partilhada"}
                        />
                        <InfoRow label="Driver" value="Atualizado" />
                    </div>
                </div>
            </div>

            {/* ARMAZENAMENTO */}
            <div className="liquid-glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <HardDrive className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-bold text-white">Armazenamento</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {disks.map((disk, idx) => {
                        const usedGb = disk.total_gb - disk.free_gb;
                        const usedPercent = (usedGb / disk.total_gb) * 100;
                        const isHealthy = disk.health_status === "healthy" || !disk.health_status;

                        return (
                            <div
                                key={idx}
                                className="liquid-glass-hover rounded-xl p-5 border border-white/10"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold font-mono text-white bg-white/10 px-3 py-1 rounded-lg">
                                        {disk.mount_point}
                                    </span>
                                    <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded">
                                        {disk.fs_type}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Total</span>
                                        <span className="text-white">{disk.total_gb.toFixed(1)} GB</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Livre</span>
                                        <span className="text-emerald-400">{disk.free_gb.toFixed(1)} GB</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">S.M.A.R.T</span>
                                        <span className={isHealthy ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                                            {isHealthy ? "Saudável" : "Atenção"}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full bg-black/50 rounded-full h-2.5 border border-white/5">
                                    <div
                                        className={`h-full rounded-full transition-all ${usedPercent > 90 ? "bg-red-500" : "bg-emerald-500"
                                            }`}
                                        style={{ width: `${usedPercent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ADAPTADORES DE REDE */}
            {hardware?.network_adapters && hardware.network_adapters.length > 0 && (
                <div className="liquid-glass rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Wifi className="w-6 h-6 text-emerald-400" />
                        <h3 className="text-xl font-bold text-white">Adaptadores de Rede</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hardware.network_adapters.map((adapter, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium text-white">{adapter.name}</span>
                                    <span
                                        className={`badge-apple ${adapter.status === "connected" ? "text-emerald-400" : "text-gray-500"
                                            }`}
                                    >
                                        {adapter.status}
                                    </span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">MAC</span>
                                        <span className="text-white font-mono">{adapter.mac_address}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Velocidade</span>
                                        <span className="text-emerald-400">{adapter.speed_mbps} Mbps</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}