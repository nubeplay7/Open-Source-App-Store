package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.*
import com.example.ui.theme.*

enum class ColumnCategoryFilter(val label: String) {
  ALL("Todas las Columnas (25+)"),
  UX_SECURITY("UX & Seguridad"),
  REPOS_FEATURES("Repos & Funciones"),
  TECH_STACK("Stack & Arquitectura"),
  PERFORMANCE("Rendimiento & RAM")
}

@Composable
fun StoreTable(
  stores: List<AppStoreInfo>,
  searchQuery: String,
  selectedCategory: StoreCategory,
  onSelectStore: (AppStoreInfo) -> Unit,
  onToggleCompare: (AppStoreInfo) -> Unit,
  comparedStores: List<AppStoreInfo>
) {
  var columnFilter by remember { mutableStateOf(ColumnCategoryFilter.ALL) }
  val horizontalScrollState = rememberScrollState()

  // Filter stores
  val filteredStores = remember(stores, searchQuery, selectedCategory) {
    stores.filter { store ->
      val matchesCategory = selectedCategory == StoreCategory.ALL || store.category == selectedCategory
      val matchesSearch = searchQuery.isBlank() ||
          store.name.contains(searchQuery, ignoreCase = true) ||
          store.tagline.contains(searchQuery, ignoreCase = true) ||
          store.keyDifferentiator.contains(searchQuery, ignoreCase = true) ||
          store.bestForUseCase.contains(searchQuery, ignoreCase = true) ||
          store.techStack.primaryLanguage.contains(searchQuery, ignoreCase = true)
      matchesCategory && matchesSearch
    }
  }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(Slate950)
      .padding(8.dp)
  ) {
    // Column filter bar
    Surface(
      color = Slate900,
      shape = RoundedCornerShape(8.dp),
      border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
      modifier = Modifier
        .fillMaxWidth()
        .padding(bottom = 8.dp)
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 10.dp, vertical = 6.dp)
          .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Icon(
          Icons.Default.ViewColumn,
          contentDescription = null,
          tint = Emerald400,
          modifier = Modifier.size(16.dp)
        )
        Text(
          text = "VISTAS:",
          style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 0.5.sp),
          fontWeight = FontWeight.Bold,
          color = Slate400
        )
        ColumnCategoryFilter.values().forEach { filter ->
          FilterChip(
            selected = columnFilter == filter,
            onClick = { columnFilter = filter },
            label = { Text(filter.label, style = MaterialTheme.typography.labelSmall) },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = Emerald900,
              selectedLabelColor = Emerald400,
              containerColor = Slate950,
              labelColor = Slate400
            ),
            border = FilterChipDefaults.filterChipBorder(
              enabled = true,
              selected = columnFilter == filter,
              borderColor = if (columnFilter == filter) Emerald400 else Slate800,
              selectedBorderColor = Emerald400,
              borderWidth = 1.dp,
              selectedBorderWidth = 1.dp
            ),
            shape = RoundedCornerShape(6.dp)
          )
        }
      }
    }

    // Mega Table with Horizontal Scroll
    Card(
      modifier = Modifier
        .weight(1f)
        .fillMaxWidth(),
      shape = RoundedCornerShape(8.dp),
      border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
      colors = CardDefaults.cardColors(containerColor = Slate900.copy(alpha = 0.5f))
    ) {
      Box(modifier = Modifier.fillMaxSize()) {
        Column(
          modifier = Modifier
            .fillMaxSize()
            .horizontalScroll(horizontalScrollState)
        ) {
          // Table Header
          TableHeader(columnFilter)

          // Table Rows
          LazyColumn(modifier = Modifier.fillMaxSize()) {
            itemsIndexed(filteredStores) { index, store ->
              val isComparing = comparedStores.any { it.id == store.id }
              TableRowItem(
                store = store,
                isEven = index % 2 == 0,
                columnFilter = columnFilter,
                onSelectStore = { onSelectStore(store) },
                onToggleCompare = { onToggleCompare(store) },
                isComparing = isComparing
              )
              Divider(color = Slate800.copy(alpha = 0.5f), thickness = 1.dp)
            }
          }
        }
      }
    }

    // Bottom info footer
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(top = 6.dp, start = 4.dp, end = 4.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = "Mostrando ${filteredStores.size} de ${stores.size} tiendas y alternativas FOSS",
        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
        color = Slate500
      )
      Text(
        text = "👈 Desliza horizontalmente para ver las 25+ columnas 👉",
        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
        fontWeight = FontWeight.SemiBold,
        color = Emerald400
      )
    }
  }
}

