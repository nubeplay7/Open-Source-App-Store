# INFRAESTRUCTURA DE CÓMPUTO DISTRIBUIDO SOBERANO — CIVER CLOUD ENTERPRISE

> **Documento Oficial de Capacidad Computacional y Estrategia de Escalamiento**
> **Organización:** Civer Cloud Enterprise
> **Versión:** 1.0.0
> **Fecha:** 11 de Septiembre de 2026
> **Clasificación:** Interno — Directivos y Arquitectura

---

## 1. Resumen Ejecutivo

Civer Cloud Enterprise opera una infraestructura de cómputo distribuido que combina recursos gratuitos, de bajo costo y de escala empresarial para ofrecer **poder de IA ilimitado** a sus usuarios sin que estos necesiten pagar por tokens, GPUs o servidores. La arquitectura se basa en 5 capas de proveedores complementarios con failover automático entre ellos.

**Capacidad total estimada actual:**
- **GPU**: 2-8x NVIDIA T4 (16 GB VRAM cada una) vía pool de cuentas Kaggle
- **CPU**: 64+ vCPUs combinadas entre GitHub Actions, DigitalOcean y Kaggle
- **RAM**: 120+ GB combinados
- **Almacenamiento**: Ilimitado (GitHub Releases CDN + Cloudflare R2)
- **Ancho de banda**: Ilimitado (Cloudflare Anycast global, 330+ ciudades)

---

## 2. Arquitectura de 5 Capas de Cómputo

```plaintext
+====================================================================================================+
|                           CIVER CLOUD COMPUTE MESH — ARQUITECTURA SOBERANA                          |
+====================================================================================================+
|                                                                                                     |
|  [CAPA 1: INFERENCIA IA]  Pool de Cuentas Kaggle (GPU T4 x2 por cuenta, 30 GB RAM)                |
|                           • Rotación automática de cuotas semanales (30h GPU/cuenta)                |
|                           • Modelos servidos: LLaMA 3.1, Mistral, Gemma, DeepSeek V3              |
|                           • Baseten endpoints para inferencia serverless de producción               |
|                           • Fallback local: CPU inference con llama.cpp / ONNX Runtime              |
|                                                                                                     |
|  [CAPA 2: COMPILACIÓN]   GitHub Actions Cloud Runners (Microsoft Azure)                             |
|                           • Ubuntu 24.04, 16 GB RAM, 4 vCPUs por job                               |
|                           • 2,000 minutos/mes gratuitos (repos públicos: ilimitado)                 |
|                           • JDK 17 + Android SDK 35 + Gradle 8.x preinstalado                      |
|                           • Compilación paralela de múltiples APKs simultáneos                      |
|                                                                                                     |
|  [CAPA 3: GATEWAY]       Droplet DigitalOcean (Ubuntu 24.04 LTS Headless)                          |
|                           • $12 USD/mes (2 vCPU, 2 GB RAM, 50 GB SSD)                              |
|                           • Túnel Cloudflare persistente (cloudflared daemon)                        |
|                           • API Gateway: /api/v1/ota, /api/health, /api/v1/compile                 |
|                           • Systemd watchdog inmortal con reinicio automático                       |
|                                                                                                     |
|  [CAPA 4: CDN & EDGE]    Cloudflare Pages + Workers + R2 Storage                                   |
|                           • Red Anycast en 330+ ciudades del mundo                                  |
|                           • Disponibilidad 99.99% SLA garantizado                                  |
|                           • Caché inteligente de PWA y Service Worker                               |
|                           • Workers: lógica de borde para routing y A/B testing                     |
|                                                                                                     |
|  [CAPA 5: MESH LOCAL]    Red Tailscale VPN (ASUS ROG + ThinkPad T480s + Samsung A06)               |
|                           • Conectividad P2P cifrada WireGuard                                      |
|                           • ADB over SSH para despliegue en hardware real                           |
|                           • Compilación local de emergencia / bare-metal fallback                   |
|                                                                                                     |
+====================================================================================================+
```

---

