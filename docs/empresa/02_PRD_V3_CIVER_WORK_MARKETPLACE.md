# PRD v3.0 — CIVER WORK MARKETPLACE & APP STORE PLATFORM

> **Documento de Requerimientos de Producto**
> **Código:** PRD-CIVER-WORK-v3.0.0
> **Estado:** En Desarrollo Activo
> **Fecha:** 11 de Septiembre de 2026
> **Clasificación:** Software Libre (FOSS) — Licencia GNU GPL-3.0
> **Autores:** Civer Core Architecture Team & Enjambre Autónomo Bené
> **Dominio:** [https://appstore.civer.cloud](https://appstore.civer.cloud)

---

## 1. Resumen Ejecutivo

**Civer App Store** evoluciona de una tienda de aplicaciones FOSS a una **plataforma integral de trabajo y monetización de software móvil**. Esta versión 3.0 del PRD integra tres ecosistemas convergentes:

1. **App Store FOSS** — Catálogo curado de +25 aplicaciones verificadas con 0 rastreadores, compilación cloud real y distribución OTA permanente.
2. **Civer Work Hub** — Marketplace de trabajo remunerado donde personas sin experiencia técnica crean, prueban y monetizan aplicaciones usando agentes de IA ("Vibe Coding").
3. **Shark Tank Platform** — Sistema de inversión, negociación y contratos digitales vinculantes con distribución automática de regalías vitalicias.

### Alcance de esta Versión
- 25 requerimientos funcionales (FR-01 a FR-25)
- 10 requerimientos no funcionales (NFR-01 a NFR-10)
- 8 personas de usuario
- Flujos completos de compilación → distribución → monetización
- Ecosistema de comunicación comunitaria internacional

---

## 2. Problema y Oportunidad

### 2.1 Problemas que Resolvemos

```plaintext
+----+-------------------------------------------+----------------------------------------------+
| #  | Problema                                  | Impacto                                      |
+----+-------------------------------------------+----------------------------------------------+
| P1 | Google cobra 30% de comisión              | Desarrolladores pierden 1/3 de sus ingresos  |
| P2 | 85% de apps tienen rastreadores ocultos   | Usuarios vigilados sin consentimiento real    |
| P3 | Personas no-técnicas no pueden crear apps | Barrera de entrada de ~4 años de formación    |
| P4 | Testers de apps ganan $2-5/bug en uTest   | Remuneración injusta por trabajo valioso      |
| P5 | No existe marketplace de ideas → apps      | Las buenas ideas mueren por falta de recursos |
| P6 | Compilar apps requiere hardware costoso   | Licencias Android Studio + Mac para iOS       |
| P7 | Sin sistema de regalías para software     | Los autores no cobran por su propiedad        |
+----+-------------------------------------------+----------------------------------------------+
```

### 2.2 Nuestra Oportunidad

Crear la primera plataforma donde:
- Cualquier persona con una idea puede convertirla en una app funcional usando IA
- Los testers cobran $15-35 USD por misión (no por bug individual)
- Los inversionistas financian proyectos en Deal Rooms interactivas
- Los desarrolladores reciben regalías vitalicias irrevocables del 20%
- Todo el cómputo (GPU, compilación, hosting) es proporcionado por Civer Cloud
- 0% Google Tax, 0 rastreadores, 100% código abierto

---

## 3. Personas de Usuario

### Persona 1: María (24 años) — La Vibe Coder
- **Perfil**: Estudiante de comunicación en Veracruz. No sabe programar pero usa ChatGPT a diario.
- **Necesidad**: Convertir su idea de app de recetas regionales en una app real que le genere ingresos pasivos.
- **Flujo**: Postula idea en Shark Tank → Un inversor la financia → María habla con los agentes de IA para diseñar la app → La app se compila en la nube → Se publica → María cobra 20% de regalías de por vida.
- **Requisito mínimo**: 2 horas al día, un teléfono Android, cuenta de Telegram.

### Persona 2: Carlos (35 años) — El QA Tester Remunerado
- **Perfil**: Mecánico en Puebla con un Samsung Galaxy A14. Busca ingresos extra.
- **Necesidad**: Ganar dinero probando apps en su tiempo libre (noches y fines de semana).
- **Flujo**: Se registra → Completa onboarding → Elige misiones abiertas ($15-35 USD c/u) → Instala APK → Sigue checklist → Sube reporte con capturas → Cobra por Lightning Network en <2 segundos.

### Persona 3: Ingeniero López (41 años) — El Shark Investor
- **Perfil**: Dueño de una empresa de logística en Monterrey.
- **Necesidad**: Necesita una app de rastreo GPS para sus 50 camiones sin pagar $200K a una consultora.
- **Flujo**: Publica proyecto privado B2B en Shark Tank → Ofrece $18,000 USD + 12% equity → Vibe Coders aplican → Negocia en Deal Room → Firma contrato digital → App se construye en 3-6 meses → López ahorra 90%.

### Persona 4: Lucas (32 años) — El Defensor de la Privacidad
- **Perfil**: Ingeniero en ciberseguridad con GrapheneOS en un Pixel 8.
- **Necesidad**: Apps verificadas criptográficamente con 0 rastreadores y código auditable.
- **Flujo**: Navega catálogo → Verifica SHA-256 → Revisa reporte Exodus → Descarga e instala → Actualización OTA automática.

### Persona 5: Elena (26 años) — La Desarrolladora FOSS
- **Perfil**: Programadora Kotlin que publica en GitHub. Quiere más visibilidad.
- **Necesidad**: Evaluar la salud de su repositorio y automatizar compilaciones.
- **Flujo**: Ingresa URL de repo → Health Score automático → Encola compilación → APK firmado en <3 minutos → Distribución OTA.

### Persona 6: Dr. Andrea (41 años) — Administradora de Flota
- **Perfil**: Gestiona 12 tablets Android en un laboratorio universitario.
- **Necesidad**: Instalar herramientas en todos los dispositivos desde su escritorio.
- **Flujo**: Conecta dispositivos → Selecciona app → "Instalar en todos" → Shizuku silent install.

### Persona 7: Roberto (19 años) — El Mantenedor Junior
- **Perfil**: Estudiante de informática que quiere experiencia real en open source.
- **Necesidad**: Contribuir a proyectos reales y ganar dinero mientras aprende.
- **Flujo**: Aplica como mantenedor de un proyecto Shark Tank → Revisa PRs → Gestiona releases → Cobra 10% de regalías.

### Persona 8: Sofía (45 años) — La Directora de Innovación
- **Perfil**: VP de innovación en una aseguradora. Busca prototipos rápidos.
- **Necesidad**: Probar ideas de apps internas sin comprometer presupuesto de TI.
- **Flujo**: Crea proyecto privado → Asigna presupuesto confidencial → Firma NDA digital → Vibe Coders construyen prototipo → Testing interno → Decisión de producción.

---

## 4. Requerimientos Funcionales

### Bloque A: App Store FOSS (FR-01 a FR-12) — Funcionalidad Existente

**FR-01: Catálogo Unificado FOSS**
- Catálogo de +25 aplicaciones con 20+ campos técnicos por entrada
- Clasificación por categorías: STORES, UTILITIES, PRIVACY, SYSTEM, DEVELOPMENT, AI_SUITE
- Indicadores: licencia SPDX, rastreadores Exodus (0), tamaño MB, rating, último release
- Motor de búsqueda instantánea (<100ms)

**FR-02: Paridad 1:1 WebAPK / TWA**
- Instalación nativa Android mediante WebAPK con Service Worker `sw.js`
- Sincronización de estado entre web y app instalada
- Actualizaciones OTA transparentes en segundo plano

**FR-03: Sincronización de Flota e Instalación Remota**
- Visualización de todos los dispositivos Android vinculados
- Despacho de comandos de instalación web-a-móvil
- Consola de despliegue en tiempo real con barra de progreso

**FR-04: Integración Shizuku PackageInstaller API**
- Instalación silenciosa via `moe.shizuku.privileged.api`
- Degradación limpia a `Intent.ACTION_INSTALL_PACKAGE` sin Shizuku

**FR-05: Auditoría Exodus Privacy**
- Desglose de permisos por nivel de riesgo (normal, peligroso, especial)
- Certificación visual de 0 rastreadores

**FR-06: Verificación Criptográfica SHA-256**
- Digest SHA-256 expuesto y validado contra release oficial
- Abort automático si hay discrepancia en el hash

**FR-07: Vista Matrix Pro**
- Tabla de alta densidad con filtros dinámicos
- Gráficos D3/Recharts de tendencias de salud

**FR-08: Cola de Compilación CI/CD**
- Compilaciones `assembleRelease` / `bundleRelease` persistentes
- Prioridades: CRITICAL, HIGH, NORMAL, LOW
- Reintentos con backoff exponencial

**FR-09: Health Score Calculator**
- Puntuación 0-100% de repositorios Android
- Evaluación: Gradle Wrapper, Kotlin DSL, targetSdk, commits, tests

**FR-10: Civer Dev Workspace**
- Exportación Markdown compatible con Obsidian
- Webhooks Jira y Slack

**FR-11: IndexedDB Forense**
- Registro local de anomalías y fallos
- Exportación JSON de auditoría

**FR-12: Civer ID y QR Pairing**
- Identificador unificado de usuario
- Emparejamiento de dispositivos por código QR efímero

---

### Bloque B: Civer Work Marketplace (FR-13 a FR-19) — NUEVA FUNCIONALIDAD

**FR-13: Bolsa de Misiones de Testing Remunerado**
- Listado de misiones abiertas con recompensa en USD y satoshis
- Filtros por: app, dispositivo requerido, recompensa, severidad
- Checklist interactivo que el tester debe completar
- Envío de reportes con capturas de pantalla y texto descriptivo
- Multiplicador de severidad de bugs: Low (1x), Medium (1.5x), High (2x), Critical (2.5x)
- Estado de misiones: OPEN → IN_PROGRESS → IN_REVIEW → COMPLETED

**FR-14: Wallet del Colaborador**
- Balance en USD y satoshis
- Historial de ganancias y misiones completadas
- Pending review (pagos en validación)
- Lifetime earnings (total acumulado)
- Métodos de pago: Lightning Network, SPEI bancario, USDT, Civer Credits

**FR-15: Calculadora de Regalías**
- Slider interactivo de ingresos proyectados ($500 - $30,000 USD)
- Desglose por rol: 51% Civer / 15% Idea / 20% Dev / 10% Maintainer / 4% QA
- Visualización de ganancia mensual estimada por rol

**FR-16: Visor y Firma de Contratos Digitales**
- Contratos generados con ID único: `CIVER-CONTRACT-YYYY-XXXX`
- Cláusula de cesión de IP con texto legal completo
- Firma digital con hash SHA-256
- Estados: DRAFT → SIGNED → ACTIVE → FULFILLED
- Jurisdicción de arbitraje: Civer Cloud Sovereign Digital Court

**FR-17: Convocatorias de Participación**
- Publicación de convocatorias con requisitos formales:
  - Tiempo mínimo disponible (ej: 2h/día)
  - Dispositivo Android requerido
  - Idiomas hablados
  - Habilidades deseadas (opcionales)
- Proceso: Registro → Verificación → Onboarding → Primera Misión
- Soporte multilingüe: español, inglés, portugués

**FR-18: Sistema de Reputación y Badges**
- 5 niveles de reputación: Novato → Verificado → Experto → Maestro → Leyenda
- Criterios de ascenso: misiones completadas, bugs válidos, apps publicadas
- Badges especiales: "Bug Hunter", "Vibe Master", "Shark Survivor", "Privacy Guardian"
- Puntaje visible en perfil público

**FR-19: Panel de Actividad y Métricas del Colaborador**
- Dashboard personal con:
  - Misiones activas y completadas
  - Contratos vigentes
  - Ganancias del mes vs mes anterior
  - Nivel de reputación y progreso al siguiente
  - Convocatorias disponibles para su perfil

---

### Bloque C: Shark Tank Platform (FR-20 a FR-25) — NUEVA FUNCIONALIDAD

**FR-20: Publicación de Proyectos en Shark Tank**
- Creación de proyectos con: título, tagline, categoría, meta de financiamiento
- Tipos: Open Source (público) y Privado B2B (confidencial)
- Campos requeridos: vibeCodingPromptIdea, equityOfferedPct, proposedSalaryUsd
- Roles requeridos seleccionables: IDEA_AUTHOR, VIBE_CODER, QA_TESTER, LEAD_MAINTAINER
- Estados: LOOKING_FOR_DEV → NEGOTIATION_ROOM → FUNDED_IN_DEV → PUBLISHED

**FR-21: Deal Rooms (Salas de Negociación)**
- Chat persistente entre inversor y candidatos
- Mensajes con timestamp y avatar del rol
- Protocolo: Propuesta → Contrapropuesta → Acuerdo → Firma
- Integración con Zoom/Google Meet para videollamadas
- Historial completo de negociación almacenado

**FR-22: Flujo Completo de Compilación → Distribución → Monetización**
```plaintext
  [PASO 1] Idea postulada en Shark Tank
      |
  [PASO 2] Inversor financia el proyecto
      |
  [PASO 3] Vibe Coder habla con agentes IA para diseñar la app
      |
  [PASO 4] Código generado se envía a GitHub
      |
  [PASO 5] Compilación automática en GitHub Actions (Ubuntu, JDK 17, SDK 35)
      |
  [PASO 6] APK firmado con scheme v2+v3 y verificado SHA-256
      |
  [PASO 7] Distribución en GitHub Releases CDN + Cloudflare
      |
  [PASO 8] QA Testers prueban en dispositivos reales
      |
  [PASO 9] Reportes de bugs alimentan auto-reparación por IA
      |
  [PASO 10] Publicación oficial en el catálogo de Civer App Store
      |
  [PASO 11] Usuarios descargan e instalan
      |
  [PASO 12] Ingresos se distribuyen automáticamente:
            51% Civer Cloud + 15% Autor + 20% Dev + 10% Maintainer + 4% QA
```

**FR-23: Contratos de Inversión con Equity**
- El inversor define: capital invertido, equity ofrecido, salario mensual, hitos de entrega
- Contrato digital con cláusulas de:
  - Cesión patrimonial a Civer Cloud Enterprise
  - Garantía irrevocable de regalías para el colaborador
  - Penalizaciones por incumplimiento de hitos
  - Cláusula de exit / buyback
- Firma digital bilateral con huella SHA-256

**FR-24: Sistema de Comunicación Multi-Canal**
- Canales de Telegram integrados por proyecto
- Foro interno con categorías: Anuncios, Soporte, Ideas, Bugs, Showcase
- Notificaciones push vía bot Telegram (@EnviodeApkCompiladaBot)
- Integración con herramientas externas: Zoom, Google Chat, Discord (opcional)

**FR-25: Pagos y Retiros Instantáneos**
- Lightning Network: pagos en satoshis en <2 segundos
- SPEI bancario: transferencias en pesos mexicanos
- USDT/USDC: para colaboradores internacionales
- Civer Credits: moneda interna canjeable
- Dashboard de finanzas personal con historial completo

---

## 5. Requerimientos No Funcionales

```plaintext
+--------+----------------------------------------------+--------------------------------------------+
| Código | Requerimiento                                | Métrica Objetivo                           |
+--------+----------------------------------------------+--------------------------------------------+
| NFR-01 | Rendimiento de Interfaz                      | Respuesta <100ms, 60 FPS estables          |
| NFR-02 | Disponibilidad Offline                       | Catálogo completo en modo avión             |
| NFR-03 | Seguridad Criptográfica                      | SHA-256 en 100% de binarios                |
| NFR-04 | Privacidad Absoluta                          | 0 cookies, 0 trackers, 0 ad IDs           |
| NFR-05 | Accesibilidad WCAG 2.1 AA                   | Contraste ≥4.5:1, touch target ≥44px      |
| NFR-06 | Compatibilidad Android                       | Android 7.0 (API 24) a Android 15 (API 35)|
| NFR-07 | Tamaño de Paquete                            | PWA <25 MB, carga 4G <1.8s                |
| NFR-08 | Disponibilidad Cloud                         | 99.9% uptime (SLA Cloudflare)             |
| NFR-09 | Latencia de Compilación                      | APK compilado en <5 minutos                |
| NFR-10 | Latencia de Pagos                            | Lightning <2s, SPEI <24h                   |
+--------+----------------------------------------------+--------------------------------------------+
```

---

## 6. Métricas de Éxito (KPIs)

### KPIs de Plataforma
1. **Tasa de Éxito de Compilación Cloud**: ≥ 95% de builds exitosos
2. **Tasa de Instalación Remota**: ≥ 99.2% de comandos ejecutados
3. **Paridad Web/App**: 100% sincronismo
4. **Exodus Score**: 0 rastreadores en auditorías

### KPIs de Marketplace
5. **Misiones de Testing Completadas/Mes**: ≥ 50 en Año 1
6. **Proyectos Shark Tank Activos**: ≥ 10 en Año 1
7. **Testers Activos Mensuales**: ≥ 50 en Año 1, ≥ 500 en Año 2
8. **Tiempo Medio de Pago**: <5 minutos (Lightning), <24h (SPEI)
9. **NPS de Colaboradores**: ≥ 70
10. **Revenue Mensual Recurrente (MRR)**: $1,250 USD en Año 1

### KPIs de Calidad
11. **Health Score Promedio del Catálogo**: ≥ 75/100
12. **Bugs Críticos Abiertos**: ≤ 3 en cualquier momento
13. **Cobertura de Testing**: ≥ 80% de apps del catálogo testeadas

---

## 7. Dependencias Técnicas

```plaintext
+----------------------------------+----------------------------+-------------------+
| Dependencia                      | Proveedor                  | Criticidad        |
+----------------------------------+----------------------------+-------------------+
| React 18 + TypeScript 5.7       | Meta / Microsoft           | ALTA              |
| Vite 6.x + PWA Plugin           | Evan You / Community       | ALTA              |
| Tailwind CSS 3.4                 | Tailwind Labs              | ALTA              |
| Lucide React Icons               | Lucide Contributors        | MEDIA             |
| Recharts 3.x + D3               | recharts.org               | MEDIA             |
| GitHub Actions API v3            | GitHub / Microsoft         | CRÍTICA           |
| Cloudflare Pages + Tunnels       | Cloudflare Inc.            | CRÍTICA           |
| DigitalOcean Droplets            | DigitalOcean LLC           | ALTA              |
| Kaggle Notebooks API             | Google / Kaggle            | ALTA              |
| Telegram Bot API                 | Telegram LLC               | MEDIA             |
| Shizuku API (Android)            | RikkaApps                  | MEDIA             |
| Lightning Network (BOLT11)       | Lightning Labs + Community | BAJA (futuro)     |
+----------------------------------+----------------------------+-------------------+
```

---

## 8. Cronograma de Implementación

```plaintext
+--------+----------------------------------------+---------------------+------------------+
| Fase   | Hito                                   | Trimestre           | Estado           |
+--------+----------------------------------------+---------------------+------------------+
| v1.0   | Catálogo FOSS + Búsqueda + Vistas     | Q1-Q2 2026          | ✅ COMPLETADO    |
| v2.0   | CI/CD + Health Score + Flota + ADB    | Q2-Q3 2026          | ✅ COMPLETADO    |
| v2.6   | Matrix Pro + OTA + Shizuku + Telegram | Q3 2026             | ✅ COMPLETADO    |
| v3.0   | Civer Work Hub + Shark Tank           | Q3-Q4 2026          | 🔄 EN CURSO      |
| v3.5   | Pagos Lightning + Convocatorias       | Q1 2027             | 📋 PLANIFICADO   |
| v4.0   | Deal Rooms Live + Contratos Legales   | Q2 2027             | 📋 PLANIFICADO   |
| v5.0   | Red Federada + DAO + P2P             | 2028                | 🔮 VISIÓN        |
+--------+----------------------------------------+---------------------+------------------+
```

---

## 9. Riesgos y Mitigación

```plaintext
+----+-----------------------------------+----------------+----------------------------------------+
| #  | Riesgo                            | Probabilidad   | Mitigación                             |
+----+-----------------------------------+----------------+----------------------------------------+
| R1 | GitHub Actions cambia límites     | Media          | OmniBuild Mesh multi-proveedor         |
| R2 | Adopción lenta del marketplace    | Alta           | Programa de referidos + content YouTube |
| R3 | Regulación financiera cripto      | Media          | Asesoría legal fintech + SPEI backup   |
| R4 | Competencia directa de Google     | Baja           | Diferenciación: privacidad + regalías  |
| R5 | Fraude en misiones de testing     | Media          | Verificación cruzada + reputación      |
| R6 | Dependencia de Kaggle GPU         | Media          | Diversificación: Baseten, Vast.ai      |
+----+-----------------------------------+----------------+----------------------------------------+
```

---

*PRD-CIVER-WORK-v3.0.0 — Civer Cloud Enterprise — Software Libre y Soberanía Digital*
