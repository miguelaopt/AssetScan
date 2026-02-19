# AssetScan v2.0 — Páginas Finais + Documentação de Instalação

## Páginas Restantes

### `dashboard/src/pages/MachineDetail.tsx`

```tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Cpu, HardDrive, Activity } from "lucide-react";
import { useMachines } from "../hooks/useMachines";

interface ProcessInfo {
  id: number;
  pid: number;
  name: string;
  exe_path: string;
  memory_mb: number;
  cpu_percent: number;
  captured_at: string;
}

export default function MachineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { machines } = useMachines();
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [tab, setTab] = useState<"hardware" | "software" | "processes">("hardware");

  const machine = machines.find((m) => m.machine_id === id);

  useEffect(() => {
    if (machine) {
      document.title = `${machine.custom_name || machine.hostname} - AssetScan`;
      loadProcesses();
    }
  }, [machine]);

  const loadProcesses = async () => {
    if (!id) return;
    try {
      const result = await invoke<ProcessInfo[]>("get_processes", { machineId: id });
      setProcesses(result);
    } catch (err) {
      console.error("Error loading processes:", err);
    }
  };

  if (!machine) {
    return <div className="text-slate-400">Máquina não encontrada</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/machines")}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {machine.custom_name || machine.hostname}
          </h1>
          <p className="text-slate-400">{machine.os_name} {machine.os_version}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Cpu} label="CPU" value={`${machine.cpu_cores} núcleos`} />
        <StatCard
          icon={HardDrive}
          label="RAM"
          value={`${(machine.ram_total_mb / 1024).toFixed(1)} GB`}
        />
        <StatCard icon={Activity} label="Software" value={`${machine.software_count}`} />
        <StatCard icon={Activity} label="Processos" value={`${machine.process_count}`} />
      </div>

      <div className="flex gap-2 border-b border-slate-700">
        {["hardware", "software", "processes"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t === "hardware" ? "🖥️ Hardware" : t === "software" ? "📦 Software" : "⚡ Processos"}
          </button>
        ))}
      </div>

      {tab === "processes" && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-left p-3 text-sm font-semibold text-slate-300">PID</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-300">Nome</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-300">Caminho</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-300">RAM (MB)</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-300">CPU %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {processes.slice(0, 50).map((proc) => (
                <tr key={proc.id} className="hover:bg-slate-700/50">
                  <td className="p-3 text-sm text-slate-400">{proc.pid}</td>
                  <td className="p-3 text-sm text-white font-medium">{proc.name}</td>
                  <td className="p-3 text-xs text-slate-500 font-mono truncate max-w-xs">
                    {proc.exe_path}
                  </td>
                  <td className="p-3 text-sm text-slate-300 text-right">
                    {proc.memory_mb.toFixed(1)}
                  </td>
                  <td className="p-3 text-sm text-slate-300 text-right">
                    {proc.cpu_percent.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-blue-500" />
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-lg font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
```

---

### `dashboard/src/pages/Audit.tsx`

```tsx
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FileText } from "lucide-react";

interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  resource_type: string;
  resource_id: string;
  user: string;
  details: string;
}

export default function Audit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    document.title = "Auditoria - AssetScan";
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const result = await invoke<AuditLog[]>("get_audit_logs", { limit: 100 });
      setLogs(result);
    } catch (err) {
      console.error("Error loading logs:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Logs de Auditoria</h1>
        <p className="text-slate-400">{logs.length} entrada(s) recentes</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-slate-300">Timestamp</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-300">Ação</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-300">Recurso</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-300">Utilizador</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-300">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-700/50">
                <td className="p-4 text-sm text-slate-400">
                  {new Date(log.timestamp).toLocaleString("pt-PT")}
                </td>
                <td className="p-4 text-sm text-white font-medium">{log.action}</td>
                <td className="p-4 text-xs text-slate-400">
                  {log.resource_type} / {log.resource_id.substring(0, 8)}...
                </td>
                <td className="p-4 text-sm text-slate-300">{log.user}</td>
                <td className="p-4 text-sm text-slate-400">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

### `dashboard/src/pages/Settings.tsx`

```tsx
import { useEffect } from "react";
import { Settings as SettingsIcon, Key } from "lucide-react";