## 3. Pool de GPUs Kaggle — Motor de IA Ilimitada

### 3.1 Especificaciones por Cuenta Kaggle

```plaintext
+-------------------------------------------+---------------------------+
| Recurso                                   | Especificación            |
+-------------------------------------------+---------------------------+
| GPU                                       | 2x NVIDIA Tesla T4        |
| VRAM por GPU                              | 16 GB GDDR6               |
| RAM del Sistema                           | 30 GB                     |
| vCPUs                                     | 4 cores                   |
| Almacenamiento Temporal                   | 70 GB NVMe                |
| Cuota GPU Semanal                         | 30 horas                  |
| Cuota CPU Semanal                         | 30 horas                  |
| Acceso a Internet                         | Sí (con restricciones)    |
| Persistencia de Datos                     | Datasets + Outputs        |
| Framework Preinstalado                    | PyTorch, TensorFlow, JAX  |
+-------------------------------------------+---------------------------+
```

### 3.2 Estrategia de Rotación Multi-Cuenta

El sistema utiliza un pool de cuentas Kaggle registradas legítimamente, cada una con su propia cuota semanal. Un coordinador central (registrado en la Google Sheets "Descarga Intelectual 3") gestiona la rotación:

```plaintext
    Solicitud de inferencia del usuario
                |
                v
    +---------------------------+
    | Coordinador de Cuotas     |
    | (Agent-AIResearcher)      |
    +---------------------------+
                |
    +-----------+-----------+-----------+
    |           |           |           |
    v           v           v           v
  Cuenta A    Cuenta B    Cuenta C    Cuenta N
  (30h/sem)   (30h/sem)   (30h/sem)   (30h/sem)
    |           |           |           |
    +--- Si cuota agotada, rotación automática ---+
                |
                v
    +---------------------------+
    | Fallback: Baseten         |
    | Endpoint Serverless       |
    +---------------------------+
                |
                v
    +---------------------------+
    | Fallback Final: CPU Local |
    | (llama.cpp / ONNX)        |
    +---------------------------+
```

### 3.3 Modelos Disponibles para Usuarios

```plaintext
+---------------------------------------+------------------+------------------+------------------+
| Modelo                                | Parámetros       | VRAM Requerida   | Velocidad (tok/s)|
+---------------------------------------+------------------+------------------+------------------+
| DeepSeek V3 (INT4 Quantized)         | 671B (MoE)       | 2x T4 (32 GB)   | ~8-12 tok/s      |
| LLaMA 3.1 8B Instruct (FP16)        | 8B               | 1x T4 (16 GB)   | ~25-35 tok/s     |
| Mistral 7B v0.3 (FP16)              | 7B               | 1x T4 (16 GB)   | ~30-40 tok/s     |
| Gemma 2 9B (FP16)                    | 9B               | 1x T4 (16 GB)   | ~20-30 tok/s     |
| Whisper Large V3 (Transcripción)     | 1.5B             | 1x T4 (16 GB)   | ~10x real-time   |
| Stable Diffusion XL (Generación)     | 6.6B             | 1x T4 (16 GB)   | ~15s/imagen      |
| CodeLlama 13B (Código)              | 13B              | 2x T4 (32 GB)   | ~15-20 tok/s     |
+---------------------------------------+------------------+------------------+------------------+
```

---

## 4. Baseten — Inferencia Serverless de Producción

### 4.1 Configuración

Baseten actúa como capa de inferencia serverless para cuando las cuentas Kaggle están saturadas o para endpoints que requieren baja latencia (<200ms):

```plaintext
+-------------------------------------------+---------------------------+
| Parámetro                                 | Valor                     |
+-------------------------------------------+---------------------------+
| Tipo de Despliegue                        | Serverless (Scale to 0)   |
| Facturación                               | Por milisegundo de GPU    |
| Modelos Desplegados                       | Mistral 7B, Whisper       |
| Latencia Cold Start                       | ~3-5 segundos             |
| Latencia Warm                             | ~100-200 ms               |
| Autenticación                             | API Key por endpoint      |
| Escalado Máximo                           | Auto (según presupuesto)  |
+-------------------------------------------+---------------------------+
```

