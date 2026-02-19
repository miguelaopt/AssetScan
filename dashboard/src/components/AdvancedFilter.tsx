import { useState } from "react";
import { Filter, X } from "lucide-react";

export interface FilterOptions {
    searchTerm: string;
    status: 'all' | 'online' | 'offline';
    os: string;
}

interface Props {
    onFilterChange: (filters: FilterOptions) => void;
}

export function AdvancedFilter({ onFilterChange }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        status: 'all',
        os: 'all',
    });

    const handleChange = (key: keyof FilterOptions, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const activeFiltersCount = [
        filters.searchTerm,
        filters.status !== 'all',
        filters.os !== 'all',
    ].filter(Boolean).length;

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 hover:border-cyber-500 bg-gray-900/50 hover:bg-gray-900 transition-all"
            >
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Filtros</span>
                {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-cyber-500 text-white text-xs font-bold">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-full mt-2 w-80 glass border border-white/10 rounded-xl p-4 z-50 animate-slide-down shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white">Filtros Avançados</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Search */}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2">
                                    Pesquisar
                                </label>
                                <input
                                    type="text"
                                    value={filters.searchTerm}
                                    onChange={(e) => handleChange('searchTerm', e.target.value)}
                                    placeholder="Nome da máquina..."
                                    className="input text-sm"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="input text-sm"
                                >
                                    <option value="all">Todas</option>
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>

                            {/* OS */}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2">
                                    Sistema Operacional
                                </label>
                                <select
                                    value={filters.os}
                                    onChange={(e) => handleChange('os', e.target.value)}
                                    className="input text-sm"
                                >
                                    <option value="all">Todos</option>
                                    <option value="windows">Windows</option>
                                    <option value="linux">Linux</option>
                                    <option value="macos">macOS</option>
                                </select>
                            </div>

                            {/* Clear Button */}
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={() => {
                                        const cleared: FilterOptions = { searchTerm: '', status: 'all', os: 'all' };
                                        setFilters(cleared);
                                        onFilterChange(cleared);
                                    }}
                                    className="w-full btn-ghost text-sm"
                                >
                                    Limpar Filtros
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}