export default function Settings() {
  useEffect(() => {
    document.title = "Configurações - AssetScan";
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-slate-400">Gerir configurações do sistema</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">API Keys</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          As API Keys são geradas automaticamente na primeira execução.
          Consulte os logs do terminal para obter a chave.
        </p>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <code className="text-sm text-slate-300 font-mono">
            Verifique o terminal do dashboard para ver a API Key gerada.
          </code>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informação do Sistema</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">Versão</dt>
            <dd className="text-white font-mono">2.0.0</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Porta HTTP</dt>
            <dd className="text-white font-mono">7474</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Base de Dados</dt>
            <dd className="text-white font-mono">SQLite (local)</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
```

---

## 📖 DOCUMENTAÇÃO DE INSTALAÇÃO COMPLETA

### `docs/INSTALL_DASHBOARD.md`

```markdown
# Instalação do AssetScan Dashboard v2.0

## Pré-requisitos

### Windows 10/11 (64-bit)
- **Rust**: 1.75 ou superior
- **Node.js**: 20.x LTS
- **Visual Studio Build Tools**: Desktop development with C++
- **WebView2**: Já incluído no Windows 10/11

---

## Instalação Passo a Passo

### 1. Instalar Rust

```powershell
# Baixar e instalar
Invoke-WebRequest -Uri https://win.rustup.rs -OutFile rustup-init.exe
.\rustup-init.exe

# Verificar
rustc --version
cargo --version
```

### 2. Instalar Node.js

Baixe o instalador LTS em: https://nodejs.org

```powershell
# Verificar
node --version
npm --version
```

### 3. Clonar o Repositório

```powershell
git clone https://github.com/miguelaopt/AssetScan.git
cd AssetScan/dashboard
```

### 4. Instalar Dependências

```powershell
npm install
```

### 5. Configurar Tailwind CSS

```powershell
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

### 6. Executar em Modo Desenvolvimento

```powershell
npm run tauri dev
```

Na primeira execução, a **API Key** será gerada e exibida no terminal:
```
[Setup] API Key gerada:
        ask_a1b2c3d4e5f6...
        Guarde esta chave! Necessária para os agentes.
```

**IMPORTANTE**: Copie e guarde esta chave — será necessária para configurar os agentes.

### 7. Compilar para Produção

```powershell
npm run tauri build
```

O instalador será gerado em:
```
dashboard/src-tauri/target/release/bundle/
├── nsis/AssetScan_2.0.0_x64-setup.exe
└── msi/AssetScan_2.0.0_x64_en-US.msi
```

Execute o `.exe` ou `.msi` para instalar o dashboard.

---

## Configuração

### Porta do Servidor

O dashboard escuta na **porta 7474** por padrão. Para alterar:

Edite `dashboard/src-tauri/src/server.rs`:
```rust
let listener = tokio::net::TcpListener::bind("0.0.0.0:7474") // Altere aqui
```

### Firewall

Certifique-se de que a porta 7474 está aberta no firewall:

```powershell
New-NetFirewallRule `
    -DisplayName "AssetScan Dashboard" `
    -Direction Inbound `
    -LocalPort 7474 `
    -Protocol TCP `
    -Action Allow
```

---

## Resolução de Problemas

### Erro: "cargo was not found"
Reinicie o terminal após instalar o Rust.

### Erro: "failed to run custom build command"
Instale o Visual Studio Build Tools com "Desktop development with C++".

### Erro: "Port 7474 already in use"
Outra aplicação está a usar a porta. Feche-a ou altere a porta no código.

---

## Próximos Passos

Após instalar o dashboard, consulte `INSTALL_AGENT.md` para instalar o agente nas máquinas dos clientes.
```

---

### `docs/INSTALL_AGENT.md`

```markdown
# Instalação do AssetScan Agent v2.0

## Pré-requisitos

- Windows 10/11 (64-bit)
- Privilégios de Administrador
- API Key do Dashboard
- IP do servidor do Dashboard

---

## Método 1: Script PowerShell (Recomendado)

### 1. Compilar o Agente

No PC de desenvolvimento:

```powershell
cd AssetScan/agent
cargo build --release
```

O executável fica em: `agent/target/release/assetscan-agent.exe`

### 2. Copiar para o PC Cliente

Copie `assetscan-agent.exe` e `install.ps1` para uma pasta temporária no cliente.

### 3. Executar o Instalador

No PC cliente (como Administrador):

```powershell
.\install.ps1 `
    -ServerURL "http://192.168.1.100:7474" `
    -APIKey "ask_sua_api_key_aqui" `
    -IntervalMinutes 60
```

**Parâmetros**:
- `ServerURL`: Endereço do Dashboard (IP ou hostname)
- `APIKey`: Chave gerada pelo Dashboard
- `IntervalMinutes`: Intervalo entre coletas (padrão: 60)
- `-DisableEnforcement`: (Opcional) Desativa enforcement de políticas

### 4. Verificar Instalação

```powershell
# Verificar serviço
Get-Service AssetScanAgent

# Ver logs (se houver)
Get-Content "C:\ProgramData\AssetScan\blocked_apps.log"
```

---

## Método 2: Instalação Manual

### 1. Criar Pasta de Instalação

```powershell
New-Item -ItemType Directory -Path "C:\Program Files\AssetScan" -Force
```

### 2. Copiar Executável

```powershell
Copy-Item "assetscan-agent.exe" -Destination "C:\Program Files\AssetScan\"
```

### 3. Configurar no Registry

```powershell
$RegPath = "HKLM:\SOFTWARE\AssetScan\Config"
New-Item -Path $RegPath -Force

Set-ItemProperty -Path $RegPath -Name "ServerURL" -Value "http://192.168.1.100:7474"
Set-ItemProperty -Path $RegPath -Name "APIKey" -Value "sua_api_key"
Set-ItemProperty -Path $RegPath -Name "IntervalMinutes" -Value 60 -Type DWord
Set-ItemProperty -Path $RegPath -Name "EnforcementEnabled" -Value 1 -Type DWord
```

### 4. Criar Serviço Windows

```powershell
New-Service `
    -Name "AssetScanAgent" `
    -DisplayName "AssetScan Agent" `
    -Description "Agente de monitorização AssetScan" `
    -BinaryPathName "C:\Program Files\AssetScan\assetscan-agent.exe" `
    -StartupType Automatic

Start-Service AssetScanAgent
```

---

## Desinstalação

```powershell
# Parar e remover serviço
Stop-Service AssetScanAgent
sc.exe delete AssetScanAgent

# Remover ficheiros
Remove-Item "C:\Program Files\AssetScan" -Recurse -Force

# Remover configuração
Remove-Item "HKLM:\SOFTWARE\AssetScan" -Recurse -Force
```

---

## Resolução de Problemas

### Agente não aparece no Dashboard

1. Verificar conectividade:
```powershell
Test-NetConnection -ComputerName 192.168.1.100 -Port 7474
```

2. Verificar API Key no Registry

3. Ver logs do serviço:
```powershell
Get-EventLog -LogName Application -Source AssetScanAgent -Newest 10
```

### Erro "Access Denied"

O agente requer privilégios de Administrador para:
- Terminar processos
- Modificar o ficheiro hosts
- Ler o Registry completo

Execute o instalador como Administrador.
```

---

*Todos os ficheiros de código e documentação foram criados. Consulte os ficheiros markdown gerados para implementação completa.*