### 4.2 Casos de Uso en Civer Cloud

1. **Asistente de Tienda (Chat IA)**: Responde preguntas sobre apps del catálogo en lenguaje natural
2. **Evaluación Heurística Rápida**: Análisis instantáneo de `AndroidManifest.xml` y `build.gradle`
3. **Síntesis de Changelogs**: Genera resúmenes de cambios a partir de commits de GitHub
4. **Detección de Rastreadores por IA**: Complementa el análisis Exodus con inferencia sobre patrones de código

---

## 5. GitHub Actions — Motor de Compilación Cloud

### 5.1 Capacidad y Cuotas

```plaintext
+-------------------------------------------+---------------------------+
| Recurso                                   | Valor (Repos Públicos)    |
+-------------------------------------------+---------------------------+
| Minutos de Ejecución                      | ILIMITADOS                |
| Runners Disponibles                       | ubuntu-latest (24.04)     |
| vCPUs por Job                             | 4 cores (2 cores mínimo)  |
| RAM por Job                               | 16 GB                     |
| Almacenamiento por Job                    | 14 GB SSD                 |
| Jobs Concurrentes                         | 20 (por cuenta gratuita)  |
| Timeout Máximo por Job                    | 6 horas                   |
| Artefactos (Retention)                    | 90 días                   |
+-------------------------------------------+---------------------------+
```

### 5.2 Pipeline de Compilación de APKs

```plaintext
  Usuario presiona "Compilar APK"
            |
            v
  [1] API Gateway (DigitalOcean)
            |
            v
  [2] Dispatch Workflow via GitHub API
      POST /repos/{owner}/{repo}/actions/workflows/{id}/dispatches
            |
            v
  [3] GitHub Runner (Ubuntu 24.04 Cloud)
      • Setup JDK 17 (Temurin)
      • Setup Android SDK 35
      • Restore Gradle Cache
      • ./gradlew assembleRelease
      • Sign APK (apksigner v2+v3)
      • Calculate SHA-256
            |
            v
  [4] Upload a GitHub Releases
      • Tag: v{version}-{timestamp}
      • Asset: app-release.apk
            |
            v
  [5] Notificación Telegram
      Bot @EnviodeApkCompiladaBot envía el .apk al chat del usuario
            |
            v
  [6] Actualizar Manifiesto OTA
      /api/v1/ota/manifest.json
```

---

## 6. DigitalOcean — Gateway Permanente

### 6.1 Especificaciones del Droplet

```plaintext
+-------------------------------------------+---------------------------+
| Parámetro                                 | Valor                     |
+-------------------------------------------+---------------------------+
| Plan                                      | Basic Droplet             |
| Costo Mensual                             | $12 USD                   |
| vCPUs                                     | 2 (Intel Regular)         |
| RAM                                       | 2 GB DDR4                 |
| Almacenamiento                            | 50 GB NVMe SSD            |
| Transferencia Mensual                     | 2 TB                      |
| Sistema Operativo                         | Ubuntu 24.04 LTS          |
| Ubicación                                 | NYC1 / SFO3               |
| IPv4 Público                              | Sí (1 IP fija)            |
| Monitoreo                                 | Integrado (CPU, RAM, Red) |
+-------------------------------------------+---------------------------+
```

### 6.2 Servicios Ejecutándose

1. **cloudflared** (túnel persistente a Cloudflare Edge) — systemd daemon
2. **Node.js API Gateway** (Express/NestJS) — endpoints de salud, OTA, compilación
3. **Caddy/Nginx** (reverse proxy con SSL automático)
4. **Cron jobs** de monitoreo (health canary cada 5 minutos)

---

## 7. Cloudflare — Borde Global y CDN

### 7.1 Servicios Utilizados (Todos en Plan Gratuito)

