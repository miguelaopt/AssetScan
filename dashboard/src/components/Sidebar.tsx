import { Link, useLocation } from "react-router-dom";
import {
    Home, Monitor, Shield, FileText, Settings,
    AlertTriangle, BarChart3, Webhook, Scale
} from "lucide-react";

export default function Sidebar() {
    const location = useLocation();

    const links = [
        { to: "/", icon: Home, label: "Dashboard" },
        { to: "/machines", icon: Monitor, label: "Máquinas" },
        { to: "/vulnerabilities", icon: AlertTriangle, label: "Vulnerabilidades" },
        { to: "/policies", icon: Shield, label: "Políticas" },
        { to: "/compliance", icon: Scale, label: "Compliance" },
        { to: "/executive", icon: BarChart3, label: "Executivo" },
        { to: "/webhooks", icon: Webhook, label: "Webhooks" },
        { to: "/audit", icon: FileText, label: "Auditoria" },
        { to: "/settings", icon: Settings, label: "Configurações" },
    ];

    return (
        <aside className="w-72 bg-gradient-to-b from-[#0A0E1A] to-[#111827] border-r border-white/10 flex flex-col relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-cyber-500/50 to-transparent" />

            {/* Logo Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyber-500 to-deep-blue-500 rounded-xl flex items-center justify-center glow">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gradient font-display">AssetScan</h1>
                        <p className="text-xs text-gray-400">v3.0 Enterprise</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const isActive = location.pathname === link.to;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 relative overflow-hidden
                ${isActive
                                    ? 'bg-gradient-to-r from-cyber-500/15 to-deep-blue-500/5 text-cyber-500 shadow-lg shadow-cyber-500/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
              `}
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyber-500 to-deep-blue-500 rounded-r" />
                            )}

                            <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span>{link.label}</span>

                            {/* Hover Glow */}
                            {!isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-cyber-500/0 via-cyber-500/5 to-cyber-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Status Footer */}
            <div className="p-4 border-t border-white/5">
                <div className="glass rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Sistema</span>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-emerald-500">Operacional</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        <p className="font-mono">localhost:7474</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}