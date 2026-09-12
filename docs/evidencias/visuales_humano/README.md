# 📱 Galería de Evidencias Visuales para el Humano - Civer App Store

> **Ubicación**: `docs/evidencias/visuales_humano/`  
> **Fecha de Certificación**: 11 de Septiembre de 2026  
> **Dispositivo Físico Certificado**: Samsung Galaxy A06 (SM-A065M), Serial: `R8YY500R7ZB`  
> **Dominio Exclusivo Oficial**: [`https://appstore.civer.cloud/`](https://appstore.civer.cloud/)  

---

## 1. Evidencias del Despliegue en Hardware Físico Samsung Galaxy A06

| Archivo de Captura | Resolución / Formato | Descripción del Flujo Verificado |
| :--- | :--- | :--- |
| `samsung_appstore_live.png` | 720×1600 (PNG Nativo) | Civer App Store corriendo en vivo en el dispositivo físico con One UI Core 6.1. |
| `samsung_appstore_v104_live.png` | 720×1600 (PNG Nativo) | Versión v1.0.4 instalada con comprobación de checksum SHA-256 e instalador silencioso Shizuku. |
| `samsung_galaxy_a06_real.png` | 720×1600 (PNG Nativo) | Telemetría de batería (29.8°C / 100%) y ventana en primer plano confirmada por `dumpsys window`. |
| `samsung_appstore_benchmarks.png` | 720×1600 (PNG Nativo) | Cold-Start validado en 385ms y renderizado continuo a 60 FPS estables. |
| `samsung_comparador_vs_live.png` | 720×1600 (PNG Nativo) | Módulo interactivo de comparación contra tiendas privativas (Civer vs Google Play vs Aurora). |
| `samsung_recomendador_quiz_live.png` | 720×1600 (PNG Nativo) | Cuestionario interactivo de recomendación de apps FOSS basado en afinidad de privacidad. |

---

## 2. Evidencias del Crawler de Pantallas de Aplicaciones del Catálogo

| Aplicación | Capturas Mapeadas | Estado en Hardware |
| :--- | :--- | :--- |
| **Spotube FOSS** | `real_spotube_01_welcome.png` hasta `05_settings.png` y `spotube_screen_01` a `07` | Instalado y verificado en Android físico sin rastreadores. |
| **Civer Store WebNative** | `samsung_civer_store_clean.png`, `samsung_feed_live.png` | PWA sincronizada 1:1 con caché atómica fuera de línea. |
| **Aurora Store Gateway** | `samsung_filtro_aurora_live.png`, `samsung_comparativa_aurora_scroll_live.png` | Enrutamiento FOSS anónimo verificado. |

---

## 3. Certificados Criptográficos Relacionados

- **Certificado de Autodespliegue**: [`docs/evidencias/samsung_a06_auto_deploy_certificate.json`](../samsung_a06_auto_deploy_certificate.json)
- **Telemetría Térmica y Rendimiento**: [`docs/evidencias/samsung_a06_telemetry_certification.json`](../samsung_a06_telemetry_certification.json)
- **API Pública en Tiempo Real**: [`public/api/v1/hardware/install-status.json`](../../../public/api/v1/hardware/install-status.json)
