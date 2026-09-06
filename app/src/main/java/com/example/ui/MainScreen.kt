package com.example.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.StoreCatalogData
import com.example.model.AppStoreInfo
import com.example.model.StoreCategory
import com.example.ui.components.*
import com.example.ui.theme.*

enum class AppNavTab(val title: String, val iconDesc: String) {
  TABLE("Tabla Maestra (25+ cols)", "Tabla completa de métricas"),
  CARDS("Catálogo Visual", "Tarjetas de tiendas"),
  COMPARE("Comparador VS", "Comparativa cara a cara"),
  QUIZ("Recomendador", "Asistente de selección"),
  PERFORMANCE("Benchmarks", "Gráficas de RAM y velocidad"),
  GUIDE("Ecosistema & Guía", "Arquitectura FOSS")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
  var currentTab by remember { mutableStateOf(AppNavTab.TABLE) }
  var searchQuery by remember { mutableStateOf("") }
  var selectedCategory by remember { mutableStateOf(StoreCategory.ALL) }
  var selectedStoreForDetail by remember { mutableStateOf<AppStoreInfo?>(null) }
  var comparedStores by remember { mutableStateOf<List<AppStoreInfo>>(emptyList()) }
  var showExportModal by remember { mutableStateOf(false) }

  val stores = StoreCatalogData.stores

