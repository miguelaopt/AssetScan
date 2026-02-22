import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Globe, Wifi, ShieldCheck, Lock, User, MapPin, Activity } from "lucide-react";
import { Machine } from "../hooks/useMachines";

interface NetworkDetails {
    local_ip: string;
    subnet_mask: string;
    gateway: string;
    dns_primary: string;
    dns_secondary?: string;
    dhcp_enabled: boolean;
    domain_name: string;
    is_domain_joined: boolean;
    mac_address: string;
    adapter_name: string;
    connection_speed_mbps: number;
    wifi_ssid?: string;
    wifi_security?: string;
}

interface SecurityStatus {
    windows_defender_enabled: boolean;
    windows_defender_updated: boolean;
    firewall_enabled: boolean;
    bitlocker_active: boolean;
    bitlocker_drives: string[];
    last_windows_update: string;
}

interface UserInfo {
    current_user: string;
    primary_user?: string;
    department?: string;
    location?: string;
}

interface Props {
    machine: Machine;
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-white text-sm font-medium text-right">
            {value || <span className="text-slate-600 italic">Não disponível</span>}
        </span>
    </div>
);

export default function NetworkTab({ machine }: Props) {
    const [network, setNetwork] = useState<NetworkDetails | null>(null);
    const [security, setSecurity] = useState<SecurityStatus | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [machine]);

    const loadData = async () => {
        try {
            setLoading(true);
            const machineId = machine.machine_id || machine.id;

            // Carrega network details
            const networkData = await invoke<NetworkDetails>("get_network_details", { machineId });
            setNetwork(networkData);

            // Carrega security status
            const securityData = await invoke<SecurityStatus>("get_security_status", { machineId });
            setSecurity(securityData);

            // User info (pode vir no machine ou separado)
            setUserInfo({
                current_user: machine.current_user || "Sistema",
                primary_user: machine.primary_user,
                department: machine.department,
                location: machine.location,
            });
        } catch (err) {
            console.error("Erro ao carregar network:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-6">
            {/* GRID 1: IP & Domínio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-400" />
                        Configuração de Rede
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <InfoRow
                            label="IP Local"
                            value={network?.local_ip ? (
                                <span className="text-emerald-400 font-mono">{network.local_ip}</span>
                            ) : machine.local_ip}
                        />
                        <InfoRow label="Subnet Mask" value={network?.subnet_mask} />
                        <InfoRow label="Gateway" value={network?.gateway} />
                        <InfoRow label="DNS Primário" value={network?.dns_primary} />
                        {network?.dns_secondary && (
                            <InfoRow label="DNS Secundário" value={network.dns_secondary} />
                        )}
                        <InfoRow
                            label="Atribuição"
                            value={network?.dhcp_enabled ? "DHCP Dinâmico" : "IP Estático"}
                        />
                    </div>
                </div>

                <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Domínio & Autenticação
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <InfoRow
                            label="Em Domínio?"
                            value={
                                network?.is_domain_joined ? (
                                    <span className="text-emerald-400 font-bold">Sim</span>
                                ) : (
                                    <span className="text-slate-400">Workgroup</span>
                                )
                            }
                        />
                        <InfoRow
                            label="Domínio/Workgroup"
                            value={network?.domain_name || "WORKGROUP"}
                        />
                        <InfoRow
                            label="Utilizador Actual"
                            value={userInfo?.current_user}
                        />
                        {userInfo?.primary_user && (
                            <InfoRow label="Utilizador Principal" value={userInfo.primary_user} />
                        )}
                    </div>
                </div>
            </div>

            {/* GRID 2: Adaptador & Wi-Fi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Wifi className="w-5 h-5 text-emerald-400" />
                        Adaptador de Rede
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <InfoRow
                            label="Adaptador"
                            value={network?.adapter_name ? (
                                <span className="text-xs">{network.adapter_name}</span>
                            ) : undefined}
                        />
                        <InfoRow
                            label="MAC Address"
                            value={network?.mac_address ? (
                                <span className="font-mono text-emerald-400">{network.mac_address}</span>
                            ) : machine.mac_address}
                        />
                        <InfoRow
                            label="Velocidade"
                            value={network?.connection_speed_mbps ? `${network.connection_speed_mbps} Mbps` : undefined}
                        />
                        <div className="h-px bg-white/10 my-3" />
                        {network?.wifi_ssid && (
                            <>
                                <InfoRow label="Wi-Fi SSID" value={network.wifi_ssid} />
                                <InfoRow label="Segurança Wi-Fi" value={network.wifi_security} />
                            </>
                        )}
                    </div>
                </div>

                <div className="liquid-glass rounded-2xl p-6 border-emerald-500/20">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        Status de Segurança
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <InfoRow
                            label="Windows Defender"
                            value={
                                security?.windows_defender_enabled ? (
                                    <span className="flex items-center justify-end gap-2">
                                        <span className={security.windows_defender_updated ? "text-emerald-400" : "text-amber-400"}>
                                            {security.windows_defender_updated ? "Ativo e Atualizado" : "Ativo (Desatualizado)"}
                                        </span>
                                    </span>
                                ) : (
                                    <span className="text-red-400">Desativado</span>
                                )
                            }
                        />
                        <InfoRow
                            label="Firewall"
                            value={
                                security?.firewall_enabled ? (
                                    <span className="text-emerald-400">Ativo</span>
                                ) : (
                                    <span className="text-red-400">Desativado</span>
                                )
                            }
                        />
                        <InfoRow
                            label="BitLocker"
                            value={
                                security?.bitlocker_active ? (
                                    <span className="flex items-center justify-end gap-1 text-emerald-400">
                                        <Lock className="w-3 h-3" />
                                        Ativo ({security.bitlocker_drives.join(", ")})
                                    </span>
                                ) : (
                                    <span className="text-slate-400">Desativado</span>
                                )
                            }
                        />
                        <InfoRow
                            label="Última Atualização"
                            value={security?.last_windows_update}
                        />
                    </div>
                </div>
            </div>

            {/* Informação de Contexto */}
            {userInfo && (userInfo.department || userInfo.location) && (
                <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-400" />
                        Contexto Organizacional
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-4">
                            {userInfo.department && (
                                <InfoRow label="Departamento" value={userInfo.department} />
                            )}
                            {userInfo.location && (
                                <InfoRow
                                    label="Localização"
                                    value={
                                        <span className="flex items-center justify-end gap-1">
                                            <MapPin className="w-3 h-3 text-rose-400" />
                                            {userInfo.location}
                                        </span>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}