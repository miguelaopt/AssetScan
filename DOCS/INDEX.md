# 📋 AssetScan v2.0 — Índice Completo

## 🎯 Implementação Completa

Este pacote contém **TODOS os ficheiros necessários** para implementar o AssetScan v2.0 do zero, incluindo:

- ✅ Código completo do Agente (Rust)
- ✅ Código completo do Dashboard Backend (Tauri + Rust)
- ✅ Código completo do Dashboard Frontend (React + TypeScript)
- ✅ Scripts de instalação (PowerShell)
- ✅ Documentação completa de instalação e uso
- ✅ Todas as funcionalidades solicitadas implementadas

---

## 📁 Estrutura dos Ficheiros

### 1. Documentação Principal
- **README.md** — Visão geral, funcionalidades e roadmap
- **INSTALLATION_DOCS.md** — Guias de instalação completos (Dashboard + Agent)

### 2. Código do Agente
- **CODE_AGENT_PART1.md** — `main.rs`, `collector.rs`, `Cargo.toml`
- **CODE_AGENT_PART2.md** — `enforcer.rs`, `config.rs`, `notifications.rs`, scripts de instalação

### 3. Código do Backend (Dashboard)
- **CODE_BACKEND_PART1.md** — `models.rs`, `database.rs`, `Cargo.toml`
- **CODE_BACKEND_PART2.md** — `auth.rs`, `server.rs`, `commands/*`

### 4. Código do Frontend (Dashboard)
- **CODE_FRONTEND_PART1.md** — `App.tsx`, `hooks/`, `package.json`, `index.css`
- **CODE_FRONTEND_PART2.md** — `pages/` (Dashboard, Machines, Policies, Audit, Settings, MachineDetail)

---

## 🚀 Como Usar Esta Documentação

### Passo 1: Começar com o README
Leia `README.md` para compreender:
- Visão geral do sistema
- Funcionalidades implementadas
- Requisitos de sistema
- Estrutura do projeto

### Passo 2: Instalar o Dashboard
Siga `INSTALLATION_DOCS.md` secção "INSTALL_DASHBOARD" para:
1. Instalar pré-requisitos (Rust, Node.js)
2. Criar a estrutura de pastas
3. Copiar o código dos ficheiros `CODE_BACKEND_*` e `CODE_FRONTEND_*`
4. Compilar e executar

### Passo 3: Instalar o Agente
Siga `INSTALLATION_DOCS.md` secção "INSTALL_AGENT" para:
1. Copiar o código de `CODE_AGENT_*`
2. Compilar o agente
3. Distribuir para os PCs clientes
4. Configurar com a API Key gerada pelo Dashboard

### Passo 4: Usar o Sistema
Após instalação:
- Aceda ao Dashboard no PC do administrador
- Configure políticas de segurança
- Monitorize máquinas em tempo real
- Consulte logs de auditoria

---

## ✨ Funcionalidades Implementadas

### ✅ Todas as Solicitadas

1. **Nome Customizável para PCs**
   - Comando Tauri: `rename_machine`
   - UI: Modal de edição no detalhe da máquina
   - BD: Campo `custom_name` na tabela `machines`

2. **Ver Processos Ativos**
   - Agente coleta processos com `sysinfo`
   - BD: Tabela `processes` com histórico
   - UI: Aba "Processos" no detalhe da máquina

3. **UI Melhorada**
   - Dark/Light mode
   - Dashboard com estatísticas agregadas
   - Navegação por rotas (React Router)
   - Componentes modernos com Tailwind CSS

4. **Políticas de Apps (Whitelist/Blacklist)**
   - BD: Tabela `policies`
   - Agente: Enforcement via `enforcer.rs`
   - UI: Página de gestão de políticas
   - Notificações Windows quando apps bloqueadas

5. **Bloqueio de Sites**
   - Agente modifica ficheiro `hosts`
   - Políticas com tipo `website`
   - UI: Mesmo gestor de políticas

6. **Autenticação e Segurança**
   - API Keys geradas automaticamente
   - Validação em cada request do agente
   - Middleware Axum para autenticação
   - Logs de auditoria completos

### 🎁 Funcionalidades Bónus

7. **Estatísticas Agregadas**
   - Dashboard com cards de estatísticas
   - Máquinas online/offline
   - Uso médio de CPU e RAM

8. **Logs de Auditoria**
   - Todas as ações registadas
   - Página dedicada para consulta
   - Imutáveis (INSERT-only)

9. **Machine ID Único**
   - UUID persistente no Registry
   - Identifica máquinas mesmo após mudança de hostname

