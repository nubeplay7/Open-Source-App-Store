---
title: "Ecosistema de Comunicación y Comunidad Internacional"
version: "1.2.0"
date: "2026-09-11"
authors: ["Comité de Operaciones Comunitarias", "Agent-PeopleOps"]
classification: "PÚBLICO - REGLAMENTOS DE COMUNIDAD"
---

# ECOSISTEMA DE COMUNICACIÓN Y COMUNIDAD INTERNACIONAL

Civer App Store opera como una red distribuida global. Este documento establece los protocolos oficiales, la infraestructura de canales y los sistemas de incentivos que rigen las interacciones de los participantes.

## 1. INFRAESTRUCTURA DE CANALES DE TELEGRAM

Telegram es el backbone operativo de la empresa, facilitando la baja latencia y la integración de bots automatizados.

+---------------------------+------------------------------------+---------------------------------------------------+
| Canal / Grupo             | Audiencia Objetivo                 | Propósito Principal                               |
+---------------------------+------------------------------------+---------------------------------------------------+
| @CiverAppStore            | Público General                    | Anuncios oficiales, lanzamientos, milestones.     |
| @CiverDevCommunity        | Vibe Coders, Lead Maintainers      | Discusión técnica, soporte de OmniRoute, reviews. |
| @CiverQATesters           | QA Testers (Remunerados)           | Anuncio de nuevas misiones, soporte de pagos.     |
| @CiverSharkTank           | Shark Investors, Idea Authors      | Pitching de proyectos, tendencias de mercado.     |
| @EnviodeApkCompiladaBot   | Infraestructura automatizada       | Notificación directa de CI/CD (GitHub Actions).   |
+---------------------------+------------------------------------+---------------------------------------------------+

### 1.1 Grupos por Proyecto Individual
Para cada aplicación aprobada en el marketplace, se genera automáticamente un sub-grupo estructurado como `[App Name] - Civer Project`.
*   Participantes obligatorios: 1 Idea Author, 1-3 Vibe Coders, 1 Lead Maintainer, N QA Testers.
*   El Bot de Civer registra toda la actividad del chat como evidencia de contribución para el cálculo de regalías.

## 2. SISTEMA DE DEAL ROOMS (SALAS DE NEGOCIACIÓN)

Las Deal Rooms son entornos seguros para la formación de capital y el acuerdo de desarrollo.

**Protocolo de Operación:**
1.  **Solicitud:** Un Idea Author o un equipo de Vibe Coders publica un prospecto (Pitch Deck).
2.  **Matchmaking:** Un Shark Investor expresa interés formal.
3.  **Apertura de Sala:** Se crea una Deal Room privada (integración con Zoom/Google Meet para videollamadas, y un chat persistente de Telegram).
4.  **Negociación:** 
    *   Fase A: Discusión técnica y de alcance.
    *   Fase B: Definición de milestones de fondeo.
5.  **Acuerdo y Firma:** Firma criptográfica del contrato inteligente que define las reglas de desembolso y el equity (respetando siempre el 51% matriz de Civer).

## 3. FORO INTERNO DE LA PLATAFORMA (WEB)

Para discusiones de largo aliento que requieren indexación SEO y persistencia estructurada, utilizamos el Foro Interno alojado en `https://appstore.civer.cloud/community`.

### Categorías Principales:
*   **[Anuncios Oficiales]:** Changelogs de la suite IA y actualizaciones de políticas.
*   **[Soporte Técnico]:** Resolución de errores de compilación, dudas sobre el split de ingresos.
*   **[Incubadora de Ideas]:** Espacio donde los Idea Authors validan conceptos antes de formalizarlos.
*   **[Bugs & Vulnerabilidades]:** Reportes detallados para el 10% de Maintainers.
*   **[Showcase]:** Promoción de apps terminadas para atraer usuarios orgánicos y Shark Investors.

**Mecánica de Upvotes:** 
Las soluciones más votadas reciben micro-recompensas en satoshis financiadas por el fondo de tesorería de Civer.

## 4. SISTEMA DE REPUTACIÓN Y GAMIFICACIÓN

