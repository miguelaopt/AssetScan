import { Search, Bell, User, LogOut, Command } from "lucide-react";
import { useState } from "react";

export default function TopBar() {
    const [searchFocused, setSearchFocused] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="h-24 relative flex items-center justify-between px-8 z-40">
            {/* Background */}
            <div className="absolute inset-0 liquid-glass border-b border-white/5" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-between w-full">
                {/* Left: Title */}
                <div className="spring-in">
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        {getPageTitle()}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Monitorização em tempo real • {new Date().toLocaleDateString('pt-PT')}
                    </p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* Search com estilo Apple */}
                    <div
                        className={`
              relative flex items-center gap-3 px-5 py-3 rounded-2xl
              transition-all duration-500 ease-out
              ${searchFocused
                                ? 'w-96 liquid-glass-active'
                                : 'w-72 liquid-glass'
                            }
            `}
                    >
                        <Search className={`w-4 h-4 transition-colors ${searchFocused ? 'text-emerald-400' : 'text-gray-600'}`} />
                        <input
                            type="text"
                            placeholder="Pesquisar máquinas..."
                            className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder-gray-600 font-medium"
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                        <div className="flex items-center gap-1 text-xs text-gray-600 font-semibold">
                            <Command className="w-3 h-3" />
                            <span>K</span>
                        </div>
                    </div>

                    {/* Notifications */}
                    <button
                        onClick={() => alert('📬 Tens 3 notificações novas!')}
                        className="relative p-3 rounded-xl liquid-glass-hover ripple-container"
                    >
                        <Bell className="w-5 h-5 text-gray-400" />
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-black" />
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl liquid-glass-hover ripple-container"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-[15px] font-semibold text-white">Admin</p>
                                <p className="text-xs text-gray-500 font-medium">Administrador</p>
                            </div>
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 top-full mt-3 w-56 liquid-glass rounded-2xl p-2 spring-in border border-white/10 shadow-2xl">
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-[15px] text-gray-300 hover:text-white transition-colors">
                                    <User className="w-4 h-4" />
                                    <span>Perfil</span>
                                </button>
                                <div className="my-2 h-px bg-white/5" />
                                <button
                                    onClick={() => confirm('Logout?') && (window.location.href = '/')}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-[15px] text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sair</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

function getPageTitle() {
    const titles: Record<string, string> = {
        '/': 'Dashboard',
        '/machines': 'Máquinas',
        '/screen-time': 'Screen Time',
        '/vulnerabilities': 'Vulnerabilidades',
        '/policies': 'Políticas de Segurança',
        '/compliance': 'Compliance',
        '/webhooks': 'Webhooks',
        '/audit': 'Auditoria',
        '/settings': 'Configurações',
    };
    return titles[window.location.pathname] || 'AssetScan';
}