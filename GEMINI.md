# GEMINI.md - Google Gemini Integration & Prompt Orchestration

> **Propósito**: Este documento establece las directrices maestras para orquestar llamadas a los modelos Google Gemini (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash`) dentro del ecosistema **Civer App Store Matrix**.

---

## 1. Seguridad Crítica y Manejo de Claves API

- **Regla Inquebrantable**: La clave `GEMINI_API_KEY` o cualquier credencial de IA debe ser consumida **exclusivamente en el lado del servidor** (mediante endpoints protegidos `/api/*`).
- **Prohibición de Exposición en el Cliente**: Prohibido utilizar variables con prefijo `VITE_GEMINI_API_KEY` o instanciar `@google/genai` directamente en el código de React que se compila para el navegador o la aplicación Android.
- **Degradación Elegante**: Toda función asistida por Gemini debe contar con un mecanismo de respaldo determinista offline (análisis heurístico regex/AST local) en caso de que no haya conexión a Internet o la cuota de API se agote.

---

## 2. Modelos Recomendados y Casos de Uso

| Modelo | Alias SDK | Casos de Uso en Civer Store | Configuración Recomendada |
| :--- | :--- | :--- | :--- |
| **Gemini 2.5 Flash** | `gemini-2.5-flash` | Análisis de manifiestos, cálculo rápido de Health Score, respuestas en tiempo real del asistente de tienda, síntesis de changelogs. | `temperature: 0.2`, `maxOutputTokens: 1024` |
| **Gemini 2.5 Pro** | `gemini-2.5-pro` | Auditorías forenses profundas de seguridad, detección de vulnerabilidades en código fuente Kotlin/Java, síntesis de scripts Gradle complejos. | `temperature: 0.1`, `maxOutputTokens: 2048` |

---

## 3. Esquemas de Salida Estructurada (JSON Schema)

Para garantizar que el frontend y los servicios de Civer Store consuman respuestas predecibles, las llamadas a Gemini deben exigir `responseMimeType: "application/json"` con los siguientes esquemas:

### Esquema A: Auditoría Heurística de Repositorio Android
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AndroidRepoAuditResult",
  "type": "object",
  "properties": {
    "healthScore": { "type": "number", "minimum": 0, "maximum": 100 },
    "trackersDetected": { "type": "integer", "minimum": 0 },
    "riskLevel": { "type": "string", "enum": ["LOW", "MODERATE", "HIGH", "CRITICAL"] },
    "targetSdk": { "type": "integer" },
    "gradleModernity": { "type": "string", "enum": ["MODERN_KTS", "GROOVY_LEGACY", "OBSOLETE"] },
    "recommendations": {
      "type": "array",
      "items": { "type": "string" }
    },
    "auditSummary": { "type": "string" }
  },
  "required": ["healthScore", "trackersDetected", "riskLevel", "gradleModernity", "recommendations"]
}
```

### Esquema B: Comando de Instalación Remota en Flota
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RemoteInstallCommandPayload",
  "type": "object",
  "properties": {
    "action": { "type": "string", "const": "INSTALL_APK" },
    "targetDeviceId": { "type": "string" },
    "packageName": { "type": "string" },
    "version": { "type": "string" },
    "apkDownloadUrl": { "type": "string", "format": "uri" },
    "expectedSha256": { "type": "string", "pattern": "^[a-fA-F0-9]{64}$" },
    "installerMode": { "type": "string", "enum": ["SHIZUKU_SILENT", "PACKAGE_INSTALLER_INTENT"] }
  },
  "required": ["action", "targetDeviceId", "packageName", "apkDownloadUrl", "expectedSha256", "installerMode"]
}
```

---

## 4. Filosofía Anti-Slop en Generación de Contenido

Cuando un agente utilice Gemini para redactar descripciones de aplicaciones, notas de versión o documentación técnica:
1. **Tono Directo y Profesional**: Redacta como un ingeniero de sistemas enfocado en la privacidad. Evita clichés de marketing como "supercharge", "empower", "revolucionario" o superlativos innecesarios.
2. **Énfasis en Soberanía Digital**: Destaca aspectos verificables: tipo de licencia (GPL, Apache), ausencia de trackers, soporte para arquitecturas libres y compatibilidad con Shizuku o microG.
3. **Brevedad y Ritmo**: Las descripciones deben ser escaneables, con viñetas estructuradas y hashes criptográficos explícitos.
