package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.*
import com.example.ui.theme.*

@Composable
fun ComparisonView(
  comparedStores: List<AppStoreInfo>,
  allStores: List<AppStoreInfo>,
  onRemoveStore: (AppStoreInfo) -> Unit,
  onAddStore: (AppStoreInfo) -> Unit,
  onSetComparedStores: (List<AppStoreInfo>) -> Unit = {},
  onClearAll: () -> Unit
) {
  if (comparedStores.isEmpty()) {
    EmptyComparisonState(allStores, onAddStore, onSetComparedStores)
  } else {
    ActiveComparisonTable(comparedStores, onRemoveStore, onClearAll)
  }
}

@Composable
fun EmptyComparisonState(
  allStores: List<AppStoreInfo>,
  onAddStore: (AppStoreInfo) -> Unit,
  onSetComparedStores: (List<AppStoreInfo>) -> Unit = {}
) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(Slate950)
      .padding(24.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center
  ) {
    Surface(
      shape = RoundedCornerShape(12.dp),
      color = Slate900,
      border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
      modifier = Modifier.padding(bottom = 16.dp)
    ) {
      Box(modifier = Modifier.padding(16.dp)) {
        Icon(
          Icons.Default.CompareArrows,
          contentDescription = null,
          tint = Emerald400,
          modifier = Modifier.size(48.dp)
        )
      }
    }
    Text(
      text = "COMPARADOR CARA A CARA (VS)",
      style = MaterialTheme.typography.labelSmall.copy(fontSize = 13.sp, letterSpacing = 1.sp),
      fontWeight = FontWeight.Bold,
      color = Slate50
    )
    Spacer(modifier = Modifier.height(8.dp))
    Text(
      text = "Selecciona de 2 a 4 tiendas para compararlas en paralelo en métricas de rendimiento, seguridad, repositorios y stack técnico.",
      style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
      color = Slate400,
      textAlign = androidx.compose.ui.text.style.TextAlign.Center,
      modifier = Modifier.widthIn(max = 500.dp)
    )
    Spacer(modifier = Modifier.height(20.dp))

    Text(
      text = "SUGERENCIAS RÁPIDAS:",
      style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, letterSpacing = 0.5.sp),
      fontWeight = FontWeight.Bold,
      color = Slate500
    )
    Spacer(modifier = Modifier.height(10.dp))

    // Quick comparison presets
    Row(
      horizontalArrangement = Arrangement.spacedBy(8.dp),
      modifier = Modifier.fillMaxWidth(0.9f),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Button(
        onClick = {
          val presets = listOfNotNull(
            allStores.find { it.id == "droid-ify" },
            allStores.find { it.id == "aurora-store" },
            allStores.find { it.id == "obtainium" }
          )
          if (presets.isNotEmpty()) {
            onSetComparedStores(presets)
          }
        },
        modifier = Modifier.weight(1f),
        colors = ButtonDefaults.buttonColors(containerColor = Emerald900, contentColor = Emerald400),
        shape = RoundedCornerShape(8.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Emerald600.copy(alpha = 0.4f))
      ) {
        Text("Top 3: Droid-ify vs Aurora vs Obtainium", style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp))
      }

      FilledTonalButton(
        onClick = {
          val presets = listOfNotNull(
            allStores.find { it.id == "fdroid-official" },
            allStores.find { it.id == "neo-store" },
            allStores.find { it.id == "accrescent" }
          )
          if (presets.isNotEmpty()) {
            onSetComparedStores(presets)
          }
        },
        modifier = Modifier.weight(1f),
        colors = ButtonDefaults.filledTonalButtonColors(containerColor = Slate800, contentColor = Slate200),
        shape = RoundedCornerShape(8.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
      ) {
        Text("F-Droid vs Neo Store vs Accrescent", style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp))
      }
    }
  }
}

