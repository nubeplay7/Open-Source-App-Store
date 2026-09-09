# Documento de Requerimientos de Producto (PRD)
## Civer App Store - The Open-Source Android Ecosystem & Cross-Device Matrix

---

| Metadato | Valor |
| :--- | :--- |
| **Documento** | PRD-CIVER-STORE-v2.6 |
| **Versión** | 2.6.0-PROD |
| **Estado** | Aprobado / En Producción |
| **Última Actualización** | 2026-09-09 |
| **Clasificación** | Software Libre (FOSS) - Licencia GNU GPL-3.0 |
| **Autores** | Civer Core Architecture Team |

---

## 1. Resumen Ejecutivo y Visión

**Civer App Store** nace para erradicar las restricciones arbitrarias, la telemetría invasiva y el monopolio de distribución impuesto por los ecosistemas cerrados en Android (como Google Play Store). Proporciona una solución integral de código abierto que une:
1. Un **catálogo curado y auditable** de aplicaciones y tiendas alternativas FOSS (F-Droid, Aurora Store, Droid-ify, Obtainium, Neo Store).
2. Una **aplicación nativa para Android** construida con tecnología WebAPK y Trusted Web Activity (TWA) con paridad 1:1 respecto a la plataforma web.
3. Un **motor de instalación remota entre dispositivos vinculados** (Play Store Parity) que permite enviar e instalar aplicaciones silenciosamente en teléfonos y tablets Android a través de la API de Shizuku.
4. Un **entorno de compilación continua (CI/CD)** que audita la salud heurística de los repositorios y permite despachar compilaciones directas hacia GitHub Actions.

---

## 2. Definición del Problema y Oportunidad

### 2.1 El Problema en los Ecosistemas Actuales
- **Vigilancia Comercial y Telemetría Oculta**: Más del 85% de las aplicaciones comerciales en Google Play contienen rastreadores de publicidad y analítica invasiva (Facebook Ads, Google AdMob, Adjust, AppsFlyer) sin consentimiento real del usuario.
- **Fragmentación de Tiendas FOSS**: Los usuarios que buscan soberanía digital deben alternar manualmente entre F-Droid, Aurora Store, Obtainium y descargas directas de APK en GitHub sin una interfaz unificada que compare características y versiones.
- **Falta de Paridad en Instalaciones Remotas**: Google Play permite enviar una app desde el navegador del PC a un teléfono con un solo clic. En el mundo del software libre no existía un mecanismo análogo, seguro y sin dependencias privativas de Google Play Services.
- **Inconsistencia entre Versión Web y Móvil**: Muchos proyectos mantienen interfaces web y aplicaciones nativas desincronizadas, obligando a reinstalaciones frecuentes de APKs voluminosos.

### 2.2 La Oportunidad de Civer Store
Crear una experiencia de usuario de primera clase, estéticamente cuidada y técnicamente robusta, que demuestre que el software libre puede igualar o superar la conveniencia de las plataformas corporativas sin comprometer la privacidad del usuario ni recopilar un solo byte de datos personales.

---

## 3. Personas y Casos de Uso Clave

### Persona 1: Lucas (32 años) — Defensor de la Privacidad y Usuario de GrapheneOS / CalyxOS
- **Contexto**: Utiliza un Google Pixel con una ROM AOSP sin Google Play Services (*de-Googled*).
- **Necesidad**: Necesita instalar y actualizar aplicaciones seguras sin rastreadores, verificando la firma digital y el hash SHA-256 de cada paquete antes de permitir su ejecución.
- **Solución Civer**: Descarga directa de APKs verificados, auditoría visual de Exodus Privacy y actualización OTA automática vía WebAPK.

### Persona 2: Elena (26 años) — Desarrolladora Android FOSS
- **Contexto**: Desarrolla utilidades de código abierto en Kotlin y publica releases en GitHub.
- **Necesidad**: Evaluar si su repositorio cumple con los estándares modernos (Gradle KTS, targetSdk 35, reproducibilidad de compilación) y automatizar builds de producción.
- **Solución Civer**: Módulo de Heuristic Health Score, cola de compilación persistente con reintentos y sincronización de documentación con Obsidian y Jira.

### Persona 3: Dr. Andrea (41 años) — Administrador de Flota de Dispositivos y Laboratorio
- **Contexto**: Gestiona una docena de dispositivos Android (teléfonos de pruebas, tablets de campo y pantallas Android TV).
- **Necesidad**: Distribuir herramientas de trabajo e instaladores APK a dispositivos específicos desde su estación de trabajo de escritorio sin cables USB ni adb manual.
- **Solución Civer**: Selector de flota remota con despacho push silencioso mediante Shizuku PackageInstaller API.

---

## 4. Requerimientos Funcionales (FR)

### FR-1: Catálogo Unificado y Matriz FOSS
- El sistema debe presentar un catálogo exhaustivo de herramientas y tiendas de software libre con clasificación por categorías (`STORES`, `UTILITIES`, `PRIVACY`, `SYSTEM`, `DEVELOPMENT`).
- Debe incluir indicadores en tiempo real de: licencia SPDX, conteo de rastreadores Exodus (0 trackers como estándar), tamaño del binario en MB, rating comunitario y fecha de último release.

### FR-2: Paridad 1:1 WebAPK / Trusted Web Activity (TWA)
- El sistema debe soportar instalación nativa en Android mediante WebAPK con registro del Service Worker en `sw.js`.
- La aplicación instalada en el dispositivo móvil debe consumir exactamente la misma lógica, rutas y estado local que la versión web, sin desfases de versión.
- Las actualizaciones del servidor deben reflejarse de forma transparente (OTA) mediante recarga atómica en segundo plano.

