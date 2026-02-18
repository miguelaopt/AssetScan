import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Monitor, Cpu, HardDrive } from "lucide-react";
import { useMachines } from "../hooks/useMachines";

export default function Machines() {
    const { machines, loading } = useMachines();

    useEffect(() => {
        document.title = "Máquinas - AssetScan";
    }, []);

    if (loading) {
        return <div className="text-slate-400">A carregar...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Máquinas</h1>
                    <p className="text-slate-400">{machines.length} máquina(s) registada(s)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machines.map((machine) => (
                    <Link
                        key={machine.id}
                        to={`/machines/${machine.machine_id}`}
                        className="block"
                    >
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-500 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-700 rounded-lg">
                                        <Monitor className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">
                                            {machine.custom_name || machine.hostname}
                                        </h3>
                                        <p className="text-sm text-slate-400">{machine.os_name}</p>
                                    </div>
                                </div>
                                <span
                                    className={`w-2 h-2 rounded-full ${machine.is_online ? "bg-green-500" : "bg-slate-500"
                                        }`}
                                />
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Cpu className="w-4 h-4" />
                                    <span>{machine.cpu_cores} núcleos</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <HardDrive className="w-4 h-4" />
                                    <span>{(machine.ram_total_mb / 1024).toFixed(0)} GB RAM</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                                <span>{machine.software_count} apps</span>
                                <span>{machine.process_count} processos</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}