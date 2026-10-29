# 🌐 WebNative Pro — Autonomous Android Web Runtime & Remote AI Agent Bridge

[![Kotlin](https://img.shields.io/badge/Kotlin-2.0.21-purple.svg?logo=kotlin)](https://kotlinlang.org)
[![Jetpack Compose](https://img.shields.io/badge/UI-Jetpack%20Compose%20M3-4285F4.svg?logo=android)](https://developer.android.com/jetpack/compose)
[![MCP Protocol](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-black.svg?logo=anthropic)](https://modelcontextprotocol.io)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Autonomous%20OTA%20Updates-success.svg?logo=githubactions)](https://github.com)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()

> **WebNative Pro** es una plataforma Android autónoma de ejecución web de alto rendimiento (`TurboWebView`) combinada con un **Servidor Puente de Agentes IA (Model Context Protocol - MCP)**, un **Motor de Actualizaciones OTA (Over-The-Air) bidireccional integrado con GitHub Actions**, soporte para **35 canales y protocolos de comunicación**, y más de **90 skills nativas** para control total del dispositivo desde cualquier IDE, LLM o entorno remoto.

---

## 🚀 Características Principales

### 1. ⚡ TurboWebView Native Engine
- **Navegación Fluida**: Renderizado web de alto desempeño con aceleración por hardware.
- **Permisos Nativos Transparentes**: Acceso completo a Cámara, Micrófono, Geolocalización, Almacenamiento y WebRTC.
- **Inyección JavaScript Bidireccional**: Inspección en tiempo real de DOM, captura de pantalla de elementos y ejecución remota de scripts.
- **Consola de Rendimiento y Auditoría QA**: Métricas en vivo (Navigation Timing, WCAG a11y, FPS, memoria).

### 2. 🤖 Servidor Puente de Agentes IA (MCP Server Integrado)
- **Servidor HTTP / WebSocket / SSE en Puerto `8765`**: Ejecuta un servidor local ligero que expone el estándar **Model Context Protocol (MCP)** de Anthropic.
- **90+ Skills Nativas Registradas**: Permite a LLMs externos (Cursor, Claude Desktop, VS Code, Gemini, ChatGPT, Termux) ejecutar acciones nativas:
  - Telemetría de batería, red, CPU, sensores y almacenamiento.
  - Manipulación del portapapeles, vibrador háptico y volumen.
  - Capturas de pantalla nativas y del WebView en Base64.
  - Inyección de JavaScript en el navegador en tiempo real.
  - Modificación de ajustes de sistema y navegación de URLs.
  - Lectura de logs en tiempo real vía Server-Sent Events (SSE).

### 3. 🔄 Motor Autónomo de CI/CD & Actualizaciones OTA
- **Panel de Control GitHub Integrado (`GitHubControlPanelCard.kt`)**: Monitoreo directo de commits, workflows y releases de GitHub.
- **Despacho Automático de Actions**: Dispara flujos `workflow_dispatch` directamente desde la app.
- **Polling Inteligente & Auto-Instalación**: Sondea el estado del pipeline cada 15 segundos y descarga e instala automáticamente el nuevo APK vía `FileProvider` y `PackageInstaller`.

### 4. 🔀 35 Protocolos de Conexión & Descubrimiento Multicanal
- **Model Context Protocol (MCP)** sobre HTTP POST (`/mcp`), Server-Sent Events (`/api/v1/events`), WebSockets (`ws://.../ws`) y JSON-RPC 2.0.
- **REST API v1 Exhaustiva**: 15+ endpoints estructurados (`/api/v1/health`, `/api/v1/skills`, `/api/v1/logs`, etc.).
- **Baliza UDP de Autodescubrimiento Activo (`Puerto 8766`)**: Emite anuncios en broadcast (`255.255.255.255`) y responde a solicitudes de agentes en la red local.
- **Túnel ADB por Cable USB**: Enlace de un solo comando (`adb forward tcp:8765 tcp:8765`).
- **Módem Acústico & Chime de Handshake**: Emisión de acordes armónicos y modulación FSK (Frequency Shift Keying) para emparejamiento con agentes con micrófono.

### 5. 📦 18 Formatos de Compartición & Emparejamiento Rápido
- **Código QR Dinámico de Alto Contraste**: Generación local offline en PNG del manifiesto completo.
- **Exportación en Archivo ZIP (`/pack.zip`)**: Descarga directa de todos los scripts y configs empaquetados.
- **Configuraciones Directas**:
  - Cursor IDE (`mcp.json`)
  - Claude Desktop (`claude_desktop_config.json`)
  - VS Code Cline / Roo Code (`vscode_mcp_settings.json`)
  - Script Bash (`connect_agent.sh`)
  - SDK Python (`connect_agent.py`)
  - SDK TypeScript (`connect_agent.ts`)
  - Variables de entorno (`.env.agent`)
  - Manifiesto JSON y YAML (`webnative_manifest.json`, `webnative_agent.yaml`)
  - Portal HTML Offline Autónomo (`webnative_portal.html`)
  - Token Mágico Base64 y DeepLink (`webnative://agent/handshake`)

---

## 📐 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             WEBNATIVE PRO (Android)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  📱 JETPACK COMPOSE UI                                                      │
│  ├── TurboWebView (Navegador Nativo) ── Inyección JS / DOM Inspection        │
│  ├── GitHub CI/CD Control Center ────── Trigger OTA & Polling Engine        │
│  ├── Registros del Sistema (AppLogger) ─ Observabilidad en Vivo              │
│  └── Diálogo de Conexión Rápida ────── QR, PIN, Acústico, 18 Formatos       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ⚡ AGENT BRIDGE CORE                                                       │
│  ├── AgentBridgeServer (Port 8765: HTTP REST, MCP RPC, SSE, WebSockets)    │
│  ├── AgentHandshakeManager (PIN Dinámico, Tokens de Sesión, Rate Limiter)   │
│  ├── McpAgentSkillsRegistry (90+ Skills Nativas Registradas)                 │
│  ├── AgentUdpDiscoveryBeacon (Port 8766: Broadcast & Discovery Listener)    │
│  ├── AgentAcousticModemHelper (Síntesis PCM 16-bit: Chime & FSK)            │
│  └── AgentShareFormatsEngine & ZipExport (18 Formatos + ZIP Pack)           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           ▼                           ▼                           ▼
    [ IDEs / Agentes ]        [ Portal Web Local ]          [ CI/CD Pipeline ]
     - Cursor MCP              - http://<IP>:8765/handshake - GitHub Actions
     - Claude Desktop          - Consola Web de Skills      - Build APK
     - VS Code Roo/Cline       - Descarga de ZIP Pack       - Auto-Install OTA
     - Terminal cURL / Python  - Probador en Vivo
```

---

## 🛠️ Inicio Rápido

### Conexión desde Cursor IDE
Copia el siguiente bloque en tu archivo `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "webnative-android": {
      "url": "http://<IP_DISPOSITIVO>:8765/mcp",
      "headers": {
        "X-Agent-Pin": "WN-XXXX"
      }
    }
  }
}
```

### Conexión desde Terminal (cURL)
```bash
# 1. Comprobar salud del servidor
curl http://<IP_DISPOSITIVO>:8765/api/v1/health

# 2. Listar skills disponibles (MCP JSON-RPC 2.0)
curl -X POST http://<IP_DISPOSITIVO>:8765/mcp \
  -H "Content-Type: application/json" \
  -H "X-Agent-Pin: WN-XXXX" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# 3. Ejecutar una skill (Telemetría de batería)
curl -X POST http://<IP_DISPOSITIVO>:8765/api/v1/skills/execute \
  -H "Content-Type: application/json" \
  -d '{"name":"get_device_battery_telemetry","arguments":{}}'
```

### Túnel Directo por Cable USB (ADB)
```bash
adb forward tcp:8765 tcp:8765
curl http://127.0.0.1:8765/api/v1/health
```

---

## 📚 Documentación Técnica

- 📋 [**PRD.md**](./PRD.md): Product Requirements Document con la visión, pilares funcionales y criterios de aceptación.
- 🏗️ [**SDD.md**](./SDD.md): Software Design Document con la arquitectura profunda, modelos de datos y protocolos.
- 🤖 [**AGENTS.md**](./AGENTS.md): Protocolos de operación de agentes autónomos, reglas anti-rotura y guía de desarrollo.
- 🏛️ [**MODULARIZATION_PLAN.md**](./docs/MODULARIZATION_PLAN.md): Super Plan Maestro de Modularización, Desacoplamiento de Dominios y Migración Zero-Breakage.
- 🧰 [**SKILLS_CATALOG.md**](./docs/SKILLS_CATALOG.md): Catálogo exhaustivo de las 90+ skills nativas de MCP con esquemas de parámetros.
- 📡 [**AGENT_API_REFERENCE.md**](./docs/AGENT_API_REFERENCE.md): Especificación completa de endpoints REST, SSE, WebSockets y UDP.

---

## 🛡️ Seguridad & Gobernanza
- **Handshake por PIN / Secreto**: Acceso protegido por PIN temporal o clave secreta criptográfica de 32 caracteres.
- **Protección Anti Fuerza Bruta**: Límite de 15 intentos consecutivos con bloqueo temporal automático de 60 segundos por IP.
- **Gestión de Sesiones**: Emisión de tokens temporales de 24 horas revocables en tiempo real vía UI o API.
- **Zero-Cloud Leak**: Toda la comunicación ocurre exclusivamente de forma local o punto a punto dentro de la red del desarrollador.

---

## 📄 Licencia
Este proyecto es software libre bajo los términos de la licencia Apache 2.0.
