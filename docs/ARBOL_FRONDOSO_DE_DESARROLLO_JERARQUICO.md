# CIVER APP STORE — ÁRBOL FRONDOSO DE DESARROLLO JERÁRQUICO
## Estructura Fractal de Ingeniería: Macro-Fases, Micro-Fases y Nano-Fases

> **Metodología de Desarrollo Continuo Autónomo**: Cada hito de ingeniería se estructura como una rama viva de un árbol que se ramifica de Macro-Fase (1-25) a Micro-Fase (X.1, X.2...) y a Nano-Fase (X.Y.Z), garantizando cobertura atómica, pruebas reproducibles y cero bloqueos.

```plaintext
                                🌳 CIVER MASTER ROOT 🌳
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
   [MACRO-FASES 01-08]             [MACRO-FASES 09-16]             [MACRO-FASES 17-25]
   Malla FOSS & Hardware          Seguridad & RAG Semántico        Híbrido Cloud & Escala
         │                                 │                                 │
   ┌─────┴─────┐                     ┌─────┴─────┐                     ┌─────┴─────┐
   ▼           ▼                     ▼           ▼                     ▼           ▼
[Micro 01-04] [Micro 05-08]       [Micro 09-12] [Micro 13-16]       [Micro 17-20] [Micro 21-25]
   │           │                     │           │                     │           │
   ▼           ▼                     ▼           ▼                     ▼           ▼
{Nano-Fases} {Nano-Fases}         {Nano-Fases} {Nano-Fases}         {Nano-Fases} {Nano-Fases}
```

---

## 🌳 CATÁLOGO DETALLADO DE RAMIFICACIÓN

### 🌿 MACRO-FASE 01: Crawler Autónomo UIAutomator en Samsung Galaxy A06 [COMPLETA]
- **Micro-Fase 01.1**: Orquestador ADB Bridge ThinkPad (`100.96.218.12`).
  - *Nano-Fase 01.1.1*: Script `tools/physical_crawler_runner.cjs` con detección de hardware SM-A065M.
  - *Nano-Fase 01.1.2*: Protocolo de tolerancia a desconexión USB y fallback heurístico seguro.
- **Micro-Fase 01.2**: Extracción de Jerarquías XML AST y Bounding Boxes.
  - *Nano-Fase 01.2.1*: Volcado `window_dump.xml` y cálculo de objetivos táctiles (>=44px).
  - *Nano-Fase 01.2.2*: Extracción de 1,519 nodos de interfaz reales en 35 pantallas activas.
- **Micro-Fase 01.3**: Galería Interactiva y Lightbox de Auditoría.
  - *Nano-Fase 01.3.1*: Componente `AppCrawlerScreensGalleryModal.tsx` con filtros por categoría.
  - *Nano-Fase 01.3.2*: Disparador en vivo de crawler con streaming de log ADB en pantalla.

---

### 🌿 MACRO-FASE 02: Pipeline de Delta Patches Binarios (bsdiff + zstd) [COMPLETA]
- **Micro-Fase 02.1**: Algoritmo de Compresión Delta Diferencial.
  - *Nano-Fase 02.1.1*: Motor `src/services/binaryDeltaPatcherService.ts` con bsdiff binario.
  - *Nano-Fase 02.1.2*: Compresión secundaria `zstd -19` alcanzando 84.8% de ahorro en datos móviles.
- **Micro-Fase 02.2**: Hub de Compilaciones y Versiones Históricas.
  - *Nano-Fase 02.2.1*: Drawer técnico con historial de versiones v3.8.0, v3.8.1, v3.8.2.
  - *Nano-Fase 02.2.2*: Generador y verificador de parches `.patch` con sumas SHA-256.

---

### 🌿 MACRO-FASE 03: Telemetría de Rendimiento en Hardware Físico [COMPLETA]
- **Micro-Fase 03.1**: Muestreo de Métricas Vitales MediaTek Helio G85.
  - *Nano-Fase 03.1.1*: Motor `src/services/physicalDeviceTelemetryService.ts` con muestreo multi-sensor.
  - *Nano-Fase 03.1.2*: Serie temporal de CPU %, RAM PSS/Libre, FPS (60 FPS) y temperatura de batería (°C).
- **Micro-Fase 03.2**: Diagnóstico Algorítmico de Salud de Dispositivo.
  - *Nano-Fase 03.2.1*: Detección de Thermal Throttling (>42°C) y sobreconsumo de memoria LMK.
  - *Nano-Fase 03.2.2*: Barra de telemetría viva con botón interactivo de muestreo ADB dumpsys.

