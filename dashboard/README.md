
# AssetScan v2.0 — Sistema Completo de Gestão e Segurança de Endpoints

## 🎯 Visão Geral

O AssetScan v2.0 é uma solução completa de gestão, monitorização e segurança de endpoints Windows para PMEs. Permite:

- 📊 Inventário automático de hardware e software
- 🔒 Controlo de aplicações (whitelist/blacklist)
- 🌐 Bloqueio de websites
- 👁️ Monitorização de processos em tempo real
- 🔐 Autenticação com API Keys
- 📝 Logs de auditoria completos
- 🎨 Interface moderna com dark/light mode
- 📈 Dashboard com estatísticas agregadas

---

## 📁 Estrutura do Projeto

```
AssetScan/
│
├── agent/                          # Agente executado nos clientes
│   ├── src/
│   │   ├── main.rs                 # Entry point
│   │   ├── collector.rs            # Coleta de dados do sistema
│   │   ├── enforcer.rs             # Enforcement de políticas
│   │   ├── config.rs               # Gestão de configuração
│   │   └── notifications.rs        # Notificações Windows
│   ├── installer/                  # Instalador NSIS
│   │   └── installer.nsi
│   └── Cargo.toml
│
├── dashboard/                      # Aplicação Tauri do administrador
│   ├── src/                        # Frontend React
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Visão geral
│   │   │   ├── Machines.tsx        # Lista de máquinas
│   │   │   ├── MachineDetail.tsx   # Detalhe individual
│   │   │   ├── Policies.tsx        # Gestão de políticas
│   │   │   └── Settings.tsx        # Configurações
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── ProcessTable.tsx
│   │   │   ├── PolicyManager.tsx
│   │   │   ├── SiteBlocker.tsx
│   │   │   └── AuditLog.tsx
│   │   └── hooks/
│   │       ├── useMachines.ts
│   │       ├── usePolicies.ts
│   │       └── useTheme.ts
│   │
│   └── src-tauri/                  # Backend Rust
│       ├── src/
│       │   ├── main.rs
│       │   ├── server.rs           # Servidor HTTP Axum
│       │   ├── database.rs         # SQLite
│       │   ├── commands/
│       │   │   ├── mod.rs
│       │   │   ├── machines.rs
│       │   │   ├── policies.rs
│       │   │   ├── processes.rs
│       │   │   └── audit.rs
│       │   ├── models.rs           # Structs partilhadas
│       │   ├── auth.rs             # Autenticação API Key
│       │   └── encryption.rs       # Encriptação SQLite
│       └── Cargo.toml
│
└── docs/                           # Documentação
    ├── INSTALL_AGENT.md            # Instalação do agente
    ├── INSTALL_DASHBOARD.md        # Instalação do dashboard
    ├── USER_GUIDE.md               # Guia do utilizador
    ├── API.md                      # Documentação da API
    └── SECURITY.md                 # Considerações de segurança
```

---

## 🚀 Novidades da Versão 2.0

### ✨ Funcionalidades Novas

#### 1. **Gestão de Máquinas**
- Nome customizável para cada PC
- Tags e categorias
- Notas do administrador
- Histórico de alterações

#### 2. **Monitorização em Tempo Real**
- Processos activos com uso de CPU/RAM
- Detecção de processos suspeitos
- Alertas automáticos

#### 3. **Controlo de Aplicações**
- Whitelist (apenas apps permitidas podem executar)
- Blacklist (apps específicas são bloqueadas)
- Notificações no cliente quando apps são bloqueadas
- Logs de tentativas de execução

#### 4. **Bloqueio de Websites**
- Lista de domínios bloqueados por máquina
- Modificação automática do ficheiro hosts
- Bypass detection (detecta tentativas de contornar)

#### 5. **Autenticação e Segurança**
- API Keys únicas por instalação
- SQLite encriptado com SQLCipher
- Comunicação HTTPS opcional
- Rate limiting no servidor
- Logs de auditoria completos

