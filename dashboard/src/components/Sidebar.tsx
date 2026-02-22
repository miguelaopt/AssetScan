import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, MonitorSmartphone, Clock, ShieldAlert,
    Lock, Scale, Webhook, FileText, Settings, ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
    const location = useLocation();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const links = [
        { to: "/", icon: LayoutDashboard, label: "Dashboard", badge: null },
        { to: "/machines", icon: MonitorSmartphone, label: "Máquinas", badge: "12" },
        { to: "/screen-time", icon: Clock, label: "Screen Time", badge: null },
        { to: "/vulnerabilities", icon: ShieldAlert, label: "Vulnerabilities", badge: "3" },
        { to: "/policies", icon: Lock, label: "Políticas", badge: null },
        { to: "/compliance", icon: Scale, label: "Compliance", badge: null },
        { to: "/webhooks", icon: Webhook, label: "Webhooks", badge: null },
        { to: "/audit", icon: FileText, label: "Auditoria", badge: null },
        { to: "/settings", icon: Settings, label: "Configurações", badge: null },
    ];

    return (
        <aside className="w-80 relative flex flex-col h-screen">
            {/* Background com gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />

            {/* Liquid glass overlay */}
            <div className="absolute inset-0 liquid-glass" />

            {/* Glow line no lado direito */}
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Logo Header com animação */}
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-4 spring-in">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50 glow-green">
                            <MonitorSmartphone className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gradient-apple">AssetScan</h1>
                            <p className="text-xs text-gray-500 font-medium">Enterprise v3.0</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {links.map((link, idx) => {
                        const isActive = location.pathname === link.to;
                        const isHovered = hoveredIndex === idx;
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className={`
                  group relative flex items-center justify-between px-4 py-3.5 rounded-xl
                  font-medium text-[15px] transition-all duration-300 ripple-container
                  ${isActive
                                        ? 'liquid-glass-active text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                `}
                                style={{
                                    animationDelay: `${idx * 50}ms`,
                                }}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-r-full spring-in" />
                                )}

                                <div className="flex items-center gap-3">
                                    <div className={`
                    transition-all duration-300
                    ${isActive ? 'text-emerald-400' : 'text-gray-500'}
                    ${isHovered ? 'scale-110 rotate-6' : 'scale-100'}
                  `}>
                                        <Icon className="w-5 h-5" strokeWidth={2.5} />
                                    </div>
                                    <span>{link.label}</span>
                                </div>

                                {/* Badge ou Arrow */}
                                {link.badge ? (
                                    <span className="badge-apple text-xs">
                                        {link.badge}
                                    </span>
                                ) : isHovered ? (
                                    <ChevronRight className="w-4 h-4 text-emerald-400 spring-in" />
                                ) : null}
                            </Link>
                        );
                    })}
                </nav>

                {/* Status Footer com animação */}
                <div className="p-4 border-t border-white/5">
                    <div className="liquid-glass rounded-2xl p-4 spring-in">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-400">Sistema</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                                <span className="text-sm font-semibold text-emerald-400">Online</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                            </div>
                            <span className="text-xs font-mono text-gray-500">75%</span>
                        </div>

                        <p className="text-xs font-mono text-gray-600 mt-2">
                            localhost:7474
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}