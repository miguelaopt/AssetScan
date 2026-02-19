import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Monitor, Cpu, HardDrive } from "lucide-react";
import { useMachines, Machine } from "../hooks/useMachines";
import { ViewModeToggle, ViewMode } from "../components/ViewModeToggle";
import { AdvancedFilter, FilterOptions } from "../components/AdvancedFilter";

export default function Machines() {
    const { machines, loading } = useMachines();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [filters, setFilters] = useState<FilterOptions>({ searchTerm: '', status: 'all', os: 'all' });

    useEffect(() => {
        document.title = "Máquinas - AssetScan";
    }, []);

    // Aplica os filtros
    const filteredMachines = useMemo(() => {
        return machines.filter(m => {
            const nameToSearch = (m.custom_name || m.hostname).toLowerCase();
            const matchesSearch = nameToSearch.includes(filters.searchTerm.toLowerCase());
            const matchesStatus = filters.status === 'all' || (filters.status === 'online' ? m.is_online : !m.is_online);
            const matchesOs = filters.os === 'all' || m.os_name.toLowerCase().includes(filters.os.toLowerCase());

            return matchesSearch && matchesStatus && matchesOs;
        });
    }, [machines, filters]);

    if (loading) return <div className="text-slate-400">A carregar...</div>;

    // Repara que agora aceitamos "items: Machine[]" como argumento
    const renderGrid = (items: Machine[]) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((machine) => (
                <Link key={machine.id} to={`/machines/${machine.machine_id}`} className="block">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-500 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-700 rounded-lg">
                                    <Monitor className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{machine.custom_name || machine.hostname}</h3>
                                    <p className="text-sm text-slate-400">{machine.os_name}</p>
                                </div>
                            </div>
                            <span className={`w-2 h-2 rounded-full ${machine.is_online ? "bg-green-500" : "bg-slate-500"}`} />
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Cpu className="w-4 h-4" /><span>{machine.cpu_cores} núcleos</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <HardDrive className="w-4 h-4" /><span>{(machine.ram_total_mb / 1024).toFixed(0)} GB RAM</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );

    const renderList = (items: Machine[]) => (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-sm">
                    <tr>
                        <th className="p-4 font-semibold">Máquina</th>
                        <th className="p-4 font-semibold">Estado</th>
                        <th className="p-4 font-semibold">OS</th>
                        <th className="p-4 font-semibold text-right">CPU Cores</th>
                        <th className="p-4 font-semibold text-right">RAM (GB)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {items.map(m => (
                        <tr key={m.id} className="hover:bg-slate-700/50 transition-colors">
                            <td className="p-4">
                                <Link to={`/machines/${m.machine_id}`} className="font-medium text-white hover:text-blue-400">
                                    {m.custom_name || m.hostname}
                                </Link>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${m.is_online ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400'}`}>
                                    {m.is_online ? 'Online' : 'Offline'}
                                </span>
                            </td>
                            <td className="p-4 text-slate-300 text-sm">{m.os_name}</td>
                            <td className="p-4 text-slate-300 text-sm text-right">{m.cpu_cores}</td>
                            <td className="p-4 text-slate-300 text-sm text-right">{(m.ram_total_mb / 1024).toFixed(1)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderKanban = (items: Machine[]) => {
        const online = items.filter(m => m.is_online);
        const offline = items.filter(m => !m.is_online);
        const warning = items.filter(m => m.uptime_hours > 720);

        const Column = ({ title, colItems, borderColor }: { title: string, colItems: Machine[], borderColor: string }) => (
            <div className={`bg-slate-900/50 rounded-xl p-4 border-t-4 ${borderColor}`}>
                <h3 className="text-white font-semibold mb-4 flex items-center justify-between">
                    {title} <span className="bg-slate-800 px-2 py-0.5 rounded text-sm text-slate-400">{colItems.length}</span>
                </h3>
                <div className="space-y-3">
                    {colItems.map(m => (
                        <Link key={m.id} to={`/machines/${m.machine_id}`} className="block bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors">
                            <p className="font-medium text-white">{m.custom_name || m.hostname}</p>
                            <p className="text-xs text-slate-400 mt-1">{m.os_name}</p>
                        </Link>
                    ))}
                </div>
            </div>
        );

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <Column title="✅ Online" colItems={online} borderColor="border-green-500" />
                <Column title="⚠️ Warning" colItems={warning} borderColor="border-yellow-500" />
                <Column title="🔴 Offline" colItems={offline} borderColor="border-red-500" />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Máquinas</h1>
                    <p className="text-slate-400">{filteredMachines.length} máquina(s) encontrada(s)</p>
                </div>

                <div className="flex items-center gap-4">
                    <AdvancedFilter onFilterChange={setFilters} />
                    <ViewModeToggle value={viewMode} onChange={setViewMode} />
                </div>
            </div>

            {/* Passamos as filteredMachines para as funções de renderização */}
            {viewMode === 'grid' && renderGrid(filteredMachines)}
            {viewMode === 'list' && renderList(filteredMachines)}
            {viewMode === 'kanban' && renderKanban(filteredMachines)}
        </div>
    );
}