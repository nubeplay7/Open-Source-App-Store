package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.service.AgentBridgeForegroundService
import com.example.ui.theme.*
import com.example.util.AgentBridgeServer
import com.example.util.AgentCloudRelayClient
import com.example.util.AgentOutgoingWebhookManager
import com.example.util.AgentSystemSelfTest
import com.example.util.McpAgentSkillsRegistry
import com.example.util.RemoteWebViewController
import com.example.util.SelfTestSuiteReport
import kotlinx.coroutines.launch

/**
 * AgentBridgeControlCard:
 * Control Center for the embedded on-device MCP (Model Context Protocol) & ADB Bridge Server.
 * Displays server status, local LAN IP address, 75+ skills catalog, outgoing webhooks, and live agent request audits.
 */
@Composable
fun AgentBridgeControlCard(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    val isRunning by AgentBridgeServer.serverRunningFlow.collectAsStateWithLifecycle()
    val totalRequests by AgentBridgeServer.totalRequestsCountFlow.collectAsStateWithLifecycle()
    val requestHistory by AgentBridgeServer.requestHistoryFlow.collectAsStateWithLifecycle()
    val configuredWebhooks by AgentOutgoingWebhookManager.configuredUrlsFlow.collectAsStateWithLifecycle()
    val relayActive by AgentCloudRelayClient.relayActiveFlow.collectAsStateWithLifecycle()
    val relayUrl by AgentCloudRelayClient.relayUrlFlow.collectAsStateWithLifecycle()
    val relayHeartbeat by AgentCloudRelayClient.lastHeartbeatStatusFlow.collectAsStateWithLifecycle()
    val relayTransactions by AgentCloudRelayClient.transactionsFlow.collectAsStateWithLifecycle()

    var showSkillsCatalog by remember { mutableStateOf(false) }
    var showRequestAuditLog by remember { mutableStateOf(false) }
    var showWebhooksPanel by remember { mutableStateOf(false) }
    var showJsConsole by remember { mutableStateOf(false) }
    var showRelayPanel by remember { mutableStateOf(false) }
    var showSelfTestPanel by remember { mutableStateOf(false) }
    var showQuickConnectDialog by remember { mutableStateOf(false) }

    var webhookInput by remember { mutableStateOf("") }
    var jsConsoleInput by remember { mutableStateOf("document.title") }
    var jsConsoleOutput by remember { mutableStateOf("") }
    var relayUrlInput by remember { mutableStateOf(relayUrl) }
    var isExecutingJs by remember { mutableStateOf(false) }
    var isPingingWebhook by remember { mutableStateOf(false) }
    var isService247Active by remember { mutableStateOf(false) }
    var isRunningSelfTest by remember { mutableStateOf(false) }
    var selfTestReport by remember { mutableStateOf<SelfTestSuiteReport?>(null) }
    var isTakingScreenshot by remember { mutableStateOf(false) }
    var screenshotResultInfo by remember { mutableStateOf("") }

    val localIp = remember(isRunning) { AgentBridgeServer.getDeviceLocalIpAddress() }
    val statusColor = if (isRunning) MintSpeed else Color(0xFFEF4444)

    LaunchedEffect(Unit) {
        AgentOutgoingWebhookManager.init(context)
        AgentCloudRelayClient.init(context)
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ElegantCard),
        shape = RoundedCornerShape(24.dp),
        border = BorderStroke(1.dp, ElegantCardBorder)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .background(LavenderPrimary.copy(alpha = 0.15f), RoundedCornerShape(14.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Terminal,
                            contentDescription = null,
                            tint = LavenderPrimary,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                "Servidor MCP & ADB Bridge",
                                fontWeight = FontWeight.Bold,
                                color = TextWhite,
                                fontSize = 15.sp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = statusColor.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = if (isRunning) "ONLINE (:8765)" else "OFFLINE",
                                    fontSize = 10.sp,
                                    color = statusColor,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = "Control total remoto y extracción profunda para agentes IA",
                            fontSize = 11.sp,
                            color = TextGrayMuted
                        )
                    }
                }

                // Toggle Server Switch
                Switch(
                    checked = isRunning,
                    onCheckedChange = { start ->
                        if (start) {
                            AgentBridgeServer.startServer(context)
                        } else {
                            AgentBridgeServer.stopServer(context)
                        }
                    },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = MintSpeed,
                        checkedTrackColor = MintSpeed.copy(alpha = 0.3f),
                        uncheckedThumbColor = Color.Gray,
                        uncheckedTrackColor = Color(0xFF1E293B)
                    )
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Metrics Strip (3 Cards)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                BridgeMetricPill(
                    title = "Skills Nativas",
                    value = "${McpAgentSkillsRegistry.getToolCount()} Tools",
                    subtitle = "Model Context Protocol",
                    color = LavenderPrimary,
                    modifier = Modifier.weight(1f)
                )

                BridgeMetricPill(
                    title = "Peticiones Agente",
                    value = "$totalRequests calls",
                    subtitle = "HTTP / RPC / ADB",
                    color = MintSpeed,
                    modifier = Modifier.weight(1f)
                )

                BridgeMetricPill(
                    title = "Canales Control",
                    value = "35 Protocolos",
                    subtitle = "QR + Handshake + MCP",
                    color = Color(0xFF38BDF8),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Quick Connect & QR Hero Banner
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color(0xFF131C2E),
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, LavenderPrimary.copy(alpha = 0.5f))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = LavenderPrimary.copy(alpha = 0.2f),
                            modifier = Modifier.size(34.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Default.QrCodeScanner,
                                    contentDescription = null,
                                    tint = LavenderPrimary,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                "Enlace Rápido & QR con Agentes",
                                fontSize = 11.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextWhite
                            )
                            Text(
                                "35 Canales • PIN Handshake • Escaneo Visual",
                                fontSize = 9.5.sp,
                                color = TextGrayMuted
                            )
                        }
                    }

                    Button(
                        onClick = { showQuickConnectDialog = true },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = LavenderPrimary),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            Icons.Default.QrCode,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Ver QR", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // LAN IP & Persistent Service Strip
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color(0xFF0F172A),
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, ElegantCardBorder)
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Wifi, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                "Acceso Remoto LAN (Wi-Fi):",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextWhite
                            )
                        }
                        IconButton(
                            onClick = {
                                val url = "http://$localIp:${AgentBridgeServer.DEFAULT_PORT}/mcp"
                                val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                cm.setPrimaryClip(ClipData.newPlainText("MCP URL", url))
                                Toast.makeText(context, "URL MCP copiada: $url", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = "Copiar", tint = LavenderPrimary, modifier = Modifier.size(14.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "http://$localIp:${AgentBridgeServer.DEFAULT_PORT}/mcp",
                        fontSize = 11.5.sp,
                        fontFamily = FontFamily.Monospace,
                        color = MintSpeed,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // 24/7 Persistent Service Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "Modo Persistente 24/7 (WakeLock)",
                                fontSize = 10.5.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextWhite
                            )
                            Text(
                                "Mantiene el servidor online con pantalla apagada o suspensión.",
                                fontSize = 9.5.sp,
                                color = TextGrayMuted
                            )
                        }
                        Switch(
                            checked = isService247Active,
                            onCheckedChange = { active ->
                                isService247Active = active
                                if (active) {
                                    AgentBridgeForegroundService.startService(context)
                                    Toast.makeText(context, "Servicio persistente 24/7 activado", Toast.LENGTH_SHORT).show()
                                } else {
                                    AgentBridgeForegroundService.stopService(context)
                                    Toast.makeText(context, "Servicio 24/7 detenido", Toast.LENGTH_SHORT).show()
                                }
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = LavenderPrimary,
                                checkedTrackColor = LavenderPrimary.copy(alpha = 0.3f),
                                uncheckedThumbColor = Color.Gray,
                                uncheckedTrackColor = Color(0xFF1E293B)
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Action Buttons Grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                OutlinedButton(
                    onClick = { showSkillsCatalog = !showSkillsCatalog },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextWhite),
                    border = BorderStroke(1.dp, ElegantCardBorder),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = if (showSkillsCatalog) Icons.Default.ExpandLess else Icons.Default.Widgets,
                        contentDescription = null,
                        tint = LavenderPrimary,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(if (showSkillsCatalog) "Ocultar" else "75+ Skills", fontSize = 10.sp)
                }

                OutlinedButton(
                    onClick = { showWebhooksPanel = !showWebhooksPanel },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextWhite),
                    border = BorderStroke(1.dp, ElegantCardBorder),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = null,
                        tint = Color(0xFF38BDF8),
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(if (showWebhooksPanel) "Ocultar" else "Webhooks", fontSize = 10.sp)
                }

                OutlinedButton(
                    onClick = { showJsConsole = !showJsConsole },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextWhite),
                    border = BorderStroke(1.dp, ElegantCardBorder),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.Code,
                        contentDescription = null,
                        tint = Color(0xFFFBBF24),
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(if (showJsConsole) "Ocultar" else "Eval JS", fontSize = 10.sp)
                }

                OutlinedButton(
                    onClick = { showRequestAuditLog = !showRequestAuditLog },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextWhite),
                    border = BorderStroke(1.dp, ElegantCardBorder),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = if (showRequestAuditLog) Icons.Default.ExpandLess else Icons.Default.History,
                        contentDescription = null,
                        tint = MintSpeed,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(if (showRequestAuditLog) "Ocultar" else "Logs", fontSize = 10.sp)
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Action Buttons Row 2: WAN Relay, CI/CD Self-Test, and Multimodal Snapshot
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                OutlinedButton(
                    onClick = { showRelayPanel = !showRelayPanel },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = if (relayActive) MintSpeed else TextWhite
                    ),
                    border = BorderStroke(1.dp, if (relayActive) MintSpeed.copy(alpha = 0.5f) else ElegantCardBorder),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.Cloud,
                        contentDescription = null,
                        tint = if (relayActive) MintSpeed else Color(0xFF38BDF8),
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(if (showRelayPanel) "Ocultar" else "Túnel WAN", fontSize = 10.sp)
                }

                OutlinedButton(
                    onClick = {
                        showSelfTestPanel = !showSelfTestPanel
                        if (showSelfTestPanel && selfTestReport == null && !isRunningSelfTest) {
                            isRunningSelfTest = true
                            coroutineScope.launch {
                                selfTestReport = AgentSystemSelfTest.runFullVerification(context)
                                isRunningSelfTest = false
                            }
                        }
                    },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextWhite),
                    border = BorderStroke(1.dp, ElegantCardBorder),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = MintSpeed,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(if (showSelfTestPanel) "Ocultar" else "Test CI/CD", fontSize = 10.sp)
                }

                OutlinedButton(
                    onClick = {
                        if (!isTakingScreenshot) {
                            isTakingScreenshot = true
                            coroutineScope.launch {
                                val shot = RemoteWebViewController.takeScreenshotBase64(quality = 70, maxDimension = 720)
                                isTakingScreenshot = false
                                if (shot.optBoolean("success", false)) {
                                    val kb = shot.optInt("sizeBytes", 0) / 1024
                                    val w = shot.optInt("width", 0)
                                    val h = shot.optInt("height", 0)
                                    screenshotResultInfo = "Captura OK: ${w}x${h} ($kb KB) disponible para IA multimodal"
                                    Toast.makeText(context, screenshotResultInfo, Toast.LENGTH_SHORT).show()
                                } else {
                                    screenshotResultInfo = "Fallo captura: ${shot.optString("error", "Error desconocido")}"
                                    Toast.makeText(context, screenshotResultInfo, Toast.LENGTH_SHORT).show()
                                }
                            }
                        }
                    },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextWhite),
                    border = BorderStroke(1.dp, ElegantCardBorder),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.PhotoCamera,
                        contentDescription = null,
                        tint = RoseAccent,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(if (isTakingScreenshot) "Tomando..." else "Captura UI", fontSize = 10.sp)
                }
            }

            // Screenshot result banner if available
            if (screenshotResultInfo.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = screenshotResultInfo,
                    fontSize = 9.5.sp,
                    color = MintSpeed,
                    fontFamily = FontFamily.Monospace,
                    maxLines = 2
                )
            }

            // Expandable Cloud Relay Panel (WAN / Remote IDEs)
            AnimatedVisibility(visible = showRelayPanel) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp)
                ) {
                    Text(
                        "Túnel WAN para Agentes Remotos (Cursor, VS Code, Roo Code)",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF38BDF8)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "Permite a agentes en cualquier IDE o red remota (4G/5G/Internet) controlar la app sin estar en la misma red Wi-Fi.",
                        fontSize = 10.sp,
                        color = TextGrayMuted
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = relayUrlInput,
                        onValueChange = { relayUrlInput = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("https://tu-relay.com/api o wss://...", fontSize = 10.sp) },
                        label = { Text("URL del Relay / Webhook Túnel", fontSize = 10.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF38BDF8),
                            unfocusedBorderColor = ElegantCardBorder,
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            onClick = {
                                if (relayActive) {
                                    AgentCloudRelayClient.stopTunnel(context)
                                } else {
                                    val ok = AgentCloudRelayClient.configureAndStart(context, relayUrlInput.trim())
                                    if (!ok) {
                                        Toast.makeText(context, "URL de Relay no válida", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (relayActive) Color(0xFFEF4444) else Color(0xFF0284C7)
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(if (relayActive) "Detener Túnel" else "Conectar Túnel", fontSize = 11.sp, color = TextWhite)
                        }

                        OutlinedButton(
                            onClick = {
                                val config = AgentCloudRelayClient.generateIdeConfigSnippet(localIp)
                                val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                cm.setPrimaryClip(ClipData.newPlainText("MCP Config", config.toString(2)))
                                Toast.makeText(context, "Configuración MCP copiada para Cursor/Claude", Toast.LENGTH_SHORT).show()
                            },
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, ElegantCardBorder),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Copiar .cursor/mcp", fontSize = 10.sp, color = TextWhite)
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Estado del enlace: ", fontSize = 10.sp, color = TextGrayMuted)
                        Text(relayHeartbeat, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = if (relayActive) MintSpeed else Color.Gray)
                    }

                    if (relayTransactions.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text("Comandos remotos procesados:", fontSize = 9.5.sp, color = TextGrayMuted)
                        relayTransactions.take(3).forEach { t ->
                            Text("• [${t.timestamp}] ${t.toolOrMethod} (${t.status} en ${t.durationMs}ms)", fontSize = 9.sp, color = TextGrayLight, fontFamily = FontFamily.Monospace)
                        }
                    }
                }
            }

            // Expandable CI/CD Self-Test Suite Panel
            AnimatedVisibility(visible = showSelfTestPanel) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Verificación CI/CD y Autodiagnóstico",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = MintSpeed
                        )
                        IconButton(
                            onClick = {
                                if (!isRunningSelfTest) {
                                    isRunningSelfTest = true
                                    coroutineScope.launch {
                                        selfTestReport = AgentSystemSelfTest.runFullVerification(context)
                                        isRunningSelfTest = false
                                    }
                                }
                            },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = "Reejecutar", tint = MintSpeed, modifier = Modifier.size(16.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    if (isRunningSelfTest) {
                        LinearProgressIndicator(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(4.dp)
                                .clip(RoundedCornerShape(2.dp)),
                            color = MintSpeed,
                            trackColor = Color(0xFF1E293B)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Ejecutando pruebas de componentes...", fontSize = 9.5.sp, color = TextGrayMuted)
                    } else if (selfTestReport != null) {
                        val report = selfTestReport!!
                        Text(
                            "Resultado: ${report.overallStatus} (${report.passedCount}/${report.totalTests} OK en ${report.totalDurationMs}ms)",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (report.failedCount == 0) MintSpeed else RoseAccent
                        )
                        Spacer(modifier = Modifier.height(6.dp))

                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            report.testResults.forEach { test ->
                                Surface(
                                    modifier = Modifier.fillMaxWidth(),
                                    color = Color(0xFF0F172A),
                                    shape = RoundedCornerShape(8.dp),
                                    border = BorderStroke(1.dp, if (test.passed) MintSpeed.copy(alpha = 0.3f) else RoseAccent.copy(alpha = 0.5f))
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Box(
                                                    modifier = Modifier
                                                        .size(6.dp)
                                                        .clip(CircleShape)
                                                        .background(if (test.passed) MintSpeed else RoseAccent)
                                                )
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text(test.name, fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = TextWhite)
                                            }
                                            Text(test.message, fontSize = 8.5.sp, color = TextGrayMuted, maxLines = 1)
                                        }
                                        Text("${test.latencyMs}ms", fontSize = 8.5.sp, color = TextGrayLight, fontFamily = FontFamily.Monospace)
                                    }
                                }
                            }
                        }
                    } else {
                        Text("Presiona el botón para ejecutar la verificación completa.", fontSize = 9.5.sp, color = TextGrayMuted)
                    }
                }
            }

            // Expandable Webhooks Panel
            AnimatedVisibility(visible = showWebhooksPanel) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp)
                ) {
                    Text(
                        "Webhooks Salientes hacia Agentes Exteriores",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF38BDF8)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "Notifica eventos de navegación, alertas y triggers en tiempo real hacia n8n, LangChain o servidores remotos.",
                        fontSize = 9.5.sp,
                        color = TextGrayMuted
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = webhookInput,
                            onValueChange = { webhookInput = it },
                            placeholder = { Text("https://mi-agente.com/webhook", fontSize = 10.sp, color = TextGrayMuted) },
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextWhite,
                                unfocusedTextColor = TextWhite,
                                focusedBorderColor = Color(0xFF38BDF8),
                                unfocusedBorderColor = ElegantCardBorder
                            )
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Button(
                            onClick = {
                                if (AgentOutgoingWebhookManager.addWebhookUrl(context, webhookInput)) {
                                    webhookInput = ""
                                    Toast.makeText(context, "Webhook guardado", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(context, "URL inválida (requiere http/https)", Toast.LENGTH_SHORT).show()
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF38BDF8)),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Añadir", fontSize = 11.sp, color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Configurados: ${configuredWebhooks.size}", fontSize = 10.sp, color = TextGrayLight)
                        TextButton(
                            onClick = {
                                isPingingWebhook = true
                                AgentOutgoingWebhookManager.sendPingTest(context) { success, msg ->
                                    isPingingWebhook = false
                                    coroutineScope.launch {
                                        Toast.makeText(context, "Ping: $msg", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            },
                            enabled = configuredWebhooks.isNotEmpty() && !isPingingWebhook
                        ) {
                            Text(if (isPingingWebhook) "Enviando..." else "Enviar Ping de Prueba", fontSize = 10.sp, color = Color(0xFF38BDF8))
                        }
                    }
                }
            }

            // Expandable JS Evaluation Console
            AnimatedVisibility(visible = showJsConsole) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp)
                ) {
                    Text(
                        "Consola Rápida de JavaScript (TurboWebView)",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFFBBF24)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "Inyecta y ejecuta código JS directamente sobre el navegador activo.",
                        fontSize = 9.5.sp,
                        color = TextGrayMuted
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    OutlinedTextField(
                        value = jsConsoleInput,
                        onValueChange = { jsConsoleInput = it },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = Color(0xFFFBBF24),
                            unfocusedBorderColor = ElegantCardBorder
                        )
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        Button(
                            onClick = {
                                isExecutingJs = true
                                coroutineScope.launch {
                                    val res = RemoteWebViewController.evaluateJavaScript(jsConsoleInput)
                                    jsConsoleOutput = res
                                    isExecutingJs = false
                                }
                            },
                            enabled = !isExecutingJs,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFBBF24)),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(if (isExecutingJs) "Ejecutando..." else "Ejecutar JS", fontSize = 11.sp, color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }

                    if (jsConsoleOutput.isNotBlank()) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            color = Color(0xFF0F172A),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, ElegantCardBorder)
                        ) {
                            Text(
                                text = jsConsoleOutput,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                color = MintSpeed,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }
                }
            }

            // Expandable Skills Catalog
            AnimatedVisibility(visible = showSkillsCatalog) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 12.dp)
                ) {
                    Text(
                        "Catálogo de Skills MCP Nativas (${McpAgentSkillsRegistry.getToolCount()} Registradas)",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = LavenderPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    val skillsArray = remember { McpAgentSkillsRegistry.getAllToolsSchema() }
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 240.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        for (i in 0 until skillsArray.length()) {
                            val toolObj = skillsArray.getJSONObject(i)
                            val name = toolObj.getString("name")
                            val cat = toolObj.optString("category", "General")
                            val desc = toolObj.getString("description")

                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                color = Color(0xFF0F172A),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, ElegantCardBorder)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(name, fontSize = 10.5.sp, fontWeight = FontWeight.Bold, color = TextWhite, fontFamily = FontFamily.Monospace)
                                        Text(desc, fontSize = 9.sp, color = TextGrayMuted, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    }
                                    Surface(
                                        color = LavenderPrimary.copy(alpha = 0.15f),
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(cat, fontSize = 8.5.sp, color = LavenderPrimary, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Expandable Request History Audit Log
            AnimatedVisibility(visible = showRequestAuditLog) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 12.dp)
                ) {
                    Text(
                        "Historial de Peticiones del Bridge (${requestHistory.size})",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = MintSpeed
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    if (requestHistory.isEmpty()) {
                        Text("No hay peticiones registradas aún.", fontSize = 10.sp, color = TextGrayMuted)
                    } else {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(max = 180.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            requestHistory.takeLast(10).reversed().forEach { req ->
                                Surface(
                                    modifier = Modifier.fillMaxWidth(),
                                    color = Color(0xFF0F172A),
                                    shape = RoundedCornerShape(8.dp),
                                    border = BorderStroke(1.dp, ElegantCardBorder)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(req.timestamp, fontSize = 9.sp, color = TextGrayMuted, fontFamily = FontFamily.Monospace)
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text(req.method, fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = if (req.method == "POST") LavenderPrimary else MintSpeed)
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text(req.toolName ?: req.path, fontSize = 9.5.sp, color = TextWhite, fontFamily = FontFamily.Monospace, maxLines = 1)
                                        }
                                        Text("${req.latencyMs}ms", fontSize = 9.sp, color = TextGrayLight)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showQuickConnectDialog) {
        AgentQuickConnectDialog(
            onDismissRequest = { showQuickConnectDialog = false }
        )
    }
}

@Composable
private fun BridgeMetricPill(
    title: String,
    value: String,
    subtitle: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        color = Color(0xFF0F172A),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, color.copy(alpha = 0.3f))
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(title, fontSize = 9.5.sp, color = TextGrayMuted, maxLines = 1)
            Text(value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = color, maxLines = 1)
            Text(subtitle, fontSize = 8.5.sp, color = TextGrayLight, maxLines = 1)
        }
    }
}

