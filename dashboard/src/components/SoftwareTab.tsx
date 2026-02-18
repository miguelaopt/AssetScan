import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

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
        invoke<SoftwareEntry[]>("get_software", { machineId })
            .then((data) => {
                setSoftware(data);
                setLoading(false);
            })
            .catch(console.error);
    }, [machineId]);

    const filtered = software.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.publisher.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                Carregando software...
            </div>
        );
    }

    return (
        <div>
            {/* Barra de pesquisa */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder={`Pesquisar entre ${software.length} softwares...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5
            text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* Tabela de software */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                                Nome
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                                Versão
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                                Fabricante
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                                Instalado em
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filtered.map((sw, i) => (
                            <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                                <td className="px-4 py-2.5">
                                    <span className="text-sm text-white">{sw.name}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className="text-sm text-slate-400 font-mono">{sw.version || "—"}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className="text-sm text-slate-400">{sw.publisher || "—"}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className="text-sm text-slate-500">{sw.install_date || "—"}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        Nenhum software encontrado para "{search}"
                    </div>
                )}
            </div>
        </div>
    );
}