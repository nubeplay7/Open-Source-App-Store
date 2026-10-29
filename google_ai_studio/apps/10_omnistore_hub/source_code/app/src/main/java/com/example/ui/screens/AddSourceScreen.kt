package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.CloudQueue
import androidx.compose.material.icons.filled.FolderShared
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.FolderZip
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.TableChart
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SecondaryTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.remote.CloudUrlResolver
import com.example.ui.theme.CyanAccent
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.viewmodel.StoreUiState

/**
 * Pantalla para añadir fuentes y gestionar repositorios de aplicaciones.
 * Permite agregar APKs individuales (enlaces directos o nube como Google Drive, Dropbox, S3),
 * sincronizar catálogos masivos desde Google Sheets o CSVs,
 * y gestionar copias de seguridad de metadatos en formato JSON (exportar y restaurar).
 */
@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
fun AddSourceScreen(
    state: StoreUiState,
    onAddApp: (name: String, packageName: String, version: String, url: String, category: String, description: String, iconUrl: String, size: String) -> Unit,
    onImportFeed: (feedUrl: String, feedName: String) -> Unit,
    onRestoreLatestBackup: () -> Unit = {},
    onRestoreJsonBackup: (String) -> Unit = {},
    onExportBackup: () -> Unit = {},
    onShareBackup: () -> Unit = {}
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .testTag("add_source_screen")
    ) {
        SecondaryTabRow(
            selectedTabIndex = selectedTab,
            containerColor = MaterialTheme.colorScheme.surface
        ) {
            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = { Text("Añadir APK") },
                icon = { Icon(Icons.Default.Link, contentDescription = null) },
                modifier = Modifier.testTag("tab_single_apk")
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = { Text("Google Sheets") },
                icon = { Icon(Icons.Default.TableChart, contentDescription = null) },
                modifier = Modifier.testTag("tab_feed_import")
            )
            Tab(
                selected = selectedTab == 2,
                onClick = { selectedTab = 2 },
                text = { Text("Backup JSON") },
                icon = { Icon(Icons.Default.FolderZip, contentDescription = null) },
                modifier = Modifier.testTag("tab_backup_json")
            )
        }

        when (selectedTab) {
            0 -> AddSingleApkContent(onAddApp = onAddApp)
            1 -> ImportFeedContent(state = state, onImportFeed = onImportFeed)
            else -> BackupRestoreSourceContent(
                state = state,
                onRestoreLatest = onRestoreLatestBackup,
                onRestoreJson = onRestoreJsonBackup,
                onExportBackup = onExportBackup,
                onShareBackup = onShareBackup
            )
        }
    }
}

