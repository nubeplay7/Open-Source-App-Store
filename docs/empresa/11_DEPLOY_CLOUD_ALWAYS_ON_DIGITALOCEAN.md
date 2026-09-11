# 11. DESPLIEGUE CLOUD ALWAYS-ON (DIGITALOCEAN + CLOUDFLARE + FAILOVER AUTOMÁTICO)

> **Estado**: Producción / Despliegue de Resiliencia  
> **Arquitectura**: Multi-Cluster Híbrido con Edge Routing  
> **Objetivo**: Disponibilidad 99.999% de Civer App Store ("La Play Store Open Source, Tu trabajo en línea que sí paga") independiente del estado eléctrico o de red de los nodos locales.

---

## 1. Visión y Topología de Red Global

Para garantizar que el catálogo, los binarios APK, el backend de tareas remuneradas y los canales de pago Lightning/SPEI permanezcan siempre en línea, se implementa una arquitectura en tres capas:

```
[ Usuario Web / Móvil ]
           │
           ▼ (HTTPS / DNS Anycast)
[ Cloudflare Global Edge Network ]
   ├─ WAF Rules & DDoS Protection
   ├─ SSL Strict Mode (certificados de borde automáticos)
   ├─ CNAME Flattening (civer.cloud, bene.civer.cloud, store.civer.cloud)
   │
   ├─► [ Cloudflare Tunnel Daemon (cloudflared) ]
   │         │
   │         ▼
   ├─► [ DigitalOcean Droplet "civer-cloud-gateway-fra1" ]
   │         ├─ IP Pública Reservada (Floating IP)
   │         ├─ Nginx 1.26 Reverse Proxy con SSL y Cache HTTP
   │         ├─ Node.js / TypeScript Gateway (`cloud_always_on_daemon.ts` :3080)
   │         ├─ Cache local de Manifiestos FOSS e Índices de Aplicaciones
   │         ├─ Base de datos de Réplica SQLite / Drizzle
   │         └─ Cola de Tareas en Espera (Work Marketplace Queue)
   │
   └─► [ Failover Mesh vía Tailscale VPN ]
             ├─ Nodo Primario Local: ASUS Zephyrus Master (:3000)
             ├─ Nodo Secundario Local: ThinkPad T480s DiscoveryWeb (:8766)
             └─ Dispositivos de Prueba: Samsung Galaxy A06 (USB ADB / Shizuku)
```

---

## 2. Especificación Técnica del Droplet DigitalOcean

| Parámetro | Valor de Configuración |
| :--- | :--- |
| **Región** | FRA1 (Frankfurt) o NYC3 con latencia balanceada |
| **Plan / Sizing** | Basic Droplet - 2 vCPU, 4GB RAM, 80GB NVMe SSD |
| **Sistema Operativo**| Ubuntu 24.04 LTS (Noble Numbat x86_64) |
| **Red Privada** | VPC Privada con cortafuegos cloud (`civer-firewall-prod`) |
| **Seguridad SSH** | Exclusivo llaves Ed25519; `PasswordAuthentication no` |
| **Floating IP** | Asignación estática con failover programático |

---

## 3. Componentes del Servidor Always-On

### A. Servicio Gateway (`civer-gateway.service`)
Gestionado mediante `systemd`, se encarga de:
1. Exponer `/api/health` para verificaciones de canario a nivel mundial.
2. Servir `/api/cluster/health` reflejando la telemetría en tiempo real de ASUS Master, ThinkPad, DiscoveryWeb y hardware Samsung A06.
3. Servir `/api/v1/ota/manifest.json` para que las aplicaciones instaladas en móviles puedan auto-actualizarse sin depender de Google Play Store.
4. Despachar las tareas de testing de Civer Work a los usuarios conectados y registrar los reportes de bugs.

### B. Cloudflare Tunnel Ingress
Túnel bidireccional cifrado que no requiere abrir puertos 80/443 de cara pública directa al firewall:
```yaml
tunnel: civer-cloud-matrix-tunnel
credentials-file: /etc/cloudflared/cert.json
ingress:
  - hostname: civer.cloud
    service: http://localhost:3080
  - hostname: bene.civer.cloud
    service: http://localhost:3080
  - hostname: store.civer.cloud
    service: http://localhost:3080
  - service: http_status:404
```

### C. Nginx Reverse Proxy y Amortiguador de Caídas
Si el nodo local pierde conexión residencial o suministro eléctrico:
1. El Droplet en DigitalOcean retiene las solicitudes entrantes en memoria.
2. Sirve las aplicaciones desde su CDN distribuido y cache de objetos S3/Spaces.
3. Pone en cola las compilaciones de APKs pendientes hasta que el worker de Kaggle o el cluster local emita su latido de reanudación.

---

## 4. Pipeline de Despliegue Automatizado

El despliegue se ejecuta desatendido mediante el script `tools/deploy_droplet_gateway.sh`:
```bash
# Ejecución en el Droplet
chmod +x tools/deploy_droplet_gateway.sh
sudo ./tools/deploy_droplet_gateway.sh
```

---

## 5. Matriz de Monitoreo Canario Continuo (SLA 99.999%)

El script `tools/health_canary_daemon.cjs` evalúa permanentemente:
1. **Canary 1: Edge DNS y Cloudflare HTTP (200 OK)**.
2. **Canary 2: Droplet DigitalOcean API Gateway (latencia < 80ms)**.
3. **Canary 3: Túnel Mesh Tailscale entre nodos**.
4. **Canary 4: Motor de Tareas de Civer Work (sincronización de saldos)**.
5. **Canary 5: Servidor de descargas de APKs (validación SHA-256)**.
6. **Canary 6: Pasarela Lightning / SPEI (tiempo de resolución de facturas)**.
