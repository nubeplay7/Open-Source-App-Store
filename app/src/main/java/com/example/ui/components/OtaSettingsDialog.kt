package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.ota.*
import com.example.ui.theme.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun OtaSettingsDialog(
    isOpen: Boolean,
    onClose: () -> Unit,
    otaManager: OtaUpdateManager,
    currentVersionName: String = "1.0.0",
    currentVersionCode: Int = 1
) {
    if (!isOpen) return

    val settings by otaManager.settingsManager.settings.collectAsState()
    val status by otaManager.status.collectAsState()
    val scope = rememberCoroutineScope()
    var shizukuState by remember { mutableStateOf(otaManager.shizukuBridge.checkShizukuState()) }

    // Refrescar estado de Shizuku al abrir
    LaunchedEffect(isOpen) {
        shizukuState = otaManager.shizukuBridge.checkShizukuState()
    }

    val dateFormat = remember { SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()) }

    Dialog(onDismissRequest = onClose) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .border(1.dp, Slate800, RoundedCornerShape(16.dp)),
            color = Slate900
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                // Cabecera
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Configuración",
                            tint = Cyan400,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Configuración OTA",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Slate100
                        )
                    }
                    IconButton(onClick = onClose, modifier = Modifier.size(28.dp)) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Cerrar",
                            tint = Slate400,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // SECCIÓN 1: Control de Actualización Automática
                Surface(
                    color = Slate950,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth().border(1.dp, Slate800, RoundedCornerShape(10.dp))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Actualización Automática",
                                    color = Slate100,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 14.sp
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Descarga y aplica nuevas versiones al iniciar o en segundo plano",
                                    color = Slate400,
                                    fontSize = 11.sp
                                )
                            }
                            Switch(
                                checked = settings.autoUpdateEnabled,
                                onCheckedChange = { otaManager.settingsManager.setAutoUpdateEnabled(it) },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Emerald400,
                                    checkedTrackColor = Emerald950,
                                    uncheckedThumbColor = Slate400,
                                    uncheckedTrackColor = Slate800
                                )
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // SECCIÓN 2: Soporte Shizuku para Instalación Silenciosa
                Surface(
                    color = Slate950,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth().border(1.dp, Slate800, RoundedCornerShape(10.dp))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Instalación Desatendida (Shizuku)",
                                    color = Slate100,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 14.sp
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Actualiza sin pantallas de confirmación del sistema si Shizuku está activo",
                                    color = Slate400,
                                    fontSize = 11.sp
                                )
                            }
                            Switch(
                                checked = settings.useShizukuEnabled,
                                onCheckedChange = { otaManager.settingsManager.setUseShizukuEnabled(it) },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Cyan400,
                                    checkedTrackColor = Cyan950,
                                    uncheckedThumbColor = Slate400,
                                    uncheckedTrackColor = Slate800
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        HorizontalDivider(color = Slate800)
                        Spacer(modifier = Modifier.height(10.dp))

                        // Estado en vivo de Shizuku
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                val (statusIcon, statusColor, statusText) = when (shizukuState) {
                                    is ShizukuState.ReadyAndAuthorized -> Triple(
                                        Icons.Default.CheckCircle,
                                        Emerald400,
                                        "Activo y Autorizado"
                                    )
                                    is ShizukuState.RunningNoPermission -> Triple(
                                        Icons.Default.Warning,
                                        Amber400,
                                        "Activo, requiere permiso"
                                    )
                                    is ShizukuState.InstalledNotRunning -> Triple(
                                        Icons.Default.HourglassEmpty,
                                        Amber400,
                                        "Instalado, servicio inactivo"
                                    )
                                    is ShizukuState.NotInstalled -> Triple(
                                        Icons.Default.Cancel,
                                        Slate500,
                                        "No instalado (Modo asistido)"
                                    )
                                }

                                Icon(
                                    imageVector = statusIcon,
                                    contentDescription = null,
                                    tint = statusColor,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = statusText,
                                    color = statusColor,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }

                            if (shizukuState is ShizukuState.InstalledNotRunning || shizukuState is ShizukuState.RunningNoPermission) {
                                TextButton(
                                    onClick = { otaManager.shizukuBridge.openShizukuApp() },
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text("Abrir Shizuku", fontSize = 11.sp, color = Cyan400)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // SECCIÓN 3: Actualización a Demanda
                Text(
                    text = "ACTUALIZACIÓN A DEMANDA",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate500,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(6.dp))

                Surface(
                    color = Slate950,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth().border(1.dp, Slate800, RoundedCornerShape(10.dp))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Versión instalada:", color = Slate400, fontSize = 12.sp)
                            Text(
                                "v$currentVersionName ($currentVersionCode)",
                                color = Slate200,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        if (settings.lastCheckTimestamp > 0) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Última búsqueda:", color = Slate500, fontSize = 11.sp)
                                Text(
                                    dateFormat.format(Date(settings.lastCheckTimestamp)),
                                    color = Slate400,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        when (val currentStatus = status) {
                            is OtaStatus.Checking -> {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    CircularProgressIndicator(modifier = Modifier.size(18.dp), color = Cyan400, strokeWidth = 2.dp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Consultando https://appstore.civer.cloud...", color = Slate300, fontSize = 12.sp)
                                }
                            }

                            is OtaStatus.Available -> {
                                val update = currentStatus.update
                                Surface(
                                    color = Emerald950.copy(alpha = 0.3f),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.fillMaxWidth().border(1.dp, Emerald500.copy(alpha = 0.4f), RoundedCornerShape(8.dp)).padding(10.dp)
                                ) {
                                    Column {
                                        Text(
                                            "¡Nueva versión disponible!",
                                            color = Emerald400,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp
                                        )
                                        Text(
                                            "Versión: v${update.versionName} (${update.versionCode}) • ${update.fileSizeMb} MB",
                                            color = Slate300,
                                            fontSize = 11.sp
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Button(
                                            onClick = {
                                                scope.launch {
                                                    otaManager.downloadUpdate(update)
                                                }
                                            },
                                            colors = ButtonDefaults.buttonColors(containerColor = Emerald500),
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Icon(Icons.Default.Download, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("Descargar e Instalar Ahora", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                        }
                                    }
                                }
                            }

                            is OtaStatus.Downloading -> {
                                val progress = currentStatus.progress
                                Column(modifier = Modifier.fillMaxWidth()) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text("Descargando...", color = Slate300, fontSize = 12.sp)
                                        Text("$progress%", color = Emerald400, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    LinearProgressIndicator(
                                        progress = { progress / 100f },
                                        modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                                        color = Emerald400,
                                        trackColor = Slate800
                                    )
                                }
                            }

                            is OtaStatus.VerifyingChecksum -> {
                                Text("Verificando firma criptográfica SHA-256...", color = Cyan400, fontSize = 12.sp)
                            }

                            is OtaStatus.InstallingSilently -> {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    CircularProgressIndicator(modifier = Modifier.size(18.dp), color = Emerald400, strokeWidth = 2.dp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Instalando desatendidamente con Shizuku...", color = Emerald300, fontSize = 12.sp)
                                }
                            }

                            is OtaStatus.ReadyToInstall -> {
                                val file = currentStatus.file
                                Button(
                                    onClick = {
                                        scope.launch {
                                            otaManager.executeInstall(file)
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Emerald500),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(Icons.Default.InstallMobile, contentDescription = null, tint = Color.Black)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Aplicar Actualización Ahora", color = Color.Black, fontWeight = FontWeight.Bold)
                                }
                            }

                            is OtaStatus.UpToDate -> {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = Emerald400, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("¡Tienes la versión más reciente!", color = Emerald400, fontSize = 12.sp)
                                }
                            }

                            else -> {
                                Button(
                                    onClick = {
                                        scope.launch {
                                            otaManager.checkOnDemand(currentVersionCode)
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(Icons.Default.Sync, contentDescription = null, tint = Cyan400, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Buscar Actualizaciones Ahora", color = Slate100, fontSize = 13.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