@Composable
private fun AddSingleApkContent(
    onAddApp: (name: String, packageName: String, version: String, url: String, category: String, description: String, iconUrl: String, size: String) -> Unit
) {
    var rawUrl by remember { mutableStateOf("") }
    var appName by remember { mutableStateOf("") }
    var packageName by remember { mutableStateOf("") }
    var version by remember { mutableStateOf("1.0.0") }
    var category by remember { mutableStateOf("General") }
    var description by remember { mutableStateOf("") }
    var iconUrl by remember { mutableStateOf("") }
    var size by remember { mutableStateOf("Variable") }

    val resolved = remember(rawUrl) {
        if (rawUrl.isNotBlank()) CloudUrlResolver.resolveDirectApkUrl(rawUrl) else null
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp, 16.dp, 16.dp, 100.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Explanatory card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
            )
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.CloudQueue, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Compatibilidad Multi-Nube",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Pega enlaces de Google Drive, servidores S3/DS3, Dropbox o cualquier servidor HTTP directo. OmniStore los resolverá automáticamente.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // URL Field
        OutlinedTextField(
            value = rawUrl,
            onValueChange = {
                rawUrl = it
                if (appName.isBlank() && it.isNotBlank()) {
                    val res = CloudUrlResolver.resolveDirectApkUrl(it)
                    res.suggestedName?.let { name ->
                        appName = name.substringBeforeLast(".apk")
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .testTag("input_apk_url"),
            label = { Text("URL del APK en la nube (Drive, S3, DS3, etc.) *") },
            placeholder = { Text("https://drive.google.com/file/d/... o https://...") },
            leadingIcon = { Icon(Icons.Default.Link, contentDescription = null) },
            shape = RoundedCornerShape(12.dp)
        )

        // URL Resolution Preview
        if (resolved != null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = CircleShape,
                            color = CyanAccent.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "Proveedor: ${resolved.sourceType}",
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Enlace directo resuelto:",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.outline
                    )
                    Text(
                        text = resolved.directDownloadUrl,
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        maxLines = 2
                    )
                }
            }
        }

        // App Name & Package
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedTextField(
                value = appName,
                onValueChange = { appName = it },
                modifier = Modifier
                    .weight(1f)
                    .testTag("input_app_name"),
                label = { Text("Nombre de la App *") },
                shape = RoundedCornerShape(12.dp)
            )
            OutlinedTextField(
                value = version,
                onValueChange = { version = it },
                modifier = Modifier
                    .weight(0.6f)
                    .testTag("input_app_version"),
                label = { Text("Versión") },
                shape = RoundedCornerShape(12.dp)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedTextField(
                value = packageName,
                onValueChange = { packageName = it },
                modifier = Modifier
                    .weight(1f)
                    .testTag("input_app_package"),
                label = { Text("ID Paquete (ej. com.miapp)") },
                placeholder = { Text("com.ejemplo.app") },
                shape = RoundedCornerShape(12.dp)
            )
            OutlinedTextField(
                value = category,
                onValueChange = { category = it },
                modifier = Modifier
                    .weight(0.7f)
                    .testTag("input_app_category"),
                label = { Text("Categoría") },
                shape = RoundedCornerShape(12.dp)
            )
        }

        // Quick Category Tag Chips for easier tagging
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            val quickCategories = listOf("Tools", "Games", "Social", "Media", "Productivity")
            quickCategories.forEach { cat ->
                FilterChip(
                    selected = category.equals(cat, ignoreCase = true),
                    onClick = { category = cat },
                    label = { Text(cat, fontSize = 11.sp) }
                )
            }
        }

        OutlinedTextField(
            value = iconUrl,
            onValueChange = { iconUrl = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("URL del Icono (opcional)") },
            placeholder = { Text("https://servidor.com/icono.png") },
            shape = RoundedCornerShape(12.dp)
        )

        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Descripción") },
            minLines = 2,
            shape = RoundedCornerShape(12.dp)
        )

        Button(
            onClick = {
                onAddApp(appName, packageName, version, rawUrl, category, description, iconUrl, size)
                // Clear inputs
                rawUrl = ""
                appName = ""
                packageName = ""
                description = ""
                iconUrl = ""
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
                .testTag("btn_save_app_source"),
            enabled = rawUrl.isNotBlank(),
            shape = RoundedCornerShape(14.dp)
        ) {
            Icon(Icons.Default.Add, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Guardar en Catálogo de OmniStore", fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun ImportFeedContent(
    state: StoreUiState,
    onImportFeed: (feedUrl: String, feedName: String) -> Unit
) {
    var feedUrl by remember { mutableStateOf("") }
    var feedName by remember { mutableStateOf("Mi Base de Datos de Apps") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp, 16.dp, 16.dp, 100.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Guide Card for Google Sheets
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.4f)
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.TableChart,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.secondary
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Base de datos en Google Sheets / CSV",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Puedes tener cientos de APKs organizados en una hoja de cálculo. Para importarla:",
                    style = MaterialTheme.typography.bodySmall
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "1. Configura tu hoja con estas columnas en la primera fila:\n" +
                            "Nombre, Paquete, Version, Enlace, Icono, Categoria, Descripcion, Tamaño",
                    style = MaterialTheme.typography.bodySmall,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "2. En Google Sheets haz clic en Compartir -> Acceso general -> Cualquier persona con el enlace.",
                    style = MaterialTheme.typography.bodySmall
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "3. Pega el enlace aquí abajo y pulsa Sincronizar.",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }

        OutlinedTextField(
            value = feedName,
            onValueChange = { feedName = it },
            modifier = Modifier
                .fillMaxWidth()
                .testTag("input_feed_name"),
            label = { Text("Nombre del Catálogo / Base de Datos") },
            shape = RoundedCornerShape(12.dp)
        )

        OutlinedTextField(
            value = feedUrl,
            onValueChange = { feedUrl = it },
            modifier = Modifier
                .fillMaxWidth()
                .testTag("input_feed_url"),
            label = { Text("URL de la Hoja de Google Sheets o CSV *") },
            placeholder = { Text("https://docs.google.com/spreadsheets/d/...") },
            leadingIcon = { Icon(Icons.Default.Storage, contentDescription = null) },
            shape = RoundedCornerShape(12.dp)
        )

        Button(
            onClick = {
                onImportFeed(feedUrl, feedName)
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
                .testTag("btn_sync_feed"),
            enabled = feedUrl.isNotBlank() && !state.isImportingFeed,
            shape = RoundedCornerShape(14.dp)
        ) {
            if (state.isImportingFeed) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text("Sincronizando...")
            } else {
                Icon(Icons.Default.Sync, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Sincronizar e Importar Catálogo", fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "Fuentes Conectadas (${state.feeds.size})",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        if (state.feeds.isEmpty()) {
            Text(
                text = "No has agregado fuentes externas aún. Pega el enlace de tu Google Sheet arriba para empezar.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.outline
            )
        } else {
            state.feeds.forEach { feed ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(feed.name, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
                        Text(feed.url, style = MaterialTheme.typography.bodySmall, maxLines = 1, color = MaterialTheme.colorScheme.outline)
                    }
                }
            }
        }
    }
}

/**
 * Pestaña de gestión de Copias de Seguridad (Backup y Restauración JSON).
 * Permite restaurar el catálogo y las APKs desde la última copia guardada o pegando JSON directamente.
 */
@Composable
private fun BackupRestoreSourceContent(
    state: StoreUiState,
    onRestoreLatest: () -> Unit,
    onRestoreJson: (String) -> Unit,
    onExportBackup: () -> Unit,
    onShareBackup: () -> Unit
) {
    var customJsonText by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp, 16.dp, 16.dp, 100.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Status & Overview Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.FolderZip,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Copias de Seguridad de Metadatos (JSON)",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Exporta o restaura la lista de metadatos de tus aplicaciones y APKs directamente desde la base de datos Room. Permite respaldar tu colección completa y compartirla con otros dispositivos.",
                    style = MaterialTheme.typography.bodySmall
                )
                if (state.lastBackupFileName != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.8f)
                    ) {
                        Text(
                            text = "Último backup: ${state.lastBackupFileName} (${(state.lastBackupSizeBytes + 1023) / 1024} KB)",
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldSuccess
                        )
                    }
                }
            }
        }

        // Quick Actions (Export / Restore Latest / Share)
        Text(
            text = "Acciones Rápidas",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = onExportBackup,
                modifier = Modifier
                    .weight(1f)
                    .testTag("btn_export_backup_tab"),
                shape = RoundedCornerShape(12.dp),
                enabled = !state.isExportingBackup
            ) {
                if (state.isExportingBackup) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Exportando...")
                } else {
                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Exportar")
                }
            }

            OutlinedButton(
                onClick = onRestoreLatest,
                modifier = Modifier
                    .weight(1f)
                    .testTag("btn_restore_latest_tab"),
                shape = RoundedCornerShape(12.dp),
                enabled = !state.isRestoringBackup
            ) {
                if (state.isRestoringBackup) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Restaurando...")
                } else {
                    Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Restaurar")
                }
            }

            FilledTonalButton(
                onClick = onShareBackup,
                modifier = Modifier.testTag("btn_share_backup_tab"),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Share, contentDescription = "Compartir", modifier = Modifier.size(16.dp))
            }
        }

        // Manual JSON Paste Section
        Text(
            text = "Restaurar desde JSON Pegado",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        OutlinedTextField(
            value = customJsonText,
            onValueChange = { customJsonText = it },
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp)
                .testTag("input_custom_json_backup"),
            label = { Text("Pega el contenido JSON de una copia de seguridad") },
            placeholder = { Text("{\"app\": \"OmniStore\", \"apks\": [...], \"appsCatalog\": [...]}") },
            shape = RoundedCornerShape(12.dp),
            textStyle = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace)
        )

        Button(
            onClick = {
                onRestoreJson(customJsonText)
                customJsonText = ""
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .testTag("btn_restore_pasted_json"),
            enabled = customJsonText.isNotBlank() && !state.isRestoringBackup,
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Default.Sync, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Importar y Fusionar Datos", fontWeight = FontWeight.Bold)
        }
    }
}
