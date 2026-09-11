# 12. ARQUITECTURA HIDROLÓGICA DE RÍOS Y LAGUNAS (PHP 8.2 + WORDPRESS HEADLESS)

> **Estado**: Producción / Despliegue en Clúster Híbrido  
> **Patrón**: Hydrological Microservices Architecture (Ríos & Lagunas)  
> **Objetivo**: Conectar el poder de PHP moderno (8.2+), el ecosistema headless de WordPress y clones soberanos FOSS de Elementor y WooCommerce con la plataforma global de Civer Cloud y la app nativa Android.

---

## 1. Fundamentos de la Arquitectura de Ríos y Lagunas

La metáfora hidrológica de Civer Cloud modela el flujo continuo de datos, código y transacciones como un sistema de cuencas interconectadas:

```
                  ┌──────────────────────────────────────────────┐
                  │    CORDILLERA DE PROVEEDORES DE CÓMPUTO      │
                  │ (Kaggle T4/TPU, Baseten, DigitalOcean, ASUS) │
                  └──────────────────────┬───────────────────────┘
                                         │  (Torrentes de Tokens & Compilación)
                                         ▼
                 ╔════════════════════════════════════════════════╗
                 ║       RÍO PRINCIPAL: OMNIROUTER & GATEWAY      ║
                 ║        (:3080 Civer Cloud Mesh & APIs)         ║
                 ╚══════════╦═════════════════════════════════════╝
                            │
       ┌────────────────────┼───────────────────────────┐
       ▼                    ▼                           ▼
┌──────────────┐    ┌────────────────┐         ┌─────────────────┐
│ LAGUNA REACT │    │   LAGUNA PHP   │         │ LAGUNA WORDPRESS│
│  & VITE PWA  │    │  (PHP 8.2 CLI) │         │ (Headless Core) │
│  Frontend    │    │  Microservices │         │  CMS & Plugins  │
└──────┬───────┘    └───────┬────────┘         └────────┬────────┘
       │                    │                           │
       │   Canal JSON-RPC   │   Canal REST / Headless   │
       └────────────────────┼───────────────────────────┘
                            ▼
        ╔═══════════════════════════════════════════╗
        ║    ESTUARIO: APP NATIVA ANDROID & TWA     ║
        ║  (Samsung Galaxy A06 / Dispositivos FOSS) ║
        ╚═══════════════════════════════════════════╝
```

### Conceptos Clave
1. **Ríos (Rivers)**: Canales de transporte de alta velocidad (WebSockets, REST APIs, JSON-RPC, canales gRPC y buses de eventos SSE) que transfieren estados entre nodos.
2. **Lagunas (Lakes / Lagoons)**: Ambientes de ejecución especializados donde residen datos persistentes o motores de renderizado específicos:
   - **Laguna PHP (`php/api/`)**: Motor ligero y ultra-rápido impulsado por el runtime nativo `PHP 8.2.33 ZTS x64`, que procesa lógica de negocio, layouts visuales y órdenes transaccionales sin overhead.
   - **Laguna WordPress Headless (`php/wordpress-plugins/`)**: Instancias desacopladas de WordPress utilizadas exclusivamente como gestor de contenidos y repositorio de extensiones modulares, exponiendo endpoints bajo `/wp-json/civer/v1/`.
   - **Laguna React / PWA (`src/`)**: Frontend cliente y catálogo interactivo con soporte de caché offline atómica y Service Workers.
3. **Afluentes (Tributaries)**: Micro-plugins y scripts satélites que aportan funcionalidades específicas (pagos Lightning BOLT11, dispersión SPEI Banxico, exportación a Jetpack Compose).

---

## 2. Clones Soberanos FOSS de Infraestructura Crítica

### A. Clon de Elementor FOSS: Constructor Visual Headless
- **Problema en WordPress tradicional**: Elementor genera marcado HTML pesado, dependencias de scripts innecesarios y no cuenta con salida nativa para aplicaciones móviles.
- **Solución Civer FOSS (`php/api/controllers/BuilderController.php`)**:
  - **Entrada**: Especificación declarativa en JSON de bloques (`HERO_BANNER`, `APP_SHOWCASE_GRID`, `FEATURE_MATRIX`, `CTA_CONVERSION`).
  - **Doble Renderizado Simultáneo (Dual-Stream Target)**:
    1. **Salida Web**: HTML semántico depurado con clases atómicas de Tailwind CSS v4, sin hojas de estilo externas bloqueantes.
    2. **Salida Android Nativa**: Código fuente en Kotlin con funciones composables `@Composable` de Jetpack Compose, garantizando paridad 1:1 entre lo visto en la web y la aplicación móvil nativa.

