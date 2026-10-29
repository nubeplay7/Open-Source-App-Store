package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Bitmap
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.theme.*
import com.example.util.AgentAcousticModemHelper
import com.example.util.AgentBridgeServer
import com.example.util.AgentHandshakeManager
import com.example.util.AgentProtocolsCatalog
import com.example.util.AgentQrShareHelper
import com.example.util.AgentShareFormatsEngine
import com.example.util.AgentZipExportHelper

/**
 * AgentQuickConnectDialog:
 * Comprehensive pairing and remote connectivity dialog for WebNative Pro.
 * Provides high-density visual QR code, acoustic audio chime, 18 export/sharing formats,
 * and an interactive explorer for all 35 communication channels and transport protocols.
 */
@Composable
fun AgentQuickConnectDialog(
    onDismissRequest: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    val currentPin by AgentHandshakeManager.pairingPinFlow.collectAsStateWithLifecycle()
    val currentSecret by AgentHandshakeManager.handshakeSecretFlow.collectAsStateWithLifecycle()
    val localIp = remember { AgentBridgeServer.getDeviceLocalIpAddress() }
    val port = AgentBridgeServer.DEFAULT_PORT

    val universalUrl = remember(currentPin, localIp) {
        AgentHandshakeManager.getUniversalConnectionUrl(localIp, port)
    }

    // Tab state: 0 = QR & PIN, 1 = 18 Formatos de Compartir, 2 = 35 Protocolos
    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val tabTitles = listOf("QR & PIN", "18 Formatos", "35 Canales")

    // QR Bitmap generation
    var qrBitmap by remember(universalUrl) {
        mutableStateOf<Bitmap?>(null)
    }

    LaunchedEffect(universalUrl) {
        qrBitmap = AgentQrShareHelper.generateQrBitmap(universalUrl, 520)
    }

    // 18 Sharing formats
    val shareFormats = remember(localIp, port, currentPin, currentSecret) {
        AgentShareFormatsEngine.getAllFormats(context, localIp, port, currentPin, currentSecret)
    }

    // Protocols Catalog
    val allProtocols = remember(localIp, currentPin) {
        AgentProtocolsCatalog.getProtocols(localIp, port, currentPin)
    }

    val categories = remember(allProtocols) {
        listOf("Todos (${allProtocols.size})") + allProtocols.map { it.category }.distinct()
    }
    var selectedCategory by remember { mutableStateOf("Todos (${allProtocols.size})") }

    val filteredProtocols = remember(selectedCategory, allProtocols) {
        if (selectedCategory.startsWith("Todos")) {
            allProtocols
        } else {
            allProtocols.filter { it.category == selectedCategory }
        }
    }

    // Handshake Live Tester State
    var testInput by remember { mutableStateOf(currentPin) }
    var testResultText by remember { mutableStateOf<String?>(null) }
    var testSuccess by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismissRequest,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = modifier
                .fillMaxWidth(0.96f)
                .fillMaxHeight(0.94f),
            color = Color(0xFF090D16),
            shape = RoundedCornerShape(24.dp),
            border = BorderStroke(1.dp, ElegantCardBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(14.dp)
            ) {
                // Dialog Top Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = CircleShape,
                            color = LavenderPrimary.copy(alpha = 0.2f),
                            modifier = Modifier.size(36.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Default.QrCodeScanner,
                                    contentDescription = null,
                                    tint = LavenderPrimary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                "Enlace Rápido con Agentes",
                                fontSize = 15.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextWhite
                            )
                            Text(
                                "QR • 18 Formatos • 35 Protocolos • Acústico",
                                fontSize = 10.5.sp,
                                color = TextGrayMuted
                            )
                        }
                    }

                    IconButton(
                        onClick = onDismissRequest,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            Icons.Default.Close,
                            contentDescription = "Cerrar",
                            tint = TextWhite,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Tab Bar
                TabRow(
                    selectedTabIndex = selectedTabIndex,
                    containerColor = Color(0xFF111726),
                    contentColor = LavenderPrimary,
                    divider = {},
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                ) {
                    tabTitles.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTabIndex == index,
                            onClick = { selectedTabIndex = index },
                            text = {
                                Text(
                                    text = title,
                                    fontSize = 12.sp,
                                    fontWeight = if (selectedTabIndex == index) FontWeight.Bold else FontWeight.Normal,
                                    color = if (selectedTabIndex == index) LavenderPrimary else TextGrayMuted
                                )
                            }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                when (selectedTabIndex) {
                    0 -> {
                        // TAB 1: QR CODE & PIN & ACOUSTIC & TESTER
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // QR Card
                            item {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(containerColor = ElegantCard),
                                    shape = RoundedCornerShape(18.dp),
                                    border = BorderStroke(1.dp, ElegantCardBorder)
                                ) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(14.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Text(
                                            "Escaneo Visual para Agentes e IDEs",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = TextWhite
                                        )
                                        Text(
                                            "Cualquier cámara, IDE o modelo multimodal obtiene IP, puerto, PIN y URL completa al escanear.",
                                            fontSize = 10.sp,
                                            color = TextGrayMuted,
                                            textAlign = TextAlign.Center,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )

                                        Spacer(modifier = Modifier.height(8.dp))

                                        // QR Container Surface
                                        Surface(
                                            shape = RoundedCornerShape(14.dp),
                                            color = Color.White,
                                            shadowElevation = 6.dp,
                                            modifier = Modifier.padding(4.dp)
                                        ) {
                                            Box(
                                                modifier = Modifier.padding(10.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                qrBitmap?.let { bmp ->
                                                    Image(
                                                        bitmap = bmp.asImageBitmap(),
                                                        contentDescription = "Código QR de Conexión y Handshake",
                                                        modifier = Modifier.size(190.dp)
                                                    )
                                                } ?: run {
                                                    Box(
                                                        modifier = Modifier
                                                            .size(190.dp)
                                                            .background(Color.White),
                                                        contentAlignment = Alignment.Center
                                                    ) {
                                                        CircularProgressIndicator(
                                                            color = LavenderPrimary,
                                                            modifier = Modifier.size(28.dp)
                                                        )
                                                    }
                                                }
                                            }
                                        }

                                        Spacer(modifier = Modifier.height(8.dp))

                                        // PIN Badge
                                        Surface(
                                            shape = RoundedCornerShape(12.dp),
                                            color = Color(0xFF0F172A),
                                            border = BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.4f)),
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(horizontal = 14.dp, vertical = 8.dp),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.SpaceBetween
                                            ) {
                                                Column {
                                                    Text(
                                                        "PIN DE HANDSHAKE:",
                                                        fontSize = 9.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        color = Color(0xFF94A3B8)
                                                    )
                                                    Text(
                                                        text = currentPin,
                                                        fontSize = 20.sp,
                                                        fontFamily = FontFamily.Monospace,
                                                        fontWeight = FontWeight.ExtraBold,
                                                        color = Color(0xFF38BDF8)
                                                    )
                                                }

                                                IconButton(
                                                    onClick = {
                                                        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                                        cm.setPrimaryClip(ClipData.newPlainText("PIN", currentPin))
                                                        Toast.makeText(context, "PIN copiado: $currentPin", Toast.LENGTH_SHORT).show()
                                                    }
                                                ) {
                                                    Icon(
                                                        Icons.Default.ContentCopy,
                                                        contentDescription = "Copiar PIN",
                                                        tint = Color(0xFF38BDF8),
                                                        modifier = Modifier.size(18.dp)
                                                    )
                                                }
                                            }
                                        }

                                        Spacer(modifier = Modifier.height(8.dp))

                                        // Action Buttons Grid
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            Button(
                                                onClick = {
                                                    AgentQrShareHelper.shareQrImage(context, universalUrl)
                                                },
                                                shape = RoundedCornerShape(10.dp),
                                                colors = ButtonDefaults.buttonColors(containerColor = LavenderPrimary),
                                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                                                modifier = Modifier.weight(1f)
                                            ) {
                                                Icon(Icons.Default.Share, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text("Compartir QR", fontSize = 10.5.sp, fontWeight = FontWeight.Bold)
                                            }

                                            OutlinedButton(
                                                onClick = {
                                                    AgentAcousticModemHelper.playHandshakeChime(context)
                                                    Toast.makeText(context, "Emitiendo tono acústico de handshake...", Toast.LENGTH_SHORT).show()
                                                },
                                                shape = RoundedCornerShape(10.dp),
                                                colors = ButtonDefaults.outlinedButtonColors(contentColor = MintSpeed),
                                                border = BorderStroke(1.dp, MintSpeed.copy(alpha = 0.5f)),
                                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                                                modifier = Modifier.weight(1f)
                                            ) {
                                                Icon(Icons.Default.VolumeUp, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(14.dp))
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text("Tono Chime", fontSize = 10.5.sp)
                                            }

                                            OutlinedButton(
                                                onClick = {
                                                    AgentAcousticModemHelper.playPinFskModulation(context, currentPin)
                                                    Toast.makeText(context, "Transmitiendo PIN $currentPin vía FSK acústico...", Toast.LENGTH_SHORT).show()
                                                },
                                                shape = RoundedCornerShape(10.dp),
                                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF38BDF8)),
                                                border = BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.5f)),
                                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                                                modifier = Modifier.weight(1f)
                                            ) {
                                                Icon(Icons.Default.GraphicEq, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(14.dp))
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text("FSK PIN", fontSize = 10.5.sp)
                                            }

                                            IconButton(
                                                onClick = {
                                                    AgentHandshakeManager.regenerateCredentials(context)
                                                    Toast.makeText(context, "Credenciales regeneradas", Toast.LENGTH_SHORT).show()
                                                },
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(10.dp))
                                                    .background(Color(0xFF1E293B))
                                                    .size(38.dp)
                                            ) {
                                                Icon(
                                                    Icons.Default.Refresh,
                                                    contentDescription = "Regenerar PIN y Secreto",
                                                    tint = MintSpeed,
                                                    modifier = Modifier.size(18.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }

                            // Live Tester
                            item {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(containerColor = Color(0xFF131C2E)),
                                    shape = RoundedCornerShape(16.dp),
                                    border = BorderStroke(1.dp, ElegantCardBorder)
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Text(
                                            "Probador de Handshake en Vivo",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = TextWhite
                                        )
                                        Text(
                                            "Simula la conexión de un agente externo validando el PIN.",
                                            fontSize = 9.5.sp,
                                            color = TextGrayMuted
                                        )

                                        Spacer(modifier = Modifier.height(6.dp))

                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            OutlinedTextField(
                                                value = testInput,
                                                onValueChange = { testInput = it },
                                                placeholder = { Text("Introduce PIN o Secreto", fontSize = 10.5.sp, color = TextGrayMuted) },
                                                singleLine = true,
                                                textStyle = androidx.compose.ui.text.TextStyle(
                                                    fontSize = 11.5.sp,
                                                    fontFamily = FontFamily.Monospace,
                                                    color = TextWhite
                                                ),
                                                shape = RoundedCornerShape(8.dp),
                                                colors = OutlinedTextFieldDefaults.colors(
                                                    focusedBorderColor = LavenderPrimary,
                                                    unfocusedBorderColor = ElegantCardBorder,
                                                    focusedContainerColor = Color(0xFF090D16),
                                                    unfocusedContainerColor = Color(0xFF090D16)
                                                ),
                                                modifier = Modifier.weight(1f)
                                            )

                                            Button(
                                                onClick = {
                                                    val res = AgentHandshakeManager.verifyHandshake(context, testInput, "live_tester")
                                                    testSuccess = res.success
                                                    testResultText = if (res.success) {
                                                        "OK: ${res.message} (Token: ${res.token?.take(8)}...)"
                                                    } else {
                                                        "Error: ${res.message}"
                                                    }
                                                },
                                                shape = RoundedCornerShape(8.dp),
                                                colors = ButtonDefaults.buttonColors(
                                                    containerColor = if (testSuccess) MintSpeed else LavenderPrimary
                                                ),
                                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp)
                                            ) {
                                                Text("Validar", fontSize = 10.5.sp, fontWeight = FontWeight.Bold)
                                            }
                                        }

                                        testResultText?.let { msg ->
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                text = msg,
                                                fontSize = 10.sp,
                                                fontFamily = FontFamily.Monospace,
                                                color = if (testSuccess) MintSpeed else Color(0xFFEF4444),
                                                fontWeight = FontWeight.SemiBold
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    1 -> {
                        // TAB 2: 18 EXPORT & SHARING FORMATS
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            item {
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = Color(0xFF131C2E),
                                    border = BorderStroke(1.dp, LavenderPrimary.copy(alpha = 0.3f)),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            Icons.Default.FileDownload,
                                            contentDescription = null,
                                            tint = LavenderPrimary,
                                            modifier = Modifier.size(20.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            "18 Formatos de Compartición listos para copiar o enviar como archivo.",
                                            fontSize = 11.sp,
                                            color = TextWhite
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Button(
                                    onClick = {
                                        AgentZipExportHelper.shareZipBundle(context, localIp, port, currentPin, currentSecret)
                                    },
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = LavenderPrimary),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(Icons.Default.Archive, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("📦 Compartir Pack Completo (.ZIP)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            items(shareFormats, key = { it.id }) { format ->
                                ShareFormatCard(
                                    format = format,
                                    onCopy = {
                                        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                        cm.setPrimaryClip(ClipData.newPlainText(format.title, format.content))
                                        Toast.makeText(context, "Copiado: ${format.title}", Toast.LENGTH_SHORT).show()
                                    },
                                    onShareFile = {
                                        AgentShareFormatsEngine.shareFormatFile(context, format)
                                    }
                                )
                            }
                        }
                    }

                    2 -> {
                        // TAB 3: 35 PROTOCOLS CATALOG
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            item {
                                Column {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            "35 Canales & Protocolos de Conexión",
                                            fontSize = 12.5.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = TextWhite
                                        )
                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = MintSpeed.copy(alpha = 0.15f),
                                            border = BorderStroke(1.dp, MintSpeed.copy(alpha = 0.3f))
                                        ) {
                                            Text(
                                                "TODOS ACTIVOS",
                                                fontSize = 8.5.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = MintSpeed,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(6.dp))

                                    // Category Filter Chips
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .horizontalScroll(rememberScrollState()),
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        categories.forEach { cat ->
                                            val isSelected = cat == selectedCategory
                                            FilterChip(
                                                selected = isSelected,
                                                onClick = { selectedCategory = cat },
                                                label = { Text(cat, fontSize = 9.5.sp) },
                                                colors = FilterChipDefaults.filterChipColors(
                                                    selectedContainerColor = LavenderPrimary,
                                                    selectedLabelColor = Color.White,
                                                    containerColor = Color(0xFF131C2E),
                                                    labelColor = TextGrayMuted
                                                ),
                                                border = BorderStroke(
                                                    1.dp,
                                                    if (isSelected) LavenderPrimary else ElegantCardBorder
                                                ),
                                                shape = RoundedCornerShape(8.dp)
                                            )
                                        }
                                    }
                                }
                            }

                            items(filteredProtocols, key = { it.id }) { protocol ->
                                ProtocolListItemCard(
                                    protocol = protocol,
                                    onCopy = { cmd ->
                                        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                        cm.setPrimaryClip(ClipData.newPlainText(protocol.name, cmd))
                                        Toast.makeText(context, "Copiado: $cmd", Toast.LENGTH_SHORT).show()
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ShareFormatCard(
    format: AgentShareFormatsEngine.ShareFormatItem,
    onCopy: () -> Unit,
    onShareFile: () -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF111726)),
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, ElegantCardBorder)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        format.title,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextWhite
                    )
                    Text(
                        "${format.category} • ${format.fileName}",
                        fontSize = 9.5.sp,
                        color = Color(0xFF38BDF8),
                        fontWeight = FontWeight.Medium
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(
                        onClick = onCopy,
                        modifier = Modifier.size(30.dp)
                    ) {
                        Icon(
                            Icons.Default.ContentCopy,
                            contentDescription = "Copiar",
                            tint = Color(0xFF38BDF8),
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    IconButton(
                        onClick = onShareFile,
                        modifier = Modifier.size(30.dp)
                    ) {
                        Icon(
                            Icons.Default.Share,
                            contentDescription = "Compartir Archivo",
                            tint = LavenderPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    IconButton(
                        onClick = { expanded = !expanded },
                        modifier = Modifier.size(30.dp)
                    ) {
                        Icon(
                            if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                            contentDescription = if (expanded) "Contraer" else "Expandir",
                            tint = TextGrayMuted,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            Text(
                format.description,
                fontSize = 10.sp,
                color = TextGrayMuted,
                modifier = Modifier.padding(top = 4.dp, bottom = 6.dp)
            )

            // Collapsed preview or expanded full view
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFF090D16),
                border = BorderStroke(1.dp, ElegantCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = if (expanded) format.content else format.content.lines().take(3).joinToString("\n") + if (format.content.lines().size > 3) "..." else "",
                    fontSize = 9.5.sp,
                    fontFamily = FontFamily.Monospace,
                    color = Color(0xFFCBD5E1),
                    modifier = Modifier.padding(8.dp),
                    maxLines = if (expanded) Int.MAX_VALUE else 3
                )
            }
        }
    }
}

@Composable
private fun ProtocolListItemCard(
    protocol: AgentProtocolsCatalog.ProtocolItem,
    onCopy: (String) -> Unit
) {
    val statusColor = when (protocol.status) {
        "ACTIVO" -> MintSpeed
        "LISTO" -> Color(0xFF38BDF8)
        else -> LavenderPrimary
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF111726)),
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, ElegantCardBorder)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Header: Number + Name + Status Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        "#${protocol.index}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = LavenderPrimary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        protocol.name,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextWhite,
                        maxLines = 1
                    )
                }

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = statusColor.copy(alpha = 0.15f),
                    border = BorderStroke(1.dp, statusColor.copy(alpha = 0.4f))
                ) {
                    Text(
                        protocol.status,
                        fontSize = 8.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = statusColor,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Category & Transport
            Text(
                "${protocol.category} • ${protocol.connectionType}",
                fontSize = 9.5.sp,
                color = Color(0xFF38BDF8),
                fontWeight = FontWeight.Medium
            )

            // Description
            Text(
                protocol.description,
                fontSize = 10.sp,
                color = TextGrayMuted,
                modifier = Modifier.padding(vertical = 4.dp)
            )

            // Endpoint / Command Box with Copy Button
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFF090D16),
                border = BorderStroke(1.dp, ElegantCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = protocol.endpointOrCommand,
                        fontSize = 9.5.sp,
                        fontFamily = FontFamily.Monospace,
                        color = TextWhite,
                        modifier = Modifier.weight(1f)
                    )

                    IconButton(
                        onClick = { onCopy(protocol.endpointOrCommand) },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            Icons.Default.ContentCopy,
                            contentDescription = "Copiar",
                            tint = Color(0xFF38BDF8),
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }
        }
    }
}
