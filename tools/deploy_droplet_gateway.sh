#!/usr/bin/env bash
# ==============================================================================
# 🚀 CIVER CLOUD ENTERPRISE — DESPLIEGUE DESATENDIDO EN DROPLET DIGITALOCEAN
# Sistema Operativo Objetivo: Ubuntu 24.04 LTS x86_64
# ==============================================================================

set -euo pipefail

echo "===================================================================="
echo "  CIVER CLOUD ENTERPRISE — DESPLIEGUE CLOUD ALWAYS-ON (DIGITALOCEAN)"
echo "===================================================================="

# 1. Actualización e Instalación de Dependencias Base
echo "[1/6] Instalando dependencias base del sistema..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git ufw jq build-essential

# 2. Instalación de Node.js 20.x LTS
if ! command -v node &>/dev/null; then
    echo "[2/6] Instalando Node.js 20.x LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "[2/6] Node.js ya está instalado: $(node -v)"
fi

# 3. Preparación del Directorio de la Aplicación
APP_DIR="/opt/civer-app-store"
REPO_URL="https://github.com/nubeplay7/Open-Source-App-Store.git"

echo "[3/6] Sincronizando repositorio en ${APP_DIR}..."
if [ -d "${APP_DIR}/.git" ]; then
    cd "${APP_DIR}"
    git fetch origin main
    git reset --hard origin/main
else
    git clone "${REPO_URL}" "${APP_DIR}"
    cd "${APP_DIR}"
fi

npm install --production=false
npm run build

# 4. Creación del Servicio Systemd para la API Gateway Always-On
echo "[4/6] Configurando servicio systemd 'civer-gateway'..."
cat << 'EOF' > /etc/systemd/system/civer-gateway.service
[Unit]
Description=Civer Cloud Always-On API Gateway & Sentinel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/civer-app-store
ExecStart=/usr/bin/npx tsx server/cloud_always_on_daemon.ts
Restart=always
RestartSec=5
Environment=PORT=3080
Environment=NODE_ENV=production
Environment=NODE_ROLE=DIGITALOCEAN_PERMANENT_GATEWAY

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable civer-gateway
systemctl restart civer-gateway

# 5. Instalación de Cloudflared (Argo Tunnel)
if ! command -v cloudflared &>/dev/null; then
    echo "[5/6] Instalando demonio cloudflared..."
    curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
    dpkg -i /tmp/cloudflared.deb
    rm -f /tmp/cloudflared.deb
else
    echo "[5/6] cloudflared ya está instalado."
fi

# 6. Verificación de Salud
echo "[6/6] Verificando salud del gateway..."
sleep 3
if curl -s http://127.0.0.1:3080/api/health | jq . ; then
    echo "===================================================================="
    echo "✅ DESPLIEGUE COMPLETADO: Civer Cloud Gateway 100% ACTIVO 24/7"
    echo "===================================================================="
else
    echo "⚠️ Advertencia: El gateway local aún no responde en puerto 3080."
fi
