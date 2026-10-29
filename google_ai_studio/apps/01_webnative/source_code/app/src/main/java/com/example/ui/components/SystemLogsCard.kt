package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.example.ui.theme.*
import com.example.util.AppLogger
import com.example.util.LogLevel
import com.example.util.MasterSystemDiagnosticsEngine
import kotlinx.coroutines.launch

@Composable
fun SystemLogsCard(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val logEntries by AppLogger.logsFlow.collectAsStateWithLifecycle()
    var selectedTag by remember { mutableStateOf("TODOS") }
    var selectedLevel by remember { mutableStateOf<LogLevel?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    var autoScrollEnabled by remember { mutableStateOf(true) }
    var showDiagnosticDialog by remember { mutableStateOf(false) }

    var logSizeFormatted by remember { mutableStateOf(AppLogger.getLogSizeFormatted(context)) }
    var logLineCount by remember { mutableStateOf(AppLogger.getLogLineCount(context)) }

    val tagsList = listOf(
        "TODOS", "CI/CD", "NATIVE_CLONER", "SPLIT_INSTALLER", "SANDBOX", "DATABASE",
        "P2P_SYNC", "AUTOMATION", "WEBVIEW", "WORK_MANAGER", "DIAGNOSTICS"
    )

    // Filter memory logs
    val filteredLogs = remember(logEntries, selectedTag, selectedLevel, searchQuery) {
        logEntries.filter { entry ->
            val matchesTag = selectedTag == "TODOS" || entry.tag.equals(selectedTag, ignoreCase = true)
            val matchesLevel = selectedLevel == null || entry.level == selectedLevel
            val matchesSearch = if (searchQuery.isBlank()) true else {
                entry.message.contains(searchQuery, ignoreCase = true) ||
                entry.tag.contains(searchQuery, ignoreCase = true)
            }
            matchesTag && matchesLevel && matchesSearch
        }
    }

    val listState = rememberLazyListState()

    // Auto-scroll when new logs arrive if enabled
    LaunchedEffect(filteredLogs.size, autoScrollEnabled) {
        if (autoScrollEnabled && filteredLogs.isNotEmpty()) {
            listState.animateScrollToItem(filteredLogs.size - 1)
        }
        logSizeFormatted = AppLogger.getLogSizeFormatted(context)
        logLineCount = AppLogger.getLogLineCount(context)
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ElegantCard),
        shape = RoundedCornerShape(24.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, ElegantCardBorder)
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
                            .background(MintSpeed.copy(alpha = 0.2f), RoundedCornerShape(14.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.ListAlt, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(24.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Consola del Sistema (Logs)", fontWeight = FontWeight.Bold, color = TextWhite, fontSize = 15.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = DeepPurpleContainer,
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = "$logSizeFormatted • $logLineCount líneas",
                                    fontSize = 9.5.sp,
                                    color = LavenderPrimary,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text("Telemetría en tiempo real y diagnóstico para Agente AI", fontSize = 11.sp, color = TextGrayMuted)
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = {
                        AppLogger.clearLogs(context)
                        logSizeFormatted = AppLogger.getLogSizeFormatted(context)
                        logLineCount = AppLogger.getLogLineCount(context)
                    }) {
                        Icon(Icons.Default.DeleteOutline, contentDescription = "Limpiar", tint = Color(0xFFEF4444), modifier = Modifier.size(20.dp))
                    }
                    IconButton(onClick = {
                        logSizeFormatted = AppLogger.getLogSizeFormatted(context)
                        logLineCount = AppLogger.getLogLineCount(context)
                    }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refrescar", tint = LavenderPrimary, modifier = Modifier.size(20.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action Buttons Toolbar: AI Copy, Diagnostics Dialog, Share File
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = {
                        scope.launch {
                            MasterSystemDiagnosticsEngine.copyMasterReportToClipboard(context, includeLogs = true)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = LavenderPrimary),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                    modifier = Modifier.weight(1.3f)
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = null, tint = Color.Black, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Copiar para Agente AI", fontSize = 11.sp, color = Color.Black, fontWeight = FontWeight.Bold, maxLines = 1)
                }

                OutlinedButton(
                    onClick = { showDiagnosticDialog = true },
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MintSpeed),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MintSpeed.copy(alpha = 0.5f)),
                    modifier = Modifier.weight(1.1f)
                ) {
                    Icon(Icons.Default.Analytics, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Diagnóstico 360°", fontSize = 11.sp, color = MintSpeed, fontWeight = FontWeight.Bold, maxLines = 1)
                }

                IconButton(
                    onClick = {
                        scope.launch {
                            MasterSystemDiagnosticsEngine.exportAndShareFullDiagnosticBundle(context)
                        }
                    },
                    modifier = Modifier
                        .size(36.dp)
                        .background(Color(0xFF1E293B), RoundedCornerShape(10.dp))
                ) {
                    Icon(Icons.Default.Share, contentDescription = "Compartir archivo", tint = TextWhite, modifier = Modifier.size(16.dp))
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Search Bar & Auto-scroll Toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Buscar en logs por texto o tag...", fontSize = 11.sp, color = TextGrayMuted) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextGrayMuted, modifier = Modifier.size(16.dp)) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }, modifier = Modifier.size(24.dp)) {
                                Icon(Icons.Default.Clear, contentDescription = "Borrar", tint = TextGrayMuted, modifier = Modifier.size(14.dp))
                            }
                        }
                    },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = LavenderPrimary,
                        unfocusedBorderColor = ElegantCardBorder,
                        focusedTextColor = TextWhite,
                        unfocusedTextColor = TextWhite,
                        focusedContainerColor = Color.Black.copy(alpha = 0.3f),
                        unfocusedContainerColor = Color.Black.copy(alpha = 0.2f)
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp)
                )

                FilterChip(
                    selected = autoScrollEnabled,
                    onClick = { autoScrollEnabled = !autoScrollEnabled },
                    label = { Text(if (autoScrollEnabled) "Auto-scroll ON" else "Auto-scroll OFF", fontSize = 10.sp) },
                    leadingIcon = {
                        Icon(
                            if (autoScrollEnabled) Icons.Default.VerticalAlignBottom else Icons.Default.PauseCircleOutline,
                            contentDescription = null,
                            modifier = Modifier.size(12.dp)
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MintSpeed.copy(alpha = 0.2f),
                        selectedLabelColor = MintSpeed,
                        selectedLeadingIconColor = MintSpeed
                    ),
                    modifier = Modifier.height(44.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Tag Filter Chips (Horizontal scroll)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                tagsList.forEach { tag ->
                    val isSelected = selectedTag == tag
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedTag = tag },
                        label = { Text(tag, fontSize = 9.5.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = LavenderPrimary.copy(alpha = 0.25f),
                            selectedLabelColor = LavenderPrimary,
                            containerColor = Color.Black.copy(alpha = 0.2f),
                            labelColor = TextGrayLight
                        ),
                        modifier = Modifier.height(30.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Log Console Window (Monospace streaming list)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF0D1117))
                    .border(1.dp, Color(0xFF30363D), RoundedCornerShape(12.dp))
                    .padding(8.dp)
            ) {
                if (filteredLogs.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(
                            text = if (logEntries.isEmpty()) "No hay registros activos. El sistema está limpio." else "Sin coincidencias con los filtros.",
                            color = TextGrayMuted,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                } else {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        items(filteredLogs, key = { it.id }) { entry ->
                            LogItemRow(entry)
                        }
                    }
                }
            }
        }
    }

    // 360° Diagnostics Audit Modal Dialog
    if (showDiagnosticDialog) {
        MasterDiagnosticAuditDialog(onDismiss = { showDiagnosticDialog = false })
    }
}

