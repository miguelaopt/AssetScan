import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface Props {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;
    subtitle?: string;
    trend?: {
        value: number;
        label: string;
    };
    children?: ReactNode;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    iconColor = "text-cyber-500",
    subtitle,
    trend,
    children
}: Props) {
    return (
        <div className="glass-hover rounded-xl p-6 card-hover animate-scale-in relative overflow-hidden group">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
                        <h3 className="text-3xl font-bold text-gradient font-display">
                            {value}
                        </h3>
                        {subtitle && (
                            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                        )}
                    </div>

                    {/* Icon */}
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 ${iconColor}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>

                {/* Trend */}
                {trend && (
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <div className={`flex items-center gap-1 text-xs font-semibold ${trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                            <span>{trend.value >= 0 ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                        <span className="text-xs text-gray-500">{trend.label}</span>
                    </div>
                )}

                {/* Custom Content */}
                {children && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}