### B. Clon de WooCommerce FOSS: Comercio Desacoplado 0% Comisiones
- **Problema en tiendas convencionales y Google Play**: Comisiones abusivas del 15% al 30% por transacción, retención arbitraria de fondos y pasarelas con comisiones intermedias.
- **Solución Civer FOSS (`php/api/controllers/CommerceController.php`)**:
  - **Comisión de Plataforma**: **0%** para transacciones directas entre creadores de software y usuarios.
  - **Métodos de Liquidación Instantánea**:
    - **Bitcoin Lightning Network (BOLT11)**: Pagos instantáneos en satoshis con liquidación criptográfica en milisegundos y comisiones de red sub-céntimo.
    - **SPEI Directo (Banxico / STP)**: Transferencias bancarias mexicanas 24/7 sin intermediarios privados, verificables mediante CEP (Comprobante Electrónico de Pago).
    - **Balance Civer Work**: Saldo acumulado por actividades remuneradas en la tienda (testeo de APKs, auditoría de permisos, reporte de bugs).

---

## 3. Bóveda de Plugins WordPress Soberanos (`php/wordpress-plugins/`)

El ecosistema genera y mantiene plugins modulares listos para ser instalados en cualquier WordPress convencional para convertirlo en un nodo headless de Civer Cloud:

| Plugin | Versión | Directorio | Función Principal |
| :--- | :--- | :--- | :--- |
| **`civer-cloud-headless-bridge`** | 1.0.0 | `php/wordpress-plugins/civer-cloud-headless-bridge/` | Expone la API REST `/wp-json/civer/v1/apps` con índices de salud, APKs firmados y telemetría de clúster. |
| **`civer-commerce-engine`** | 1.0.0 | `php/wordpress-plugins/civer-commerce-engine/` | Sustituto headless de WooCommerce con pasarelas Lightning Network y SPEI directo. |
| **`civer-visual-builder-engine`** | 1.0.0 | `php/wordpress-plugins/civer-visual-builder-engine/` | Sustituto headless de Elementor que compila a Tailwind CSS y Jetpack Compose. |

---

## 4. Endpoints y Protocolo de Comunicación REST de la Laguna PHP

El enrutador nativo `php/api/router.php` despacha peticiones mediante CLI o servidor web integrado (`php -S 127.0.0.1:8088`):

### 1. `GET /api/health`
- **Controlador**: `HealthController::status()`
- **Respuesta**: Telemetría de runtime (versión de PHP, extensiones `curl`, `openssl`, `pdo_sqlite`, memoria RAM utilizada, timestamp de servidor).

### 2. `POST /api/builder/render`
- **Controlador**: `BuilderController::render()`
- **Cuerpo (JSON)**: Lista de bloques declarativos.
- **Respuesta**: 
  - `html`: Marcado optimizado con Tailwind CSS.
  - `compose`: Código fuente Kotlin `@Composable`.
  - `blockCount`: Conteo total de bloques renderizados.

### 3. `GET /api/commerce/products`
- **Controlador**: `CommerceController::getProducts()`
- **Respuesta**: Catálogo de aplicaciones, módulos de código y suscripciones para desarrolladores con precios en USD, Satoshis y MXN SPEI.

### 4. `POST /api/commerce/order`
- **Controlador**: `CommerceController::createOrder()`
- **Cuerpo (JSON)**: `productId`, `paymentMethod`, `customerEmail`.
- **Respuesta**: ID de orden, factura Lightning (factura `lnbc...`), CLABE interbancaria SPEI y cálculo de ahorro del 30% frente a la tasa de Google Play.

### 5. `GET /api/plugins/list`
- **Controlador**: `WordPressBridgeController::getPlugins()`
- **Respuesta**: Registro de plugins detectados en `php/wordpress-plugins/` con cabeceras de metadatos oficiales de WordPress.

---

## 5. Resiliencia y Tolerancia a Fallos (Offline Graceful Fallback)

El servicio `src/services/phpHydrologyService.ts` implementa el principio de **Degradación Elegante Determinista**:
1. **Intento Primario**: Conexión HTTP al endpoint de la Laguna PHP local o remota.
2. **Fallback Local Transparente**: Si el servicio PHP no responde (por corte de red o proceso detenido), el cliente en TypeScript sintetiza localmente los bloques visuales a Tailwind CSS y emite facturas y pedidos simulados criptográficamente verificables, garantizando que el usuario jamás enfrente una pantalla de error.
3. **Sincronización Diferida**: Las órdenes generadas en modo offline se encolan en `localStorage` (`civer_pending_commerce_orders_v1`) y se sincronizan automáticamente tan pronto como la Laguna PHP vuelva a estar en línea.

---

## 6. Hoja de Ruta de Expansión del Ecosistema Hidrológico

1. **Fase 1 (Completada)**:
   - Implementación de controladores PHP nativos y enrutador modular.
   - Creación de plugins exportables en `php/wordpress-plugins/`.
   - Interfaz interactiva completa en React (`PhpHydrologyEcosystemView.tsx`).
   - Integración con navegación principal (Sidebar y Navbar).
2. **Fase 2 (En curso)**:
   - Sonda automática en `tools/health_canary_daemon.cjs`.
   - Generación de paquetes ZIP exportables de plugins para WordPress.org.
   - Conector con base de datos SQLite persistente para órdenes comerciales (`php/api/database/civer_commerce.sqlite`).
3. **Fase 3 (Siguiente Hito)**:
   - Despliegue de contenedor Docker PHP 8.2-FPM en DigitalOcean Always-On Droplet.
   - Conexión del río de eventos SSE para notificaciones de pago instantáneas en la app de Android.