  Scaffold(
    containerColor = Slate950,
    topBar = {
      Surface(
        color = Slate950,
        modifier = Modifier.fillMaxWidth().border(width = 1.dp, color = Slate800)
      ) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
          // Top Header Row
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                  text = "Open Source ",
                  style = MaterialTheme.typography.titleLarge.copy(fontSize = 20.sp),
                  fontWeight = FontWeight.Light,
                  color = Slate100
                )
                Text(
                  text = "Android Marketplaces",
                  style = MaterialTheme.typography.titleLarge.copy(fontSize = 20.sp),
                  fontWeight = FontWeight.Bold,
                  color = Emerald400
                )
              }
              Text(
                text = "COMPARATIVE ANALYSIS: SECURITY, PERFORMANCE & REPOSITORY ARCHITECTURE",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 1.sp),
                fontWeight = FontWeight.SemiBold,
                color = Slate500,
                modifier = Modifier.padding(top = 2.dp)
              )
            }

            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
              // KPI Stat 1
              Column(horizontalAlignment = Alignment.End) {
                Text(
                  text = "INDEX SIZE",
                  style = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp, letterSpacing = 0.5.sp),
                  fontWeight = FontWeight.Bold,
                  color = Slate500
                )
                Text(
                  text = "482,901",
                  fontFamily = FontFamily.Monospace,
                  fontSize = 15.sp,
                  fontWeight = FontWeight.Bold,
                  color = Emerald400
                )
              }

              // KPI Stat 2
              Column(horizontalAlignment = Alignment.End) {
                Text(
                  text = "AVG COLD START",
                  style = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp, letterSpacing = 0.5.sp),
                  fontWeight = FontWeight.Bold,
                  color = Slate500
                )
                Text(
                  text = "450 ms",
                  fontFamily = FontFamily.Monospace,
                  fontSize = 15.sp,
                  fontWeight = FontWeight.Bold,
                  color = Emerald400
                )
              }

              IconButton(
                onClick = { showExportModal = true },
                modifier = Modifier
                  .size(36.dp)
                  .clip(RoundedCornerShape(8.dp))
                  .background(Slate900)
                  .border(1.dp, Slate800, RoundedCornerShape(8.dp))
              ) {
                Icon(
                  Icons.Default.Download,
                  contentDescription = "Exportar Markdown",
                  tint = Emerald400,
                  modifier = Modifier.size(18.dp)
                )
              }
            }
          }

          // 4 Mini Tech Specs Badges Grid (visible on tablets/wider screens or scrollable row)
          Spacer(modifier = Modifier.height(10.dp))
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            HeaderMetricBadge("PRIVACY METRIC", "98% No-Tracker Policy", Emerald400)
            HeaderMetricBadge("TECH STACK STANDARD", "Kotlin / Jetpack Compose", Sky400)
            HeaderMetricBadge("NETWORK PROTOCOL", "Tor / Orbot Proxy Native", Indigo400)
            HeaderMetricBadge("COMPLIANCE", "GPL-3.0 / AGPL-3.0 Only", Amber400)
          }
        }
      }
    },
    bottomBar = {
      NavigationBar(
        containerColor = Slate900,
        tonalElevation = 0.dp,
        modifier = Modifier.border(1.dp, Slate800)
      ) {
        NavigationBarItem(
          selected = currentTab == AppNavTab.TABLE,
          onClick = { currentTab = AppNavTab.TABLE },
          icon = { Icon(Icons.Default.TableChart, contentDescription = null) },
          label = { Text("Tabla (25+)") },
          colors = NavigationBarItemDefaults.colors(
            selectedIconColor = Emerald400,
            selectedTextColor = Emerald400,
            indicatorColor = Emerald950,
            unselectedIconColor = Slate500,
            unselectedTextColor = Slate500
          )
        )
        NavigationBarItem(
          selected = currentTab == AppNavTab.CARDS,
          onClick = { currentTab = AppNavTab.CARDS },
          icon = { Icon(Icons.Default.GridView, contentDescription = null) },
          label = { Text("Catálogo") },
          colors = NavigationBarItemDefaults.colors(
            selectedIconColor = Emerald400,
            selectedTextColor = Emerald400,
            indicatorColor = Emerald950,
            unselectedIconColor = Slate500,
            unselectedTextColor = Slate500
          )
        )
        NavigationBarItem(
          selected = currentTab == AppNavTab.COMPARE,
          onClick = { currentTab = AppNavTab.COMPARE },
          icon = {
            BadgedBox(
              badge = {
                if (comparedStores.isNotEmpty()) {
                  Badge(containerColor = Emerald500, contentColor = Slate950) {
                    Text("${comparedStores.size}", fontWeight = FontWeight.Bold)
                  }
                }
              }
            ) {
              Icon(Icons.Default.CompareArrows, contentDescription = null)
            }
          },
          label = { Text("Comparar") },
          colors = NavigationBarItemDefaults.colors(
            selectedIconColor = Emerald400,
            selectedTextColor = Emerald400,
            indicatorColor = Emerald950,
            unselectedIconColor = Slate500,
            unselectedTextColor = Slate500
          )
        )
        NavigationBarItem(
          selected = currentTab == AppNavTab.QUIZ,
          onClick = { currentTab = AppNavTab.QUIZ },
          icon = { Icon(Icons.Default.Psychology, contentDescription = null) },
          label = { Text("Test") },
          colors = NavigationBarItemDefaults.colors(
            selectedIconColor = Emerald400,
            selectedTextColor = Emerald400,
            indicatorColor = Emerald950,
            unselectedIconColor = Slate500,
            unselectedTextColor = Slate500
          )
        )
        NavigationBarItem(
          selected = currentTab == AppNavTab.PERFORMANCE,
          onClick = { currentTab = AppNavTab.PERFORMANCE },
          icon = { Icon(Icons.Default.Speed, contentDescription = null) },
          label = { Text("Benchmarks") },
          colors = NavigationBarItemDefaults.colors(
            selectedIconColor = Emerald400,
            selectedTextColor = Emerald400,
            indicatorColor = Emerald950,
            unselectedIconColor = Slate500,
            unselectedTextColor = Slate500
          )
        )
        NavigationBarItem(
          selected = currentTab == AppNavTab.GUIDE,
          onClick = { currentTab = AppNavTab.GUIDE },
          icon = { Icon(Icons.Default.MenuBook, contentDescription = null) },
          label = { Text("Guía") },
          colors = NavigationBarItemDefaults.colors(
            selectedIconColor = Emerald400,
            selectedTextColor = Emerald400,
            indicatorColor = Emerald950,
            unselectedIconColor = Slate500,
            unselectedTextColor = Slate500
          )
        )
      }
    }
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .background(Slate950)
        .padding(innerPadding)
    ) {
      // Search Bar and Category Filter chips (visible on Table and Cards tabs)
      if (currentTab == AppNavTab.TABLE || currentTab == AppNavTab.CARDS) {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
          // Search TextField
          OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Buscar tienda, stack, protocolo, Shizuku, RAM...", style = MaterialTheme.typography.bodyMedium, color = Slate500) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Emerald400) },
            trailingIcon = {
              if (searchQuery.isNotEmpty()) {
                IconButton(onClick = { searchQuery = "" }) {
                  Icon(Icons.Default.Clear, contentDescription = "Limpiar", tint = Slate400)
                }
              }
            },
            colors = OutlinedTextFieldDefaults.colors(
              focusedContainerColor = Slate900,
              unfocusedContainerColor = Slate900,
              focusedBorderColor = Emerald400,
              unfocusedBorderColor = Slate800,
              focusedTextColor = Slate100,
              unfocusedTextColor = Slate200
            ),
            shape = RoundedCornerShape(8.dp),
            singleLine = true
          )

          Spacer(modifier = Modifier.height(6.dp))

          // Category filter scroll
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            StoreCategory.values().forEach { cat ->
              FilterChip(
                selected = selectedCategory == cat,
                onClick = { selectedCategory = cat },
                label = { Text(cat.label, style = MaterialTheme.typography.labelSmall) },
                colors = FilterChipDefaults.filterChipColors(
                  selectedContainerColor = Emerald900,
                  selectedLabelColor = Emerald400,
                  containerColor = Slate900,
                  labelColor = Slate400
                ),
                border = FilterChipDefaults.filterChipBorder(
                  enabled = true,
                  selected = selectedCategory == cat,
                  borderColor = if (selectedCategory == cat) Emerald400 else Slate800,
                  selectedBorderColor = Emerald400,
                  borderWidth = 1.dp,
                  selectedBorderWidth = 1.dp
                ),
                shape = RoundedCornerShape(6.dp)
              )
            }
          }
        }
      }

      // Comparison status bar notice if items are selected
      AnimatedVisibility(visible = comparedStores.isNotEmpty() && currentTab != AppNavTab.COMPARE) {
        Surface(
          color = Slate900,
          shape = RoundedCornerShape(8.dp),
          border = androidx.compose.foundation.BorderStroke(1.dp, Emerald500.copy(alpha = 0.5f)),
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 4.dp)
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(Icons.Default.CompareArrows, contentDescription = null, tint = Emerald400)
              Spacer(modifier = Modifier.width(8.dp))
              Text(
                text = "${comparedStores.size} tiendas en el comparador",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = Slate100
              )
            }
            TextButton(
              onClick = { currentTab = AppNavTab.COMPARE },
              contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
            ) {
              Text("Ir al Comparador", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = Emerald400)
            }
          }
        }
      }

      // Tab Content Router
      Box(modifier = Modifier.weight(1f)) {
        when (currentTab) {
          AppNavTab.TABLE -> {
            StoreTable(
              stores = stores,
              searchQuery = searchQuery,
              selectedCategory = selectedCategory,
              onSelectStore = { selectedStoreForDetail = it },
              onToggleCompare = { store ->
                comparedStores = if (comparedStores.any { it.id == store.id }) {
                  comparedStores.filter { it.id != store.id }
                } else {
                  if (comparedStores.size < 4) comparedStores + store else comparedStores
                }
              },
              comparedStores = comparedStores
            )
          }

          AppNavTab.CARDS -> {
            StoreCardList(
              stores = stores,
              searchQuery = searchQuery,
              selectedCategory = selectedCategory,
              onSelectStore = { selectedStoreForDetail = it },
              onToggleCompare = { store ->
                comparedStores = if (comparedStores.any { it.id == store.id }) {
                  comparedStores.filter { it.id != store.id }
                } else {
                  if (comparedStores.size < 4) comparedStores + store else comparedStores
                }
              },
              comparedStores = comparedStores
            )
          }

          AppNavTab.COMPARE -> {
            ComparisonView(
              comparedStores = comparedStores,
              allStores = stores,
              onRemoveStore = { store ->
                comparedStores = comparedStores.filter { it.id != store.id }
              },
              onAddStore = { store ->
                if (!comparedStores.any { it.id == store.id } && comparedStores.size < 4) {
                  comparedStores = comparedStores + store
                }
              },
              onClearAll = { comparedStores = emptyList() }
            )
          }

          AppNavTab.QUIZ -> {
            RecommenderQuiz(
              allStores = stores,
              onSelectStore = { selectedStoreForDetail = it }
            )
          }

          AppNavTab.PERFORMANCE -> {
            PerformanceChartsView(
              stores = stores,
              onSelectStore = { selectedStoreForDetail = it }
            )
          }

          AppNavTab.GUIDE -> {
            EcosystemGuideView()
          }
        }
      }

      // Quick Key Winners Footer Banner
      Surface(
        color = Slate900,
        modifier = Modifier.fillMaxWidth().border(1.dp, Slate800)
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 12.dp, vertical = 6.dp),
          horizontalArrangement = Arrangement.spacedBy(16.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          WinnerFootnote("EASE OF USE", "Droid-ify (Material You)", Emerald400)
          WinnerFootnote("SECURITY ARCHITECTURE", "Accrescent (Attestation)", Sky400)
          WinnerFootnote("CATALOG SIZE", "Aurora Store (GPlay Proxy)", Amber400)
        }
      }
    }
  }

  // Store Detail Inspection Dialog
  selectedStoreForDetail?.let { store ->
    val isComparing = comparedStores.any { it.id == store.id }
    StoreDetailModal(
      store = store,
      onDismiss = { selectedStoreForDetail = null },
      onAddToCompare = {
        comparedStores = if (isComparing) {
          comparedStores.filter { it.id != store.id }
        } else {
          if (comparedStores.size < 4) comparedStores + store else comparedStores
        }
      },
      isComparing = isComparing
    )
  }

  // Export Markdown Modal
  if (showExportModal) {
    ExportModal(
      stores = stores,
      onDismiss = { showExportModal = false }
    )
  }
}

