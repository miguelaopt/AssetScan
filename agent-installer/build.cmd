@echo off
echo [1/3] A compilar o Agente Rust em Modo Release...
cd ..\agent
cargo build --release
cd ..\agent-installer

echo [2/3] A compilar o ficheiro WXS...
wix build Product.wxs -o AssetScanAgent.msi

echo [3/3] Sucesso! Instalador gerado: AssetScanAgent.msi
pause