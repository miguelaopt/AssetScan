import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AlertTriangle, Shield, CheckCircle, XCircle } from "lucide-react";
import { Vulnerability } from "../types";

export default function Vulnerabilities() {
    const [vulns, setVulns] = useState<Vulnerability[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('all');

    useEffect(() => {
        loadVulnerabilities();
    }, [filter]);

    const loadVulnerabilities = async () => {
        try {
            setLoading(true);
            const severity = filter === 'all' ? null : filter;
            const result = await invoke<Vulnerability[]>("get_vulnerabilities", {
                machineId: null,
                severity,
            });
            setVulns(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-500 bg-red-500/15 border-red-500/30';
            case 'HIGH': return 'text-orange-500 bg-orange-500/15 border-orange-500/30';
            case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/15 border-yellow-500/30';
            case 'LOW': return 'text-blue-500 bg-blue-500/15 border-blue-500/30';
            default: return 'text-gray-500 bg-gray-500/15 border-gray-500/30';
        }
    };

    const stats = {
        critical: vulns.filter(v => v.severity === 'CRITICAL').length,
        high: vulns.filter(v => v.severity === 'HIGH').length,
        medium: vulns.filter(v => v.severity === 'MEDIUM').length,
        low: vulns.filter(v => v.severity === 'LOW').length,
    };

    if (loading) {
        return <div className="animate-pulse">A carregar vulnerabilidades...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Vulnerabilidades</h1>
                <p className="text-gray-400">Análise de segurança e CVEs detectadas</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Críticas</p>
                            <p className="text-3xl font-bold text-red-500">{stats.critical}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div className="glass rounded-xl p-4 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Altas</p>
                            <p className="text-3xl font-bold text-orange-500">{stats.high}</p>
                        </div>
                        <Shield className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                <div className="glass rounded-xl p-4 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Médias</p>
                            <p className="text-3xl font-bold text-yellow-500">{stats.medium}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>

                <div className="glass rounded-xl p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Baixas</p>
                            <p className="text-3xl font-bold text-blue-500">{stats.low}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {(['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === f
                                ? 'bg-gradient-to-r from-cyber-500 to-deep-blue-500 text-white'
                                : 'glass text-gray-400 hover:text-white'
                            }`}
                    >
                        {f === 'all' ? 'Todas' : f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="glass rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="text-left p-4 text-sm font-semibold text-gray-300">CVE ID</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-300">Software</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-300">Severidade</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-300">Descrição</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-300">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {vulns.map((vuln) => (
                            <tr key={vuln.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="p-4">
                                    <code className="text-xs text-cyber-500 font-mono bg-cyber-500/10 px-2 py-1 rounded">
                                        {vuln.cve_id}
                                    </code>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <p className="text-sm font-medium text-white">{vuln.software_name}</p>
                                        <p className="text-xs text-gray-500">{vuln.software_version}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`badge ${getSeverityColor(vuln.severity)}`}>
                                        {vuln.severity}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-400 max-w-md truncate">
                                    {vuln.description || 'Sem descrição'}
                                </td>
                                <td className="p-4">
                                    <span className={`badge ${vuln.status === 'open' ? 'badge-error' : 'badge-success'
                                        }`}>
                                        {vuln.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {vulns.length === 0 && (
                    <div className="p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <p className="text-gray-400">Nenhuma vulnerabilidade detectada!</p>
                    </div>
                )}
            </div>
        </div>
    );
}