@Composable
fun TableHeader(columnFilter: ColumnCategoryFilter) {
  Surface(
    color = Slate900,
    modifier = Modifier.fillMaxWidth().border(1.dp, Slate800)
  ) {
    Row(
      modifier = Modifier.padding(vertical = 10.dp, horizontal = 8.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      // Sticky First Column: Store Name
      HeaderCell("MARKETPLACE", width = 200)

      if (columnFilter == ColumnCategoryFilter.ALL || columnFilter == ColumnCategoryFilter.UX_SECURITY) {
        HeaderCell("CATEGORÍA", width = 170)
        HeaderCell("ESTADO", width = 140)
        HeaderCell("VERSIÓN", width = 120)
        HeaderCell("EASE", width = 100)
        HeaderCell("SECURITY", width = 110)
        HeaderCell("CUENTA GOOGLE", width = 160)
        HeaderCell("TELEMETRÍA", width = 170)
        HeaderCell("INSTALACIÓN", width = 190)
        HeaderCell("REPRODUCIBLE", width = 120)
      }

      if (columnFilter == ColumnCategoryFilter.ALL || columnFilter == ColumnCategoryFilter.REPOS_FEATURES) {
        HeaderCell("REPOS", width = 110)
        HeaderCell("REPOSITORIOS DEFAULT", width = 220)
        HeaderCell("GIT RELEASES", width = 130)
        HeaderCell("AUTO UPDATES", width = 130)
        HeaderCell("ROOTLESS SILENT", width = 150)
        HeaderCell("SPLIT APKS", width = 130)
        HeaderCell("ROLLBACK", width = 120)
        HeaderCell("EXODUS SCAN", width = 130)
        HeaderCell("TOR / ORBOT", width = 130)
      }

      if (columnFilter == ColumnCategoryFilter.ALL || columnFilter == ColumnCategoryFilter.TECH_STACK) {
        HeaderCell("LENGUAJE", width = 120)
        HeaderCell("ARQUITECTURA UI", width = 180)
        HeaderCell("BASE DE DATOS", width = 150)
        HeaderCell("CLIENTE RED", width = 160)
        HeaderCell("MIN / TARGET SDK", width = 160)
        HeaderCell("TAMAÑO APK", width = 120)
      }

      if (columnFilter == ColumnCategoryFilter.ALL || columnFilter == ColumnCategoryFilter.PERFORMANCE) {
        HeaderCell("RAM REPOSO", width = 120)
        HeaderCell("RAM INDEX", width = 120)
        HeaderCell("COLD START", width = 120)
        HeaderCell("SYNC SPEED", width = 120)
        HeaderCell("INDEX V2", width = 120)
        HeaderCell("SCORE PERF", width = 130)
      }

      if (columnFilter == ColumnCategoryFilter.ALL) {
        HeaderCell("DIFERENCIADOR CLAVE", width = 240)
        HeaderCell("BEST FOR", width = 220)
      }

      HeaderCell("ACCIÓN", width = 90)
    }
  }
}

@Composable
fun TableRowItem(
  store: AppStoreInfo,
  isEven: Boolean,
  columnFilter: ColumnCategoryFilter,
  onSelectStore: () -> Unit,
  onToggleCompare: () -> Unit,
  isComparing: Boolean
) {
  val rowBackground = if (isEven) {
    Slate900.copy(alpha = 0.35f)
  } else {
    Slate950
  }

  Row(
    modifier = Modifier
      .background(rowBackground)
      .clickable { onSelectStore() }
      .padding(vertical = 10.dp, horizontal = 8.dp),
    verticalAlignment = Alignment.CenterVertically
  ) {
    // Primary Store Name Cell
    Box(
      modifier = Modifier
        .width(200.dp)
        .padding(horizontal = 6.dp)
    ) {
      Column {
        Text(
          text = store.name,
          style = MaterialTheme.typography.titleSmall.copy(fontSize = 13.sp),
          fontWeight = FontWeight.Bold,
          color = Slate50
        )
        Text(
          text = store.tagline,
          style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
          color = Slate500,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )
      }
    }

    if (columnFilter == ColumnCategoryFilter.ALL || columnFilter == ColumnCategoryFilter.UX_SECURITY) {
      // Category
      Box(modifier = Modifier.width(170.dp).padding(horizontal = 6.dp)) {
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = Color(store.category.badgeColorHex).copy(alpha = 0.15f),
          border = androidx.compose.foundation.BorderStroke(1.dp, Color(store.category.badgeColorHex).copy(alpha = 0.35f))
        ) {
          Text(
            text = store.category.label,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
            fontWeight = FontWeight.SemiBold,
            color = Color(store.category.badgeColorHex),
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
          )
        }
      }

      // Status
      Box(modifier = Modifier.width(140.dp).padding(horizontal = 6.dp)) {
        Text(
          text = store.projectStatus.label,
          style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
          color = if (store.projectStatus.isHealthy) Emerald400 else Rose400,
          fontWeight = FontWeight.Medium
        )
      }

      // Version
      TextCell(store.latestVersion, width = 120, isBold = true, isMonospace = true)

      // Ease of Use
      ScoreCell(store.easeOfUseScore, width = 100, Sky400)

      // Security
      ScoreCell(store.securityScore, width = 110, Emerald400)

      // Google Account
      TextCell(store.googleAccountRequirement.label, width = 160)

      // Telemetry
      TextCell(store.telemetry, width = 170)

      // Install methods
      TextCell(store.installMethods.joinToString(", ") { it.name.take(8) }, width = 190)

      // Reproducible
      BooleanCell(store.reproducibleBuilds, width = 120)
    }

    if (columnFilter == ColumnCategoryFilter.ALL || columnFilter == ColumnCategoryFilter.REPOS_FEATURES) {
      ScoreCell(store.repoEcosystemScore, width = 110, Violet400)
      TextCell(store.defaultRepos.joinToString(", "), width = 220)
      BooleanCell(store.gitReleasesDirectSupport, width = 130)
      BooleanCell(store.features.backgroundAutoUpdates, width = 130)
      BooleanCell(store.features.unattendedRootlessUpdates, width = 150)
      BooleanCell(store.features.splitApkSupport, width = 130)
      BooleanCell(store.features.rollbackSupport, width = 120)
      BooleanCell(store.features.trackerScanningExodus, width = 130)
      BooleanCell(store.features.torOrbotProxy, width = 130)
    }

    if (columnFilter == ColumnCategoryFilter.ALL || columnFilter == ColumnCategoryFilter.TECH_STACK) {
      TextCell(store.techStack.primaryLanguage, width = 120, isBold = true)
      TextCell(store.techStack.uiArchitecture, width = 180)
      TextCell(store.techStack.database, width = 150)
      TextCell(store.techStack.networkLibrary, width = 160)
      TextCell("Min ${store.techStack.minSdk} / Target ${store.techStack.targetSdk}", width = 160, isMonospace = true)
      TextCell("${store.techStack.apkPayloadSizeMb} MB", width = 120, isMonospace = true)
    }

    if (columnFilter == ColumnCategoryFilter.ALL || columnFilter == ColumnCategoryFilter.PERFORMANCE) {
      TextCell("${store.performance.ramUsageIdleMb} MB", width = 120, isMonospace = true)
      TextCell("${store.performance.ramUsageIndexingMb} MB", width = 120, isMonospace = true)
      TextCell("${store.performance.coldStartTimeMs} ms", width = 120, isMonospace = true)
      TextCell("${store.performance.indexSyncSpeedSec} s", width = 120, isMonospace = true)
      BooleanCell(store.performance.indexV2Support, width = 120)
      ScoreCell(store.performance.overallPerformanceScore, width = 130, Amber400)
    }

    if (columnFilter == ColumnCategoryFilter.ALL) {
      TextCell(store.keyDifferentiator, width = 240)
      Box(modifier = Modifier.width(220.dp).padding(horizontal = 6.dp)) {
        Text(
          text = store.bestForUseCase,
          style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
          color = Emerald400,
          fontWeight = FontWeight.Medium
        )
      }
    }

    // Action button
    Box(
      modifier = Modifier
        .width(90.dp)
        .padding(horizontal = 4.dp),
      contentAlignment = Alignment.Center
    ) {
      IconButton(
        onClick = { onToggleCompare() },
        modifier = Modifier.size(28.dp)
      ) {
        Icon(
          if (isComparing) Icons.Default.CheckCircle else Icons.Default.AddCircleOutline,
          contentDescription = "Comparar",
          tint = if (isComparing) Emerald400 else Slate600
        )
      }
    }
  }
}

