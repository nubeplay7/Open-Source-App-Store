# ARQUITECTURA CLOUD ALWAYS-ON & ECONOMÍA "CIVER WORK" (TU TRABAJO EN LÍNEA QUE SÍ PAGA)

> **Documento Oficial de Infraestructura y Modelo de Negocio Corporativo**  
> **Organización:** Civer Cloud Enterprise & Enjambre Autónomo Bené  
> **Versión:** 5.0.0 (Edición Soberana 2026–2030)  
> **Dominio de Producción:** [https://appstore.civer.cloud](https://appstore.civer.cloud)  
> **Eslogan Oficial:** *"Civer App Store — La Play Store Open Source, Tu trabajo en línea que sí paga"*  

---

## ☁️ PARTE 1: INFRAESTRUCTURA 100% CLOUD ALWAYS-ON (INDEPENDIENTE DE DISPOSITIVOS LOCALES)

Para garantizar que el sitio web, las descargas, el catálogo y las compilaciones permanezcan **100% activas y accesibles las 24 horas del día, los 365 días del año**, incluso si se corta la energía eléctrica o el internet en la residencia del mantenedor o si las laptops y computadoras locales se apagan:

```plaintext
+-----------------------------------------------------------------------------------------------------------+
|                                    NUBE GLOBAL AUTÓNOMA CIVER CLOUD                                       |
+-----------------------------------------------------------------------------------------------------------+
|  [CAPA 1: BORDE GLOBAL]      Cloudflare Pages & Edge Workers (DNS: appstore.civer.cloud)                 |
|                             • Red Anycast en 330+ ciudades del mundo.                                     |
|                             • Disponibilidad 99.99% independiente de cualquier hardware casero.           |
|                             • Caché atómica inteligente de la PWA y Service Worker v1.3.0.                |
+-----------------------------------------------------------------------------------------------------------+
|  [CAPA 2: SERVICIO GATEWAY]  Droplet DigitalOcean Cloud (Headless Linux Ubuntu 24.04 LTS)                |
|                             • Servidor persistente con systemd watchdog inmortal.                         |
|                             • Cloudflared tunnel en modo servicio daemon (--service-install).             |
|                             • Despachador de APIs (/api/v1/ota/manifest.json, /api/health).               |
+-----------------------------------------------------------------------------------------------------------+
|  [CAPA 3: COMPILADOR CLOUD]  GitHub Actions Cloud Runners (Ubuntu 24.04, 16 GB RAM, JDK 17, SDK 35)      |
|                             • Se ejecuta en los centros de datos de Microsoft Azure / GitHub.             |
|                             • Compila APKs nativos y Flutter a demanda desde la app de los usuarios.     |
|                             • Cero consumo de CPU/RAM de computadoras personales.                         |
+-----------------------------------------------------------------------------------------------------------+
|  [CAPA 4: ALMACENAMIENTO]    GitHub Releases CDN + Cloudflare R2 / S3 Storage                             |
|                             • Descarga directa de APKs a velocidades gigabit (21.59 MB en segundos).     |
|                             • Checksums SHA-256 inmutables con firma Scheme v2+v3+v4.                     |
+-----------------------------------------------------------------------------------------------------------+
|  [CAPA 5: MENSAJERÍA BOT]    Telegram Cloud Webhooks Daemon (@EnviodeApkCompiladaBot)                     |
|                             • Envío inmediato del archivo .apk al chat del usuario al finalizar el build.|
+-----------------------------------------------------------------------------------------------------------+
```

### Protocolo de Supervivencia ante Desconexión Local
1. **Apagado de Laptops Locales (ASUS ROG / ThinkPad T480s)**:
   - El túnel en la nube enruta automáticamente el tráfico hacia el Droplet DigitalOcean y Cloudflare Edge.
   - Los usuarios de todo el mundo continúan navegando en `https://appstore.civer.cloud/`, explorando el catálogo y descargando APKs sin enterarse de que la PC física está apagada.
2. **Petición de Compilación en la Nube**:
   - Cuando un usuario pulsa *"Compilar APK"* en la app, la solicitud viaja directamente de su navegador a la API de GitHub Actions en la nube.
   - El servidor Ubuntu de GitHub compila la app, la firma y sube el archivo a los servidores de descarga.

---

## 💼 PARTE 2: EL MODELO DE NEGOCIO "CIVER WORK" (TU TRABAJO EN LÍNEA QUE SÍ PAGA)

### 1. Filosofía Tipo "Disquera Musical" (Record Label IP & Sovereign Royalties)
En la industria musical, la disquera es dueña de los estudios de grabación, la tecnología de masterización, las plataformas de distribución y los fonogramas maestros; los artistas son socios que cobran regalías de por vida por haber escrito la letra, haber cantado o haber producido el tema.

En **Civer Cloud Enterprise** adoptamos el mismo estándar para el desarrollo de software móvil:
- **Propiedad Intelectual y Plataforma**: Civer Cloud es la dueña de la plataforma, las herramientas de desarrollo, la suite de IA ilimitada, los servidores de compilación y la titularidad patrimonial maestra de las aplicaciones creadas con nuestro ecosistema.
- **Socios y Colaboradores**: Cada participante es un socio legítimo que recibe regalías económicas vitalicias o salarios acordados de acuerdo con su rol específico en cada proyecto.

### 2. Tabulador Maestro de División de Ingresos (51% Empresa / 49% Colaboradores)

```plaintext
+------------------------------------+------------+-------------------------------------------------------------+
| Beneficiario / Rol                 | Porcentaje | Justificación y Responsabilidad                             |
+------------------------------------+------------+-------------------------------------------------------------+
| 🏛️ Civer Cloud Enterprise         |    51%     | Cómputo de IA ilimitado, servidores, infraestructura, IP.   |
| 💡 Autor Intelectual de la Idea    |    15%     | Aporta el concepto, caso de uso y modelo del proyecto.      |
| 💻 Vibe Coder / Programador con IA |    20%     | Persona que ensambla la app usando los agentes de IA.       |
| 🔧 Mantenedor Principal            |    10%     | Mantiene el repositorio activo, corrige bugs y actualiza.   |
| 🧪 Pool de Testers y Verificadores |     4%     | Comunidad remunerada que prueba en Android y reporta fallos.|
+------------------------------------+------------+-------------------------------------------------------------+
| TOTAL                              |   100%     | Cero comisiones a Google (0% Google Tax).                   |
+------------------------------------+------------+-------------------------------------------------------------+
```

### 3. Los 5 Roles Operativos en el Ecosistema

1. **`IDEA_AUTHOR` (El de la Idea)**:
   - Cualquier persona (estudiante, comerciante, profesionista) que tenga una necesidad o idea de app.
   - No necesita saber programar: la redacta en lenguaje natural y la postula en el **Shark Tank**.
   - Recibe el **15% de todas las ganancias netas** de la aplicación para siempre.

2. **`VIBE_CODER` (Desarrollador con IA)**:
   - Personas comunes que utilizan nuestras herramientas de inteligencia artificial para programar sin tener un título de ingeniería ("Vibe Coding").
   - Hablan con los agentes autónomos de Civer Cloud, generan la interfaz, definen las reglas y disparan compilaciones cloud.
   - Reciben el **20% de regalías** más posibles salarios o apoyos directos del inversionista.

3. **`QA_TESTER` (Tester Remunerado)**:
   - Cualquier persona con un smartphone Android (Samsung, Xiaomi, Motorola, Pixel).
   - Elige misiones en la **Bolsa de Testeo Remunerado**, instala el APK, comprueba la lista de verificación, reporta errores y sube capturas.
   - Cobra recompensas inmediatas en dólares ($15 - $35 USD por misión) o satoshis por Lightning Network.
   - Sus reportes alimentan a los agentes de IA para que reparen el código automáticamente.

4. **`LEAD_MAINTAINER` (Mantenedor Técnico)**:
   - Programadores experimentados que supervisan la calidad del código, resuelven pull requests y gestionan los lanzamientos en GitHub.
   - Reciben el **10% de regalías** por la estabilidad y longevidad del proyecto.

5. **`SHARK_INVESTOR` (Inversionista / Cliente Empresarial)**:
   - Empresas, empresarios o inversionistas ángeles que buscan financiar el desarrollo de una app para su negocio o para ganar retornos.
   - Negocian en salas privadas (**Deal Rooms**), pactan sueldos, apoyos e hitos, y firman contratos digitales dentro de la plataforma.

---

## 🦈 PARTE 3: EL "SHARK TANK" DE CIVER CLOUD & SALAS DE NEGOCIACIÓN

1. **Postulación Pública o Privada**:
   - **Proyectos Open Source**: Financiados por inversionistas comunitarios o fondos de mecenazgo; monetizan mediante donaciones, suscripciones premium o soporte empresarial.
   - **Proyectos Privados B2B**: Proyectos confidenciales para empresas privadas (logística, salud, fintech) que pagan un contrato cerrado y salarios a los Vibe Coders.
2. **Salas de Tratos (Deal Rooms)**:
   - Interfaz interactiva donde el inversionista conversa en tiempo real con los candidatos a Vibe Coders y Testers.
   - Se acuerdan las condiciones: salario fijo mensual, porcentaje de regalías, fechas de entrega y especificaciones de la app.
3. **Contratos Digitales Vinculantes**:
   - Cada proyecto genera un contrato legal interno (`CIVER-CONTRACT-YYYY-XXXX`) con huella criptográfica SHA-256.
   - Ambas partes firman digitalmente en pantalla. La cesión patrimonial se otorga a Civer Cloud Enterprise y la empresa garantiza por contrato el pago irrevocable de las regalías y sueldos pactados.

---

## ⚡ PARTE 4: PAGOS INSTANTÁNEOS Y SOBERANÍA FINANCIERA

- **Retiros por Lightning Network**: Pagos directos en fracciones de Bitcoin (satoshis) en menos de 2 segundos a cualquier billetera (Wallet of Satoshi, Phoenix, Alby, Strike).
- **Transferencias SPEI / Bancarias**: Para colaboradores locales que deseen recibir pesos o dólares en sus cuentas tradicionales.
- **Cero Retenciones Abusivas**: Sin intermediarios extranjeros que bloqueen transferencias; cada tester o programador cobra su trabajo de inmediato tras la validación de la misión.
