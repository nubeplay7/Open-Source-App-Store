export interface RoadmapPhaseItem {
  id: number;
  phaseCode: string;
  title: string;
  macroStage: 'Etapa I: Fundamentos & Vistas Duales' | 'Etapa II: Hardware & Cloudflare' | 'Etapa III: Descentralización P2P & Malla' | 'Etapa IV: Seguridad DEX & Privacidad' | 'Etapa V: Escala Planetaria & DAO';
  specialty: string;
  objective: string;
  keyDeliverables: string[];
  status: 'COMPLETO' | 'EN_CURSO' | 'SIGUIENTE' | 'PLANIFICADO';
  assignee: 'Enjambre IA' | 'Administrador Humano' | 'Híbrido Agente-Humano';
  verificationCriteria: string;
}

export const ROADMAP_50_PHASES: RoadmapPhaseItem[] = [
  // ETAPA I: Fundamentos & Vistas Duales (Fases 1 a 10)
  {
    id: 1,
    phaseCode: 'FASE-01',
    title: 'Génesis: Matriz FOSS y Benchmarks de Rendimiento',
    macroStage: 'Etapa I: Fundamentos & Vistas Duales',
    specialty: 'Arquitectura & Benchmarks',
    objective: 'Establecer la comparativa técnica en 25 dimensiones entre 10 tiendas FOSS y medir consumo de RAM.',
    keyDeliverables: ['Matriz 10 Tiendas', 'Test de consumo RAM', 'Quiz interactivo de recomendación'],
    status: 'COMPLETO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Tabla comparativa renderizando 25 columnas sin errores.'
  },
  {
    id: 2,
    phaseCode: 'FASE-02',
    title: 'Vistas Duales: Material 3 Expressive & Cupertino Glass',
    macroStage: 'Etapa I: Fundamentos & Vistas Duales',
    specialty: 'Diseño UI/UX',
    objective: 'Desarrollar vistas nativas inspiradas en Google Play Store y Apple App Store con catálogo FOSS.',
    keyDeliverables: ['PlayStoreView.tsx', 'AppStoreView.tsx', 'Filtros por categoría', 'Modal de detalle'],
    status: 'COMPLETO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Alternancia fluida entre interfaz Android e iOS.'
  },
  {
    id: 3,
    phaseCode: 'FASE-03',
    title: 'Compilador Cloud y Actualizaciones Delta BSDiff',
    macroStage: 'Etapa I: Fundamentos & Vistas Duales',
    specialty: 'CI/CD & Optimización',
    objective: 'Implementar emulación de builds en la nube con cálculo de deltas binarios para ahorro de datos.',
    keyDeliverables: ['GitHubCompilerModal.tsx', 'Algoritmo BSDiff', 'Simulador de compilación Gradle'],
    status: 'COMPLETO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Generación de parche binario con >70% de reducción de tamaño.'
  },
  {
    id: 4,
    phaseCode: 'FASE-04',
    title: 'Civer Dev Workspace: Obsidian, Jira y Slack',
    macroStage: 'Etapa I: Fundamentos & Vistas Duales',
    specialty: 'DevOps & Productividad',
    objective: 'Integrar entorno de desarrollo colaborativo con tablero Kanban, editor Markdown y mensajería.',
    keyDeliverables: ['CiberDevWorkspaceView.tsx', 'Tablero Jira interactivo', 'Cuadernos Obsidian', 'Canales Slack'],
    status: 'COMPLETO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Movimiento de tarjetas entre columnas y edición de notas vivas.'
  },
  {
    id: 5,
    phaseCode: 'FASE-05',
    title: 'Bóveda Keystore y Verificación de Firmas v1-v4',
    macroStage: 'Etapa I: Fundamentos & Vistas Duales',
    specialty: 'Seguridad Criptográfica',
    objective: 'Administrar certificados RSA/ECDSA y verificar compatibilidad con esquemas v1 a v4 de Android.',
    keyDeliverables: ['KeystoreVaultModal.tsx', 'Generador de llaves', 'Inspector de apksigner'],
    status: 'COMPLETO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Huella SHA-256 extraída y validación de firma v2/v3.'
  },
  {
    id: 6,
    phaseCode: 'FASE-06',
    title: 'Motor de Temas Cromáticos y 16 Feature Flags',
    macroStage: 'Etapa I: Fundamentos & Vistas Duales',
    specialty: 'Resiliencia & Ergonomía',
    objective: 'Implementar 8 paletas de color de alto contraste y 16 interruptores funcionales no destructivos.',
    keyDeliverables: ['themeProfilesData.ts', 'functionalityProfilesData.ts', 'Selector de temas en caliente'],
    status: 'COMPLETO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Cambio instantáneo de variables CSS :root y persistencia de flags.'
  },
  {
    id: 7,
    phaseCode: 'FASE-07',
    title: 'Descompilador DEX Smali y Sandbox de Seguridad',
    macroStage: 'Etapa I: Fundamentos & Vistas Duales',
    specialty: 'Ingeniería Inversa & QA',
    objective: 'Inspeccionar bytecode Dalvik y auditar permisos en AndroidManifest.xml antes de instalación.',
    keyDeliverables: ['DexDecompilerModal.tsx', 'Extractor de clases Smali', 'Visor de manifiesto decodificado'],
    status: 'COMPLETO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Visualización de clases y detección de llamadas reflejadas.'
  },
  {
    id: 8,
    phaseCode: 'FASE-08',
    title: 'Transferencia Local Nearby P2P y Hub de Innovación',
    macroStage: 'Etapa I: Fundamentos & Vistas Duales',
    specialty: 'Red Local & Gobernanza',
    objective: 'Intercambio de APKs mediante WebRTC en LAN y hub de propuestas técnicas RFC/PRD.',
    keyDeliverables: ['NearbyTransferModal.tsx', 'ProposalsHubModal.tsx', 'Simulador de pares WebRTC'],
    status: 'COMPLETO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Transferencia de paquetes con validación de hash entre pares.'
  },
  {
    id: 9,
    phaseCode: 'FASE-09',
    title: 'Telemetría Forense IndexedDB y Failover Mesh',
    macroStage: 'Etapa I: Fundamentos & Vistas Duales',
    specialty: 'Telemetría & Resiliencia',
    objective: 'Persistencia forense de eventos en el navegador y auto-recuperación ante caídas de servicio.',
    keyDeliverables: ['IndexedDB Service', 'Registro de anomalías', 'Monitor de latencia de red'],
    status: 'COMPLETO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Recuperación de estado tras recarga sin pérdida de sesión.'
  },
  {
    id: 10,
    phaseCode: 'FASE-10',
    title: 'Plugins WebAssembly (WASM) y Auditor Anti-Feature',
    macroStage: 'Etapa I: Fundamentos & Vistas Duales',
    specialty: 'WebAssembly & Privacidad',
    objective: 'Ejecución de extensiones de cómputo en Web Workers y certificación de 0 trackers en apps.',
    keyDeliverables: ['WASM Runtime Loader', 'Auditor de dependencias Exodus', 'Filtro de anti-features'],
    status: 'COMPLETO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Procesamiento de hashing sin congelamiento del hilo UI.'
  },

  // ETAPA II: Hardware Físico, Administración Root & Cloudflare Edge (Fases 11 a 20)
  {
    id: 11,
    phaseCode: 'FASE-11',
    title: 'Modo Offline PWA Completo y Zero-Knowledge Vault',
    macroStage: 'Etapa II: Hardware & Cloudflare',
    specialty: 'PWA & Criptografía Cliente',
    objective: 'Navegación sin conexión y almacenamiento cifrado de credenciales con PBKDF2/AES-GCM.',
    keyDeliverables: ['Service Worker Stale-While-Revalidate', 'Cifrado E2E en navegador', 'WebLN Bridge'],
    status: 'COMPLETO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Catálogo accesible en modo avión y descargas encoladas.'
  },
  {
    id: 12,
    phaseCode: 'FASE-12',
    title: 'Agent Academy, Blueprints de Red y OpenAPI Hub',
    macroStage: 'Etapa II: Hardware & Cloudflare',
    specialty: 'Pedagogía & Contratos API',
    objective: 'Generación de guías inter-agente y especificación interactiva OpenAPI/Swagger.',
    keyDeliverables: ['Manuales pedagógicos', 'Planos SVG de red multi-nodo', 'Explorador Swagger UI'],
    status: 'COMPLETO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Documentación accesible y contratos de API validados.'
  },
  {
    id: 13,
    phaseCode: 'FASE-13',
    title: 'OmniBuild Universal Kaggle 30GB & Cloudflare Edge',
    macroStage: 'Etapa II: Hardware & Cloudflare',
    specialty: 'Infraestructura Cloud & CDN',
    objective: 'Aprovisionamiento de granja de compilación en Kaggle y publicación en appstore.civer.cloud.',
    keyDeliverables: ['Kernel Kaggle 30GB RAM', 'Túnel Cloudflare Zero Trust', 'Servidor dual puertos 80/3000'],
    status: 'COMPLETO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Dominio appstore.civer.cloud respondiendo 200 OK con SSL.'
  },
  {
    id: 14,
    phaseCode: 'FASE-14',
    title: 'Consola de Administración Maestro & Scraper GitHub FOSS',
    macroStage: 'Etapa II: Hardware & Cloudflare',
    specialty: 'Operaciones & Ingesta Masiva',
    objective: 'Panel root con PIN civer2026, tabla de 15+ columnas, scraper GitHub y despliegue ADB en A06.',
    keyDeliverables: ['AdminMasterCatalogView.tsx', 'Scraper GitHub con PAT', 'Instalador Spotube en Samsung A06'],
    status: 'COMPLETO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Spotube v3.8.2 instalado físicamente en Samsung Galaxy A06 verificado.'
  },
  {
    id: 15,
    phaseCode: 'FASE-15',
    title: 'Sincronización Syncthing Mesh P2P entre Bóvedas de APKs',
    macroStage: 'Etapa II: Hardware & Cloudflare',
    specialty: 'Red P2P & Malla de Almacenamiento',
    objective: 'Replicar automáticamente la carpeta de descargas entre Desktop ASUS y ThinkPad T480s.',
    keyDeliverables: ['Configuración Syncthing cluster', 'Watchdog de carpeta downloads/', 'Detección de conflictos'],
    status: 'EN_CURSO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Copia automática de nuevos APKs hacia el nodo ThinkPad en < 5s.'
  },
  {
    id: 16,
    phaseCode: 'FASE-16',
    title: 'Crawler de Pantallas Automático en Dispositivos Físicos',
    macroStage: 'Etapa II: Hardware & Cloudflare',
    specialty: 'Testing Automatizado en Hardware',
    objective: 'Recorrer aplicaciones instaladas en el Samsung A06 extrayendo capturas reales para la tienda.',
    keyDeliverables: ['Script UIAutomator dump', 'Capturador screencap en bucle', 'Actualizador de appScreensInventory'],
    status: 'EN_CURSO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Galería de capturas reales del Samsung A06 integradas a la tienda.'
  },
  {
    id: 17,
    phaseCode: 'FASE-17',
    title: 'Generador Universal de Documentos Imprimibles A4, PDF & Word',
    macroStage: 'Etapa II: Hardware & Cloudflare',
    specialty: 'Publicación Editorial Corporativa',
    objective: 'Compilar el Plan Maestro de 50 fases en documentos ejecutivos listos para imprimir y encuadernar.',
    keyDeliverables: ['generate_printable_docs.cjs', 'PLAN_MAESTRO_A4.html', 'PLAN_MAESTRO.doc', 'PLAN_MAESTRO.pdf'],
    status: 'COMPLETO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Generación exitosa de PDF (488 KB) y HTML A4 con @media print.'
  },
  {
    id: 18,
    phaseCode: 'FASE-18',
    title: 'Pasarela de Micro-Donaciones Lightning Network FOSS',
    macroStage: 'Etapa II: Hardware & Cloudflare',
    specialty: 'Monetización Ética & WebLN',
    objective: 'Permitir a los usuarios recompensar a los creadores de software libre con Satoshis en 1 clic.',
    keyDeliverables: ['Componente WebLN Button', 'Generador de QR BOLT11', 'Verificador de facturas pagadas'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Liquidación instantánea de donación a nodo Lightning.'
  },
  {
    id: 19,
    phaseCode: 'FASE-19',
    title: 'Ingesta Reactiva del Índice F-Droid v2 por Chunks Streaming',
    macroStage: 'Etapa II: Hardware & Cloudflare',
    specialty: 'Big Data & Normalización',
    objective: 'Parsear index-v2.json de F-Droid (>100MB) sin saturar memoria RAM mediante Node.js Streams.',
    keyDeliverables: ['Worker stream-json', 'Normalizador de esquema 15 cols', 'Filtro de apps archivadas'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Carga de 4,000+ apps libres en segundo plano en < 45s.'
  },
  {
    id: 20,
    phaseCode: 'FASE-20',
    title: 'Balanceador Dinámico de Carga en Puertos Duales (80 & 3000)',
    macroStage: 'Etapa II: Hardware & Cloudflare',
    specialty: 'Alta Disponibilidad & Proxy',
    objective: 'Garantizar conmutación por fallo automática entre puertos HTTP y proceso de fondo.',
    keyDeliverables: ['Watchdog de salud de puerto', 'Conmutador de tráfico upstream', 'Métricas de concurrencia'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Tolerancia a interrupción de proceso sin caída del túnel Cloudflare.'
  },

  // ETAPA III: Descentralización P2P, Malla Syncthing & Compilación Masiva (Fases 21 a 30)
  {
    id: 21,
    phaseCode: 'FASE-21',
    title: 'Red de Distribución BitTorrent P2P Descentralizada',
    macroStage: 'Etapa III: Descentralización P2P & Malla',
    specialty: 'Protocolos P2P',
    objective: 'Generar archivos .torrent y enlaces Magnet para distribución de APKs sin servidor central.',
    keyDeliverables: ['Creador de torrents con WebTorrent', 'Semillero automático local', 'Descargador P2P en navegador'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Descarga completa de APK de 100MB entre dos navegadores sin servidor.'
  },
  {
    id: 22,
    phaseCode: 'FASE-22',
    title: 'Servidor WebRTC de Señalización Local para Redes Aisladas',
    macroStage: 'Etapa III: Descentralización P2P & Malla',
    specialty: 'Redes Locales & Resiliencia Offline',
    objective: 'Establecer intercambio P2P en escuelas o comunidades rurales sin acceso a internet.',
    keyDeliverables: ['Servidor WebSocket local', 'Descubrimiento mDNS en LAN', 'Modo punto de acceso Wi-Fi Direct'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Intercambio de apps verificado en red local desconectada de WAN.'
  },
  {
    id: 23,
    phaseCode: 'FASE-23',
    title: 'Granja de Compilación Distribuida Multi-Arquitectura',
    macroStage: 'Etapa III: Descentralización P2P & Malla',
    specialty: 'Compilación Masiva (arm64, armeabi, x86_64)',
    objective: 'Compilar en paralelo bundles APK para todos los procesadores del mercado móvil.',
    keyDeliverables: ['Script Gradle multi-flavor', 'Orquestador de builds distribuidos', 'Almacén segmentado por arch'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Generación simultánea de los 3 sabores de arquitectura.'
  },
  {
    id: 24,
    phaseCode: 'FASE-24',
    title: 'Verificador Automático de Reproducibilidad de Compilación (Diffoscope)',
    macroStage: 'Etapa III: Descentralización P2P & Malla',
    specialty: 'Seguridad de Cadena de Suministro',
    objective: 'Verificar bit a bit que el binario generado en Civer Cloud sea idéntico al del autor original.',
    keyDeliverables: ['Contenedor Docker reproducible', 'Integración Diffoscope', 'Sello Reproducible Build'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Diff binario = 0 bytes entre build local y release oficial.'
  },
  {
    id: 25,
    phaseCode: 'FASE-25',
    title: 'Integración Shizuku Manager para Instalación Muda (Silent Sideload)',
    macroStage: 'Etapa III: Descentralización P2P & Malla',
    specialty: 'APIs Nativas Android',
    objective: 'Permitir instalación y actualización de aplicaciones sin pulsar botones de confirmación en Android.',
    keyDeliverables: ['Puente IPC Shizuku Binder', 'Comando PackageInstaller en segundo plano', 'Instalación de 1 toque'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Actualización en segundo plano sin intervención del usuario en el teléfono.'
  },
  {
    id: 26,
    phaseCode: 'FASE-26',
    title: 'Agente Autónomo de Monitoreo de Releases en GitHub 24/7',
    macroStage: 'Etapa III: Descentralización P2P & Malla',
    specialty: 'Automatización & Webhooks',
    objective: 'Detectar liberaciones de versiones de las 19 apps del catálogo inmediatamente tras su publicación.',
    keyDeliverables: ['Cron job con PAT Keyring', 'Descargador automático de assets', 'Notificación en Slack interno'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Detección e integración de nuevo release en < 10 minutos.'
  },
  {
    id: 27,
    phaseCode: 'FASE-27',
    title: 'Generador de Changelogs Automatizados con IA',
    macroStage: 'Etapa III: Descentralización P2P & Malla',
    specialty: 'NLP & Documentación',
    objective: 'Sintetizar listas de commits crudos de Git en notas de versión legibles y útiles para el usuario final.',
    keyDeliverables: ['Pipeline de destilación de commits', 'Traductor automático al español', 'Ficha de cambios en UI'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Resumen de release generado con puntos clave de mejoras y correcciones.'
  },
  {
    id: 28,
    phaseCode: 'FASE-28',
    title: 'Bóveda de Respaldo Descentralizada en IPFS & Filecoin',
    macroStage: 'Etapa III: Descentralización P2P & Malla',
    specialty: 'Almacenamiento Inmutable Web3',
    objective: 'Publicar hashes CID en IPFS para asegurar que los APKs nunca puedan ser eliminados de internet.',
    keyDeliverables: ['Pinning service con Infura/Kubo', 'Mapeo CID a Package Name', 'Gateway IPFS en appstore'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Descarga verificada de APK utilizando únicamente su hash CID IPFS.'
  },
  {
    id: 29,
    phaseCode: 'FASE-29',
    title: 'Motor de Búsqueda Semántica Vectorial en Qdrant Cloud',
    macroStage: 'Etapa III: Descentralización P2P & Malla',
    specialty: 'Inteligencia Artificial & RAG',
    objective: 'Permitir búsquedas por concepto o intención ("reproductor de música sin anuncios y con letras").',
    keyDeliverables: ['Embeddings de descripciones FOSS', 'Colección Qdrant bene_apps_catalog', 'Búsqueda híbrida BM25+Vector'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Recuperación precisa de apps incluso sin coincidencia exacta de nombre.'
  },
  {
    id: 30,
    phaseCode: 'FASE-30',
    title: 'Despliegue Multi-Dispositivo Simultáneo por ADB en Paralelo',
    macroStage: 'Etapa III: Descentralización P2P & Malla',
    specialty: 'Banco de Pruebas Físico Masivo',
    objective: 'Instalar la misma app simultáneamente en Samsung Galaxy A06, Honor X8 y tabletas conectadas.',
    keyDeliverables: ['Multiplexor ADB multi-hilo', 'Script de broadcast de APKs', 'Matriz de estado por dispositivo'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Instalación paralela en 2+ dispositivos físicos en < 30s.'
  },

  // ETAPA IV: Seguridad Criptográfica, Sandbox DEX & Privacidad Absoluta (Fases 31 a 40)
  {
    id: 31,
    phaseCode: 'FASE-31',
    title: 'Monitor de Consumo de Batería y CPU en Hardware Real',
    macroStage: 'Etapa IV: Seguridad DEX & Privacidad',
    specialty: 'Profiling Físico & Eficiencia',
    objective: 'Medir el impacto térmico y consumo en mAh de cada app instalada en el Samsung Galaxy A06.',
    keyDeliverables: ['Extractor de dumpsys batterystats', 'Gráfica de consumo en panel admin', 'Certificación Eco-Friendly'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Reporte de mAh consumidos por 10 minutos de reproducción.'
  },
  {
    id: 32,
    phaseCode: 'FASE-32',
    title: 'Escudo de Red con Proxy Tor / Orbot Integrado',
    macroStage: 'Etapa IV: Seguridad DEX & Privacidad',
    specialty: 'Anonimato & Evasión de Censura',
    objective: 'Permitir descargar aplicaciones a través de la red Onion para usuarios en países con censura estatal.',
    keyDeliverables: ['SOCKS5 Tor Proxy Client', 'Enlace .onion oficial para la tienda', 'DNS criptográfico DoH'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Descarga exitosa de APK ocultando completamente la IP pública.'
  },
  {
    id: 33,
    phaseCode: 'FASE-33',
    title: 'Sistema de Reputación y Reseñas Criptográficas Firmadas con PGP',
    macroStage: 'Etapa IV: Seguridad DEX & Privacidad',
    specialty: 'Gobernanza Comunitaria',
    objective: 'Evitar reseñas falsas y spam mediante firmas digitales criptográficas de usuarios y auditores.',
    keyDeliverables: ['Validador de firmas OpenPGP.js', 'Feed de comentarios inmutables', 'Puntaje ponderado por reputación'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Verificación matemática de firma de reseña antes de su publicación.'
  },
  {
    id: 34,
    phaseCode: 'FASE-34',
    title: 'Sandbox de Emulación Android en Contenedores Docker (Reddroid / Anbox)',
    macroStage: 'Etapa IV: Seguridad DEX & Privacidad',
    specialty: 'Virtualización Headless',
    objective: 'Ejecutar apps en contenedores virtuales de Android para probar comportamientos maliciosos.',
    keyDeliverables: ['Contenedor Reddroid en la nube', 'Grabador de tráfico de red pcap', 'Detector de conexiones no declaradas'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Ejecución y captura de logcat de un APK en contenedor en < 60s.'
  },
  {
    id: 35,
    phaseCode: 'FASE-35',
    title: 'Portal de Autoservicio para Desarrolladores de Software Libre',
    macroStage: 'Etapa IV: Seguridad DEX & Privacidad',
    specialty: 'Portal de Desarrollador FOSS',
    objective: 'Permitir a creadores vincular sus repositorios de GitHub/GitLab para compilación automatizada.',
    keyDeliverables: ['Formulario de postulación con OAuth Git', 'Pipeline de validación automática', 'Dashboard de descargas'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Postulación y aprobación de app sin requerir acceso de superusuario.'
  },
  {
    id: 36,
    phaseCode: 'FASE-36',
    title: 'Sistema de Notificaciones Push Descentralizadas (UnifiedPush)',
    macroStage: 'Etapa IV: Seguridad DEX & Privacidad',
    specialty: 'Mensajería Libre sin Google',
    objective: 'Alertar sobre nuevas actualizaciones sin depender de Firebase Cloud Messaging (FCM).',
    keyDeliverables: ['Distribuidor UnifiedPush / ntfy', 'WebPush en PWA', 'Control de suscripciones en cliente'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Recepción de notificación de nueva versión en smartphone sin Google Services.'
  },
  {
    id: 37,
    phaseCode: 'FASE-37',
    title: 'Conversor Automático de WebApps a APKs Nativos (TWA Engine)',
    macroStage: 'Etapa IV: Seguridad DEX & Privacidad',
    specialty: 'Empaquetado Web-a-Android',
    objective: 'Generar paquetes APK nativos de alta velocidad a partir de cualquier Progressive Web App libre.',
    keyDeliverables: ['Compilador Bubblewrap CLI headless', 'Generador de Digital Asset Links', 'Firma con Keystore Civer'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Compilación de APK funcional desde una URL web en < 2 minutos.'
  },
  {
    id: 38,
    phaseCode: 'FASE-38',
    title: 'Auditoría Continua de Vulnerabilidades en Código Fuente (Semgrep FOSS)',
    macroStage: 'Etapa IV: Seguridad DEX & Privacidad',
    specialty: 'Análisis Estático SAST',
    objective: 'Escanear el código de las aplicaciones del catálogo buscando patrones de vulnerabilidad conocidos.',
    keyDeliverables: ['Reglas Semgrep para Kotlin/Java/Flutter', 'Reporte de severidad de fallas', 'Alerta en panel admin'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Escaneo de repositorio con reporte de líneas de código inseguras.'
  },
  {
    id: 39,
    phaseCode: 'FASE-39',
    title: 'Malla de Servidores Espejo (Mirrors) Comunitarios con Geo-DNS',
    macroStage: 'Etapa IV: Seguridad DEX & Privacidad',
    specialty: 'Distribución Global Geográfica',
    objective: 'Desplegar nodos espejo en Europa, América y Asia para reducir latencias de descarga a < 50ms.',
    keyDeliverables: ['Script de sincronización de mirror rsync', 'Enrutamiento Geo-IP en DNS', 'Balanceador Cloudflare Workers'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Descarga servida desde el nodo geográficamente más cercano al usuario.'
  },
  {
    id: 40,
    phaseCode: 'FASE-40',
    title: 'Soporte de Extensiones Modulares de Terceros para la Tienda',
    macroStage: 'Etapa IV: Seguridad DEX & Privacidad',
    specialty: 'Ecosistema de Plugins',
    objective: 'Permitir a desarrolladores externos crear plugins (temas, scrapers personalizados, analizadores).',
    keyDeliverables: ['API de extensión tipada TypeScript', 'Sandbox iframe seguro para plugins', 'Tienda de extensiones'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Carga y ejecución de un plugin externo sin acceso a credenciales de administración.'
  },

  // ETAPA V: Escala Planetaria, Economía Lightning & Federación Autónoma (Fases 41 a 50)
  {
    id: 41,
    phaseCode: 'FASE-41',
    title: 'Interfaz de Voz Accesible mediante Web Speech & TTS Integrado',
    macroStage: 'Etapa V: Escala Planetaria & DAO',
    specialty: 'Accesibilidad Universal a11y',
    objective: 'Permitir la navegación completa y descarga de aplicaciones mediante comandos vocales en español.',
    keyDeliverables: ['Reconocedor WebSpeech API', 'Sintetizador vocal en navegador', 'Navegación manos libres'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Búsqueda e instalación ordenada mediante la voz del usuario.'
  },
  {
    id: 42,
    phaseCode: 'FASE-42',
    title: 'Integración con Home Assistant y Dispositivos Android TV / Smart TV',
    macroStage: 'Etapa V: Escala Planetaria & DAO',
    specialty: 'SmartHome & TV Platforms',
    objective: 'Interfaz optimizada con control D-Pad remoto para instalar apps en Smart TVs y TV Sticks.',
    keyDeliverables: ['Modo UI Leanback Android TV', 'Navegación por teclado de flechas', 'Integración Home Assistant REST'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Instalación de NewPipe o Kodi en Android TV mediante control remoto.'
  },
  {
    id: 43,
    phaseCode: 'FASE-43',
    title: 'Sincronización Cifrada de Colecciones de Apps entre Equipos',
    macroStage: 'Etapa V: Escala Planetaria & DAO',
    specialty: 'Gestión de Perfil de Usuario',
    objective: 'Migrar todas las aplicaciones favoritas de un teléfono viejo a uno nuevo con 1 clic sin cuentas de Google.',
    keyDeliverables: ['Exportador de lista de apps instaladas', 'Cifrado local de lista con frase de paso', 'Restauración automática'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Descarga e instalación secuencial del paquete de apps del usuario en un nuevo terminal.'
  },
  {
    id: 44,
    phaseCode: 'FASE-44',
    title: 'Depuración Remota en Vivo con ADB sobre WebSocket Interactivo',
    macroStage: 'Etapa V: Escala Planetaria & DAO',
    specialty: 'Herramientas de Diagnóstico Remoto',
    objective: 'Visualizar en tiempo real el logcat de Android de los dispositivos conectados desde el panel web.',
    keyDeliverables: ['Streaming de logcat por WebSocket', 'Filtrador de errores en consola web', 'Captura de memoria y dumpsys'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Visualización de logs de Spotube en ejecución en la consola de administración.'
  },
  {
    id: 45,
    phaseCode: 'FASE-45',
    title: 'Sistema de Detección de Desviación de Dependencias (Dependency Drift Sentinel)',
    macroStage: 'Etapa V: Escala Planetaria & DAO',
    specialty: 'Mantenimiento Preventivo',
    objective: 'Alertar proactivamente cuando librerías de terceros en un APK tengan alertas CVE de seguridad.',
    keyDeliverables: ['Base de datos de vulnerabilidades OSV', 'Escáner de Gradle lockfiles', 'Insignia de seguridad verde/amarilla'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Detección automática de dependencias vulnerables en repositorios analizados.'
  },
  {
    id: 46,
    phaseCode: 'FASE-46',
    title: 'Pasarela Civer Cloud a Repositorio Nativo F-Droid (index.jar)',
    macroStage: 'Etapa V: Escala Planetaria & DAO',
    specialty: 'Interoperabilidad Ecosistémica',
    objective: 'Emitir un repositorio oficial compatible con clientes F-Droid, Neo Store y Droid-ify nativos.',
    keyDeliverables: ['Generador de index.xml e index.jar', 'Firma con Keystore oficial Civer', 'URL de repo https://appstore.civer.cloud/fdroid/repo'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Añadir el repositorio de Civer Cloud en Droid-ify y descargar una app con éxito.'
  },
  {
    id: 47,
    phaseCode: 'FASE-47',
    title: 'Optimizador de Densidad Gráfica y Temas Vectoriales para Pantallas e-Ink',
    macroStage: 'Etapa V: Escala Planetaria & DAO',
    specialty: 'Hardware Experimental & e-Paper',
    objective: 'Adaptar la tienda para lectores de tinta electrónica (Boox, Kindle con Android) sin animaciones ni sombras.',
    keyDeliverables: ['Tema Monocromático 1-bit', 'Eliminación de transiciones CSS', 'Botones de alto contraste'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Navegación nítida en pantallas con frecuencia de actualización lenta.'
  },
  {
    id: 48,
    phaseCode: 'FASE-48',
    title: 'Enjambre de Agentes de Prueba End-to-End Continuos (Puppeteer Swarm)',
    macroStage: 'Etapa V: Escala Planetaria & DAO',
    specialty: 'QA Autónomo Desatendido',
    objective: 'Ejecutar 100 pruebas diarias de navegación, búsqueda, filtrado y descarga en producción.',
    keyDeliverables: ['Suite Puppeteer headless', 'Reporte automático de fallas visuales', 'Generador de capturas de evidencia'],
    status: 'PLANIFICADO',
    assignee: 'Enjambre IA',
    verificationCriteria: 'Ejecución exitosa del ciclo de pruebas con 0 errores de regresión.'
  },
  {
    id: 49,
    phaseCode: 'FASE-49',
    title: 'Bóveda de Soberanía Absoluta Offline en Medios Físicos USB / SD',
    macroStage: 'Etapa V: Escala Planetaria & DAO',
    specialty: 'Disaster Recovery Extremo',
    objective: 'Generar una imagen completa de la tienda con todas sus apps para distribución en memorias USB sin internet.',
    keyDeliverables: ['Script de empaquetado standalone', 'Servidor portátil Node/Go de 5MB', 'Manual de supervivencia digital'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Levantar la tienda desde una memoria USB en un equipo aislado sin conexión a red.'
  },
  {
    id: 50,
    phaseCode: 'FASE-50',
    title: 'Autonomía Plena: Gobernanza Descentralizada DAO y Auto-Evolución FOSS',
    macroStage: 'Etapa V: Escala Planetaria & DAO',
    specialty: 'Gobernanza Digital del Futuro',
    objective: 'Transferir la gobernanza del catálogo y las decisiones de arquitectura a la comunidad global libre.',
    keyDeliverables: ['Contratos de votación comunitaria', 'Protocolo de auto-actualización del enjambre', 'Ecosistema 100% libre perpetuo'],
    status: 'PLANIFICADO',
    assignee: 'Híbrido Agente-Humano',
    verificationCriteria: 'Aprobación de nuevo roadmap mediante votación criptográfica verificada.'
  }
];
