import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Package, Shield, Ban } from "lucide-react";
import toast from "react-hot-toast";

interface SoftwareEntry {
    name: string;
    version: string;
    publisher: string;
    install_date: string;
}

interface Props {
    machineId: string;
}

export default function SoftwareTab({ machineId }: Props) {
    const [software, setSoftware] = useState<SoftwareEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadSoftware();
    }, [machineId]);

    const loadSoftware = async () => {
        try {
            const result = await invoke<SoftwareEntry[]>("get_software", { machineId });
            setSoftware(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const blockSoftware = async (sw: SoftwareEntry) => {
        if (!confirm(`Bloquear ${sw.name}?`)) return;

        try {
            await invoke("block_software_for_machine", {
                machineId,
                softwareName: sw.name,
                reason: "Bloqueado pelo administrador",
            });
            toast.success(`${sw.name} bloqueado com sucesso!`);
        } catch (err) {
            toast.error(`Erro: ${err}`);
        }
    };

    const filtered = software.filter(sw =>
        sw.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="animate-pulse text-gray-500">A carregar...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Pesquisar software..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input flex-1"
                />
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Package className="w-4 h-4" />
                    <span>{filtered.length} aplicações</span>
                </div>
            </div>

            {/* Table */}
            <div className="glass rounded-xl overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Software</th>
                            <th>Versão</th>
                            <th>Publicador</th>
                            <th>Instalado Em</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">Nenhum software encontrado</td></tr>
                        ) : (
                            filtered.map((sw, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <Package className="w-4 h-4 text-matrix-green-500" />
                                            <span className="font-medium text-white">{sw.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-gray-400">{sw.version || 'N/A'}</td>
                                    <td className="text-gray-400">{sw.publisher || 'Desconhecido'}</td>
                                    <td className="text-gray-400">{sw.install_date || 'N/A'}</td>
                                    <td>
                                        <button
                                            onClick={() => blockSoftware(sw)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
                                        >
                                            <Ban className="w-4 h-4" />
                                            Bloquear
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}