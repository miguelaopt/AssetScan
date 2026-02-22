import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Cpu, HardDrive, MemoryStick, Server } from "lucide-react";

interface DiskInfo {
    name: string;
    mount_point: string;
    total_gb: number;
    free_gb: number;
    fs_type: string;
}

interface Props {
    machineId: string;
}

export default function HardwareTab({ machineId }: Props) {
    const [disks, setDisks] = useState<DiskInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDisks();
    }, [machineId]);

    const loadDisks = async () => {
        try {
            const result = await invoke<DiskInfo[]>("get_disks", { machineId });
            setDisks(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse text-gray-500">A carregar...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-lg bg-matrix-green-500/10">
                            <Cpu className="w-6 h-6 text-matrix-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Processador</p>
                            <p className="text-lg font-semibold text-white">Intel Core i7</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Cores:</span>
                        <span className="text-white font-medium">8 físicos / 16 lógicos</span>
                    </div>
                </div>

                <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-lg bg-matrix-green-500/10">
                            <MemoryStick className="w-6 h-6 text-matrix-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Memória RAM</p>
                            <p className="text-lg font-semibold text-white">32 GB</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Usada:</span>
                        <span className="text-white font-medium">16 GB (50%)</span>
                    </div>
                </div>
            </div>

            {/* Disks */}
            <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <HardDrive className="w-5 h-5 text-matrix-green-500" />
                    <h3 className="text-lg font-semibold text-white">Discos</h3>
                </div>

                <div className="space-y-4">
                    {disks.map((disk, idx) => {
                        const usedGb = disk.total_gb - disk.free_gb;
                        const usedPercent = (usedGb / disk.total_gb) * 100;

                        return (
                            <div key={idx} className="bg-black/30 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <Server className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-white">{disk.name}</span>
                                        <span className="text-xs text-gray-500 font-mono">{disk.mount_point}</span>
                                    </div>
                                    <span className="text-sm text-gray-400">{disk.fs_type}</span>
                                </div>

                                <div className="flex items-center justify-between mb-2 text-sm">
                                    <span className="text-gray-500">
                                        {usedGb.toFixed(1)} GB / {disk.total_gb.toFixed(1)} GB
                                    </span>
                                    <span className={`font-semibold ${usedPercent > 90 ? 'text-red-400' : 'text-matrix-green-400'}`}>
                                        {usedPercent.toFixed(1)}% usado
                                    </span>
                                </div>

                                <div className="w-full bg-gray-900 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${usedPercent > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-matrix-green-500 to-cyber-green-500'
                                            }`}
                                        style={{ width: `${usedPercent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}