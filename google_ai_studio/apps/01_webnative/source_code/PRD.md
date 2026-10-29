# 📋 PRD — Product Requirements Document: WebNative Pro

**Versión:** 2.0  
**Fecha:** 2026-09-09  
**Estado:** Activo / En Producción  
**Autor:** Equipo de Arquitectura WebNative Pro  

---

## 1. 🎯 Visión y Declaración del Problema

### 1.1 Declaración del Problema
Tradicionalmente, los entornos de desarrollo para Android y las aplicaciones basadas en WebView sufren de desconexión entre el entorno donde el desarrollador o agente de IA escribe código (IDE, Cursor, Claude, Terminal) y el dispositivo físico donde se ejecuta la app. Los flujos comunes requieren:
- Conectar cables USB constantemente y configurar `adb` de forma manual.
- Compilar e instalar manualmente nuevos APKs en cada iteración.
- Falta de observabilidad directa en tiempo real de lo que ocurre dentro del WebView y en los subsistemas nativos del teléfono.
- Carencia de un protocolo unificado para que agentes de inteligencia artificial (LLMs) interactúen con el dispositivo de forma estandarizada y segura.

### 1.2 Visión del Producto
**WebNative Pro** es una plataforma autónoma e inteligente que fusiona un runtime de WebView de ultra alto rendimiento con un **servidor nativo Model Context Protocol (MCP)** y un **motor de CI/CD con autoactualización OTA**. Permite a cualquier agente o desarrollador, desde cualquier parte del mundo o red local, conectarse en segundos con cero fricción (mediante QR, enlace universal, módem acústico, UDP o configs para IDE) para controlar, inspeccionar, depurar y actualizar el dispositivo y el navegador.

---

## 2. 👥 Usuarios Objetivo y Casos de Uso

1. **Agentes de IA Autónomos (Cursor, Claude Desktop, Roo Code, Cline, AutoGPT)**:
   - Necesitan inspeccionar el estado del dispositivo (batería, almacenamiento, memoria), capturar la pantalla del WebView, inyectar scripts JS, evaluar el rendimiento DOM y automatizar pruebas.
2. **Desarrolladores Web & Mobile**:
   - Quieren probar sus aplicaciones web en un entorno móvil real sin necesidad de configurar emuladores pesados ni conectar cables ADB.
3. **Equipos de QA & Testing Automatizado**:
   - Requieren auditar accesibilidad (WCAG), tiempos de carga de navegación (Navigation Timing API) y capturar capturas de pantalla de elementos específicos de forma desatendida.
4. **Desarrolladores Remotos / Nómadas**:
   - Iteran código en GitHub y reciben la nueva versión compilada e instalada automáticamente en el teléfono vía OTA en menos de 2 minutos.

---

## 3. 🏛️ Pilares Fundamentales del Producto

### Pilar 1: Motor Web Nativo de Alto Rendimiento (`TurboWebView`)
- **FR-1.1**: Renderizado acelerado por hardware con soporte para estándares HTML5, CSS3, ES2024 y WebGL.
- **FR-1.2**: Gestión proactiva de permisos nativos (Cámara, Micrófono, Ubicación, Almacenamiento, Sensores) con diálogo de solicitud integrado.
- **FR-1.3**: Inyector bidireccional de JavaScript con captura de retornos asíncronos y consola de logs remota.
- **FR-1.4**: Suite de auditoría QA integrada: cálculo de métricas de rendimiento, DOM depth, contraste WCAG y tiempos de carga.

### Pilar 2: Servidor Puente de Agentes IA (Model Context Protocol - MCP)
- **FR-2.1**: Servidor HTTP/JSON-RPC 2.0 integrado en puerto `8765` compatible con la especificación oficial de Anthropic MCP.
- **FR-2.2**: Catálogo de más de 90 skills nativas categorizadas en: Telemetría, WebView/DOM, Red, Sistema, Portapapeles, Multimedia, Hardware, Audio y Compartición.
- **FR-2.3**: Endpoint Server-Sent Events (SSE) `/api/v1/events` para streaming en vivo de eventos del sistema y logs hacia los agentes.
- **FR-2.4**: Endpoint WebSocket `/ws` para comunicación bidireccional persistente de baja latencia.

