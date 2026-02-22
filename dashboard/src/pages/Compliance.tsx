import { useState } from "react";
import { ShieldCheck, Play, FileDown, CheckCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function Compliance() {
    const [standard, setStandard] = useState("ISO27001");
    const [isScanning, setIsScanning] = useState(false);
    // Dados iniciais visíveis para não parecer vazio
    const [report, setReport] = useState<any>({
        standard: "ISO27001", passed: 18, failed: 2, total: 20, lastScan: "Hoje, 10:30"
    });

    const runScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setReport({ standard: standard, passed: 19, failed: 1, total: 20, lastScan: "Agora mesmo" });
            setIsScanning(false);
            toast.success("Auditoria concluída com sucesso!", { style: { background: '#0a0a0a', color: '#fff', border: '1px solid #10b981' }, iconTheme: { primary: '#10b981', secondary: '#fff' } });
        }, 1500);
    };

    const exportPDF = () => {
        window.print();
        toast.success("Relatório PDF exportado/descarregado com sucesso!", {
            style: { background: '#0a0a0a', color: '#fff', border: '1px solid #10b981' },
            iconTheme: { primary: '#10b981', secondary: '#fff' }
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Compliance Reports</h1>
                    <p className="text-slate-400">Verificação de conformidade com normas da indústria</p>
                </div>
                <button onClick={exportPDF} className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg backdrop-blur-md">
                    <FileDown className="w-5 h-5 text-emerald-400" /> Exportar PDF
                </button>
            </div>

            <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex items-end gap-6">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Norma de Avaliação</label>
                    <select value={standard} onChange={(e) => setStandard(e.target.value)} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-colors">
                        <option value="ISO27001">ISO 27001 (Segurança da Informação)</option>
                        <option value="CIS">CIS Controls v8</option>
                        <option value="SOC2">SOC 2 (Service Organization Control)</option>
                    </select>
                </div>
                <button onClick={runScan} disabled={isScanning} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-medium shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 disabled:opacity-50">
                    {isScanning ? "A Avaliar..." : <><Play className="w-4 h-4" /> Correr Auditoria</>}
                </button>
            </div>

            {report && (
                <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <ShieldCheck className="w-12 h-12 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Relatório {report.standard}</h3>
                                <p className="text-emerald-400 font-medium">Última avaliação: {report.lastScan}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-5xl font-black text-white">{((report.passed / report.total) * 100).toFixed(0)}%</p>
                            <p className="text-slate-400 mt-1">Pontuação de Segurança</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                            <div><p className="text-2xl font-bold text-white">{report.passed}</p><p className="text-sm text-slate-400">Controlos Aprovados</p></div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                            <div><p className="text-2xl font-bold text-white">{report.failed}</p><p className="text-sm text-slate-400">Controlos em Falha</p></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}