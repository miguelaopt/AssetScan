import { useState } from "react";
import { Plus, Trash2, Globe, MonitorPlay, Usb, FolderLock, Network, Clock, ShieldAlert } from "lucide-react";
import { useMachines } from "../hooks/useMachines";
import { usePolicies } from "../hooks/usePolicies";

export default function Policies() {
    const { machines } = useMachines();
    const { policies, createPolicy, deletePolicy } = usePolicies();

    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState("app");

    const [formData, setFormData] = useState({
        name: "", machineId: "all", priority: "1", action: "block", reason: "",
        schedule: "always", allowAdmin: false,
        // Web
        webTargetType: "domain", blockMethod: "firewall", domains: "",
        // App
        matchType: "name", target: "", hashValue: "",
        // Device
        deviceAction: "block_usb", allowedSerials: "",
        // Folder
        restrictedFolders: [] as string[],
        // Network
        blockedPorts: "",
    });

    const toggleFolder = (folder: string) => {
        setFormData(prev => ({
            ...prev,
            restrictedFolders: prev.restrictedFolders.includes(folder)
                ? prev.restrictedFolders.filter(f => f !== folder) : [...prev.restrictedFolders, folder]
        }));
    };

    const handleSavePolicy = async () => {
        let configJson: any = { schedule: formData.schedule, allow_admin: formData.allowAdmin };
        let targetValue = formData.target;

        if (activeTab === "web") {
            const domainsList = formData.domains.split("\n").map(d => d.trim()).filter(d => d !== "");
            configJson.domains = domainsList;
            configJson.block_method = formData.blockMethod;
            configJson.target_type = formData.webTargetType;
            targetValue = domainsList.length > 0 ? domainsList[0] : "Multi-domínios";
        } else if (activeTab === "app") {
            configJson.match_type = formData.matchType;
            configJson.hash_value = formData.hashValue || null;
        } else if (activeTab === "device") {
            configJson.device_action = formData.deviceAction;
            configJson.allowed_serials = formData.allowedSerials.split("\n").map(s => s.trim());
            targetValue = "Regras de Dispositivos USB";
        } else if (activeTab === "folder") {
            configJson.restricted_folders = formData.restrictedFolders;
            targetValue = "Restrições de Sistema";
        } else if (activeTab === "network") {
            configJson.blocked_ports = formData.blockedPorts;
            targetValue = "Portas de Rede Bloqueadas";
        }

        await createPolicy({
            name: formData.name, machineId: formData.machineId, priority: formData.priority,
            policyType: activeTab, target: targetValue || "*", action: formData.action,
            configJson: JSON.stringify(configJson), reason: formData.reason
        });

        setShowModal(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Políticas de Segurança Enterprise</h1>
                    <p className="text-slate-400">{policies.length} regra(s) ativa(s) na rede</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    <Plus className="w-5 h-5" /><span>Nova Regra</span>
                </button>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-400 text-sm">
                        <tr>
                            <th className="p-4">Nome</th><th className="p-4">Tipo</th>
                            <th className="p-4">Alvo</th><th className="p-4">Prioridade</th>
                            <th className="p-4">Ação</th><th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {policies.map((policy) => (
                            <tr key={policy.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-sm text-white font-medium">{policy.name}</td>
                                <td className="p-4 text-sm text-slate-400 capitalize">{policy.policy_type}</td>
                                <td className="p-4 text-sm text-slate-300 font-mono">{policy.target}</td>
                                <td className="p-4 text-sm text-slate-400">{policy.priority}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${policy.action === "block" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                                        {policy.action}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => deletePolicy(policy.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold text-white">Configuração Avançada de Política</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="flex border-b border-white/10 bg-black/50 overflow-x-auto px-6">
                            <button onClick={() => setActiveTab("app")} className={`px-4 py-4 flex items-center gap-2 font-medium ${activeTab === "app" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-white"}`}><MonitorPlay className="w-4 h-4" /> Application Control</button>
                            <button onClick={() => setActiveTab("web")} className={`px-4 py-4 flex items-center gap-2 font-medium ${activeTab === "web" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-white"}`}><Globe className="w-4 h-4" /> Web Filtering</button>
                            <button onClick={() => setActiveTab("device")} className={`px-4 py-4 flex items-center gap-2 font-medium ${activeTab === "device" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-white"}`}><Usb className="w-4 h-4" /> Device Control</button>
                            <button onClick={() => setActiveTab("folder")} className={`px-4 py-4 flex items-center gap-2 font-medium ${activeTab === "folder" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-white"}`}><FolderLock className="w-4 h-4" /> Folder Restrictions</button>
                            <button onClick={() => setActiveTab("network")} className={`px-4 py-4 flex items-center gap-2 font-medium ${activeTab === "network" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-white"}`}><Network className="w-4 h-4" /> Network Rules</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            {/* PARÂMETROS COMUNS */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-white/10 pb-6">
                                <div className="col-span-2">
                                    <label className="block text-sm text-slate-400 mb-1">Nome da Política</label>
                                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" placeholder="Ex: Bloquear Redes Sociais" className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white outline-none focus:border-emerald-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm text-slate-400 mb-1">Máquina / Grupo Alvo</label>
                                    <select value={formData.machineId} onChange={e => setFormData({ ...formData, machineId: e.target.value })} className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white outline-none focus:border-emerald-500">
                                        <option value="all">Toda a Organização</option>
                                        {machines.map(m => <option key={m.id} value={m.machine_id}>{m.hostname}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Ação</label>
                                    <select value={formData.action} onChange={e => setFormData({ ...formData, action: e.target.value })} className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white outline-none">
                                        <option value="block">Bloquear / Terminar</option>
                                        <option value="alert">Apenas Alertar</option>
                                        <option value="ask">Pedir Autorização Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Prioridade</label>
                                    <input value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} type="number" className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white outline-none" />
                                </div>
                                <div className="col-span-2 pt-6 flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-slate-300">
                                        <Clock className="w-4 h-4 text-emerald-500" />
                                        <select value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })} className="bg-transparent border-b border-white/10 text-white outline-none pb-1">
                                            <option value="always" className="bg-black">Sempre Ativa (24/7)</option>
                                            <option value="work_hours" className="bg-black">Horário Laboral (09:00 - 18:00)</option>
                                        </select>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-300">
                                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                                        <input type="checkbox" checked={formData.allowAdmin} onChange={e => setFormData({ ...formData, allowAdmin: e.target.checked })} className="rounded bg-black/50 border-white/10" />
                                        Permitir se Admin
                                    </label>
                                </div>
                            </div>

                            {/* ABAS ESPECÍFICAS */}
                            {activeTab === "app" && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Tipo de Identificação</label>
                                            <select value={formData.matchType} onChange={e => setFormData({ ...formData, matchType: e.target.value })} className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white outline-none">
                                                <option value="name">Nome do Executável (ex: fraps.exe)</option>
                                                <option value="path">Caminho Completo</option>
                                                <option value="hash">Por Hash do ficheiro (Mais Seguro)</option>
                                                <option value="publisher">Por Publisher (Assinatura)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Alvo do Bloqueio</label>
                                            <input value={formData.target} onChange={e => setFormData({ ...formData, target: e.target.value })} type="text" placeholder="ex: fraps.exe" className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white font-mono outline-none" />
                                        </div>
                                    </div>
                                    {formData.matchType === "hash" && (
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Hash SHA-256</label>
                                            <input value={formData.hashValue} onChange={e => setFormData({ ...formData, hashValue: e.target.value })} type="text" placeholder="Cole o hash aqui..." className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white font-mono text-sm outline-none" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "web" && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">O que bloquear?</label>
                                            <select value={formData.webTargetType} onChange={e => setFormData({ ...formData, webTargetType: e.target.value })} className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white outline-none">
                                                <option value="domain">Domínios Específicos</option>
                                                <option value="category">Categoria (Redes Sociais, Adulto, Jogos)</option>
                                                <option value="whitelist">Permitir Apenas Whitelist</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Modo de Aplicação</label>
                                            <select value={formData.blockMethod} onChange={e => setFormData({ ...formData, blockMethod: e.target.value })} className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white outline-none">
                                                <option value="firewall">Windows Firewall (Recomendado)</option>
                                                <option value="dns">DNS Filtering</option>
                                                <option value="hosts">Hosts File</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Lista de Domínios (Um por linha)</label>
                                        <textarea value={formData.domains} onChange={e => setFormData({ ...formData, domains: e.target.value })} rows={3} placeholder="facebook.com&#10;youtube.com" className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white font-mono text-sm outline-none"></textarea>
                                    </div>
                                </div>
                            )}

                            {activeTab === "device" && (
                                <div className="space-y-4 animate-fade-in">
                                    <label className="block text-sm text-slate-400 mb-1">Ação USB</label>
                                    <select value={formData.deviceAction} onChange={e => setFormData({ ...formData, deviceAction: e.target.value })} className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white outline-none mb-4">
                                        <option value="block_all">Bloquear todos os USBs de Armazenamento</option>
                                        <option value="whitelist_only">Permitir apenas USBs Autorizados</option>
                                    </select>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Whitelists (Serials Autorizados)</label>
                                        <textarea value={formData.allowedSerials} onChange={e => setFormData({ ...formData, allowedSerials: e.target.value })} rows={3} placeholder="USB_SERIAL_12345" className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white font-mono text-sm outline-none"></textarea>
                                    </div>
                                </div>
                            )}

                            {activeTab === "folder" && (
                                <div className="space-y-4 animate-fade-in">
                                    <h3 className="text-sm font-medium text-slate-300 mb-3">Selecione o que deseja bloquear nesta máquina:</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Painel de Controlo', 'Regedit (Editor de Registo)', 'Task Manager (Gestor de Tarefas)', 'CMD / PowerShell'].map(folder => (
                                            <label key={folder} className="flex items-center gap-3 p-3 bg-black/30 border border-white/5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                                <input type="checkbox" checked={formData.restrictedFolders.includes(folder)} onChange={() => toggleFolder(folder)} className="w-4 h-4 accent-emerald-500" />
                                                <span className="text-sm text-white">{folder}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "network" && (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Bloquear Portas Específicas (Vírgula para separar)</label>
                                        <input value={formData.blockedPorts} onChange={e => setFormData({ ...formData, blockedPorts: e.target.value })} type="text" placeholder="Ex: 21, 22, 3389" className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white font-mono outline-none" />
                                    </div>
                                    <p className="text-xs text-amber-500/80 mt-2">* Funcionalidade avançada baseada no Windows Defender Firewall</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                            <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-transparent border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors">Cancelar</button>
                            <button onClick={handleSavePolicy} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                Guardar Regra
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}