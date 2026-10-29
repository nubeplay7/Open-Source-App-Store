package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.example.model.AppStoreInfo
import com.example.ui.theme.*

@Composable
fun PerformanceChartsView(
  stores: List<AppStoreInfo>,
  onSelectStore: (AppStoreInfo) -> Unit
) {
  var activeMetricTab by remember { mutableStateOf(0) }
  val metricTabs = listOf("Consumo RAM (MB)", "Cold Start (ms)", "Tamaño APK (MB)", "Sync Speed (seg)")

  LazyColumn(
    modifier = Modifier
      .fillMaxSize()
      .background(Slate950)
      .padding(14.dp),
    verticalArrangement = Arrangement.spacedBy(14.dp)
  ) {
    // Header
    item {
      Card(
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        colors = CardDefaults.cardColors(containerColor = Slate900)
      ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Speed, contentDescription = null, tint = Emerald400, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "MÉTRICAS DE RENDIMIENTO & BENCHMARKS",
              style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, letterSpacing = 0.5.sp),
              fontWeight = FontWeight.Bold,
              color = Slate50
            )
          }
          Text(
            text = "Pruebas de consumo de memoria en reposo e indexación, peso de APK y tiempo de sincronización con repositorios masivos.",
            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
            color = Slate400
          )

          ScrollableTabRow(
            selectedTabIndex = activeMetricTab,
            edgePadding = 0.dp,
            containerColor = Color.Transparent,
            divider = {}
          ) {
            metricTabs.forEachIndexed { index, title ->
              Tab(
                selected = activeMetricTab == index,
                onClick = { activeMetricTab = index },
                text = {
                  Text(
                    title,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                    fontWeight = if (activeMetricTab == index) FontWeight.Bold else FontWeight.Normal,
                    color = if (activeMetricTab == index) Emerald400 else Slate400
                  )
                }
              )
            }
          }
        }
      }
    }

    // Chart content
    item {
      Card(
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        colors = CardDefaults.cardColors(containerColor = Slate900)
      ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
          when (activeMetricTab) {
            0 -> {
              Text(
                text = "CONSUMO DE MEMORIA RAM (Menor es Mejor)",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, letterSpacing = 0.5.sp),
                fontWeight = FontWeight.Bold,
                color = Emerald400
              )
              Text(
                text = "Cyan: RAM en Reposo (Idle) | Ámbar: RAM en indexación masiva",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                color = Slate400
              )
              Spacer(modifier = Modifier.height(4.dp))

              val sortedByRam = stores.filter { it.performance.ramUsageIdleMb > 0 }.sortedBy { it.performance.ramUsageIdleMb }
              val maxRam = 200f

              sortedByRam.forEach { store ->
                Column(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                  ) {
                    Text(
                      text = store.name,
                      style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                      fontWeight = FontWeight.SemiBold,
                      color = Slate100
                    )
                    Text(
                      text = "Idle: ${store.performance.ramUsageIdleMb} MB | Index: ${store.performance.ramUsageIndexingMb} MB",
                      fontFamily = FontFamily.Monospace,
                      fontSize = 10.sp,
                      color = Slate400
                    )
                  }
                  Spacer(modifier = Modifier.height(4.dp))
                  // Dual bar
                  Row(modifier = Modifier.fillMaxWidth().height(10.dp), horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                    Box(
                      modifier = Modifier
                        .weight(store.performance.ramUsageIdleMb.toFloat().coerceAtLeast(1f))
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(3.dp))
                        .background(Sky400)
                    )
                    Box(
                      modifier = Modifier
                        .weight((store.performance.ramUsageIndexingMb - store.performance.ramUsageIdleMb).toFloat().coerceAtLeast(1f))
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(3.dp))
                        .background(Amber400)
                    )
                    val remaining = (maxRam - store.performance.ramUsageIndexingMb).coerceAtLeast(0f)
                    if (remaining > 0) {
                      Spacer(modifier = Modifier.weight(remaining))
                    }
                  }
                }
              }
            }

            1 -> {
              Text(
                text = "TIEMPO DE INICIO EN FRÍO (Cold Start en ms - Menor es Mejor)",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, letterSpacing = 0.5.sp),
                fontWeight = FontWeight.Bold,
                color = Emerald400
              )
              Spacer(modifier = Modifier.height(4.dp))

              val sortedByStart = stores.filter { it.performance.coldStartTimeMs > 0 }.sortedBy { it.performance.coldStartTimeMs }
              val maxTime = 1000f

              sortedByStart.forEach { store ->
                Column(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                  ) {
                    Text(store.name, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), fontWeight = FontWeight.SemiBold, color = Slate100)
                    Text("${store.performance.coldStartTimeMs} ms", fontFamily = FontFamily.Monospace, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Emerald400)
                  }
                  Spacer(modifier = Modifier.height(4.dp))
                  Row(modifier = Modifier.fillMaxWidth().height(10.dp)) {
                    Box(
                      modifier = Modifier
                        .weight(store.performance.coldStartTimeMs.toFloat())
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(3.dp))
                        .background(if (store.performance.coldStartTimeMs < 350) Emerald400 else if (store.performance.coldStartTimeMs < 600) Sky400 else Rose400)
                    )
                    val remaining = (maxTime - store.performance.coldStartTimeMs).coerceAtLeast(1f)
                    Spacer(modifier = Modifier.weight(remaining))
                  }
                }
              }
            }

            2 -> {
              Text(
                text = "TAMAÑO DEL APK (Menor es Mejor)",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, letterSpacing = 0.5.sp),
                fontWeight = FontWeight.Bold,
                color = Emerald400
              )
              Spacer(modifier = Modifier.height(4.dp))

              val sortedBySize = stores.filter { it.techStack.apkPayloadSizeMb > 0 }.sortedBy { it.techStack.apkPayloadSizeMb }
              val maxSize = 25f

              sortedBySize.forEach { store ->
                Column(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                  ) {
                    Text(store.name, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), fontWeight = FontWeight.SemiBold, color = Slate100)
                    Text("${store.techStack.apkPayloadSizeMb} MB", fontFamily = FontFamily.Monospace, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Sky400)
                  }
                  Spacer(modifier = Modifier.height(4.dp))
                  Row(modifier = Modifier.fillMaxWidth().height(10.dp)) {
                    Box(
                      modifier = Modifier
                        .weight(store.techStack.apkPayloadSizeMb.coerceAtLeast(0.1f))
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(3.dp))
                        .background(if (store.techStack.apkPayloadSizeMb < 8f) Emerald400 else if (store.techStack.apkPayloadSizeMb < 15f) Sky400 else Violet400)
                    )
                    val remaining = (maxSize - store.techStack.apkPayloadSizeMb).coerceAtLeast(1f)
                    Spacer(modifier = Modifier.weight(remaining))
                  }
                }
              }
            }

            3 -> {
              Text(
                text = "VELOCIDAD DE SINCRONIZACIÓN DE ÍNDICE (~5k Apps)",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, letterSpacing = 0.5.sp),
                fontWeight = FontWeight.Bold,
                color = Emerald400
              )
              Spacer(modifier = Modifier.height(4.dp))

              val sortedBySpeed = stores.filter { it.performance.indexSyncSpeedSec > 0 }.sortedBy { it.performance.indexSyncSpeedSec }
              val maxSpeed = 8f

              sortedBySpeed.forEach { store ->
                Column(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                  ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                      Text(store.name, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), fontWeight = FontWeight.SemiBold, color = Slate100)
                      if (store.performance.indexV2Support) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Surface(shape = RoundedCornerShape(3.dp), color = Emerald900, border = androidx.compose.foundation.BorderStroke(1.dp, Emerald600.copy(alpha = 0.4f))) {
                          Text("Index V2", fontFamily = FontFamily.Monospace, fontSize = 8.sp, color = Emerald400, modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp))
                        }
                      }
                    }
                    Text("${store.performance.indexSyncSpeedSec} s", fontFamily = FontFamily.Monospace, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Emerald400)
                  }
                  Spacer(modifier = Modifier.height(4.dp))
                  Row(modifier = Modifier.fillMaxWidth().height(10.dp)) {
                    Box(
                      modifier = Modifier
                        .weight(store.performance.indexSyncSpeedSec.coerceAtLeast(0.2f))
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(3.dp))
                        .background(if (store.performance.indexSyncSpeedSec < 2.5f) Emerald400 else if (store.performance.indexSyncSpeedSec < 4.5f) Sky400 else Rose400)
                    )
                    val remaining = (maxSpeed - store.performance.indexSyncSpeedSec).coerceAtLeast(0.5f)
                    Spacer(modifier = Modifier.weight(remaining))
                  }
                }
              }
            }
          }
        }
      }
    }

    // Ranking Table of Overall Scores
    item {
      Card(
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        colors = CardDefaults.cardColors(containerColor = Slate900)
      ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text(
            text = "🏆 RANKING GLOBAL DE RENDIMIENTO & OPTIMIZACIÓN",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, letterSpacing = 0.5.sp),
            fontWeight = FontWeight.Bold,
            color = Emerald400
          )

          val rankedStores = stores.sortedByDescending { it.performance.overallPerformanceScore }
          rankedStores.forEachIndexed { index, store ->
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                Surface(
                  shape = RoundedCornerShape(4.dp),
                  color = if (index < 3) Amber400.copy(alpha = 0.15f) else Slate800,
                  border = androidx.compose.foundation.BorderStroke(1.dp, if (index < 3) Amber400.copy(alpha = 0.4f) else Slate700)
                ) {
                  Text(
                    text = "#${index + 1}",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (index < 3) Amber400 else Slate400,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                  )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                  Text(store.name, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), fontWeight = FontWeight.Bold, color = Slate100)
                  Text(store.techStack.uiArchitecture, style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp), color = Slate500)
                }
              }

              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Amber400.copy(alpha = 0.12f),
                border = androidx.compose.foundation.BorderStroke(1.dp, Amber400.copy(alpha = 0.3f))
              ) {
                Text(
                  text = "${store.performance.overallPerformanceScore} / 10",
                  fontFamily = FontFamily.Monospace,
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = Amber400,
                  modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
              }
            }
            if (index < rankedStores.size - 1) {
              Divider(color = Slate800.copy(alpha = 0.5f))
            }
          }
        }
      }
    }
  }
}
