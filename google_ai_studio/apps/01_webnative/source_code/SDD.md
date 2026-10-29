# 🏗️ SDD — Software Design Document: WebNative Pro

**Versión:** 2.0  
**Fecha:** 2026-09-09  
**Arquitectura:** Clean Architecture + MVVM + Micro-Server Nativo  

---

## 1. 📐 Diagrama Arquitectónico Global

```
+-----------------------------------------------------------------------------------+
|                                ANDROID APPLICATION LAYER                          |
|                                                                                   |
|  +---------------------------+  +------------------------+  +-------------------+ |
|  |     Jetpack Compose UI    |  |     TurboWebView       |  | AppLogger Overlay | |
|  | (AgentQuickConnectDialog, |  | (Hardware Acceleration,|  | (Live Logs Flow,  | |
|  |  GitHubControlPanelCard,  |  |  JS Bridge, A11y Audits|  |  Filter, Export) | |
|  |  Settings, Diagnostics)   |  +------------^-----------+  +---------^---------+ |
|  +-------------^-------------+               |                        |           |
+----------------|-----------------------------|------------------------|-----------+
                 |                             |                        |
+----------------v-----------------------------v------------------------v-----------+
|                          AGENT BRIDGE & SERVICES CORE                             |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                          AgentBridgeServer (Port 8765)                      |  |
|  |  - Embedded HTTP 1.1 Non-Blocking Engine                                    |  |
|  |  - REST Handler (/api/v1/health, /skills, /logs, /share, /sessions)         |  |
|  |  - MCP JSON-RPC 2.0 Dispatcher (/mcp)                                       |  |
|  |  - Server-Sent Events (SSE) Hub (/api/v1/events)                            |  |
|  |  - WebSockets Relay (/ws)                                                   |  |
|  |  - Interactive Web Console & Pairing Portal (/handshake)                    |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-------------------------+  +------------------------+  +--------------------+  |
|  | McpAgentSkillsRegistry  |  |  AgentHandshakeManager |  | AgentAcousticModem |  |
|  | (90+ Tools: Telemetry,  |  | (PIN Storage, AuthToken|  | (PCM 16-bit Synth, |  |
|  |  DOM, Hardware, Files)  |  |  Rate Limiting, Guard) |  |  FSK PIN Pulses)   |  |
|  +-------------------------+  +------------------------+  +--------------------+  |
|                                                                                   |
|  +-------------------------+  +------------------------+  +--------------------+  |
|  | AgentShareFormatsEngine |  |  AgentZipExportHelper  |  | AgentUdpDiscovery  |  |
|  | (18 Format Generators)  |  | (ZIP Pack Packaging)   |  | (Port 8766 Beacon) |  |
|  +-------------------------+  +------------------------+  +--------------------+  |
+-----------------------------------------------------------------------------------+
                 |
+----------------v------------------------------------------------------------------+
|                            EXTERNAL AGENT INTERFACES                              |
|                                                                                   |
|   [Cursor IDE]    [Claude Desktop]    [VS Code / Roo]    [Python / Bash SDKs]     |
|   [UDP Beacon]    [Acoustic Mic]      [ADB USB Tunnel]   [GitHub Actions CI/CD]   |
+-----------------------------------------------------------------------------------+
```

---

## 2. 🔌 Topología de Protocolos y Capas de Red

WebNative Pro implementa una arquitectura de comunicación multinivel con **35 canales y protocolos** organizados en 7 categorías:

### 2.1 Model Context Protocol (MCP - Anthropic Specification)
- **Endpoint**: `http://<IP>:8765/mcp`
- **Métodos JSON-RPC 2.0 soportados**:
  - `initialize`: Negociación de protocolo, versión y capacidades del servidor.
  - `tools/list`: Devuelve el catálogo completo de las 90+ skills registradas con esquemas de parámetros JSON Schema.
  - `tools/call`: Ejecuta una herramienta específica en el hilo de fondo correspondiente y retorna el resultado estructurado.