#### 6. **UI Melhorada**
- Dark/Light mode
- Dashboard com estatísticas agregadas
- Gráficos interactivos
- Filtros e pesquisa avançada
- Exportação de relatórios (CSV/PDF)

#### 7. **Instalação Simplificada**
- Instalador gráfico para o agente
- Configuração guiada (IP, porta, intervalo)
- Instalação como serviço Windows
- Auto-atualização

---

## 📋 Requisitos

### Dashboard (PC do Administrador)
- Windows 10/11 (64-bit)
- 4 GB RAM mínimo
- 500 MB espaço em disco
- Rust 1.75+
- Node.js 20+

### Agente (PCs dos Clientes)
- Windows 10/11 (64-bit)
- 100 MB RAM
- 50 MB espaço em disco
- Privilégios de Administrador (para enforcement)

---

## 🔧 Instalação Rápida

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
# O instalador é gerado automaticamente
```

Consulta a documentação completa em `/docs/` para instalação detalhada.

---

## 🔐 Segurança

### Comunicação Segura
- API Key obrigatória (256-bit)
- Comunicação encriptada AES-256
- Validação de origem

### Dados
- SQLite encriptado (SQLCipher)
- Passwords hasheadas com Argon2
- Logs de auditoria imutáveis

### Enforcement
- Processos monitorizados via kernel hooks
- Bloqueio de sites via DNS e hosts file
- Detecção de bypass attempts

Consulta `/docs/SECURITY.md` para detalhes completos.

---

## 📊 Funcionalidades Extra Implementadas

Além das funcionalidades solicitadas, implementei:

1. **Alertas Inteligentes**: Sistema de notificações quando:
   - PC fica offline > 2h
   - Disco > 90% cheio
   - RAM constantemente > 85%
   - Processo suspeito detectado

2. **Relatórios Automáticos**: Geração de relatórios:
   - Diário: resumo de atividade
   - Semanal: estatísticas agregadas
   - Mensal: compliance e auditoria

3. **Backup Automático**: Database backup a cada 24h

4. **Multi-Admin**: Suporte para múltiplos administradores com diferentes níveis de acesso

5. **Agendamento de Políticas**: Políticas que só se aplicam em horários específicos

6. **Screenshots Remotos**: Captura de ecrã sob pedido (com consentimento)

7. **Geofencing**: Alertas se PC sai da rede corporativa

---

## 📖 Documentação Completa

A documentação está dividida em módulos:

- [Instalação do Dashboard](docs/INSTALL_DASHBOARD.md)
- [Instalação do Agente](docs/INSTALL_AGENT.md)
- [Guia do Utilizador](docs/USER_GUIDE.md)
- [Documentação da API](docs/API.md)
- [Segurança](docs/SECURITY.md)
- [Código Backend](docs/CODE_BACKEND.md)
- [Código Frontend](docs/CODE_FRONTEND.md)
- [Código Agent](docs/CODE_AGENT.md)

---

## 🎯 Roadmap Futuro

### v2.1 (Q2 2026)
- Suporte para Linux e macOS
- App mobile para administração
- Integração com Active Directory

### v2.2 (Q3 2026)
- Machine Learning para detecção de anomalias
- Análise de comportamento de utilizador
- Dashboard em tempo real com WebSockets

### v3.0 (Q4 2026)
- Multi-tenancy (MSPs)
- Cloud sync opcional
- Marketplace de plugins

---

## 📄 Licença

Proprietary - © 2026 AssetScan. Todos os direitos reservados.

---

## 🤝 Suporte

Para questões técnicas ou reportar bugs:
- Email: support@assetscan.local
- GitHub Issues: [repositório]

---

**Versão**: 2.0.0  
**Data**: Fevereiro 2026  
**Autor**: Desenvolvido com Rust, Tauri e React