### FR-3: Sincronización de Flota e Instalación Remota (Play Store Parity)
- El usuario podrá visualizar todos los dispositivos Android vinculados a su cuenta (teléfonos, tablets, TVs).
- El usuario podrá seleccionar una aplicación del catálogo y un dispositivo destino, despachando un comando de instalación a distancia.
- El sistema debe mostrar una consola de despliegue en tiempo real con barra de progreso, validación de huella digital y confirmación de instalación.

### FR-4: Integración con Shizuku PackageInstaller API
- La app nativa en el dispositivo Android debe comunicarse con el servicio `moe.shizuku.privileged.api` para ejecutar instalaciones silenciosas y desatendidas (sin requerir acceso root).
- En dispositivos sin Shizuku configurado, el sistema debe degradar limpiamente abriendo el diálogo estándar del sistema Android (`Intent.ACTION_INSTALL_PACKAGE`).

### FR-5: Auditoría de Privacidad y Cero Rastreadores (Exodus Integration)
- Cada aplicación catalogada debe presentar su desglose de permisos Android solicitados (clasificados por nivel de riesgo: normal, peligroso, especial).
- Certificación visual del reporte Exodus Privacy demostrando la ausencia total de trackers analíticos y publicitarios.

### FR-6: Verificación Criptográfica Extremo a Extremo
- Cada aplicación debe exponer su digest SHA-256 pre-calculado y validado contra el release oficial de GitHub o el índice F-Droid v2.
- El instalador debe comparar el hash del binario descargado antes de invocar la API del sistema operativo, abortando la operación si existe la menor discrepancia.

### FR-7: Vista Matricial Avanzada (Matrix Pro)
- El sistema debe ofrecer una vista tabular de alta densidad con filtros dinámicos, ordenamiento multicriterio y búsqueda instantánea sin lag.
- Gráficos integrados con D3 y Recharts para visualizar tendencias de puntuación de salud, velocidad de sincronización y tamaños de paquetes.

### FR-8: Cola de Compilación Persistente CI/CD
- El usuario podrá encolar tareas de compilación automatizada (`assembleRelease`, `bundleRelease`) con persistencia en `localStorage`.
- Soporte para prioridades (`CRITICAL`, `HIGH`, `NORMAL`, `LOW`), política de reintentos con backoff y visualización de terminal de logs simulados/reales.

### FR-9: Calculador Heurístico de Salud de Repositorios (Health Score)
- Algoritmo que puntúa de 0 a 100% la calidad y mantenimiento de un repositorio Android evaluando:
  - Presencia de Gradle Wrapper actualizado (`gradlew`).
  - Adopción de Kotlin DSL (`build.gradle.kts`).
  - Nivel de `targetSdk` (mínimo 34, óptimo 35).
  - Recencia del último commit y frecuencia de releases.
  - Cobertura de pruebas unitarias y documentación (`README`, `CONTRIBUTING`).

### FR-10: Civer Dev Workspace (Obsidian, Jira, Slack)
- Exportador de notas de producto en formato Markdown estructurado con frontmatter YAML compatible con Obsidian Vaults.
- Conectores para despacho de webhooks hacia Jira (creación de incidencias) y Slack (notificaciones de releases y fallos de CI).

### FR-11: Almacenamiento Local Resiliente e IndexedDB Forense
- Registro de anomalías de red, caídas de descarga y fallos de verificación en la base de datos local IndexedDB (`civer_fault_telemetry_db`).
- Capacidad de exportar un volcado JSON para auditoría y diagnóstico técnico.

### FR-12: Sesión Unificada y Emparejamiento por Código QR
- El usuario podrá iniciar sesión con un identificador unificado (`Civer ID`) y emparejar nuevos dispositivos móviles mediante el escaneo de un código QR con clave efímera.

---

## 5. Requerimientos No Funcionales (NFR)

| Código | Requerimiento | Métrica Objetivo |
| :--- | :--- | :--- |
| **NFR-1** | **Rendimiento de Interfaz** | Tiempo de respuesta a interacciones de usuario < 100 ms. Renderizado a 60 FPS estables. |
| **NFR-2** | **Disponibilidad Offline** | Funcionalidad completa del catálogo en modo avión gracias a caché Service Worker e IndexedDB. |
| **NFR-3** | **Seguridad Criptográfica** | Verificación obligatoria SHA-256 en el 100% de los binarios distribuidos. |
| **NFR-4** | **Privacidad Absoluta** | 0 cookies de terceros, 0 scripts de tracking, 0 transmisión de identificadores de publicidad. |
| **NFR-5** | **Accesibilidad (a11y)** | Cumplimiento estricto del estándar WCAG 2.1 nivel AA. Ratio de contraste mínimo 4.5:1. |
| **NFR-6** | **Ergonomía Táctil Móvil** | Objetivos táctiles interactivos mínimos de 44x44 píxeles en dispositivos móviles. |
| **NFR-7** | **Compatibilidad Android** | Soporte verificado desde Android 7.0 (Nougat, API 24) hasta Android 15 (Vanilla Ice Cream, API 35). |
| **NFR-8** | **Optimización de Paquete** | Huella de la aplicación nativa en disco < 25 MB. Carga inicial en red 4G < 1.8 segundos. |

---

## 6. Métricas de Éxito y Validación (KPIs)

1. **Tasa de Éxito en Instalación Remota**: >= 99.2% de comandos despachados ejecutados correctamente en dispositivos online.
2. **Índice de Paridad Web/App**: 100% de sincronismo de vistas y configuraciones entre cliente web y app instalada.
3. **Satisfacción de Privacidad (Exodus Score)**: 0 rastreadores detectados en auditorías externas continuas.
4. **Tiempo de Ciclo de Compilación Heurística**: Cálculo y reporte de salud de repositorios en menos de 1.5 segundos.