@Composable
fun ActiveComparisonTable(
  stores: List<AppStoreInfo>,
  onRemoveStore: (AppStoreInfo) -> Unit,
  onClearAll: () -> Unit
) {
  val horizontalScrollState = rememberScrollState()

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(Slate950)
      .padding(10.dp)
  ) {
    // Header bar
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(bottom = 8.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = "COMPARATIVA PARALELA (${stores.size} SELECCIONADAS)",
        style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, letterSpacing = 0.5.sp),
        fontWeight = FontWeight.Bold,
        color = Emerald400
      )
      TextButton(onClick = onClearAll) {
        Icon(Icons.Default.DeleteSweep, contentDescription = null, tint = Rose400, modifier = Modifier.size(16.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text("Limpiar", color = Rose400, style = MaterialTheme.typography.labelSmall)
      }
    }

    // Main comparison scrollable view
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
          // Store Headers row
          Row(
            modifier = Modifier
              .background(Slate900)
              .border(1.dp, Slate800)
              .padding(10.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Box(modifier = Modifier.width(200.dp)) {
              Text(
                text = "MÉTRICA / ESPECIFICACIÓN",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 1.sp),
                fontWeight = FontWeight.Bold,
                color = Slate400
              )
            }
            stores.forEach { store ->
              Box(
                modifier = Modifier
                  .width(240.dp)
                  .padding(horizontal = 6.dp)
              ) {
                Column {
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                  ) {
                    Text(
                      text = store.name,
                      style = MaterialTheme.typography.titleSmall.copy(fontSize = 13.sp),
                      fontWeight = FontWeight.Bold,
                      color = Slate50
                    )
                    IconButton(
                      onClick = { onRemoveStore(store) },
                      modifier = Modifier.size(20.dp)
                    ) {
                      Icon(Icons.Default.Close, contentDescription = "Quitar", tint = Rose400, modifier = Modifier.size(14.dp))
                    }
                  }
                  Text(
                    text = store.latestVersion,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    color = Emerald400
                  )
                }
              }
            }
          }

          LazyColumn(modifier = Modifier.fillMaxSize()) {
            // Section 1: Scores
            item {
              ComparisonSectionHeader("⭐ PUNTUACIONES & RATINGS (1 - 10)")
            }
            item {
              ComparisonRowScore("Facilidad de Uso (UX)", stores) { it.easeOfUseScore }
            }
            item {
              ComparisonRowScore("Seguridad & Privacidad", stores) { it.securityScore }
            }
            item {
              ComparisonRowScore("Ecosistema de Repos", stores) { it.repoEcosystemScore }
            }
            item {
              ComparisonRowScore("Rendimiento Global", stores) { it.performance.overallPerformanceScore }
            }

            // Section 2: Benchmarks
            item {
              ComparisonSectionHeader("⚡ MÉTRICAS DE RENDIMIENTO & HARDWARE")
            }
            item {
              ComparisonRowText("RAM en Reposo", stores, isMono = true) { "${it.performance.ramUsageIdleMb} MB" }
            }
            item {
              ComparisonRowText("RAM Indexando", stores, isMono = true) { "${it.performance.ramUsageIndexingMb} MB" }
            }
            item {
              ComparisonRowText("Tiempo Inicio Frío", stores, isMono = true) { "${it.performance.coldStartTimeMs} ms" }
            }
            item {
              ComparisonRowText("Velocidad Sync Repos", stores, isMono = true) { "${it.performance.indexSyncSpeedSec} seg" }
            }
            item {
              ComparisonRowText("Tamaño del APK", stores, isMono = true) { "${it.techStack.apkPayloadSizeMb} MB" }
            }
            item {
              ComparisonRowBoolean("Soporte F-Droid Index V2", stores) { it.performance.indexV2Support }
            }

            // Section 3: Tech Stack
            item {
              ComparisonSectionHeader("🛠️ STACK TECNOLÓGICO & ARQUITECTURA")
            }
            item {
              ComparisonRowText("Lenguaje Principal", stores) { it.techStack.primaryLanguage }
            }
            item {
              ComparisonRowText("Arquitectura de UI", stores) { it.techStack.uiArchitecture }
            }
            item {
              ComparisonRowText("Patrón Arquitectural", stores) { it.techStack.architecturePattern }
            }
            item {
              ComparisonRowText("Base de Datos", stores) { it.techStack.database }
            }
            item {
              ComparisonRowText("Librería de Red", stores) { it.techStack.networkLibrary }
            }
            item {
              ComparisonRowText("Android Min / Target", stores, isMono = true) { "Android ${getAndroidVersionName(it.techStack.minSdk)} / SDK ${it.techStack.targetSdk}" }
            }

            // Section 4: Key Features
            item {
              ComparisonSectionHeader("🧩 FUNCIONALIDADES CLAVE")
            }
            item {
              ComparisonRowBoolean("Updates Auto en Segundo Plano", stores) { it.features.backgroundAutoUpdates }
            }
            item {
              ComparisonRowBoolean("Instalación Silenciosa (Shizuku)", stores) { it.features.unattendedRootlessUpdates }
            }
            item {
              ComparisonRowBoolean("Soporte Split APKs / App Bundles", stores) { it.features.splitApkSupport }
            }
            item {
              ComparisonRowBoolean("Rollback / Versiones Previas", stores) { it.features.rollbackSupport }
            }
            item {
              ComparisonRowBoolean("Escaneo Exodus Privacy", stores) { it.features.trackerScanningExodus }
            }
            item {
              ComparisonRowBoolean("Navegación por Categorías", stores) { it.features.categoryBrowsing }
            }
            item {
              ComparisonRowBoolean("Releases Directos de GitHub", stores) { it.gitReleasesDirectSupport }
            }
            item {
              ComparisonRowBoolean("Proxy Tor / Orbot", stores) { it.features.torOrbotProxy }
            }

            // Section 5: Verdict
            item {
              ComparisonSectionHeader("🏆 CONCLUSIÓN & MEJOR CASO DE USO")
            }
            item {
              ComparisonRowText("Diferenciador Clave", stores) { it.keyDifferentiator }
            }
            item {
              ComparisonRowText("¿Para qué es mejor?", stores, isHighlight = true) { it.bestForUseCase }
            }
          }
        }
      }
    }
  }
}