La confianza es la moneda principal del ecosistema. Hemos establecido un sistema de 5 niveles que rige los límites de retiro, el acceso a misiones premium y el peso de voto en las disputas.

+--------------+---------------------------------------+-------------------------------------------------+
| Nivel        | Requisitos de Ascenso                 | Beneficios Adicionales                          |
+--------------+---------------------------------------+-------------------------------------------------+
| 1. Novato    | Completar onboarding, KYC básico.     | Acceso a misiones de testing nivel D.           |
| 2. Verificado| 10 misiones exitosas o 1 app lanzada. | Retiros rápidos SPEI, acceso a misiones C.      |
| 3. Experto   | 50 misiones, >95% success rate.       | Multiplicador de pago x1.2, acceso a Deal Rooms.|
| 4. Maestro   | Historial de >1 año, mentoría activa. | Rol de árbitro en disputas, acceso a misiones A.|
| 5. Leyenda   | Top 1% del leaderboard histórico.     | Acceso directo al Comité Ejecutivo Civer.       |
+--------------+---------------------------------------+-------------------------------------------------+

### Badges Especiales (NFTs y Perfil):
*   🛡️ **Bug Hunter:** Por reportar 5+ vulnerabilidades críticas.
*   🧠 **Vibe Master:** Por completar 3 aplicaciones exitosas usando DeepSeek/OmniRoute.
*   🦈 **Shark Survivor:** Por fondear con éxito una app que generó ROI positivo.
*   🔒 **Privacy Guardian:** Por asegurar que una aplicación pase la auditoría Exodus con cero trackers.

## 5. CONVOCATORIAS DE PARTICIPACIÓN Y ONBOARDING

La adquisición de talento se realiza mediante convocatorias estructuradas.

### Template Estándar de Convocatoria:
```
[ALERTA DE MISIÓN - CIVER APP STORE] 🚀
Rol Requerido: QA Tester
Proyecto: Aplicación de Finanzas Personales (Cód: FIN-092)
Requisitos Mínimos:
- Disponibilidad: 2h/día durante 3 días.
- Dispositivo: Android 11 o superior (Preferible Samsung Galaxy o equivalente).
- Conexión activa a Telegram.
Pago Estimado: 12,000 Satoshis + 4% Regalías del Pool de QA.
Proceso: Ingresa al bot oficial y envía el comando /apply FIN-092
```

### Proceso de Onboarding Paso a Paso:
1.  **Registro:** Autenticación vía Telegram y vinculación de wallet Lightning o cuenta CLABE (SPEI).
2.  **Tutorial Base:** Completar el módulo interactivo de 15 minutos sobre "Cómo reportar un bug efectivamente".
3.  **Misión de Prueba (Sandboxed):** Una tarea simulada para evaluar la calidad del reporte del usuario.
4.  **Activación:** El perfil es aprobado automáticamente por Agent-PeopleOps y puede comenzar a aceptar misiones reales.

### Soporte Multilingüe:
Aunque la documentación matriz está en español, el bot oficial soporta de forma nativa traducciones en tiempo real (Inglés, Portugués) para facilitar la participación en el sur global.

## 6. PROTOCOLO DE COMUNICACIÓN INTERNACIONAL

Para sincronizar una fuerza laboral global distribuida, aplicamos reglas estrictas de comunicación asíncrona.

*   **Horarios de Disponibilidad (Core Hours):** 
    Se recomienda una ventana de solapamiento de 15:00 a 19:00 UTC para sincronizaciones sincrónicas entre Vibe Coders (Latinoamérica/Europa).
*   **Idioma Oficial:** El español es el idioma corporativo para documentación técnica y legal. El código fuente, nombres de variables y commits de Git DEBEN estar en inglés.
*   **Código de Conducta:** 
    1. Cero tolerancia al acoso o toxicidad en los repositorios/chats.
    2. Respetar los SLAs (Acuerdos de Nivel de Servicio) acordados en los contratos. Si un Vibe Coder abandona un proyecto, el Lead Maintainer asume el control bajo los términos de abandono.
    3. Toda retroalimentación debe ser constructiva, accionable y profesional.

---
*Fin del Documento 2*