@Composable
fun HeaderCell(text: String, width: Int) {
  Box(
    modifier = Modifier
      .width(width.dp)
      .padding(horizontal = 6.dp),
    contentAlignment = Alignment.CenterStart
  ) {
    Text(
      text = text,
      style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 1.sp),
      fontWeight = FontWeight.Bold,
      color = Slate400
    )
  }
}

@Composable
fun TextCell(text: String, width: Int, isBold: Boolean = false, isMonospace: Boolean = false) {
  Box(
    modifier = Modifier
      .width(width.dp)
      .padding(horizontal = 6.dp),
    contentAlignment = Alignment.CenterStart
  ) {
    Text(
      text = text,
      style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
      fontWeight = if (isBold) FontWeight.Bold else FontWeight.Normal,
      fontFamily = if (isMonospace) FontFamily.Monospace else FontFamily.Default,
      color = if (isBold) Slate100 else Slate300,
      maxLines = 2,
      overflow = TextOverflow.Ellipsis
    )
  }
}

@Composable
fun ScoreCell(score: Float, width: Int, color: Color) {
  Box(
    modifier = Modifier
      .width(width.dp)
      .padding(horizontal = 6.dp),
    contentAlignment = Alignment.CenterStart
  ) {
    Surface(
      shape = RoundedCornerShape(4.dp),
      color = color.copy(alpha = 0.12f),
      border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.3f))
    ) {
      Text(
        text = String.format("%.1f", score),
        fontFamily = FontFamily.Monospace,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        color = color,
        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
      )
    }
  }
}

@Composable
fun BooleanCell(value: Boolean, width: Int) {
  Box(
    modifier = Modifier
      .width(width.dp)
      .padding(horizontal = 6.dp),
    contentAlignment = Alignment.CenterStart
  ) {
    if (value) {
      Icon(
        Icons.Default.CheckCircle,
        contentDescription = "Sí",
        tint = Emerald400,
        modifier = Modifier.size(16.dp)
      )
    } else {
      Icon(
        Icons.Default.Cancel,
        contentDescription = "No",
        tint = Slate700,
        modifier = Modifier.size(16.dp)
      )
    }
  }
}
