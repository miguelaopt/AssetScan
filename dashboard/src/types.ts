// Tipos partilhados no frontend

export interface Machine {
    id: string;
    machine_id: string;
    hostname: string;
    custom_name: string | null;
    tags: string[];
    notes: string | null;
    last_seen: string;
    cpu_name: string;
    cpu_cores: number;
    ram_total_mb: number;
    ram_used_mb: number;
    os_name: string;
    os_version: string;
    uptime_hours: number;
    disk_count: number;
    software_count: number;
    process_count: number;
    is_online: boolean;
}

export interface DiskInfo {
    name: string;
    mount_point: string;
    total_gb: number;
    free_gb: number;
    fs_type: string;
}

export interface SoftwareEntry {
    name: string;
    version: string;
    publisher: string;
    install_date: string;
}

export interface ProcessInfo {
    id: number;
    machine_id: string;
    pid: number;
    name: string;
    exe_path: string;
    memory_mb: number;
    cpu_percent: number;
    captured_at: string;
}

export interface Policy {
    id: string;
    machine_id: string | null;
    policy_type: 'application' | 'website';
    target: string;
    action: 'allow' | 'block';
    reason: string;
    created_by: string;
    created_at: string;
    enabled: boolean;
}

export interface AuditLog {
    id: number;
    timestamp: string;
    action: string;
    resource_type: string;
    resource_id: string;
    user: string;
    details: string;
}

export interface Vulnerability {
    id: number;
    machine_id: string;
    software_name: string;
    software_version: string;
    cve_id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string | null;
    published_date: string | null;
    last_checked: string | null;
    status: 'open' | 'acknowledged' | 'patched';
}

export interface DashboardStats {
    total_machines: number;
    online_machines: number;
    total_ram_gb: number;
    total_storage_gb: number;
    avg_cpu_usage: number;
    avg_ram_usage_percent: number;
    total_policies: number;
    active_policies: number;
}

export interface ComparisonResult {
    machine_a: Machine;
    machine_b: Machine;
    diff_software: string[];
    diff_policies: string[];
}