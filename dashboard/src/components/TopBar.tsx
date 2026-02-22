import { Search, Bell, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function TopBar() {
    const [searchFocused, setSearchFocused] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const notificationsList = [
        { id: 1, type: "success", title: "Máquina Online", text: "Servidor DB-01 reconectado.", time: "Há 2 min" },
        { id: 2, type: "warning", title: "CPU Crítico", text: "Worker-Node excedeu 95% de CPU.", time: "Há 15 min" }
    ];

    return (
        <header className="h-20 bg-[#0a0a0a]/60 border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{getPageTitle()}</h2>
                <p className="text-sm text-emerald-400/80 font-medium">Monitorização em tempo real</p>
            </div>

            <div className="flex items-center gap-5">
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all duration-300 backdrop-blur-md ${searchFocused ? 'w-96 bg-black/40 border-emerald-500 ring-2 ring-emerald-500/20' : 'w-64 bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <Search className={`w-4 h-4 ${searchFocused ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <input type="text" placeholder="Pesquisar assets..." className="flex-1 bg-transparent outline-none text-sm text-white placeholder-slate-400" onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
                </div>

                <div className="relative z-50">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative cursor-pointer">
                        <Bell className="w-5 h-5 text-slate-300" />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-black rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-[#111318]/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-4">
                            <h4 className="text-white font-semibold mb-3 px-1">Notificações</h4>
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                {notificationsList.map(notif => (
                                    <div key={notif.id} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                        <p className={`text-sm font-semibold ${notif.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>{notif.title}</p>
                                        <p className="text-xs text-slate-300 mt-1">{notif.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative z-50">
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                            <User className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-sm font-medium text-white">Admin</p>
                    </button>
                    {showUserMenu && (
                        <div className="absolute right-0 mt-3 w-48 bg-[#111318]/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-2">
                            <Link to="/profile" onClick={() => setShowUserMenu(false)} className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-xl transition-colors">Meu Perfil</Link>
                            <Link to="/settings" onClick={() => setShowUserMenu(false)} className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-xl transition-colors">Configurações</Link>
                            <div className="h-px w-full bg-white/10 my-1"></div>
                            <button className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-white/10 rounded-xl transition-colors">Terminar Sessão</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function getPageTitle() {
    const path = window.location.pathname;
    const titles: Record<string, string> = { '/': 'Dashboard', '/machines': 'Máquinas', '/compliance': 'Compliance', '/webhooks': 'Webhooks', '/settings': 'Configurações', '/audit': 'Auditoria', '/policies': 'Políticas', '/vulnerabilities': 'Vulnerabilidades', '/screen-time': 'Screen Time' };
    return titles[path] || 'AssetScan';
}