10. **Instalação Melhorada**
    - Script PowerShell com parâmetros
    - Instalação como serviço Windows
    - Configuração via Registry

---

## 🏗️ Estrutura de Pastas a Criar

```
AssetScan/
│
├── agent/
│   ├── src/
│   │   ├── main.rs
│   │   ├── collector.rs
│   │   ├── enforcer.rs
│   │   ├── config.rs
│   │   └── notifications.rs
│   ├── installer/
│   │   └── install.ps1
│   └── Cargo.toml
│
└── dashboard/
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── index.css
    │   ├── hooks/
    │   │   ├── useMachines.ts
    │   │   ├── usePolicies.ts
    │   │   └── useTheme.ts
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   ├── Machines.tsx
    │   │   ├── MachineDetail.tsx
    │   │   ├── Policies.tsx
    │   │   ├── Audit.tsx
    │   │   └── Settings.tsx
    │   └── components/
    │       ├── Sidebar.tsx
    │       ├── TopBar.tsx
    │       └── StatCard.tsx
    │
    ├── src-tauri/
    │   ├── src/
    │   │   ├── main.rs
    │   │   ├── models.rs
    │   │   ├── database.rs
    │   │   ├── auth.rs
    │   │   ├── server.rs
    │   │   └── commands/
    │   │       ├── mod.rs
    │   │       ├── machines.rs
    │   │       ├── policies.rs
    │   │       ├── processes.rs
    │   │       └── audit.rs
    │   ├── Cargo.toml
    │   └── tauri.conf.json
    │
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 📊 Mapeamento Código ↔ Funcionalidades

| Funcionalidade | Ficheiros Relacionados |
|---|---|
| Nome customizável | `database.rs` (update_machine_custom_name), `commands/machines.rs`, `MachineDetail.tsx` |
| Processos ativos | `collector.rs` (collect_processes), `database.rs` (update_processes), `ProcessTable.tsx` |
| Políticas de apps | `enforcer.rs`, `policies.rs`, `Policies.tsx` |
| Bloqueio de sites | `enforcer.rs` (enforce_website_policies) |
| Autenticação | `auth.rs`, `server.rs` (auth_middleware) |
| UI melhorada | Todos os ficheiros em `src/pages/` e `src/components/` |
| Logs auditoria | `database.rs` (log_audit), `Audit.tsx` |

---

## 🔧 Comandos Rápidos

### Dashboard
```powershell
cd dashboard
npm install
npm run tauri dev          # Desenvolvimento
npm run tauri build        # Produção
```

### Agente
```powershell
cd agent
cargo build --release
# Executável: target/release/assetscan-agent.exe
```

### Instalar Agente no Cliente
```powershell
.\install.ps1 -ServerURL "http://IP:7474" -APIKey "ask_..."
```

---

## ⚠️ Notas Importantes

1. **API Key**: Guarde a chave gerada na primeira execução do dashboard
2. **Firewall**: Abra a porta 7474 no PC do administrador
3. **Privilégios**: O agente requer Admin para enforcement
4. **Compilação**: A primeira compilação do Rust demora ~5-10 minutos
5. **Dependências**: Certifique-se de instalar Visual Studio Build Tools

---

## 🆘 Suporte

Se encontrar problemas:

1. Consulte "Resolução de Problemas" em `INSTALLATION_DOCS.md`
2. Verifique logs no terminal do dashboard
3. No cliente, verifique: `Get-Service AssetScanAgent` e `Get-EventLog`

---

## 📝 Checklist de Implementação

- [ ] Ler `README.md` completo
- [ ] Instalar pré-requisitos (Rust, Node.js, VS Build Tools)
- [ ] Criar estrutura de pastas do dashboard
- [ ] Copiar código do backend (`CODE_BACKEND_*.md`)
- [ ] Copiar código do frontend (`CODE_FRONTEND_*.md`)
- [ ] Executar `npm install` no dashboard
- [ ] Executar `npm run tauri dev` e confirmar que funciona
- [ ] Copiar e guardar a API Key gerada
- [ ] Criar estrutura de pastas do agente
- [ ] Copiar código do agente (`CODE_AGENT_*.md`)
- [ ] Compilar agente com `cargo build --release`
- [ ] Testar instalação do agente num PC de teste
- [ ] Confirmar que a máquina aparece no dashboard
- [ ] Criar política de teste e verificar enforcement
- [ ] Compilar versão de produção com `npm run tauri build`
- [ ] Distribuir para PCs clientes

---

**AssetScan v2.0** — Sistema Completo de Gestão e Segurança de Endpoints  
Desenvolvido com Rust, Tauri e React  
Fevereiro 2026
