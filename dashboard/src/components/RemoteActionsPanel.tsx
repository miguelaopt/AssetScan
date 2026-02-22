import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Power, RefreshCw, Lock, Terminal, Ban } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
    machineId: string;
    machineName: string;
}

export default function RemoteActionsPanel({ machineId, machineName }: Props) {
    const [loading, setLoading] = useState(false);

    const executeAction = async (action: string, displayName: string) => {
        if (!confirm(`${displayName} em ${machineName}?`)) return;

        try {
            setLoading(true);
            await invoke("execute_remote_action", { machineId, action });
            toast.success(`${displayName} executado com sucesso!`);
        } catch (err) {
            toast.error(`Erro: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="liquid-glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                Acções Remotas
            </h3>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => executeAction("restart", "Reiniciar")}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 font-medium transition-colors disabled:opacity-50"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reiniciar
                </button>

                <button
                    onClick={() => executeAction("shutdown", "Desligar")}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-medium transition-colors disabled:opacity-50"
                >
                    <Power className="w-4 h-4" />
                    Desligar
                </button>

                <button
                    onClick={() => executeAction("lock", "Bloquear ecrã")}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 font-medium transition-colors disabled:opacity-50"
                >
                    <Lock className="w-4 h-4" />
                    Bloquear
                </button>

                <button
                    onClick={() => executeAction("force_update", "Forçar actualização")}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium transition-colors disabled:opacity-50"
                >
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                </button>
            </div>
        </div>
    );
}