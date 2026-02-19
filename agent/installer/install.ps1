#Requires -RunAsAdministrator

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerURL,
    
    [Parameter(Mandatory=$true)]
    [string]$APIKey,
    
    [int]$IntervalMinutes = 60,
    
    [switch]$DisableEnforcement
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  AssetScan Agent v2.0 - Instalacao" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Criar pasta
$InstallPath = "C:\Program Files\AssetScan"
Write-Host "[1/5] Criando pasta..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null

# 2. Copiar executavel
Write-Host "[2/5] Copiando ficheiros..." -ForegroundColor Yellow
Copy-Item "assetscan-agent.exe" -Destination "$InstallPath\assetscan-agent.exe" -Force

# 3. Configurar Registry
Write-Host "[3/5] Configurando..." -ForegroundColor Yellow
$RegPath = "HKLM:\SOFTWARE\AssetScan\Config"
New-Item -Path $RegPath -Force | Out-Null

Set-ItemProperty -Path $RegPath -Name "ServerURL" -Value $ServerURL
Set-ItemProperty -Path $RegPath -Name "APIKey" -Value $APIKey
Set-ItemProperty -Path $RegPath -Name "IntervalMinutes" -Value $IntervalMinutes -Type DWord
Set-ItemProperty -Path $RegPath -Name "EnforcementEnabled" -Value $(if ($DisableEnforcement) { 0 } else { 1 }) -Type DWord

# 4. Criar servico
Write-Host "[4/5] Criando servico..." -ForegroundColor Yellow

$ServiceName = "AssetScanAgent"
$ServicePath = "$InstallPath\assetscan-agent.exe"

if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
    Stop-Service -Name $ServiceName -Force
    sc.exe delete $ServiceName
    Start-Sleep -Seconds 2
}

New-Service -Name $ServiceName -DisplayName "AssetScan Agent" -Description "Agente AssetScan" -BinaryPathName $ServicePath -StartupType Automatic | Out-Null

# 5. Iniciar
Write-Host "[5/5] Iniciando servico..." -ForegroundColor Yellow
Start-Service -Name $ServiceName

Write-Host ""
Write-Host "Instalacao concluida!" -ForegroundColor Green
Write-Host "Servidor: $ServerURL" -ForegroundColor Cyan
Write-Host "Intervalo: $IntervalMinutes minutos" -ForegroundColor Cyan