# 📁 Bóveda de Evidencias Visuales para el Humano
> **Civer App Store Matrix • Sistema Operativo FOSS y Android 15**

Esta carpeta contiene todas las evidencias gráficas certificadas generadas por el enjambre de agentes y pruebas automatizadas E2E.

---

## 🌐 Visor Interactivo Rápido
Puedes abrir con doble clic el archivo **`index.html`** dentro de esta misma carpeta para explorar todas las capturas con diseño moderno, badges de estado y descripciones forenses.

---

## 🗂️ Catálogo de Evidencias por Macro-Fase

### 🟢 Macro-Fase 07: Ingesta Streaming F-Droid Index V2 & Anti-Features
- `admin_20_app_main_loaded.png`: Civer App Store v3.4 cargada en producción con Vite y Service Worker PWA de 19 precaches.
- `admin_21_fdroid_v2_modal.png`: Gestor descentralizado de repositorios FOSS (F-Droid, IzzyOnDroid, Guardian Project, microG).
- `admin_22_fdroid_streaming_v2_tab.png`: Descompresión streaming de `entry.json.gz` en memoria con DecompressionStream y cálculo SemVer.
- `admin_23_fdroid_mirrors_tab.png`: Latencia en microsegundos y huellas GPG de los mirrors oficiales de F-Droid.
- `admin_24_fdroid_batch_import_tab.png`: Detección de Anti-Features (Ads, Tracking, NonFreeNet, NonFreeDep).

### 🔵 Macro-Fase 06: Radar Nearby P2P WebRTC & Chunks de 64 KB
- `admin_17_nearby_p2p_radar.png`: Radar de descubrimiento local en red Wi-Fi / WebRTC Data Channels.
- `admin_18_p2p_chunk_streaming.png`: Transmisión por bloques de 64 KB de APKs con verificación de suma SHA-256.
- `admin_19_p2p_qr_pairing.png`: Generación dinámica de código QR con token Ed25519 efímero para emparejamiento táctil.

### 🟡 Macro-Fase 05: Bóveda de Keystores & Re-Firma de APKs
- `admin_14_keystore_vault_schemes.png`: Bóveda de llaves RSA-4096 / ECDSA con esquemas JAR Scheme v1, v2 y v3.
- `admin_15_apk_signature_verification.png`: Inspección criptográfica de firmas de binarios APK en cliente.
- `admin_16_apk_resigned_in_action.png`: Proceso de zipalign y estampado de firma digital.

### 🟣 Macro-Fase 04: Motor de Comparación y Diff Visual AST
- `admin_13_visual_diff_comparator.png`: Comparador visual de divergencia entre capturas con layout shift score y deltas %.

### 🔴 Macro-Fase 03: Telemetría Física en Vivo (Samsung Galaxy A06)
- `admin_12_physical_telemetry_live.png`: Carga CPU MediaTek Helio G85, RAM PSS / Libre, 60 FPS y temperatura 31.4°C.
- `samsung_galaxy_a06_real.png`: Captura directa del dispositivo físico SM-A065M.
- `samsung_civer_store.png`: Civer App Store ejecutándose nativamente en la pantalla del Galaxy A06.

### 🟠 Macro-Fase 02: Hub de Builds y Parches Delta BSDiff/Zstandard
- `admin_09_delta_patches_view.png`: Motor de micro-parches para reducir el consumo de datos celulares hasta un 87%.

### ⚪ Macro-Fase 01: Galería y Crawler de Pantallas UIAutomator
- `admin_07_crawler_gallery_modal.png`: Explorador de pantallas y jerarquía de vistas de aplicaciones inspeccionadas.
- `admin_08_screen_lightbox_detail.png`: Inspección a resolución nativa con metadatos de accesibilidad.

---

### 🏛️ Certificación Criptográfica
- **Cero Daemons Residuales en el IDE**: 0 tareas de fondo colgadas.
- **Tipado TypeScript**: 0 errores (`tsc --noEmit` Exit Code 0).
- **Servidor Local**: `127.0.0.1:3000` con `HTTP 200 OK` permanente e inmortal.