@Composable
private fun LogItemRow(entry: com.example.util.LogEntry) {
    val levelColor = when (entry.level) {
        LogLevel.DEBUG -> Color(0xFF94A3B8)
        LogLevel.INFO -> Color(0xFF38BDF8)
        LogLevel.SUCCESS -> MintSpeed
        LogLevel.WARN -> Color(0xFFFBBF24)
        LogLevel.ERROR -> Color(0xFFF87171)
    }

    val tagColor = when (entry.tag) {
        "CI/CD" -> Color(0xFFC084FC)
        "NATIVE_CLONER" -> Color(0xFFFB923C)
        "SPLIT_INSTALLER" -> Color(0xFF60A5FA)
        "SANDBOX" -> MintSpeed
        "P2P_SYNC" -> Color(0xFFE879F9)
        "DATABASE" -> Color(0xFF34D399)
        "AUTOMATION" -> Color(0xFFF43F5E)
        "WORK_MANAGER" -> Color(0xFFA78BFA)
        else -> Color(0xFFCBD5E1)
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF161B22).copy(alpha = 0.5f), RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = entry.timestamp.substringAfter(" "),
                    color = TextGrayMuted,
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.width(6.dp))
                Surface(
                    color = tagColor.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = entry.tag,
                        color = tagColor,
                        fontSize = 8.5.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                    )
                }
            }

            Surface(
                color = levelColor.copy(alpha = 0.15f),
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(
                    text = "${entry.level.emoji} ${entry.level.label}",
                    color = levelColor,
                    fontSize = 8.5.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(2.dp))

        Text(
            text = entry.message,
            color = if (entry.level == LogLevel.ERROR) Color(0xFFFCA5A5) else TextWhite,
            fontSize = 10.sp,
            fontFamily = FontFamily.Monospace,
            lineHeight = 13.sp
        )
    }
}

