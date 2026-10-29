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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.DownloadDone
import androidx.compose.material.icons.filled.FolderZip
import androidx.compose.material.icons.filled.InstallMobile
import androidx.compose.material.icons.filled.Label
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ApkEntity
import com.example.data.model.AppEntity
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.viewmodel.StoreUiState

@Composable
fun DownloadsScreen(
    state: StoreUiState,
    localSearchQuery: String,
    onLocalSearchQueryChanged: (String) -> Unit,
    filteredLocalApks: List<ApkEntity>,
    selectedCategory: String = "Todos",
    onCategorySelected: (String) -> Unit = {},
    onUpdateApkCategory: (Long, String) -> Unit = { _, _ -> },
    onInstallApp: (AppEntity) -> Unit,
    onLaunchApp: (AppEntity) -> Unit,
    onDeleteApp: (AppEntity) -> Unit,
    onInstallApkEntity: (ApkEntity) -> Unit,
    onDeleteApkEntity: (ApkEntity) -> Unit,
    onClearCache: () -> Unit,
    onRequestInstallPermission: () -> Unit,
    onExportBackup: () -> Unit = {},
    onShareBackup: () -> Unit = {},
    onRestoreBackup: () -> Unit = {}
) {
    val downloadedOrActive = state.apps.filter {
        it.downloadStatus in listOf("DOWNLOADING", "DOWNLOADED", "INSTALLING") || it.localApkPath != null
    }

    // Filter active items based on search query in real time
    val filteredActiveApps = if (localSearchQuery.isBlank()) {
        downloadedOrActive
    } else {
        val q = localSearchQuery.trim().lowercase()
        downloadedOrActive.filter {
            it.name.lowercase().contains(q) ||
            it.versionName.lowercase().contains(q) ||
            it.packageName.lowercase().contains(q)
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("downloads_list"),
        contentPadding = PaddingValues(16.dp, 16.dp, 16.dp, 96.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Storage Cleaner Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Almacenamiento de APKs",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        val mbSize = state.cacheSizeBytes / (1024 * 1024)
                        Text(
                            text = "$mbSize MB guardados en caché local",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    FilledTonalButton(
                        onClick = onClearCache,
                        modifier = Modifier.testTag("btn_clear_cache")
                    ) {
                        Icon(Icons.Default.CleaningServices, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Limpiar")
                    }
                }
            }
        }

        // Backup & Export JSON Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.FolderZip,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Copia de Seguridad (JSON)",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = if (state.lastBackupFileName != null) {
                                    "Último: ${state.lastBackupFileName}"
                                } else {
                                    "Exporta los metadatos de tus APKs de Room a archivo JSON"
                                },
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = onExportBackup,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("btn_export_apk_json"),
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
                                Icon(
                                    imageVector = Icons.Default.Download,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Exportar")
                            }
                        }

                        androidx.compose.material3.OutlinedButton(
                            onClick = onRestoreBackup,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("btn_restore_apk_json"),
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
                                Icon(
                                    imageVector = Icons.Default.Sync,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Restaurar")
                            }
                        }

                        FilledTonalButton(
                            onClick = onShareBackup,
                            modifier = Modifier.testTag("btn_share_apk_json"),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Share,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }

        // Real-time StateFlow Search Bar for Local APKs
        item {
            OutlinedTextField(
                value = localSearchQuery,
                onValueChange = onLocalSearchQueryChanged,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("local_apk_search_field"),
                placeholder = { Text("Buscar APKs locales en tiempo real...") },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = "Buscar")
                },
                trailingIcon = {
                    if (localSearchQuery.isNotEmpty()) {
                        IconButton(onClick = { onLocalSearchQueryChanged("") }) {
                            Icon(Icons.Default.Clear, contentDescription = "Borrar búsqueda")
                        }
                    }
                },
                shape = RoundedCornerShape(14.dp),
                singleLine = true
            )
        }

        // Category Tag Filter Row for Library Management
        item {
            val defaultCategories = listOf("Todos", "Games", "Tools", "Social", "Media", "Productivity")
            val categories = (defaultCategories + filteredLocalApks.map { it.category }).distinct()
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("local_categories_row"),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(categories) { category ->
                    val isSelected = selectedCategory.equals(category, ignoreCase = true)
                    FilterChip(
                        selected = isSelected,
                        onClick = { onCategorySelected(category) },
                        label = {
                            Text(
                                text = when (category) {
                                    "Games" -> "🎮 Games"
                                    "Tools" -> "🔧 Tools"
                                    "Social" -> "💬 Social"
                                    "Media" -> "🎬 Media"
                                    "Productivity" -> "💼 Productivity"
                                    "Todos" -> "Todos"
                                    else -> "📁 $category"
                                },
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    )
                }
            }
        }

        // Permission quick check
        if (!state.canInstallUnknownApps) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f)
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "Permiso de instalación no concedido",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                "Para instalar los APKs descargados nativamente, activa el permiso en los ajustes del sistema.",
                                style = MaterialTheme.typography.bodySmall
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Button(
                                onClick = onRequestInstallPermission,
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                            ) {
                                Text("Otorgar Permiso")
                            }
                        }
                    }
                }
            }
        }

        // Section header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Biblioteca de APKs Locales",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                if (selectedCategory != "Todos" || localSearchQuery.isNotBlank()) {
                    Text(
                        text = if (selectedCategory != "Todos") "Tag: $selectedCategory" else "Filtro: \"$localSearchQuery\"",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }
            }
        }

        // Display results from filteredLocalApks (Room ApkEntity StateFlow)
        if (filteredLocalApks.isNotEmpty()) {
            items(filteredLocalApks, key = { "apk_entity_${it.id}" }) { apk ->
                ApkEntityCard(
                    apk = apk,
                    onInstall = { onInstallApkEntity(apk) },
                    onDelete = { onDeleteApkEntity(apk) },
                    onUpdateCategory = { newCat -> onUpdateApkCategory(apk.id, newCat) }
                )
            }
        }

        // Display active downloads and downloaded apps from AppEntity
        if (filteredActiveApps.isNotEmpty()) {
            item {
                Text(
                    text = "Descargas Activas y Catálogo Local (${filteredActiveApps.size})",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            items(filteredActiveApps, key = { "app_entity_${it.id}" }) { app ->
                val isInstalled = state.installedPackages.contains(app.packageName)
                DownloadItemCard(
                    app = app,
                    isInstalled = isInstalled,
                    onInstall = { onInstallApp(app) },
                    onLaunch = { onLaunchApp(app) },
                    onDelete = { onDeleteApp(app) }
                )
            }
        }

        if (filteredLocalApks.isEmpty() && filteredActiveApps.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 48.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.FolderZip,
                            contentDescription = null,
                            modifier = Modifier.size(48.dp),
                            tint = MaterialTheme.colorScheme.outline
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = if (localSearchQuery.isNotBlank() || selectedCategory != "Todos")
                                "No se encontraron APKs con estos filtros"
                            else
                                "No hay APKs descargados",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (localSearchQuery.isNotBlank() || selectedCategory != "Todos")
                                "Prueba a seleccionar 'Todos' o limpiar el texto de búsqueda."
                            else
                                "Cuando descargues o instales aplicaciones desde el catálogo, aparecerán aquí con sus etiquetas de categoría.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ApkEntityCard(
    apk: ApkEntity,
    onInstall: () -> Unit,
    onDelete: () -> Unit,
    onUpdateCategory: (String) -> Unit = {}
) {
    var expandedCategoryMenu by remember { mutableStateOf(false) }

    val (categoryColor, categoryIcon) = when (apk.category.lowercase()) {
        "games" -> Pair(Color(0xFF8E24AA), Icons.Default.SportsEsports)
        "social" -> Pair(Color(0xFFF57C00), Icons.Default.Share)
        "media" -> Pair(Color(0xFFE91E63), Icons.Default.VideoLibrary)
        "productivity" -> Pair(Color(0xFF1976D2), Icons.Default.Work)
        else -> Pair(Color(0xFF00897B), Icons.Default.Build) // Tools default
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("apk_entity_card_${apk.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
        )
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(EmeraldSuccess.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.DownloadDone,
                        contentDescription = null,
                        tint = EmeraldSuccess
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = apk.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "v${apk.version} • Estado: ${apk.installStatus}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    if (apk.localFilePath != null) {
                        Text(
                            text = apk.localFilePath.substringAfterLast("/"),
                            style = MaterialTheme.typography.bodySmall,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.outline
                        )
                    }
                }

                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Borrar APK",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Category tag and tag changer
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = categoryColor.copy(alpha = 0.15f),
                    modifier = Modifier.padding(vertical = 2.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = categoryIcon,
                            contentDescription = null,
                            tint = categoryColor,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = apk.category,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = categoryColor
                        )
                    }
                }

                // Tag switcher menu
                Box {
                    AssistChip(
                        onClick = { expandedCategoryMenu = true },
                        label = { Text("Etiquetar", fontSize = 11.sp) },
                        leadingIcon = {
                            Icon(Icons.Default.Label, contentDescription = null, modifier = Modifier.size(14.dp))
                        },
                        modifier = Modifier.testTag("btn_tag_category_${apk.id}")
                    )

                    DropdownMenu(
                        expanded = expandedCategoryMenu,
                        onDismissRequest = { expandedCategoryMenu = false }
                    ) {
                        val availableTags = listOf("Games", "Tools", "Social", "Media", "Productivity")
                        availableTags.forEach { tag ->
                            DropdownMenuItem(
                                text = {
                                    Text(when (tag) {
                                        "Games" -> "🎮 Games"
                                        "Tools" -> "🔧 Tools"
                                        "Social" -> "💬 Social"
                                        "Media" -> "🎬 Media"
                                        else -> "💼 Productivity"
                                    })
                                },
                                onClick = {
                                    onUpdateCategory(tag)
                                    expandedCategoryMenu = false
                                }
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Button(
                onClick = onInstall,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("btn_install_apk_entity_${apk.id}")
            ) {
                Icon(Icons.Default.InstallMobile, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Instalar con PackageInstaller API")
            }
        }
    }
}

@Composable
fun DownloadItemCard(
    app: AppEntity,
    isInstalled: Boolean,
    onInstall: () -> Unit,
    onLaunch: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("download_item_${app.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            if (app.downloadStatus == "DOWNLOADED") EmeraldSuccess.copy(alpha = 0.2f)
                            else MaterialTheme.colorScheme.primaryContainer
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (app.downloadStatus == "DOWNLOADED") Icons.Default.DownloadDone else Icons.Default.FolderZip,
                        contentDescription = null,
                        tint = if (app.downloadStatus == "DOWNLOADED") EmeraldSuccess else MaterialTheme.colorScheme.primary
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = app.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "v${app.versionName} • ${app.fileSize} • ${app.sourceType}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    if (app.localApkPath != null) {
                        Text(
                            text = app.localApkPath.substringAfterLast("/"),
                            style = MaterialTheme.typography.bodySmall,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.outline
                        )
                    }
                }

                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Borrar",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }

            if (app.downloadStatus == "DOWNLOADING") {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Descargando desde la nube...",
                        style = MaterialTheme.typography.labelSmall
                    )
                    Text(
                        text = "${(app.downloadProgress * 100).toInt()}%",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                LinearProgressIndicator(
                    progress = { app.downloadProgress },
                    modifier = Modifier.fillMaxWidth()
                )
            } else if (app.downloadStatus == "ERROR") {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Error: ${app.downloadErrorMessage ?: "Fallo de descarga"}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            } else {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onInstall,
                        modifier = Modifier.weight(1f).testTag("btn_install_apk_${app.id}")
                    ) {
                        Icon(Icons.Default.InstallMobile, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (isInstalled) "Reinstalar" else "Instalar APK")
                    }

                    if (isInstalled) {
                        OutlinedButton(
                            onClick = onLaunch,
                            modifier = Modifier.weight(1f).testTag("btn_open_app_${app.id}")
                        ) {
                            Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Abrir")
                        }
                    }
                }
            }
        }
    }
}
