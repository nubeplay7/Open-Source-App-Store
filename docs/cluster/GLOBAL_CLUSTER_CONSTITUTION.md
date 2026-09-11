# CONSTITUCIÓN Y PROTOCOLO OPERATIVO UNIFICADO DEL CLÚSTER SOBERANO
## Civer App Store & Bené Cloud Multi-Agent Swarm

> **Vigencia**: 2026 – 2028 | **Nivel de Aislamiento**: Soberanía Digital 100% Libre  
> **Ámbito de Aplicación**: Todos los servidores (ASUS Master, ThinkPad T480s, Droplets DigitalOcean), agentes de IA (Antigravity IDE, DiscoveryWeb, Claude, Gemini, Paperclip Runners) y dispositivos de hardware conectados (Samsung Galaxy A06, emuladores y clústeres locales).

---

## 1. Preámbulo y Declaración de Soberanía Digital

Este documento establece las **Leyes Fundamentales, Principios Inmutables y Protocolos de Comunicación** que rigen a la totalidad de agentes autónomos, desarrolladores humanos y nodos de cómputo dentro de la red **Civer Cloud**. Cualquier agente o proceso que opere dentro de este repositorio o en los servidores federados debe acatar obligatoriamente estas directivas.

---

## 2. Los 7 Principios Cardinales Inmutables

### Principio 1: Cero Rastreadores y Soberanía de Datos (Zero-Trackers Absolute)
- **Regla**: Queda estrictamente prohibida la inclusión de SDKs de telemetría privativa, analítica publicitaria o librerías que transmitan metadatos a terceros (Google Analytics, AppsFlyer, Facebook Graph, Adjust, Firebase Analytics sin proxy soberano).
- **Verificación**: Todo binario o paquete debe ser auditado con `SKILL-SEC-01: ExodusTrackerAudit` registrando exactamente 0 firmas de rastreadores.

### Principio 2: Paridad Absoluta 1:1 Web ↔ Android Nativo (Cross-Platform Parity)
- **Regla**: La experiencia servida en la web a través del cliente PWA/Vite debe reflejar con paridad matemática de diseño y funcionalidad la aplicación instalada en hardware real mediante WebAPK o APK empaquetado.
- **Verificación**: Los widgets generados por el motor de construcción deben compilar simultáneamente a clases de Tailwind CSS v4 para la web y composables de Jetpack Compose en Kotlin (`SKILL-HYD-04` y `SKILL-ENT-07`).

### Principio 3: Verificación Criptográfica Forense y Cero Falsos Positivos
- **Regla**: Ninguna tarea, reporte de salud o artefacto puede darse por completado mediante datos simulados (*mocks*) si el servicio correspondiente se encuentra activo. Toda medición debe triangularse a través de al menos 3 fuentes independientes (HTTP, sistema operativo y archivos en disco).
- **Verificación**: Todo entregable debe sellarse con su hash criptográfico SHA-256 (`SKILL-TST-05: ZeroFalsePositiveCertifier` y `SKILL-SEC-03: Sha256ChecksumEnforcer`).

### Principio 4: Autonomía Operativa Continua (YOLO & Continuous Self-Healing)
- **Regla**: Los agentes deben operar en ciclos continuos e ininterrumpidos de trabajo. Está terminantemente prohibido pedir intervenciones manuales al usuario para clics, configuración de modales o tipeo de comandos. Si un servicio se cae, el agente debe diagnosticar, recuperar y certificar de manera desatendida.
- **Verificación**: Integración con los scripts supervisores `tools/recover_system.ps1` y `tools/civer_infinite_sync.ps1`.

### Principio 5: Cero Daemons Residuales en el Entorno de Desarrollo
- **Regla**: Ninguna tarea en segundo plano puede quedar huérfana o activa indefinidamente en las herramientas de gestión de procesos del IDE (`manage_task`). Todo script de verificación o auditoría debe ejecutarse de forma finita y devolver el control al sistema.
- **Verificación**: Centinela de procesos con límite de tiempo estricto y limpieza sistemática tras cada ráfaga.

### Principio 6: Arquitectura Hidrológica Desacoplada (Ríos y Lagunas)
- **Regla**: La infraestructura se modela como una cuenca hidrológica interconectada donde el frontend React (río principal) interactúa con microservicios independientes denominados *Lagunas* (Laguna PHP 8.2 Headless, Laguna de WordPress Plugins, Laguna de Gateway Always-On). Si una laguna disminuye su caudal, el sistema degrada limpiamente sin bloquear al usuario.
- **Verificación**: Enrutador dual CLI/HTTP `php/api/router.php` validado con `php -l` asegurando 0 errores sintácticos.

