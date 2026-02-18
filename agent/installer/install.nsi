# ============================================================
# AssetScan Agent - Script de Instalação
# Requer privilégios de Administrador
# ============================================================

#Requires -RunAsAdministrator

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerURL,
    
    [Parameter(Mandatory=$true)]
    [string]$APIKey,
    
    [int]$IntervalMinutes = 60,
    
    [switch]$DisableEnforcement
)

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  AssetScan Agent v2.0 - Instalação" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Criar pasta de instalação
$InstallPath = "C:\Program Files\AssetScan"
Write-Host "[1/5] Criando pasta de instalação..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null

# 2. Copiar executável
Write-Host "[2/5] Copiando ficheiros..." -ForegroundColor Yellow
Copy-Item "assetscan-agent.exe" -Destination "$InstallPath\assetscan-agent.exe" -Force

# 3. Salvar configuração no Registry
Write-Host "[3/5] Configurando..." -ForegroundColor Yellow
$RegPath = "HKLM:\SOFTWARE\AssetScan\Config"
New-Item -Path $RegPath -Force | Out-Null

Set-ItemProperty -Path $RegPath -Name "ServerURL" -Value $ServerURL
Set-ItemProperty -Path $RegPath -Name "APIKey" -Value $APIKey
Set-ItemProperty -Path $RegPath -Name "IntervalMinutes" -Value $IntervalMinutes -Type DWord
Set-ItemProperty -Path $RegPath -Name "EnforcementEnabled" -Value $(if ($DisableEnforcement) { 0 } else { 1 }) -Type DWord

# 4. Criar serviço Windows
Write-Host "[4/5] Criando serviço..." -ForegroundColor Yellow

$ServiceName = "AssetScanAgent"
$ServiceDisplayName = "AssetScan Agent"
$ServiceDescription = "Agente de monitorização e segurança AssetScan"
$ServicePath = "$InstallPath\assetscan-agent.exe"

# Remove serviço se já existir
if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
    Stop-Service -Name $ServiceName -Force
    sc.exe delete $ServiceName
    Start-Sleep -Seconds 2
}

# Cria novo serviço
New-Service `
    -Name $ServiceName `
    -DisplayName $ServiceDisplayName `
    -Description $ServiceDescription `
    -BinaryPathName $ServicePath `
    -StartupType Automatic `
    | Out-Null

# 5. Iniciar serviço
Write-Host "[5/5] Iniciando serviço..." -ForegroundColor Yellow
Start-Service -Name $ServiceName

Write-Host ""
Write-Host "✓ Instalação concluída com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuração:" -ForegroundColor Cyan
Write-Host "  Servidor: $ServerURL"
Write-Host "  Intervalo: $IntervalMinutes minutos"
Write-Host "  Enforcement: $(if ($DisableEnforcement) { 'Desactivado' } else { 'Activado' })"
Write-Host ""
Write-Host "O serviço 'AssetScan Agent' está agora em execução." -ForegroundColor Green
Write-Host "Para verificar: Get-Service AssetScanAgent" -ForegroundColor Gray