/**
 * Interactive 360° System & Component Diagnostic Audit Dialog.
 */
@Composable
fun MasterDiagnosticAuditDialog(onDismiss: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var selectedTab by remember { mutableStateOf(0) }
    var reportMarkdown by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        reportMarkdown = MasterSystemDiagnosticsEngine.generateMasterMarkdownReport(context, includeLogs = true, maxLogLines = 1000)
        isLoading = false
    }

    val tabs = listOf("Auditoría Completa", "Hardware & OS", "Sandboxes", "Clones & Splits", "Logs Crudos")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Analytics, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(22.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Diagnóstico Integral 360°", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextWhite)
                }
                IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                    Icon(Icons.Default.Close, contentDescription = "Cerrar", tint = TextGrayMuted, modifier = Modifier.size(18.dp))
                }
            }
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Tab Row
                ScrollableTabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Color.Transparent,
                    contentColor = LavenderPrimary,
                    edgePadding = 0.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    tabs.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            text = { Text(title, fontSize = 10.5.sp, fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                if (isLoading) {
                    Box(modifier = Modifier.fillMaxWidth().height(250.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = LavenderPrimary)
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(340.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF0D1117))
                            .border(1.dp, Color(0xFF30363D), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        val scrollState = rememberScrollState()
                        Text(
                            text = reportMarkdown ?: "Generando reporte...",
                            color = MintSpeed,
                            fontSize = 9.5.sp,
                            fontFamily = FontFamily.Monospace,
                            lineHeight = 13.5.sp,
                            modifier = Modifier.verticalScroll(scrollState)
                        )
                    }
                }
            }
        },
        confirmButton = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = {
                        scope.launch {
                            MasterSystemDiagnosticsEngine.exportAndShareFullDiagnosticBundle(context)
                        }
                    },
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextWhite)
                ) {
                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Exportar Archivo", fontSize = 11.sp)
                }

                Button(
                    onClick = {
                        scope.launch {
                            MasterSystemDiagnosticsEngine.copyMasterReportToClipboard(context, includeLogs = true)
                            onDismiss()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = LavenderPrimary)
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = null, tint = Color.Black, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Copiar Todo para AI", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        },
        dismissButton = null,
        containerColor = ElegantNav,
        shape = RoundedCornerShape(20.dp)
    )
}