### Principio 7: Economía Soberana y Comercio con 0% Comisiones
- **Regla**: Toda transacción económica dentro del ecosistema (compra de software, pago por tareas de testing, financiamiento de proyectos) debe liquidarse sin comisiones abusivas de tiendas cerradas, utilizando canales soberanos: satoshis sobre Lightning Network (BOLT11/WebLN) y dispersión inmediata bancaria nacional (SPEI Banxico).
- **Verificación**: Registros de auditoría en el libro mayor inmutable local y cálculo de ahorro del 30% frente a monopolios (`SKILL-ECO-07`).

---

## 3. Topología de Servidores y Nodos Federados

```plaintext
+----------------------------------------------------------------------------------------+
|                                    RED CIVER CLOUD                                     |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|   +--------------------------+       Tailscale Mesh       +------------------------+   |
|   |   ASUS MASTER NODE       | <=======================> |   THINKPAD T480s PEER  |   |
|   |   (DESKTOP-HLBE8QU)      |       100.68.236.36       |   (SECONDARY WORKER)   |   |
|   |   - React App (3000)     |       100.96.218.12       |   - DiscoveryWeb HUD   |   |
|   |   - PHP 8.2 Headless     |                           |   - SSH Bridge Server  |   |
|   |   - Always-On Gateway    |                           |   - ADB Host Bridge    |   |
|   +--------------------------+                           +------------------------+   |
|                |                                                     |                 |
|                | Cloudflare Tunnel                                   | USB ADB         |
|                v                                                     v                 |
|   +--------------------------+                           +------------------------+   |
|   |   EDGE CLOUDFLARE        |                           |   SAMSUNG GALAXY A06   |   |
|   |   https://bene.civer.cloud                           |   (HARDWARE REAL)      |   |
|   |   - PWA Service Worker   |                           |   - Shizuku API        |   |
|   |   - OTA Manifest         |                           |   - PackageInstaller   |   |
|   +--------------------------+                           +------------------------+   |
|                                                                                        |
+----------------------------------------------------------------------------------------+
```

---

## 4. Estándar de Catálogo Maestro de 113 Skills de Agente

Todo agente perteneciente al enjambre debe reconocer y ejecutar las 113 habilidades estandarizadas registradas en `docs/skills/SKILLS_REGISTRY.md`:

- **Categoría A (Skills 01-10)**: Seguridad Criptográfica y Auditoría.
- **Categoría B (Skills 11-20)**: Toolchain Android y Compilación CI/CD.
- **Categoría C (Skills 21-28)**: Gestión de Flota y Despliegue Remoto.
- **Categoría D (Skills 29-36)**: Curaduría de Catálogo y Heurística FOSS.
- **Categoría E (Skills 37-43)**: Developer Workspace e Integraciones.
- **Categoría F (Skills 44-50)**: Experiencia de Usuario, Ergonomía y Accesibilidad.
- **Categoría G (Skills 51-58)**: Infraestructura Empresarial y Pagos Soberanos.
- **Categoría H (Skills 59-69)**: Testing Forense y Certificación Anti-Falsos Positivos.
- **Categoría I (Skills 70-80)**: Toolchain de Despliegue en Hardware Android y Shizuku.
- **Categoría J (Skills 81-91)**: Arquitectura Hidrológica Avanzada y PHP 8.2.
- **Categoría K (Skills 92-102)**: Automatización de Resiliencia, Failover de Red y Anti-502.
- **Categoría L (Skills 103-113)**: Economía Descentralizada, Pagos y Gobernanza FOSS.

---

## 5. Hub Global de Informes y Protocolo de Sincronización

Cada ciclo de auditoría automatizada debe volcar sus resultados a un destino común accesible por cualquier nodo:

1. **Informe Humano/Agente**: `docs/reports/GLOBAL_CLUSTER_AUDIT_REPORT.md`
2. **Informe Computable JSON**: `docs/reports/global_cluster_audit_report.json`
3. **Punto de Acceso Web**: `public/api/v1/cluster/global-report.json`
4. **Buzón Inter-Agentes del IDE**: `C:\Users\asus\.gemini\antigravity\brain\cluster_mailbox.json` y `global_cluster_audit_report.json`

Ningún servidor o agente puede operar con directivas aisladas. Este manifiesto es la fuente única de verdad para el enjambre.
