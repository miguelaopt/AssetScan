import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Shield, ShieldAlert, AlertTriangle, CheckCircle, Search, Play, RefreshCw } from "lucide-react";
import { useMachines } from "../hooks/useMachines";
import toast from "react-hot-toast";

interface Vulnerability {
    id: number;
    machine_id: string;
    software_name: string;
    current_version: string;
    cve_id: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
    solution: string;
    detected_at: string;
}

export default function Vulnerabilities() {
    const { machines } = useMachines();
    const [vulns, setVulns] = useState<Vulnerability[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadVulnerabilities();
    }, []);

    const loadVulnerabilities = async () => {
        try {
            setLoading(true);
            // CORRIGIDO: O nome correto do comando no Rust e passagem dos argumentos vazios
            const data = await invoke<Vulnerability[]>("get_vulnerabilities", { machineId: null, severity: null });
            setVulns(data);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar vulnerabilidades");
        } finally {
            setLoading(false);
        }
    };

    const runScan = async () => {
        if (!confirm("Iniciar scan de vulnerabilidades em todas as máquinas online?")) return;

        try {
            setScanning(true);
            // CORRIGIDO: O nome correto e passagem da flag "all"
            await invoke("scan_vulnerabilities", { machineId: "all" });
            toast.success("Scan iniciado e concluído!");
            setTimeout(loadVulnerabilities, 1000);
        } catch (err) {
            toast.error(`Erro: ${err}`);
        } finally {
            setScanning(false);
        }
    };

    const filtered = vulns.filter(v =>
        v.software_name.toLowerCase().includes(search.toLowerCase()) ||
        v.cve_id.toLowerCase().includes(search.toLowerCase())
    );

    const criticalCount = vulns.filter(v => v.severity === "critical").length;
    const highCount = vulns.filter(v => v.severity === "high").length;
    const mediumCount = vulns.filter(v => v.severity === "medium").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gradient-apple">Vulnerabilidades</h1>
                    <p className="text-gray-500 mt-1">Scan de CVEs e exposições conhecidas</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadVulnerabilities}
                        className="btn-apple-secondary ripple-container flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Atualizar
                    </button>
                    <button
                        onClick={runScan}
                        disabled={scanning}
                        className="btn-apple-primary ripple-container flex items-center gap-2 disabled:opacity-50"
                    >
                        {scanning ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                A Scanear...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Scan Completo
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats - TEMA VERDE */}
            <div className="grid grid-cols-4 gap-4">
                <div className="liquid-glass-hover rounded-2xl p-6 border-l-4 border-red-500">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <span className="text-sm text-gray-400">Críticas</span>
                    </div>
                    <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
                    <p className="text-xs text-gray-600 mt-1">Requerem ação imediata</p>
                </div>

                <div className="liquid-glass-hover rounded-2xl p-6 border-l-4 border-amber-500">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert className="w-6 h-6 text-amber-500" />
                        <span className="text-sm text-gray-400">Altas</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-400">{highCount}</p>
                    <p className="text-xs text-gray-600 mt-1">Atenção prioritária</p>
                </div>

                <div className="liquid-glass-hover rounded-2xl p-6 border-l-4 border-emerald-500">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-6 h-6 text-emerald-500" />
                        <span className="text-sm text-gray-400">Médias</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">{mediumCount}</p>
                    <p className="text-xs text-gray-600 mt-1">Monitorizar</p>
                </div>

                <div className="liquid-glass-hover rounded-2xl p-6 border-l-4 border-emerald-500">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <span className="text-sm text-gray-400">Protegidas</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">
                        {machines.length - Math.min(vulns.length, machines.length)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Sem vulnerabilidades</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Pesquisar por CVE ou software..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 liquid-glass rounded-xl text-white placeholder-gray-600 border border-white/10 focus:border-emerald-500 transition-colors"
                />
            </div>

            {/* Table */}
            <div className="liquid-glass rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-black/30 border-b border-white/10">
                        <tr>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Severidade</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">CVE ID</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Software</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Versão</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Máquina</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Detectado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12">
                                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
                                    <p className="text-gray-500">A carregar...</p>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12">
                                    <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-gray-500 font-medium">
                                        {search ? 'Nenhuma vulnerabilidade encontrada' : 'Nenhuma vulnerabilidade detectada! 🎉'}
                                    </p>
                                    {!search && <p className="text-xs text-gray-600 mt-1">Sistema seguro</p>}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((vuln) => (
                                <tr key={vuln.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <span className={`badge-apple text-xs font-semibold ${vuln.severity === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                                                vuln.severity === 'high' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                                                    vuln.severity === 'medium' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                                                        'text-gray-400 bg-gray-500/10 border-gray-500/30'
                                            }`}>
                                            {vuln.severity.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-emerald-400 text-sm">{vuln.cve_id}</td>
                                    <td className="p-4 text-white font-medium">{vuln.software_name}</td>
                                    <td className="p-4 text-gray-400 font-mono text-sm">{vuln.current_version}</td>
                                    <td className="p-4 text-gray-400">
                                        {machines.find(m => m.machine_id === vuln.machine_id)?.hostname || 'Unknown'}
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {new Date(vuln.detected_at).toLocaleDateString('pt-PT')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}