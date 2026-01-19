#!/bin/bash

#################################################################
# 🦖 Gaming Control Panel - Remote Installer
# Pterodactyl installer'a benzer tek komut kurulum
#################################################################

set -euo pipefail

INSTALLER_URL="https://raw.githubusercontent.com/mwlih28-gif/Cursor-Pterodactyl/main/install.sh"
GITHUB_REPO="https://github.com/mwlih28-gif/Cursor-Pterodactyl.git"
INSTALL_DIR="/tmp/gaming-panel-installer"

print_banner() {
    cat << "EOF"
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║          🦖 GAMING CONTROL PANEL - INSTALLER                ║
    ║                                                              ║
    ║          High-Performance Game Server Management            ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
EOF
    echo ""
}

print_banner

echo "🔽 Kurulum scripti indiriliyor..."

# Geçici dizin oluştur
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Installer'ı indir
if command -v curl &> /dev/null; then
    curl -fsSL "$INSTALLER_URL" -o install.sh
elif command -v wget &> /dev/null; then
    wget -q "$INSTALLER_URL" -O install.sh
else
    echo "❌ curl veya wget bulunamadı!"
    exit 1
fi

# Çalıştırılabilir yap
chmod +x install.sh

# Kaynak kodları kopyala (eğer mevcut dizindeyse)
if [[ -d "../backend" ]] && [[ -d "../frontend" ]]; then
    echo "📦 Kaynak kodlar bulundu, kopyalanıyor..."
    mkdir -p source
    cp -r ../backend ../frontend ../daemon source/ 2>/dev/null || true
fi

# Kurulumu başlat
echo "🚀 Kurulum başlatılıyor..."
echo ""

exec bash install.sh