@Composable
fun ComparisonSectionHeader(title: String) {
  Surface(
    color = Slate900,
    border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
    modifier = Modifier.fillMaxWidth()
  ) {
    Text(
      text = title,
      style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 0.5.sp),
      fontWeight = FontWeight.Bold,
      color = Emerald400,
      modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
    )
  }
}

@Composable
fun ComparisonRowText(label: String, stores: List<AppStoreInfo>, isMono: Boolean = false, isHighlight: Boolean = false, extractor: (AppStoreInfo) -> String) {
  Row(
    modifier = Modifier
      .background(Slate950)
      .padding(vertical = 8.dp, horizontal = 10.dp),
    verticalAlignment = Alignment.CenterVertically
  ) {
    Box(modifier = Modifier.width(200.dp)) {
      Text(
        text = label,
        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
        fontWeight = FontWeight.SemiBold,
        color = Slate300
      )
    }
    stores.forEach { store ->
      Box(
        modifier = Modifier
          .width(240.dp)
          .padding(horizontal = 6.dp)
      ) {
        Text(
          text = extractor(store),
          style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
          fontFamily = if (isMono) FontFamily.Monospace else FontFamily.Default,
          color = if (isHighlight) Emerald400 else Slate200
        )
      }
    }
  }
  Divider(color = Slate800.copy(alpha = 0.5f), thickness = 1.dp)
}

@Composable
fun ComparisonRowScore(label: String, stores: List<AppStoreInfo>, extractor: (AppStoreInfo) -> Float) {
  Row(
    modifier = Modifier
      .background(Slate950)
      .padding(vertical = 8.dp, horizontal = 10.dp),
    verticalAlignment = Alignment.CenterVertically
  ) {
    Box(modifier = Modifier.width(200.dp)) {
      Text(
        text = label,
        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
        fontWeight = FontWeight.SemiBold,
        color = Slate300
      )
    }
    stores.forEach { store ->
      val score = extractor(store)
      Box(
        modifier = Modifier
          .width(240.dp)
          .padding(horizontal = 6.dp)
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          LinearProgressIndicator(
            progress = { score / 10f },
            modifier = Modifier
              .weight(1f)
              .height(6.dp)
              .clip(RoundedCornerShape(3.dp)),
            color = if (score >= 9.0f) Emerald400 else if (score >= 8.0f) Sky400 else Amber400,
            trackColor = Slate800
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = String.format("%.1f", score),
            fontFamily = FontFamily.Monospace,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = Slate100
          )
        }
      }
    }
  }
  Divider(color = Slate800.copy(alpha = 0.5f), thickness = 1.dp)
}

@Composable
fun ComparisonRowBoolean(label: String, stores: List<AppStoreInfo>, extractor: (AppStoreInfo) -> Boolean) {
  Row(
    modifier = Modifier
      .background(Slate950)
      .padding(vertical = 8.dp, horizontal = 10.dp),
    verticalAlignment = Alignment.CenterVertically
  ) {
    Box(modifier = Modifier.width(200.dp)) {
      Text(
        text = label,
        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
        fontWeight = FontWeight.SemiBold,
        color = Slate300
      )
    }
    stores.forEach { store ->
      val supported = extractor(store)
      Box(
        modifier = Modifier
          .width(240.dp)
          .padding(horizontal = 6.dp)
      ) {
        if (supported) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.CheckCircle, contentDescription = "Sí", tint = Emerald400, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Soportado", style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), color = Emerald400)
          }
        } else {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Cancel, contentDescription = "No", tint = Slate700, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("No disponible", style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), color = Slate600)
          }
        }
      }
    }
  }
  Divider(color = Slate800.copy(alpha = 0.5f), thickness = 1.dp)
}
