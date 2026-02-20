import { Sun, Moon, Search, Bell, User } from "lucide-react";
import { useState } from "react";

interface Props {
    theme: string;
    onToggleTheme: () => void;
}

export default function TopBar({ theme, onToggleTheme }: Props) {
    const [searchFocused, setSearchFocused] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="h-20 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-xl">
            <div>
                <h2 className="text-2xl font-bold text-white">{getPageTitle()}</h2>
                <p className="text-sm text-slate-400">Monitorização em tempo real</p>
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all duration-300 ${searchFocused ? 'w-96 bg-slate-800 border-blue-500 ring-2 ring-blue-500/20' : 'w-64 bg-slate-800 border-slate-700'}`}>
                    <Search className={`w-4 h-4 ${searchFocused ? 'text-blue-500' : 'text-slate-500'}`} />
                    <input type="text" placeholder="Pesquisar..." className="flex-1 bg-transparent outline-none text-sm text-white" onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
                </div>

                {/* Theme Toggle */}
                <button onClick={onToggleTheme} className="p-2.5 rounded-lg hover:bg-slate-700 transition-colors z-50 relative cursor-pointer">
                    {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
                </button>

                {/* Notifications */}
                <div className="relative z-50">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 rounded-lg hover:bg-slate-700 transition-colors relative cursor-pointer">
                        <Bell className="w-5 h-5 text-slate-400" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-4">
                            <h4 className="text-white font-bold mb-2">Notificações</h4>
                            <p className="text-sm text-slate-400">Sem novos alertas.</p>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative z-50">
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-white">Admin</p>
                        </div>
                    </button>
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2">
                            <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 rounded-lg">Perfil</button>
                            <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-lg">Terminar Sessão</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function getPageTitle() {
    const path = window.location.pathname;
    const titles: Record<string, string> = {
        '/': 'Dashboard', '/machines': 'Máquinas', '/vulnerabilities': 'Vulnerabilidades',
        '/policies': 'Políticas', '/compliance': 'Compliance', '/executive': 'Dashboard Executivo',
        '/webhooks': 'Webhooks', '/audit': 'Auditoria', '/settings': 'Configurações',
    };
    return titles[path] || 'AssetScan';
}