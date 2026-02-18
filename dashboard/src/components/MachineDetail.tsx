import { useState } from "react";
import { Machine } from "../App";
import HardwareTab from "./HardwareTab";
import SoftwareTab from "./SoftwareTab";
import StatusBadge from "./StatusBadge";

interface Props {
    machine: Machine;
    onBack: () => void;
}

type Tab = "hardware" | "software";

export default function MachineDetail({ machine, onBack }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("hardware");

    return (
        <div>
            {/* Botão voltar + cabeçalho */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={onBack}
                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                >
                    ← Voltar
                </button>
                <span className="text-slate-600">|</span>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🖥️</span>
                    <div>
                        <h1 className="text-xl font-bold text-white">{machine.hostname}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm text-slate-400">{machine.os_name} {machine.os_version}</span>
                            <StatusBadge lastSeen={machine.last_seen} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards de resumo rápido */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "CPU", value: `${machine.cpu_cores} núcleos`, icon: "⚡" },
                    { label: "RAM Total", value: `${(machine.ram_total_mb / 1024).toFixed(1)} GB`, icon: "💾" },
                    { label: "Discos", value: `${machine.disk_count} disco${machine.disk_count !== 1 ? "s" : ""}`, icon: "💿" },
                    { label: "Software", value: `${machine.software_count} apps`, icon: "📦" },
                ].map((card) => (
                    <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span>{card.icon}</span>
                            <span className="text-xs text-slate-400 uppercase tracking-wider">{card.label}</span>
                        </div>
                        <p className="text-xl font-bold text-white">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Abas */}
            <div className="flex gap-1 border-b border-slate-700 mb-5">
                {(["hardware", "software"] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab
                            ? "text-white border-blue-500"
                            : "text-slate-400 border-transparent hover:text-white"
                            }`}
                    >
                        {tab === "hardware" ? "🖥️ Hardware" : "📦 Software"}
                    </button>
                ))}
            </div>

            {/* Conteúdo da aba ativa */}
            {activeTab === "hardware" ? (
                <HardwareTab machine={machine} />
            ) : (
                <SoftwareTab machineId={machine.id} />
            )}
        </div>
    );
}