### 2.2 API REST v1
- `GET /api/v1/health`: Estado del puente, carga de batería, memoria y hora del sistema.
- `GET /api/v1/skills`: Listado de skills registradas.
- `POST /api/v1/skills/execute`: Ejecución directa REST de cualquier skill nativa.
- `GET /api/v1/logs`: Volcado de registros del sistema con soporte para filtrado por nivel y conteo.
- `GET /api/v1/events`: Flujo Server-Sent Events (SSE) para recepción de eventos en tiempo real.
- `GET /api/v1/share/formats`: Listado de los 18 formatos de compartición estructurados en JSON.
- `GET /api/v1/share/pack.zip`: Descarga binaria del paquete ZIP completo.
- `GET /api/v1/share/export/:id`: Descarga individual del archivo de configuración seleccionado.
- `GET /api/v1/acoustic/chime` y `/api/v1/acoustic/fsk`: Disparo remoto de tonos acústicos.
- `GET /api/v1/sessions` y `POST /api/v1/sessions/revoke`: Gestión y revocación de tokens de sesión.

### 2.3 Baliza de Autodescubrimiento UDP (Puerto `8766`)
- **Escucha Inbound**: Procesa datagramas UDP con el texto `DISCOVER_WEBNATIVE` y responde instantáneamente con un paquete JSON unicast conteniendo la IP, puerto, PIN y URLs de conexión.
- **Emisión Outbound Activa**: Difusión periódica cada 15 segundos hacia la dirección `255.255.255.255:8766` con la carga útil `ANNOUNCE_WEBNATIVE_PRO`.

### 2.4 Módem Acústico en Banda Base (Audio PCM 16-bit)
- Generación sintetizada a 44.1 kHz mediante `AudioTrack` en modo estático.
- **Chime Armónico**: Secuencia de 4 tonos armónicos (D5: 587Hz, A5: 880Hz, D6: 1174Hz, A6: 1760Hz) con modulación de envolvente senoidal.
- **FSK (Frequency Shift Keying)**: Modulación por desplazamiento de frecuencia de cada símbolo del PIN (`WN-XXXX`) entre 1200 Hz y 2800 Hz con delimitadores STX/ETX.

---

## 3. 🛡️ Modelo de Seguridad y Handshake

```
 Agente Externo                        WebNative Pro Server
       │                                        │
       ├──── 1. GET /handshake?pin=WN-XXXX ────►│
       │                                        ├─ Verifica PIN / Clave Secreta
       │                                        ├─ Comprueba Intentos Fallidos (Rate Limit)
       │◄─── 2. Retorna JSON con Token ─────────┤ (Genera wn_auth_<UUID>)
       │        (Duración: 24 horas)            │
       │                                        │
       ├──── 3. POST /mcp (Header: X-Auth-Token)┤
       │                                        ├─ Valida Sesión Activa
       │◄─── 4. Ejecuta Skill y Retorna JSON ───┤
```

### 3.1 Mitigación de Ataques de Fuerza Bruta
`AgentHandshakeManager` mantiene un mapa concurrente `failedAttempts: ConcurrentHashMap<String, Pair<Int, Long>>`:
- Si una dirección IP acumula más de **15 intentos erróneos**, queda automáticamente bloqueada por un periodo de enfriamiento de **60 segundos**.
- Las credenciales pueden ser regeneradas en cualquier momento desde la interfaz o vía skill MCP `regenerate_credentials`.

---

## 4. 🔄 Flujo del Motor de CI/CD & Actualizaciones OTA

1. **Disparo**: El desarrollador o la app despacha un evento `workflow_dispatch` a la API de GitHub (`/repos/:owner/:repo/actions/workflows/build-and-release.yml/dispatches`).
2. **Monitoreo**: La corrutina `OtaUpdateManager` consulta periódicamente (`GET /repos/:owner/:repo/actions/runs`) cada 15 segundos.
3. **Descarga**: Al detectar el estado `completed` con resultado `success`, obtiene la URL del APK en el Release generado y descarga el binario a la memoria caché local.
4. **Instalación**: Invoca el `Intent.ACTION_VIEW` con `FLAG_GRANT_READ_URI_PERMISSION` utilizando la autoridad de `FileProvider` (`com.example.fileprovider`).
