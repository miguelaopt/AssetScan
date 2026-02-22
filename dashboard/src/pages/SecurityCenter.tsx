import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ShieldCheck, ShieldAlert, Lock, Shield, AlertTriangle } from "lucide-react";
import { useMachines } from "../hooks/useMachines";

interface SecurityOverview {
    total_machines: number;
    defender_active: number;
    firewall_active: number;
    bitlocker_active: number;
    fully_protected: number;
    at_risk: number;
}

export default function SecurityCenter() {
    const { machines } = useMachines();
    const [overview, setOverview] = useState<SecurityOverview>({
        total_machines: 0,
        defender_active: 0,
        firewall_active: 0,
        bitlocker_active: 0,
        fully_protected: 0,
        at_risk: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSecurityOverview();
    }, [machines]);

    const loadSecurityOverview = async () => {
        try {
            setLoading(true);

            let defenderCount = 0;
            let firewallCount = 0;
            let bitlockerCount = 0;
            let fullyProtected = 0;
            let atRisk = 0;

            for (const machine of machines) {
                try {
                    const security = await invoke<any>("get_security_status", {
                        machineId: machine.machine_id || machine.id,
                    });

                    if (security.windows_defender_enabled) defenderCount++;
                    if (security.firewall_enabled) firewallCount++;
                    if (security.bitlocker_active) bitlockerCount++;

                    if (
                        security.windows_defender_enabled &&
                        security.firewall_enabled &&
                        security.bitlocker_active
                    ) {
                        fullyProtected++;
                    } else if (
                        !security.windows_defender_enabled ||
                        !security.firewall_enabled
                    ) {
                        atRisk++;
                    }
                } catch (err) {
                    console.error(`Error loading security for ${machine.hostname}:`, err);
                }
            }

            setOverview({
                total_machines: machines.length,
                defender_active: defenderCount,
                firewall_active: firewallCount,
                bitlocker_active: bitlockerCount,
                fully_protected: fullyProtected,
                at_risk: atRisk,
            });
        } catch (err) {
            console.error("Error loading security overview:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const protectionRate =
        overview.total_machines > 0
            ? (overview.fully_protected / overview.total_machines) * 100
            : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gradient-apple">Security Center</h1>
                    <p className="text-gray-500 mt-1">Visão geral de segurança da infraestrutura</p>
                </div>

                <button className="btn-apple-primary ripple-container" onClick={loadSecurityOverview}>
                    Actualizar
                </button>
            </div>

            {/* Protection Score */}
            <div className="liquid-glass rounded-2xl p-8 border-l-4 border-emerald-500">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">
                                {protectionRate.toFixed(0)}%
                            </h2>
                            <p className="text-gray-400">Taxa de Protecção</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-500">Máquinas Totalmente Protegidas</p>
                        <p className="text-4xl font-bold text-emerald-400">
                            {overview.fully_protected}/{overview.total_machines}
                        </p>
                    </div>
                </div>

                <div className="w-full bg-black/50 rounded-full h-4 border border-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: `${protectionRate}%` }}
                    />
                </div>
            </div>

            {/* Security Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="liquid-glass-hover rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-8 h-8 text-blue-400" />
                        <h3 className="font-semibold text-white">Windows Defender</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">{overview.defender_active}</p>
                    <p className="text-sm text-gray-500">
                        {((overview.defender_active / overview.total_machines) * 100).toFixed(0)}% activo
                    </p>
                </div>

                <div className="liquid-glass-hover rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        <h3 className="font-semibold text-white">Firewall</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">{overview.firewall_active}</p>
                    <p className="text-sm text-gray-500">
                        {((overview.firewall_active / overview.total_machines) * 100).toFixed(0)}% activo
                    </p>
                </div>

                <div className="liquid-glass-hover rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className="w-8 h-8 text-amber-400" />
                        <h3 className="font-semibold text-white">BitLocker</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">{overview.bitlocker_active}</p>
                    <p className="text-sm text-gray-500">
                        {((overview.bitlocker_active / overview.total_machines) * 100).toFixed(0)}% activo
                    </p>
                </div>

                <div className="liquid-glass-hover rounded-2xl p-6 border-red-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                        <h3 className="font-semibold text-white">Em Risco</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-400 mb-2">{overview.at_risk}</p>
                    <p className="text-sm text-gray-500">Requerem atenção imediata</p>
                </div>
            </div>

            {/* At Risk Machines */}
            {overview.at_risk > 0 && (
                <div className="liquid-glass rounded-2xl p-6 border-red-500/20">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-red-400" />
                        Máquinas em Risco
                    </h3>
                    <div className="space-y-2">
                        {machines
                            .filter((m) => !m.is_bitlocker_active)
                            .slice(0, 5)
                            .map((machine) => (
                                <div
                                    key={machine.id}
                                    className="flex items-center justify-between bg-white/5 rounded-xl p-4"
                                >
                                    <div>
                                        <p className="font-medium text-white">
                                            {machine.custom_name || machine.hostname}
                                        </p>
                                        <p className="text-sm text-gray-500">{machine.local_ip}</p>
                                    </div>
                                    <button className="btn-apple-secondary text-sm">Corrigir</button>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}