```plaintext
+-------------------------------------------+---------------------------+
| Servicio                                  | Uso en Civer Cloud        |
+-------------------------------------------+---------------------------+
| Cloudflare Pages                          | Hosting de la PWA         |
| Cloudflare DNS                            | appstore.civer.cloud      |
| Cloudflare CDN                            | Caché de assets estáticos |
| Cloudflare Tunnels (Argo Tunnel)         | Conexión DigitalOcean     |
| Cloudflare R2 Storage                     | Almacén de APKs (futuro)  |
| Cloudflare Workers                        | Lógica de borde (futuro)  |
| Cloudflare WAF                            | Protección contra ataques |
| Cloudflare SSL                            | Certificados automáticos  |
+-------------------------------------------+---------------------------+
| COSTO TOTAL                               | $0 USD/mes                |
+-------------------------------------------+---------------------------+
```

---

## 8. Red Tailscale — Mesh VPN Privada

### 8.1 Nodos del Clúster

```plaintext
+---------------------------+-------------------+------------------+---------------------+
| Nodo                      | IP Tailscale      | SO               | Rol                 |
+---------------------------+-------------------+------------------+---------------------+
| ASUS ROG Zephyrus Desktop | 100.x.x.x        | Windows 11       | Master Node         |
| ThinkPad T480s Laptop     | 100.96.218.12     | Ubuntu 24.04     | ADB Bridge + Build  |
| Samsung Galaxy A06        | N/A (via ADB SSH) | Android 14       | Test Device         |
| Droplet DigitalOcean      | 100.x.x.x        | Ubuntu 24.04     | Cloud Gateway       |
+---------------------------+-------------------+------------------+---------------------+
```

---

## 9. Resumen de Costos Operativos Mensuales

```plaintext
+-------------------------------------------+---------------------------+
| Servicio                                  | Costo Mensual (USD)       |
+-------------------------------------------+---------------------------+
| Pool de Cuentas Kaggle (GPU)             | $0.00 (cuota gratuita)    |
| Baseten Endpoints (inferencia)           | $0.00 - $10.00 (bajo uso)|
| GitHub Actions (compilación)             | $0.00 (repos públicos)    |
| Droplet DigitalOcean (gateway)           | $12.00                    |
| Cloudflare (CDN + DNS + Tunnel)          | $0.00 (plan gratuito)     |
| Tailscale (VPN mesh)                     | $0.00 (plan personal)     |
| Dominio civer.cloud (anual/12)           | $1.00                     |
+-------------------------------------------+---------------------------+
| TOTAL ESTIMADO                            | $13.00 - $23.00 USD/mes   |
+-------------------------------------------+---------------------------+
```

**Conclusión**: Civer Cloud Enterprise opera una infraestructura de nivel empresarial con costos operativos menores a **$25 USD mensuales**, demostrando que es posible construir una plataforma tecnológica competitiva sin financiamiento de capital de riesgo.

---

## 10. Plan de Escalamiento (2026-2028)

### Fase 1: Actual (Q3-Q4 2026) — "Bootstrap Soberano"
- Pool de 3-5 cuentas Kaggle (90-150h GPU/semana)
- 1 Droplet DigitalOcean ($12/mes)
- GitHub Actions ilimitado
- Cloudflare gratuito
- **Capacidad**: ~100 compilaciones/día, ~1000 inferencias IA/día

### Fase 2: Crecimiento (Q1-Q2 2027) — "Expansion Cloud"
- Pool de 10-20 cuentas Kaggle (300-600h GPU/semana)
- 2-3 Droplets DigitalOcean ($36-48/mes)
- Baseten con presupuesto de $50-100/mes
- **Capacidad**: ~500 compilaciones/día, ~10,000 inferencias IA/día

### Fase 3: Escala (Q3 2027 - 2028) — "Mesh Federation"
- Vast.ai/RunPod para cargas pesadas (~$100-300/mes)
- Red de nodos voluntarios Syncthing
- Multi-región (DigitalOcean NYC + AMS + SGP)
- **Capacidad**: ~5,000 compilaciones/día, ~100,000 inferencias IA/día

---

*Civer Cloud Enterprise — Infraestructura Soberana de Cómputo Distribuido*