@Composable
fun HeaderMetricBadge(label: String, value: String, accentColor: Color) {
  Surface(
    color = Slate900.copy(alpha = 0.7f),
    shape = RoundedCornerShape(6.dp),
    border = androidx.compose.foundation.BorderStroke(1.dp, Slate800)
  ) {
    Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) {
      Text(
        text = label,
        style = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp, letterSpacing = 0.5.sp),
        fontWeight = FontWeight.Bold,
        color = Slate500
      )
      Text(
        text = value,
        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
        fontWeight = FontWeight.Medium,
        color = Slate300
      )
    }
  }
}

@Composable
fun WinnerFootnote(category: String, winner: String, color: Color) {
  Row(
    verticalAlignment = Alignment.CenterVertically,
    modifier = Modifier.padding(vertical = 2.dp)
  ) {
    Box(
      modifier = Modifier
        .width(3.dp)
        .height(20.dp)
        .background(color, RoundedCornerShape(2.dp))
    )
    Spacer(modifier = Modifier.width(6.dp))
    Column {
      Text(
        text = "WINNER: $category",
        style = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp, letterSpacing = 0.5.sp),
        fontWeight = FontWeight.Bold,
        color = Slate500
      )
      Text(
        text = winner,
        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
        fontWeight = FontWeight.SemiBold,
        color = Slate100
      )
    }
  }
}

