import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Package, Ban, Search, Filter } from "lucide-react";
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
    const [search, setSearch] = useState(""); // ✅ NOVO

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
        if (!confirm(`Bloquear ${sw.name} nesta máquina?`)) return;

        try {
            await invoke("block_software", {
                machineId,
                softwareName: sw.name,
                reason: "Bloqueado pelo administrador via dashboard",
            });
            toast.success(`${sw.name} será bloqueado no próximo ciclo!`);
        } catch (err) {
            toast.error(`Erro: ${err}`);
        }
    };

    // ✅ FILTRO DE PESQUISA
    const filtered = software.filter(sw =>
        sw.name.toLowerCase().includes(search.toLowerCase()) ||
        (sw.publisher || '').toLowerCase().includes(search.toLowerCase()) ||
        (sw.version || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-4 mt-6">
            {/* ✅ BARRA DE PESQUISA */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, versão ou publicador..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 liquid-glass rounded-xl text-white placeholder-gray-600 border border-white/10 focus:border-emerald-500 transition-colors"
                    />
                </div>
                <button className="btn-apple-secondary ripple-container flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                    <Package className="w-4 h-4" />
                    <span>{filtered.length} de {software.length} aplicações</span>
                </div>
            </div>

            {/* Tabela */}
            <div className="liquid-glass rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-black/30 border-b border-white/10">
                        <tr>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Software</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Versão</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Publicador</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Instalado</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12">
                                    <Package className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-500">
                                        {search ? 'Nenhum software encontrado' : 'Nenhum software instalado'}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((sw, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Package className="w-4 h-4 text-emerald-500" />
                                            <span className="font-medium text-white">{sw.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400 font-mono text-sm">
                                        {sw.version || 'N/A'}
                                    </td>
                                    <td className="p-4 text-gray-400">
                                        {sw.publisher || 'Desconhecido'}
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {sw.install_date || 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => blockSoftware(sw)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors text-sm font-medium"
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