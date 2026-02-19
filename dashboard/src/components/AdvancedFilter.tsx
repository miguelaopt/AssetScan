// src/components/AdvancedFilter.tsx
import { useState, useEffect } from "react";
import { Popover } from "@headlessui/react";
import { Search, Filter, X } from "lucide-react";

export interface FilterOptions {
    searchTerm: string;
    status: 'all' | 'online' | 'offline';
    os: string;
}

interface Props {
    onFilterChange: (filters: FilterOptions) => void;
}

export function AdvancedFilter({ onFilterChange }: Props) {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: "",
        status: "all",
        os: "all",
    });

    // Notifica o componente pai quando os filtros mudam
    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, searchTerm: e.target.value });
    };

    const activeFiltersCount = (filters.status !== 'all' ? 1 : 0) + (filters.os !== 'all' ? 1 : 0);

    return (
        <div className="flex items-center gap-2">
            {/* Barra de Pesquisa */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Pesquisar máquinas..."
                    value={filters.searchTerm}
                    onChange={handleSearchChange}
                    className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 w-64 transition-colors"
                />
            </div>

            {/* Menu de Filtros (Headless UI Popover) */}
            <Popover className="relative">
                <Popover.Button className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-sm rounded-lg px-4 py-2 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filtros
                    {activeFiltersCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </Popover.Button>

                <Popover.Panel className="absolute right-0 z-10 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-semibold">Filtros Avançados</h3>
                        <Popover.Button className="text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </Popover.Button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Estado</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2 focus:border-blue-500 outline-none"
                            >
                                <option value="all">Todos</option>
                                <option value="online">Apenas Online</option>
                                <option value="offline">Apenas Offline</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Sistema Operativo</label>
                            <select
                                value={filters.os}
                                onChange={(e) => setFilters({ ...filters, os: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2 focus:border-blue-500 outline-none"
                            >
                                <option value="all">Todos</option>
                                <option value="Windows">Windows</option>
                                <option value="Linux">Linux</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setFilters({ searchTerm: filters.searchTerm, status: 'all', os: 'all' })}
                            className="w-full text-sm text-slate-400 hover:text-white mt-2"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </Popover.Panel>
            </Popover>
        </div>
    );
}