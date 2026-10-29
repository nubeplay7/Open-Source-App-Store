package com.example.core.model

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

/**
 * The 8 Autonomous Domains of WebNative Pro Architecture.
 */
enum class DomainModuleId(
    val title: String,
    val packagePath: String,
    val description: String,
    val priorityLevel: Int // 1 highest (OTA / CI/CD & Agent Bridge)
) {
    AGENT_BRIDGE(
        title = "Agent Bridge & MCP Protocol",
        packagePath = "com.example.agent",
        description = "Micro-servidor HTTP 8765, MCP JSON-RPC 2.0, módem acústico y descubrimiento UDP.",
        priorityLevel = 1
    ),
    CI_CD_OTA(
        title = "CI/CD & Motor OTA",
        packagePath = "com.example.ota",
        description = "Bucle autónomo de actualización GitHub Actions, sondeo de releases e instalador APK.",
        priorityLevel = 1
    ),
    TURBO_WEBVIEW(
        title = "TurboWebView Runtime",
        packagePath = "com.example.webview",
        description = "Motor web optimizado, JS Bridge nativo, adblocker y caché inteligente.",
        priorityLevel = 2
    ),
    CONTAINERS_VIRTUALIZATION(
        title = "Contenedores & Aislamiento",
        packagePath = "com.example.container",
        description = "Sandboxes independientes, bóveda de cookies y virtualización de hardware.",
        priorityLevel = 2
    ),
    AUTOMATION_MACROS(
        title = "Automatización & Visión",
        packagePath = "com.example.automation",
        description = "Grabación/reproducción de macros web, bots concurrentes y anclas visuales.",
        priorityLevel = 3
    ),
    DIAGNOSTICS_QA(
        title = "Diagnóstico & Forense QA",
        packagePath = "com.example.diagnostics",
        description = "Auditorías de 360°, extracción forense, telemetría térmica y monitor de caídas.",
        priorityLevel = 3
    ),
    CLOUD_SYNC_P2P(
        title = "Sincronización Cloud & P2P",
        packagePath = "com.example.cloud",
        description = "Integración con Firebase, Google Sheets, sincronización P2P LAN.",
        priorityLevel = 4
    ),
    CORE_INFRASTRUCTURE(
        title = "Core Infra & Observabilidad",
        packagePath = "com.example.core",
        description = "AppLogger universal, guardias de inicialización y políticas de energía.",
        priorityLevel = 1
    );

    val icon: ImageVector
        get() = when (this) {
            AGENT_BRIDGE -> Icons.Default.Hub
            CI_CD_OTA -> Icons.Default.SystemUpdate
            TURBO_WEBVIEW -> Icons.Default.Language
            CONTAINERS_VIRTUALIZATION -> Icons.Default.Widgets
            AUTOMATION_MACROS -> Icons.Default.SmartToy
            DIAGNOSTICS_QA -> Icons.Default.Troubleshoot
            CLOUD_SYNC_P2P -> Icons.Default.CloudSync
            CORE_INFRASTRUCTURE -> Icons.Default.Security
        }
}

enum class DomainHealthStatus(val label: String) {
    ACTIVE("Activo & Listo"),
    STANDBY("En Espera"),
    THROTTLED("Ahorro de Batería"),
    SUSPENDED("Suspendido"),
    ERROR("Degradado")
}

data class DomainStatusInfo(
    val domainId: DomainModuleId,
    val status: DomainHealthStatus,
    val memoryUsageDesc: String,
    val details: String = ""
)