### Pilar 3: Bucle Autónomo de CI/CD & Actualizaciones OTA
- **FR-3.1**: Panel de control interactivo en la app para visualizar el estado de GitHub Actions y versiones lanzadas.
- **FR-3.2**: Disparo de flujos de compilación remota (`workflow_dispatch`) mediante GitHub REST API con tokens seguros.
- **FR-3.3**: Polling inteligente con intervalos de 15 segundos para evitar límites de tasa (*rate-limiting*).
- **FR-3.4**: Descarga transparente del APK generado y activación del instalador de paquetes nativo de Android mediante `FileProvider`.

### Pilar 4: Emparejamiento Rápido & 18 Formatos de Compartición
- **FR-4.1**: Generador de Código QR de alto contraste (PNG) generado localmente sin dependencias de internet.
- **FR-4.2**: Motor de exportación de 18 formatos de configuración listos para copiar o enviar como archivo físico (Cursor, Claude, VS Code, Bash, Python, TypeScript, .env, YAML, JSON, HTML, etc.).
- **FR-4.3**: Generación y compartición de paquete completo comprimido `.ZIP` (`/pack.zip` o `AgentZipExportHelper`).
- **FR-4.4**: Sistema de Handshake por PIN amigable (`WN-XXXX`) y clave secreta criptográfica con protección contra ataques de fuerza bruta.
- **FR-4.5**: Transmisión de presencia y PIN mediante Módem Acústico (acordes armónicos y modulación FSK de audio PCM).

### Pilar 5: Observabilidad y Diagnóstico Local (`AppLogger`)
- **FR-5.1**: Registro persistente en memoria y disco de todas las acciones del sistema, solicitudes de red, errores y respuestas MCP.
- **FR-5.2**: Visualizador nativo de logs con filtros por nivel (`INFO`, `SUCCESS`, `WARN`, `ERROR`) y exportación instantánea.
- **FR-5.3**: Baliza de autodescubrimiento UDP en puerto `8766` con soporte para escaneo pasivo y emisión activa de anuncios periódicos.

---

## 4. 🔒 Requisitos No Funcionales (NFRs)

- **NFR-1 (Rendimiento)**: El servidor HTTP y la baliza UDP no deben consumir más del 2% de CPU en estado inactivo.
- **NFR-2 (Concurrencia)**: Todas las operaciones de red, compresión ZIP, síntesis de audio y operaciones de disco deben ejecutarse en `Dispatchers.IO` o `Dispatchers.Default` para evitar bloqueos del hilo principal de la UI (ANRs).
- **NFR-3 (Estabilidad & Resilencia)**: Fallos en scripts JS inyectados o comandos MCP no válidos deben responder con mensajes de error estructurados en JSON sin detener la aplicación ni provocar cierres inesperados.
- **NFR-4 (Compatibilidad Android)**: Compatibilidad total desde Android 8.0 (API 26) hasta Android 15 (API 35), con soporte de Edge-to-Edge y Material 3.

---

## 5. 📊 Criterios de Aceptación y Validación

1. **Handshake**: Cualquier agente o usuario que proporcione el PIN actual (`WN-XXXX`) en cabeceras o URLs debe recibir un token de sesión válido por 24 horas.
2. **MCP Compliance**: La petición POST a `/mcp` con `tools/list` debe devolver la lista completa de skills con esquemas JSON válidos.
3. **OTA Loop**: El flujo de actualización OTA debe compilar, descargar e invocar el instalador de Android sin requerir Termux ni cables USB.
4. **Verificación Build**: Todo el código de la aplicación debe compilar con `compile_applet` con `BUILD SUCCESSFUL` de manera determinista.
