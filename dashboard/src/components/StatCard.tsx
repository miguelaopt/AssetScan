import { LucideIcon } from "lucide-react";

interface Props {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;
    subtitle?: string;
}

export default function StatCard({ title, value, icon: Icon, iconColor = "text-blue-500", subtitle }: Props) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="text-sm text-slate-400 font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-lg bg-slate-700 ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}