import { Link, useLocation } from "react-router-dom";
import { Home, Monitor, Shield, FileText, Settings } from "lucide-react";

export default function Sidebar() {
    const location = useLocation();

    const links = [
        { to: "/", icon: Home, label: "Dashboard" },
        { to: "/machines", icon: Monitor, label: "Máquinas" },
        { to: "/policies", icon: Shield, label: "Políticas" },
        { to: "/audit", icon: FileText, label: "Auditoria" },
        { to: "/settings", icon: Settings, label: "Configurações" },
    ];

    return (
        <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
            <div className="p-5 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg">AssetScan</h1>
                        <p className="text-xs text-slate-400">v2.0.0</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-1">
                {links.map((link) => {
                    const isActive = location.pathname === link.to;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                transition-colors
                ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                                }
              `}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-700">
                <div className="text-xs text-slate-500">
                    <p className="mb-1">Servidor HTTP</p>
                    <p className="font-mono text-slate-400">localhost:7474</p>
                </div>
            </div>
        </aside>
    );
}