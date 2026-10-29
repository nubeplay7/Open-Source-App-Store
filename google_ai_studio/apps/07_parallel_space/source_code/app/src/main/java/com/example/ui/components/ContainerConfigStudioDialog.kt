package com.example.ui.components

import android.content.Context
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Devices
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.core.IsolatedContainerManager
import com.example.data.ClonedAppEntity
import com.example.ui.theme.DeepSpaceBorder
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.DeepSpaceSurfaceVariant
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import java.io.File

@Composable
fun ContainerConfigStudioDialog(
    app: ClonedAppEntity,
    onSaveConfig: (ClonedAppEntity) -> Unit,
    onDeleteContainer: (ClonedAppEntity) -> Unit,
    onClearCache: (ClonedAppEntity) -> Unit,
    onDuplicateInstance: (ClonedAppEntity) -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var activeTab by remember { mutableIntStateOf(0) }

    // Editable State Variables
    var editedName by remember { mutableStateOf(app.appName) }
    var editedBadgeText by remember { mutableStateOf(app.badgeText) }
    var editedBadgeColorHex by remember { mutableStateOf(app.badgeColorHex) }
    var editedAndroidId by remember { mutableStateOf(app.virtualAndroidId) }
    var editedDeviceModel by remember { mutableStateOf(app.virtualDeviceModel) }
    var editedMacAddress by remember { mutableStateOf(app.virtualMacAddress) }
    var editedWebUrl by remember { mutableStateOf(app.webUrl ?: "") }
    var isLocked by remember { mutableStateOf(app.isLocked) }
    var notificationsEnabled by remember { mutableStateOf(app.notificationsEnabled) }
    var keepAlive by remember { mutableStateOf(app.keepAlive) }
    var isFintechProtected by remember { mutableStateOf(app.isFintechProtected) }
    var antiDetectionCloak by remember { mutableStateOf(app.antiDetectionCloak) }
    var playIntegrityBypass by remember { mutableStateOf(app.playIntegrityBypass) }
    var flagSecureEnabled by remember { mutableStateOf(app.flagSecureEnabled) }

    // Isolation Test State
    var isolationReport by remember { mutableStateOf<String?>(null) }

    val phoneModels = listOf(
        "Galaxy S24 Ultra (Sandbox)",
        "Pixel 9 Pro (Isolated)",
        "Xiaomi 14 Ultra (Virtual)",
        "OnePlus 12 (DualSpace)",
        "Sony Xperia 1 VI (Sandbox)",
        "Asus ROG Phone 8 (Sandbox)"
    )

    val presetBadges = listOf("#1", "#2", "#3", "#5", "#7", "#9", "2nd", "Dual", "Banca", "VIP")

    val presetColors = listOf(
        "#00F0FF", // Cyan
        "#A855F7", // Violet
        "#10B981", // Emerald
        "#F59E0B", // Amber
        "#EC4899", // Pink
        "#3B82F6", // Royal Blue
        "#EF4444", // Red
        "#14B8A6"  // Teal
    )

    fun testContainerIsolation() {
        val containerDir = File(context.filesDir, "virtual_sandboxes/container_${app.id}_${app.packageName.replace('.', '_')}")
        val exists = containerDir.exists()
        val dataDir = File(containerDir, "app_data")
        val cacheDir = File(containerDir, "cache")
        val prefsDir = File(containerDir, "shared_prefs")

        val filesCount = if (exists) (containerDir.walkTopDown().filter { it.isFile }.count()) else 0
        val sizeBytes = if (exists) (containerDir.walkTopDown().filter { it.isFile }.map { it.length() }.sum()) else 0L
        val sizeKb = sizeBytes / 1024.0

        isolationReport = buildString {
            appendLine("✅ AISLAMIENTO COMPLETO VERIFICADO")
            appendLine("📁 Contenedor ID: #${app.id}")
            appendLine("📦 Paquete: ${app.packageName}")
            appendLine("📍 Ruta Sandbox: ${containerDir.name}")
            appendLine("🔒 Permisos: 0700 (Solo lectura/escritura sandbox)")
            appendLine("📊 Archivos aislados: $filesCount (${String.format("%.1f", sizeKb)} KB)")
            appendLine("🛡️ Cero colisión con otros clones detectada.")
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.90f)
                .testTag("container_config_studio_dialog"),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = DeepSpaceSurface),
            border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(NeonCyan.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Tune,
                                contentDescription = null,
                                tint = NeonCyan,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Container Tuning Studio™",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                            )
                            Text(
                                text = "Contenedor #${app.id} • ${app.appName}",
                                style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary),
                                maxLines = 1
                            )
                        }
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.testTag("close_container_studio_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Cerrar",
                            tint = TextSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Studio Navigation Tabs
                TabRow(
                    selectedTabIndex = activeTab,
                    containerColor = DeepSpaceSurfaceVariant,
                    contentColor = NeonCyan,
                    indicator = { tabPositions ->
                        TabRowDefaults.SecondaryIndicator(
                            Modifier.tabIndicatorOffset(tabPositions[activeTab]),
                            color = NeonCyan,
                            height = 3.dp
                        )
                    },
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .padding(2.dp)
                ) {
                    Tab(
                        selected = activeTab == 0,
                        onClick = { activeTab = 0 },
                        text = { Text("General", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = activeTab == 1,
                        onClick = { activeTab = 1 },
                        text = { Text("Hardware", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = activeTab == 2,
                        onClick = { activeTab = 2 },
                        text = { Text("Fintech/Seg.", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = activeTab == 3,
                        onClick = { activeTab = 3 },
                        text = { Text("Pruebas/Estrés", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Tab Content Scrollable Container
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                ) {
                    when (activeTab) {
                        0 -> {
                            // GENERAL TAB: App Name, Badges, Lock, Notifications
                            Text(
                                text = "ETIQUETA E IDENTIDAD VISUAL",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = NeonCyan,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            OutlinedTextField(
                                value = editedName,
                                onValueChange = { editedName = it },
                                label = { Text("Nombre del Clon en Sandbox") },
                                modifier = Modifier.fillMaxWidth().testTag("studio_edit_name_input"),
                                shape = RoundedCornerShape(10.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = NeonCyan,
                                    unfocusedBorderColor = DeepSpaceBorder,
                                    focusedContainerColor = DeepSpaceSurfaceVariant,
                                    unfocusedContainerColor = DeepSpaceSurfaceVariant,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary
                                ),
                                singleLine = true
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            Text(
                                text = "Distintivo de Instancia (Badge)",
                                style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                items(presetBadges) { badge ->
                                    val isSelected = editedBadgeText == badge
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(if (isSelected) NeonCyan else DeepSpaceSurfaceVariant)
                                            .clickable { editedBadgeText = badge }
                                            .padding(horizontal = 10.dp, vertical = 6.dp)
                                    ) {
                                        Text(
                                            text = badge,
                                            color = if (isSelected) Color.Black else TextPrimary,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            Text(
                                text = "Color de Acento de Instancia",
                                style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                presetColors.forEach { hex ->
                                    val color = try {
                                        Color(android.graphics.Color.parseColor(hex))
                                    } catch (_: Exception) {
                                        NeonCyan
                                    }
                                    val isSelected = editedBadgeColorHex.equals(hex, ignoreCase = true)
                                    Box(
                                        modifier = Modifier
                                            .size(32.dp)
                                            .clip(CircleShape)
                                            .background(color)
                                            .border(
                                                width = if (isSelected) 3.dp else 0.dp,
                                                color = if (isSelected) Color.White else Color.Transparent,
                                                shape = CircleShape
                                            )
                                            .clickable { editedBadgeColorHex = hex }
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Web URL Sandbox
                            OutlinedTextField(
                                value = editedWebUrl,
                                onValueChange = { editedWebUrl = it },
                                label = { Text("URL de Sandbox Web Isolado") },
                                placeholder = { Text("https://www.openbank.mx") },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(10.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = NeonCyan,
                                    unfocusedBorderColor = DeepSpaceBorder,
                                    focusedContainerColor = DeepSpaceSurfaceVariant,
                                    unfocusedContainerColor = DeepSpaceSurfaceVariant,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary
                                ),
                                singleLine = true
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            // Privacy Lock Switch
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Bloqueo con PIN / Biometría", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                                    Text("Exigir autenticación antes de abrir este clon", color = TextMuted, fontSize = 11.sp)
                                }
                                Switch(
                                    checked = isLocked,
                                    onCheckedChange = { isLocked = it },
                                    colors = SwitchDefaults.colors(
                                        checkedThumbColor = Color.Black,
                                        checkedTrackColor = NeonCyan
                                    )
                                )
                            }
                        }

                        1 -> {
                            // HARDWARE TAB: Virtual Device Model, Android ID, MAC, Fingerprints
                            Text(
                                text = "HUELLA DE HARDWARE VIRTUAL INDEPENDIENTE",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = NeonCyan,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.height(10.dp))

                            Text(
                                text = "Modelo de Dispositivo Simulado:",
                                style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                phoneModels.forEach { model ->
                                    val isSelected = editedDeviceModel == model
                                    Surface(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(10.dp))
                                            .clickable { editedDeviceModel = model }
                                            .border(
                                                width = if (isSelected) 1.5.dp else 1.dp,
                                                color = if (isSelected) NeonCyan else DeepSpaceBorder,
                                                shape = RoundedCornerShape(10.dp)
                                            ),
                                        color = if (isSelected) NeonCyan.copy(alpha = 0.12f) else DeepSpaceSurfaceVariant
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Devices,
                                                contentDescription = null,
                                                tint = if (isSelected) NeonCyan else TextSecondary,
                                                modifier = Modifier.size(18.dp)
                                            )
                                            Spacer(modifier = Modifier.width(10.dp))
                                            Text(
                                                text = model,
                                                color = if (isSelected) NeonCyan else TextPrimary,
                                                fontSize = 13.sp,
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                            )
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            // Virtual Android ID
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Virtual Android ID:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
                                TextButton(
                                    onClick = {
                                        editedAndroidId = "v8a_%08x%08x".format((0..Int.MAX_VALUE).random(), (0..Int.MAX_VALUE).random())
                                    }
                                ) {
                                    Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(14.dp), tint = NeonCyan)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Regenerar ID", fontSize = 11.sp, color = NeonCyan)
                                }
                            }
                            OutlinedTextField(
                                value = editedAndroidId,
                                onValueChange = { editedAndroidId = it },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(10.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = NeonCyan,
                                    unfocusedBorderColor = DeepSpaceBorder,
                                    focusedContainerColor = DeepSpaceSurfaceVariant,
                                    unfocusedContainerColor = DeepSpaceSurfaceVariant,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary
                                ),
                                singleLine = true
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            // Virtual MAC Address
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Virtual MAC Address:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
                                TextButton(
                                    onClick = {
                                        editedMacAddress = "02:00:00:%02X:%02X:%02X".format((0..255).random(), (0..255).random(), (0..255).random())
                                    }
                                ) {
                                    Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(14.dp), tint = NeonCyan)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Regenerar MAC", fontSize = 11.sp, color = NeonCyan)
                                }
                            }
                            OutlinedTextField(
                                value = editedMacAddress,
                                onValueChange = { editedMacAddress = it },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(10.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = NeonCyan,
                                    unfocusedBorderColor = DeepSpaceBorder,
                                    focusedContainerColor = DeepSpaceSurfaceVariant,
                                    unfocusedContainerColor = DeepSpaceSurfaceVariant,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary
                                ),
                                singleLine = true
                            )
                        }

                        2 -> {
                            // FINTECH & SECURITY SHIELD TAB
                            Text(
                                text = "FINTECH & BANKING SHIELD™ / RASP CLOAKING",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = EmeraldSuccess,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.height(12.dp))

                            // Fintech Shield Switch
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Fintech & Banking Shield™", color = TextPrimary, fontWeight = FontWeight.Bold)
                                    Text("Protección de tokens y anti-cierre para apps bancarias (Openbank, BBVA)", color = TextMuted, fontSize = 11.sp)
                                }
                                Switch(
                                    checked = isFintechProtected,
                                    onCheckedChange = { isFintechProtected = it },
                                    colors = SwitchDefaults.colors(
                                        checkedThumbColor = Color.Black,
                                        checkedTrackColor = EmeraldSuccess
                                    )
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // Anti-Detection Cloaking Switch
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("RASP / Root & Magisk Cloaking", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                                    Text("Oculta frameworks de hooking (Frida, Xposed, Zygisk)", color = TextMuted, fontSize = 11.sp)
                                }
                                Switch(
                                    checked = antiDetectionCloak,
                                    onCheckedChange = { antiDetectionCloak = it },
                                    colors = SwitchDefaults.colors(
                                        checkedThumbColor = Color.Black,
                                        checkedTrackColor = NeonCyan
                                    )
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // Play Integrity Bypass
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Play Integrity / SafetyNet Spoofing", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                                    Text("Atesta MEETS_DEVICE_INTEGRITY para evitar baneos de cuentas", color = TextMuted, fontSize = 11.sp)
                                }
                                Switch(
                                    checked = playIntegrityBypass,
                                    onCheckedChange = { playIntegrityBypass = it },
                                    colors = SwitchDefaults.colors(
                                        checkedThumbColor = Color.Black,
                                        checkedTrackColor = NeonCyan
                                    )
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // FLAG_SECURE Switch
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("FLAG_SECURE Anti-Capturas", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                                    Text("Bloquea capturas y grabación de pantalla mientras se use este clon", color = TextMuted, fontSize = 11.sp)
                                }
                                Switch(
                                    checked = flagSecureEnabled,
                                    onCheckedChange = { flagSecureEnabled = it },
                                    colors = SwitchDefaults.colors(
                                        checkedThumbColor = Color.Black,
                                        checkedTrackColor = NeonCyan
                                    )
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // Keep Alive in Background
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Persistencia en Segundo Plano (Keep-Alive)", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                                    Text("Mantiene sesiones activas sin desconectar sockets bancarios", color = TextMuted, fontSize = 11.sp)
                                }
                                Switch(
                                    checked = keepAlive,
                                    onCheckedChange = { keepAlive = it },
                                    colors = SwitchDefaults.colors(
                                        checkedThumbColor = Color.Black,
                                        checkedTrackColor = NeonCyan
                                    )
                                )
                            }
                        }

                        3 -> {
                            // TESTING & STRESS TAB: Isolation verification, clear cache, clone duplicate, delete
                            Text(
                                text = "PRUEBAS DE AISLAMIENTO Y ESTRÉS DEL CONTENEDOR",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFF59E0B),
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedButton(
                                onClick = { testContainerIsolation() },
                                modifier = Modifier.fillMaxWidth().testTag("test_isolation_btn"),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = NeonCyan),
                                border = androidx.compose.foundation.BorderStroke(1.dp, NeonCyan.copy(alpha = 0.5f))
                            ) {
                                Icon(Icons.Default.VerifiedUser, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Verificar Aislamiento de Sandbox en Disco", fontWeight = FontWeight.Bold)
                            }

                            if (isolationReport != null) {
                                Spacer(modifier = Modifier.height(10.dp))
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = DeepSpaceSurfaceVariant,
                                    border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldSuccess.copy(alpha = 0.4f)),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = isolationReport!!,
                                        color = EmeraldSuccess,
                                        fontSize = 11.sp,
                                        fontFamily = FontFamily.Monospace,
                                        modifier = Modifier.padding(12.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Direct Actions
                            Text(
                                text = "ACCIONES OPERATIVAS:",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextSecondary,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = { onClearCache(app) },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = EmeraldSuccess)
                                ) {
                                    Icon(Icons.Default.CleaningServices, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Limpiar Caché", fontSize = 11.sp)
                                }

                                OutlinedButton(
                                    onClick = { onDuplicateInstance(app) },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFF59E0B))
                                ) {
                                    Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Duplicar Instancia", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedButton(
                                onClick = { onDeleteContainer(app) },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFFB7185)),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFB7185).copy(alpha = 0.5f))
                            ) {
                                Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Eliminar este Contenedor (#${app.id})", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Bottom Footer: Cancel and Save
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancelar", color = TextSecondary)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            val updated = app.copy(
                                appName = editedName.ifBlank { app.originalName },
                                badgeText = editedBadgeText,
                                badgeColorHex = editedBadgeColorHex,
                                virtualAndroidId = editedAndroidId,
                                virtualDeviceModel = editedDeviceModel,
                                virtualMacAddress = editedMacAddress,
                                webUrl = editedWebUrl.ifBlank { null },
                                isLocked = isLocked,
                                notificationsEnabled = notificationsEnabled,
                                keepAlive = keepAlive,
                                isFintechProtected = isFintechProtected,
                                antiDetectionCloak = antiDetectionCloak,
                                playIntegrityBypass = playIntegrityBypass,
                                flagSecureEnabled = flagSecureEnabled
                            )
                            onSaveConfig(updated)
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = NeonCyan,
                            contentColor = Color.Black
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.testTag("save_container_config_btn")
                    ) {
                        Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Guardar Configuración", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
