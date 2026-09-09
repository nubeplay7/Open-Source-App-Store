package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.example.ota.OtaAppUpdate
import com.example.ota.OtaStatus
import com.example.ota.OtaUpdateManager
import com.example.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun OtaUpdateDialog(
    isOpen: Boolean,
    onClose: () -> Unit,
    otaManager: OtaUpdateManager,
    currentVersionName: String = "1.0.0",
    currentVersionCode: Int = 1
) {
    if (!isOpen) return

    val status by otaManager.status.collectAsState()
    val scope = rememberCoroutineScope()

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
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.SystemUpdate,
                            contentDescription = "Actualización OTA",
                            tint = Emerald400,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Actualización de Civer",
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

                when (val currentStatus = status) {
                    is OtaStatus.Checking -> {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator(color = Emerald400, strokeWidth = 3.dp)
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "Consultando https://appstore.civer.cloud...",
                                color = Slate400,
                                fontSize = 12.sp
                            )
                        }
                    }

                    is OtaStatus.Available -> {
                        val update = currentStatus.update
                        VersionInfoBox(
                            currentVersion = "$currentVersionName ($currentVersionCode)",
                            newVersion = "${update.versionName} (${update.versionCode})",
                            fileSize = "${update.fileSizeMb} MB"
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "NOTAS DE LA VERSIÓN",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate500,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Surface(
                            color = Slate950,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth().border(1.dp, Slate800, RoundedCornerShape(8.dp))
                        ) {
                            Text(
                                text = update.releaseNotes,
                                color = Slate300,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(10.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = {
                                scope.launch {
                                    otaManager.downloadUpdate(update)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Emerald500),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth().height(44.dp)
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null, tint = Color.Black)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Descargar e Instalar", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }

                    is OtaStatus.Downloading -> {
                        val progress = currentStatus.progress
                        val downloadedMb = (currentStatus.downloadedBytes.toDouble() / (1024 * 1024))
                        val totalMb = (currentStatus.totalBytes.toDouble() / (1024 * 1024))

                        Column(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Descargando actualización...", color = Slate300, fontSize = 13.sp)
                                Text("$progress%", color = Emerald400, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            LinearProgressIndicator(
                                progress = { progress / 100f },
                                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                                color = Emerald400,
                                trackColor = Slate800
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = String.format("%.1f MB / %.1f MB", downloadedMb, totalMb),
                                color = Slate500,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    is OtaStatus.VerifyingChecksum -> {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Cyan400, strokeWidth = 2.dp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text("Verificando firma criptográfica SHA-256...", color = Slate300, fontSize = 12.sp)
                        }
                    }

                    is OtaStatus.ReadyToInstall -> {
                        val file = currentStatus.file
                        val update = currentStatus.update

                        Surface(
                            color = Emerald950.copy(alpha = 0.4f),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth().border(1.dp, Emerald500.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Emerald400)
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text("¡Descarga e Integridad Verificadas!", color = Emerald300, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Text("El paquete APK está listo para aplicarse.", color = Slate400, fontSize = 11.sp)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = {
                                scope.launch {
                                    otaManager.executeInstall(file)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Emerald500),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth().height(46.dp)
                        ) {
                            Icon(Icons.Default.InstallMobile, contentDescription = null, tint = Color.Black)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Completar Instalación Ahora", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }

                    is OtaStatus.UpToDate -> {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(Icons.Default.Verified, contentDescription = null, tint = Emerald400, modifier = Modifier.size(40.dp))
                            Spacer(modifier = Modifier.height(10.dp))
                            Text("Estás en la versión más reciente", color = Slate100, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("v$currentVersionName ($currentVersionCode)", color = Slate400, fontSize = 12.sp)
                        }
                    }

                    is OtaStatus.Error -> {
                        Surface(
                            color = Rose950.copy(alpha = 0.3f),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth().border(1.dp, Rose500.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                        ) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = Rose400)
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(currentStatus.message, color = Rose200, fontSize = 12.sp)
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        OutlinedButton(
                            onClick = {
                                scope.launch {
                                    otaManager.checkForUpdates(currentVersionCode)
                                }
                            },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Slate300),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Reintentar búsqueda")
                        }
                    }

                    is OtaStatus.Idle -> {
                        Button(
                            onClick = {
                                scope.launch {
                                    otaManager.checkForUpdates(currentVersionCode)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, tint = Emerald400)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Buscar actualizaciones ahora", color = Slate100)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun VersionInfoBox(currentVersion: String, newVersion: String, fileSize: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Slate950, RoundedCornerShape(10.dp))
            .border(1.dp, Slate800, RoundedCornerShape(10.dp))
            .padding(12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text("INSTALADA", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate500)
            Text(currentVersion, color = Slate300, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
        }
        Icon(Icons.Default.ArrowForward, contentDescription = null, tint = Emerald400, modifier = Modifier.size(16.dp))
        Column(horizontalAlignment = Alignment.End) {
            Text("DISPONIBLE ($fileSize)", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Emerald400)
            Text(newVersion, color = Emerald300, fontWeight = FontWeight.Bold, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
        }
    }
}