import { useState } from "react";
import { FileDown, Plus, Search } from "lucide-react";
import { useMachines } from "../hooks/useMachines";
import { exportMachinesPDF } from "../utils/exportPDF";
import MachineCard from "../components/MachineCard";
import ViewModeToggle, { ViewMode } from "../components/ViewModeToggle";
import AdvancedFilter from "../components/AdvancedFilter";

export default function Machines() {
    const { machines, loading } = useMachines();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

    const filtered = machines.filter(m => {
        const matchesSearch = m.hostname.toLowerCase().includes(search.toLowerCase()) ||
            (m.custom_name || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true :
            statusFilter === 'online' ? m.is_online : !m.is_online;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <div className="animate-pulse text-emerald-500">A carregar máquinas...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gradient-apple">Máquinas</h1>
                    <p className="text-gray-500 mt-1">
                        {filtered.length} de {machines.length} equipamentos
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="btn-apple-primary ripple-container flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar
                    </button>

                    <button
                        onClick={() => exportMachinesPDF(filtered)}
                        className="btn-apple-secondary ripple-container flex items-center gap-2"
                    >
                        <FileDown className="w-4 h-4" />
                        Exportar PDF
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Pesquisar máquinas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 liquid-glass rounded-xl text-white placeholder-gray-600 border border-white/10 focus:border-emerald-500 transition-colors"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-3 liquid-glass rounded-xl text-white border border-white/10 focus:border-emerald-500 transition-colors"
                >
                    <option value="all">Todas</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                </select>

                {/* View Mode Toggle */}
                <ViewModeToggle mode={viewMode} onChange={setViewMode} />
            </div>

            {/* Content */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map(machine => (
                        <MachineCard key={machine.id} machine={machine} />
                    ))}
                </div>
            )}

            {viewMode === 'list' && (
                <div className="liquid-glass rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-black/30 border-b border-white/10">
                            <tr>
                                <th className="text-left p-4 text-sm font-semibold text-gray-400">Hostname</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-400">IP</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-400">OS</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-400">RAM</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(machine => (
                                <tr key={machine.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium text-white">{machine.custom_name || machine.hostname}</td>
                                    <td className="p-4 text-gray-400 font-mono text-sm">{machine.local_ip || 'N/A'}</td>
                                    <td className="p-4 text-gray-400">{machine.os_name}</td>
                                    <td className="p-4 text-gray-400">{(machine.ram_total_mb / 1024).toFixed(1)} GB</td>
                                    <td className="p-4">
                                        {machine.is_online ? (
                                            <span className="badge-apple-online">Online</span>
                                        ) : (
                                            <span className="badge-apple text-gray-500">Offline</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {viewMode === 'kanban' && (
                <div className="grid grid-cols-3 gap-6">
                    {/* Online Column */}
                    <div className="space-y-4">
                        <div className="liquid-glass rounded-xl p-4 border-l-4 border-emerald-500">
                            <h3 className="font-bold text-white flex items-center justify-between">
                                Online
                                <span className="badge-apple-online">{filtered.filter(m => m.is_online).length}</span>
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {filtered.filter(m => m.is_online).map(machine => (
                                <div key={machine.id} className="liquid-glass-hover rounded-xl p-4 cursor-pointer">
                                    <p className="font-medium text-white">{machine.custom_name || machine.hostname}</p>
                                    <p className="text-sm text-gray-500">{machine.os_name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Offline Column */}
                    <div className="space-y-4">
                        <div className="liquid-glass rounded-xl p-4 border-l-4 border-gray-600">
                            <h3 className="font-bold text-white flex items-center justify-between">
                                Offline
                                <span className="badge-apple text-gray-500">{filtered.filter(m => !m.is_online).length}</span>
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {filtered.filter(m => !m.is_online).map(machine => (
                                <div key={machine.id} className="liquid-glass-hover rounded-xl p-4 cursor-pointer opacity-60">
                                    <p className="font-medium text-white">{machine.custom_name || machine.hostname}</p>
                                    <p className="text-sm text-gray-500">{machine.os_name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Maintenance Column */}
                    <div className="space-y-4">
                        <div className="liquid-glass rounded-xl p-4 border-l-4 border-amber-500">
                            <h3 className="font-bold text-white flex items-center justify-between">
                                Manutenção
                                <span className="badge-apple text-amber-500">0</span>
                            </h3>
                        </div>
                        <p className="text-center text-gray-600 text-sm pt-8">Nenhuma máquina em manutenção</p>
                    </div>
                </div>
            )}
        </div>
    );
}