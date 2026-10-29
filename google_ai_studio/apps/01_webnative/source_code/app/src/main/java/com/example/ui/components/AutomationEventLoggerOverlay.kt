package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.DeleteSweep
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.util.AutomationController
import com.example.util.AutomationEventLog
import com.example.util.AutomationEventStatus
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.roundToInt

@Composable
fun AutomationEventLoggerOverlay(
    modifier: Modifier = Modifier
) {
    val isVisible by AutomationController.isEventLoggerOverlayVisible.collectAsState()
    val eventLogs by AutomationController.eventLogs.collectAsState()

    if (!isVisible) return

    val context = LocalContext.current
    var isMinimized by remember { mutableStateOf(false) }
    var selectedFilter by remember { mutableStateOf<String>("ALL") } // ALL, SUCCESS, ERRORS, ANCHORS
    var searchQuery by remember { mutableStateOf("") }

    var offsetX by remember { mutableFloatStateOf(16f) }
    var offsetY by remember { mutableFloatStateOf(120f) }

    val listState = rememberLazyListState()

    val filteredLogs = remember(eventLogs, selectedFilter, searchQuery) {
        eventLogs.filter { log ->
            val matchesFilter = when (selectedFilter) {
                "SUCCESS" -> log.status == AutomationEventStatus.SUCCESS || log.status == AutomationEventStatus.ANCHOR_MATCHED || log.status == AutomationEventStatus.PRESET_LOADED
                "ERRORS" -> log.status == AutomationEventStatus.FAILURE || log.status == AutomationEventStatus.ANCHOR_FAILED
                "ANCHORS" -> log.status == AutomationEventStatus.ANCHOR_MATCHED || log.status == AutomationEventStatus.ANCHOR_FAILED
                else -> true
            }
            val matchesSearch = if (searchQuery.isBlank()) true else {
                log.pointLabel.contains(searchQuery, ignoreCase = true) ||
                log.message.contains(searchQuery, ignoreCase = true) ||
                log.targetAnchor.contains(searchQuery, ignoreCase = true)
            }
            matchesFilter && matchesSearch
        }
    }

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.TopStart
    ) {
        Box(
            modifier = Modifier
                .offset { IntOffset(offsetX.roundToInt(), offsetY.roundToInt()) }
                .pointerInput(Unit) {
                    detectDragGestures { change, dragAmount ->
                        change.consume()
                        offsetX = (offsetX + dragAmount.x).coerceIn(0f, 600f)
                        offsetY = (offsetY + dragAmount.y).coerceIn(50f, 1600f)
                    }
                }
        ) {
            if (isMinimized) {
                // Minimized Pill
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0xEE14141E),
                    border = androidx.compose.foundation.BorderStroke(1.dp, LavenderPrimary.copy(alpha = 0.6f)),
                    shadowElevation = 8.dp,
                    modifier = Modifier.clickable { isMinimized = false }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(MintSpeed)
                        )
                        Text(
                            "Event Logger (${eventLogs.size})",
                            color = TextWhite,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Icon(
                            Icons.Default.OpenInFull,
                            contentDescription = "Expandir",
                            tint = LavenderPrimary,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            } else {
                // Full Floating Card
                Card(
                    modifier = Modifier
                        .widthIn(min = 280.dp, max = 340.dp)
                        .heightIn(min = 200.dp, max = 380.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFA121218)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF2C2C3A)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 10.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(10.dp)
                    ) {
                        // Header
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(10.dp)
                                        .clip(CircleShape)
                                        .background(MintSpeed)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    "Event Logger en Vivo",
                                    color = TextWhite,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    "(${filteredLogs.size})",
                                    color = LavenderPrimary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }

                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                // Copy All
                                IconButton(
                                    onClick = {
                                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                        val text = eventLogs.joinToString("\n") { log ->
                                            val time = SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault()).format(Date(log.timestamp))
                                            "[$time][${log.status.name}] ${log.pointLabel} (${log.gestureType}) Anchor: ${log.targetAnchor} -> ${log.message}"
                                        }
                                        clipboard.setPrimaryClip(ClipData.newPlainText("Automation Logs", text))
                                        Toast.makeText(context, "Logs copiados al portapapeles", Toast.LENGTH_SHORT).show()
                                    },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(Icons.Outlined.ContentCopy, contentDescription = "Copiar logs", tint = TextGrayLight, modifier = Modifier.size(14.dp))
                                }

                                // Clear
                                IconButton(
                                    onClick = { AutomationController.clearEventLogs() },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(Icons.Outlined.DeleteSweep, contentDescription = "Limpiar logs", tint = TextGrayLight, modifier = Modifier.size(15.dp))
                                }

                                // Minimize
                                IconButton(
                                    onClick = { isMinimized = true },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(Icons.Default.CloseFullscreen, contentDescription = "Minimizar", tint = TextGrayLight, modifier = Modifier.size(14.dp))
                                }

                                // Close
                                IconButton(
                                    onClick = { AutomationController.setEventLoggerOverlayVisible(false) },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(Icons.Default.Close, contentDescription = "Cerrar", tint = TextGrayLight, modifier = Modifier.size(15.dp))
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        // Filter Chips
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            listOf("ALL" to "Todos", "SUCCESS" to "Éxito", "ERRORS" to "Errores", "ANCHORS" to "Anclas").forEach { (key, label) ->
                                val isSelected = selectedFilter == key
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isSelected) LavenderPrimary.copy(alpha = 0.3f) else Color(0xFF1E1E28))
                                        .border(1.dp, if (isSelected) LavenderPrimary else Color.Transparent, RoundedCornerShape(6.dp))
                                        .clickable { selectedFilter = key }
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        label,
                                        color = if (isSelected) TextWhite else TextGrayMuted,
                                        fontSize = 9.5.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        // Logs List
                        if (filteredLogs.isEmpty()) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF181820)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    "Esperando eventos de automatización...",
                                    color = TextGrayMuted,
                                    fontSize = 10.5.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        } else {
                            LazyColumn(
                                state = listState,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF0C0C12))
                                    .padding(4.dp),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                items(filteredLogs, key = { it.id }) { log ->
                                    EventLogRowItem(log = log)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun EventLogRowItem(log: AutomationEventLog) {
    val timeFormatted = remember(log.timestamp) {
        SimpleDateFormat("HH:mm:ss.S", Locale.getDefault()).format(Date(log.timestamp))
    }

    val (statusColor, badgeBg) = when (log.status) {
        AutomationEventStatus.SUCCESS, AutomationEventStatus.ANCHOR_MATCHED -> MintSpeed to MintSpeed.copy(alpha = 0.15f)
        AutomationEventStatus.FAILURE, AutomationEventStatus.ANCHOR_FAILED -> CoralError to CoralError.copy(alpha = 0.15f)
        AutomationEventStatus.SKIPPED, AutomationEventStatus.WAITING -> AmberWarning to AmberWarning.copy(alpha = 0.15f)
        AutomationEventStatus.PRESET_LOADED -> LavenderPrimary to LavenderPrimary.copy(alpha = 0.2f)
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(6.dp))
            .background(Color(0xFF161622))
            .padding(6.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(badgeBg)
                        .padding(horizontal = 4.dp, vertical = 1.dp)
                ) {
                    Text(
                        log.status.name,
                        color = statusColor,
                        fontSize = 8.5.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    log.pointLabel,
                    color = TextWhite,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Text(
                timeFormatted,
                color = TextGrayMuted,
                fontSize = 8.5.sp,
                fontFamily = FontFamily.Monospace
            )
        }

        Spacer(modifier = Modifier.height(2.dp))

        Text(
            log.message,
            color = TextGrayLight,
            fontSize = 9.5.sp,
            fontFamily = FontFamily.Monospace,
            lineHeight = 12.sp
        )

        if (log.targetAnchor.isNotBlank() && log.targetAnchor != "None") {
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                "Ancla: ${log.targetAnchor} ${if (log.confidenceScore != null) "(${(log.confidenceScore * 100).toInt()}%)" else ""}",
                color = LavenderPrimary.copy(alpha = 0.8f),
                fontSize = 8.5.sp,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}
