#!/usr/bin/env bash
# ==============================================================================
# AetherHost - Automatisches Installations-Skript für Linux Server
# Repository: https://github.com/opensmp6-creator/Aether-Host
# Geeignet für: Ubuntu 22.04 / 24.04, Debian 11 / 12, AlmaLinux 9
# ==============================================================================

set -e

echo "=================================================================="
echo "   AetherHost Cloud Dashboard - Automatische Server-Installation   "
echo "=================================================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "[FEHLER] Bitte führe dieses Skript als root aus (sudo bash install.sh)."
  exit 1
fi

echo "[1/5] Aktualisiere Paketquellen..."
apt-get update -y || yum update -y

echo "[2/5] Installiere Node.js 22 LTS, Git, Curl..."
if command -v apt-get &> /dev/null; then
  apt-get install -y curl git ufw
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
else
  curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
  yum install -y nodejs git curl
fi

echo "[3/5] Installiere Abhängigkeiten und baue Production Assets..."
cd "$(dirname "$0")"
npm install
npm run build

echo "[4/5] Richte Systemd Dienst 'aetherhost.service' ein..."
cat <<EOF > /etc/systemd/system/aetherhost.service
[Unit]
Description=AetherHost Cloud Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$(pwd)
ExecStart=$(which npx) tsx server.ts
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable aetherhost.service
systemctl restart aetherhost.service

echo "[5/5] Öffne Firewall Port 3000..."
if command -v ufw &> /dev/null; then
  ufw allow 3000/tcp || true
fi

SERVER_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

echo "=================================================================="
echo " [ERFOLG] AetherHost wurde erfolgreich auf deinem Server installiert!"
echo " Das Dashboard ist jetzt erreichbar unter:"
echo " -> http://${SERVER_IP}:3000"
echo "=================================================================="
