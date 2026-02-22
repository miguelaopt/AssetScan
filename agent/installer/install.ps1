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

# 4. Criar Tarefa Agendada (Em vez de Servico)
Write-Host "[4/5] Criando Tarefa Agendada invisivel em background..." -ForegroundColor Yellow

$TaskName = "AssetScanAgent"
$TaskPath = "$InstallPath\assetscan-agent.exe"

# Remove a tarefa antiga se já existir
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Configura a nova tarefa para iniciar com o Windows (como SYSTEM / Administrador)
$Action = New-ScheduledTaskAction -Execute $TaskPath
$Trigger = New-ScheduledTaskTrigger -AtStartup
$Principal = New-ScheduledTaskPrincipal -UserId "NT AUTHORITY\SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit 0

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Force | Out-Null

# 5. Iniciar
Write-Host "[5/5] A iniciar o Agente AssetScan..." -ForegroundColor Yellow
Start-ScheduledTask -TaskName $TaskName

Write-Host "`n[SUCESSO] Agente instalado e a correr em background!" -ForegroundColor Green