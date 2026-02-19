import { Sun, Moon, Search, Bell, User } from "lucide-react";
import { useState } from "react";

interface Props {
    theme: "dark" | "light";
    onToggleTheme: () => void;
}

export default function TopBar({ theme, onToggleTheme }: Props) {
    const [searchFocused, setSearchFocused] = useState(false);

    return (
        <header className="h-20 glass border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-xl">
            {/* Left: Title */}
            <div>
                <h2 className="text-2xl font-bold text-white font-display">
                    {getPageTitle()}
                </h2>
                <p className="text-sm text-gray-400">Monitorização em tempo real</p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Global Search */}
                <div
                    className={`
            flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all duration-300
            ${searchFocused
                            ? 'w-96 bg-gray-900/90 border-cyber-500 ring-2 ring-cyber-500/20'
                            : 'w-64 bg-gray-900/50 border-gray-700'
                        }
          `}
                >
                    <Search className={`w-4 h-4 ${searchFocused ? 'text-cyber-500' : 'text-gray-500'}`} />
                    <input
                        type="text"
                        placeholder="Pesquisar máquinas, software..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-800 rounded">
                        <span>⌘</span>K
                    </kbd>
                </div>

                {/* Notifications */}
                <button className="relative p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                    <Bell className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={onToggleTheme}
                    className="p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                    {theme === "dark" ? (
                        <Sun className="w-5 h-5 text-gray-400 group-hover:text-amber-400" />
                    ) : (
                        <Moon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                    )}
                </button>

                {/* User Menu */}
                <button className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-500 to-deep-blue-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-white">Admin</p>
                        <p className="text-xs text-gray-400">Administrador</p>
                    </div>
                </button>
            </div>
        </header>
    );
}

function getPageTitle() {
    const path = window.location.pathname;
    const titles: Record<string, string> = {
        '/': 'Dashboard',
        '/machines': 'Máquinas',
        '/vulnerabilities': 'Vulnerabilidades',
        '/policies': 'Políticas',
        '/compliance': 'Compliance',
        '/executive': 'Dashboard Executivo',
        '/webhooks': 'Webhooks',
        '/audit': 'Auditoria',
        '/settings': 'Configurações',
    };
    return titles[path] || 'AssetScan';
}