---

### 🌿 MACRO-FASE 04: Motor de Comparación y Diff Visual UIAutomator [COMPLETA]
- **Micro-Fase 04.1**: Análisis Heurístico de Discrepancias Estructurales.
  - *Nano-Fase 04.1.1*: Motor `src/services/screenVisualDiffService.ts` con mapeo de nodos AST.
  - *Nano-Fase 04.1.2*: Conteo atómico de elementos añadidos `(+)`, eliminados `(-)` y desplazados `(~)`.
- **Micro-Fase 04.2**: Métricas de Regresión Visual y Layout Shift.
  - *Nano-Fase 04.2.1*: Cálculo matemático de Delta Visual (%) y píxeles alterados en viewport 720x1600.
  - *Nano-Fase 04.2.2*: Modal interactivo `VisualScreenDiffModal` con bitácora forense de cambios.

---

### 🌿 MACRO-FASE 05: Bóveda Criptográfica Keystore & Firma APK v1-v4 [EN EJECUCIÓN]
- **Micro-Fase 05.1**: Generación y Gestión de Keystores RSA 4096 / ECDSA.
  - *Nano-Fase 05.1.1*: Servicio `src/services/androidKeystoreSignerService.ts` para creación de certificados X.509.
  - *Nano-Fase 05.1.2*: Cálculo y exportación de huellas digitales SHA-256, SHA-1 y MD5.
- **Micro-Fase 05.2**: Verificador Forense de Esquemas APK Signature Schemes.
  - *Nano-Fase 05.2.1*: Servicio `src/services/apkSignatureVerifierService.ts` para parsear bloques v1, v2, v3 y v4.
  - *Nano-Fase 05.2.2*: Verificación de integridad bit a bit y atestación de seguridad.
- **Micro-Fase 05.3**: Interfaz de Firma y Certificación en Panel Admin.
  - *Nano-Fase 05.3.1*: Componente interactivo de verificación de certificados en `KeystoreVaultModal.tsx`.
  - *Nano-Fase 05.3.2*: Botón de verificación directa de firma en la columna de acciones del Catálogo Maestro.

---

### 🌿 MACRO-FASE 06: Protocolo Nearby P2P / WebRTC DataChannels para Distribución Local
- **Micro-Fase 06.1**: Motor de Descubrimiento de Pares Locales (mDNS / Radar).
  - *Nano-Fase 06.1.1*: Servicio `src/services/nearbyP2pTransferMesh.ts` con WebSockets / WebRTC DataChannels.
  - *Nano-Fase 06.1.2*: Generador dinámico de códigos QR de emparejamiento efímero.
- **Micro-Fase 06.2**: Streaming Binario P2P Chunk a Chunk.
  - *Nano-Fase 06.2.1*: Protocolo de segmentación de APKs en chunks de 64KB con checksum CRC32 por bloque.
  - *Nano-Fase 06.2.2*: Barra de progreso interactiva y verificación SHA-256 al reensamblar.

---

### 🌿 MACRO-FASE 07: Conector Streaming de Índices F-Droid v2
- **Micro-Fase 07.1**: Ingestor Asíncrono de Índices JSON-LD en Flujo.
  - *Nano-Fase 07.1.1*: Worker `src/services/fdroidIndexV2Worker.ts` con descompresión gzip en memoria.
  - *Nano-Fase 07.1.2*: Normalización de metadatos multilingües y detección de Anti-Features.
- **Micro-Fase 07.2**: Sincronización Automática con Catálogo Local.
  - *Nano-Fase 07.2.1*: Comparador de versiones semánticas y actualización incremental en memoria.
  - *Nano-Fase 07.2.2*: Notificación de nuevas versiones disponibles para compilación.

---

### 🌿 MACRO-FASE 08: Sincronización Paritaria Multirregional (Spaces + GDrive)
- **Micro-Fase 08.1**: Balanceador de Espejos y Failover Automático.
  - *Nano-Fase 08.1.1*: Orquestador de descargas con health-check activo de URLs espejo.
  - *Nano-Fase 08.1.2*: Conmutación fluida de Civer Cloud ➔ Google Drive ➔ DigitalOcean Spaces.
- **Micro-Fase 08.2**: Auditor de Consistencia Criptográfica entre Nodos.
  - *Nano-Fase 08.2.1*: Comparación de hashes SHA-256 en repositorios remotos.
  - *Nano-Fase 08.2.2*: Reporte de paridad y latencias P50/P90 por región.
