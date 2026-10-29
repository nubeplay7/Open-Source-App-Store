package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.model.*
import com.example.ui.theme.*

@Composable
fun StoreDetailModal(
  store: AppStoreInfo,
  onDismiss: () -> Unit,
  onAddToCompare: (AppStoreInfo) -> Unit,
  isComparing: Boolean
) {
  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxWidth(0.95f)
        .fillMaxHeight(0.92f)
        .clip(RoundedCornerShape(12.dp))
        .border(1.dp, Slate800, RoundedCornerShape(12.dp)),
      color = Slate950
    ) {
      Column(
        modifier = Modifier.fillMaxSize()
      ) {
        // Header Bar
        Surface(
          color = Slate900,
          modifier = Modifier.fillMaxWidth().border(1.dp, Slate800)
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                  text = store.name,
                  style = MaterialTheme.typography.titleLarge.copy(fontSize = 18.sp),
                  fontWeight = FontWeight.Bold,
                  color = Slate50
                )
                Spacer(modifier = Modifier.width(8.dp))
                Surface(
                  shape = RoundedCornerShape(4.dp),
                  color = Emerald900,
                  border = androidx.compose.foundation.BorderStroke(1.dp, Emerald600.copy(alpha = 0.4f))
                ) {
                  Text(
                    text = store.latestVersion,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Emerald400,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                  )
                }
              }
              Text(
                text = store.tagline,
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                color = Slate400
              )
            }
            IconButton(onClick = onDismiss) {
              Icon(Icons.Default.Close, contentDescription = "Cerrar", tint = Slate400)
            }
          }
        }

        // Scrollable content
        LazyColumn(
          modifier = Modifier
            .weight(1f)
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          // Badges row
          item {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
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
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
              }

              Surface(
                shape = RoundedCornerShape(4.dp),
                color = if (store.projectStatus.isHealthy) Emerald900.copy(alpha = 0.4f) else Rose500.copy(alpha = 0.15f),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (store.projectStatus.isHealthy) Emerald500.copy(alpha = 0.4f) else Rose400.copy(alpha = 0.35f))
              ) {
                Text(
                  text = store.projectStatus.label,
                  style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                  fontWeight = FontWeight.SemiBold,
                  color = if (store.projectStatus.isHealthy) Emerald400 else Rose400,
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
              }

              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Slate800,
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                  Icon(
                    Icons.Default.Star,
                    contentDescription = null,
                    tint = Amber400,
                    modifier = Modifier.size(14.dp)
                  )
                  Spacer(modifier = Modifier.width(4.dp))
                  Text(
                    text = store.githubStars,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                  )
                }
              }
            }
          }

          // Key Highlights: Best For & Differentiator
          item {
            Card(
              colors = CardDefaults.cardColors(containerColor = Slate900),
              shape = RoundedCornerShape(8.dp),
              border = androidx.compose.foundation.BorderStroke(1.dp, Slate800)
            ) {
              Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(verticalAlignment = Alignment.Top) {
                  Icon(
                    Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = Emerald400,
                    modifier = Modifier.size(18.dp)
                  )
                  Spacer(modifier = Modifier.width(8.dp))
                  Column {
                    Text(
                      text = "DIFERENCIADOR CLAVE",
                      style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 0.5.sp),
                      fontWeight = FontWeight.Bold,
                      color = Emerald400
                    )
                    Text(
                      text = store.keyDifferentiator,
                      style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                      color = Slate200
                    )
                  }
                }

                Divider(color = Slate800.copy(alpha = 0.5f))

                Row(verticalAlignment = Alignment.Top) {
                  Icon(
                    Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = Sky400,
                    modifier = Modifier.size(18.dp)
                  )
                  Spacer(modifier = Modifier.width(8.dp))
                  Column {
                    Text(
                      text = "¿PARA QUÉ ES MEJOR?",
                      style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 0.5.sp),
                      fontWeight = FontWeight.Bold,
                      color = Sky400
                    )
                    Text(
                      text = store.bestForUseCase,
                      style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                      color = Slate200
                    )
                  }
                }
              }
            }
          }

          // Scores Matrix
          item {
            Text(
              text = "EVALUACIONES & PUNTUACIONES (1 - 10)",
              style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, letterSpacing = 0.5.sp),
              fontWeight = FontWeight.Bold,
              color = Slate400
            )
            Spacer(modifier = Modifier.height(4.dp))
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              ScoreMetricCard("UX", store.easeOfUseScore, Sky400, Modifier.weight(1f))
              ScoreMetricCard("Seguridad", store.securityScore, Emerald400, Modifier.weight(1f))
              ScoreMetricCard("Repos", store.repoEcosystemScore, Violet400, Modifier.weight(1f))
              ScoreMetricCard("Perf", store.performance.overallPerformanceScore, Amber400, Modifier.weight(1f))
            }
          }

          // Performance Benchmark
          item {
            Card(
              shape = RoundedCornerShape(8.dp),
              border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
              colors = CardDefaults.cardColors(containerColor = Slate900)
            ) {
              Column(modifier = Modifier.padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  Icon(Icons.Default.Speed, contentDescription = null, tint = Emerald400, modifier = Modifier.size(16.dp))
                  Spacer(modifier = Modifier.width(6.dp))
                  Text(
                    text = "MÉTRICAS DE RENDIMIENTO",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 0.5.sp),
                    fontWeight = FontWeight.Bold,
                    color = Emerald400
                  )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  BenchmarkItem("RAM Idle", "${store.performance.ramUsageIdleMb} MB")
                  BenchmarkItem("RAM Index", "${store.performance.ramUsageIndexingMb} MB")
                  BenchmarkItem("Cold Start", "${store.performance.coldStartTimeMs} ms")
                  BenchmarkItem("Sync", "${store.performance.indexSyncSpeedSec} s")
                  BenchmarkItem("APK", "${store.techStack.apkPayloadSizeMb} MB")
                }
              }
            }
          }

          // Tech Stack Details
          item {
            Card(
              shape = RoundedCornerShape(8.dp),
              border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
              colors = CardDefaults.cardColors(containerColor = Slate900)
            ) {
              Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                  text = "STACK TECNOLÓGICO & ARQUITECTURA",
                  style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 0.5.sp),
                  fontWeight = FontWeight.Bold,
                  color = Emerald400
                )
                TechStackRow("Lenguaje Principal", store.techStack.primaryLanguage)
                TechStackRow("Arquitectura UI", store.techStack.uiArchitecture)
                TechStackRow("Patrón Arquitectural", store.techStack.architecturePattern)
                TechStackRow("Base de Datos", store.techStack.database)
                TechStackRow("Librería de Red", store.techStack.networkLibrary)
                TechStackRow("Compatibilidad", "Android ${getAndroidVersionName(store.techStack.minSdk)}+ (Min ${store.techStack.minSdk} / Target ${store.techStack.targetSdk})")
              }
            }
          }

          // Security & Repositories
          item {
            Card(
              shape = RoundedCornerShape(8.dp),
              border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
              colors = CardDefaults.cardColors(containerColor = Slate900)
            ) {
              Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                  text = "SEGURIDAD & PRIVACIDAD",
                  style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 0.5.sp),
                  fontWeight = FontWeight.Bold,
                  color = Emerald400
                )
                Text(
                  text = store.securitySummary,
                  style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                  color = Slate300
                )
                Divider(color = Slate800.copy(alpha = 0.5f))
                Text(
                  text = "MÉTODOS DE INSTALACIÓN:",
                  style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                  fontWeight = FontWeight.Bold,
                  color = Slate400
                )
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                  store.installMethods.forEach { method ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                      Icon(
                        Icons.Default.Check,
                        contentDescription = null,
                        tint = Emerald400,
                        modifier = Modifier.size(14.dp)
                      )
                      Spacer(modifier = Modifier.width(6.dp))
                      Text(text = method.label, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), color = Slate200)
                    }
                  }
                }
              }
            }
          }

          // Features Checklist Grid
          item {
            Card(
              shape = RoundedCornerShape(8.dp),
              border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
              colors = CardDefaults.cardColors(containerColor = Slate900)
            ) {
              Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                  text = "CATÁLOGO DE FUNCIONES",
                  style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 0.5.sp),
                  fontWeight = FontWeight.Bold,
                  color = Emerald400
                )
                FeatureCheckRow("Actualizaciones automáticas (Background)", store.features.backgroundAutoUpdates)
                FeatureCheckRow("Instalación silenciosa sin root (Shizuku)", store.features.unattendedRootlessUpdates)
                FeatureCheckRow("Soporte Split APKs / Bundles / XAPK", store.features.splitApkSupport)
                FeatureCheckRow("Rollback de versiones", store.features.rollbackSupport)
                FeatureCheckRow("Navegación por categorías", store.features.categoryBrowsing)
                FeatureCheckRow("Exportar / Importar lista de apps", store.features.exportImportList)
                FeatureCheckRow("Soporte Proxy Tor / Orbot", store.features.torOrbotProxy)
                FeatureCheckRow("Escaneo de rastreadores (Exodus Privacy)", store.features.trackerScanningExodus)
                FeatureCheckRow("Advertencias Anti-Features", store.features.antiFeaturesWarning)
                FeatureCheckRow("Añadir repositorio mediante QR", store.features.repoAddViaQr)
              }
            }
          }

          // Recent Updates & Changelog
          item {
            Card(
              shape = RoundedCornerShape(8.dp),
              border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
              colors = CardDefaults.cardColors(containerColor = Slate900)
            ) {
              Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  Icon(Icons.Default.Update, contentDescription = null, tint = Emerald400, modifier = Modifier.size(16.dp))
                  Spacer(modifier = Modifier.width(6.dp))
                  Text(
                    text = "ÚLTIMA ACTUALIZACIÓN (${store.latestReleaseDate})",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 0.5.sp),
                    fontWeight = FontWeight.Bold,
                    color = Emerald400
                  )
                }
                Text(
                  text = store.recentChangelog,
                  style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                  color = Slate300
                )
              }
            }
          }

          // Pros & Cons
          item {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Emerald600.copy(alpha = 0.3f)),
                colors = CardDefaults.cardColors(containerColor = Slate900)
              ) {
                Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                  Text(
                    text = "VENTAJAS",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 0.5.sp),
                    fontWeight = FontWeight.Bold,
                    color = Emerald400
                  )
                  store.pros.forEach { pro ->
                    Row(verticalAlignment = Alignment.Top) {
                      Text("• ", color = Emerald400, fontWeight = FontWeight.Bold)
                      Text(pro, style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp), color = Slate200)
                    }
                  }
                }
              }

              Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Rose400.copy(alpha = 0.3f)),
                colors = CardDefaults.cardColors(containerColor = Slate900)
              ) {
                Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                  Text(
                    text = "LIMITACIONES",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 0.5.sp),
                    fontWeight = FontWeight.Bold,
                    color = Rose400
                  )
                  store.cons.forEach { con ->
                    Row(verticalAlignment = Alignment.Top) {
                      Text("• ", color = Rose400, fontWeight = FontWeight.Bold)
                      Text(con, style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp), color = Slate200)
                    }
                  }
                }
              }
            }
          }
        }

        // Bottom Action Bar
        Surface(
          color = Slate900,
          modifier = Modifier.fillMaxWidth().border(1.dp, Slate800)
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "Licencia: ${store.license}",
              style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
              color = Slate400
            )

            Button(
              onClick = { onAddToCompare(store) },
              colors = ButtonDefaults.buttonColors(
                containerColor = if (isComparing) Rose500.copy(alpha = 0.2f) else Emerald900,
                contentColor = if (isComparing) Rose400 else Emerald400
              ),
              shape = RoundedCornerShape(6.dp),
              border = androidx.compose.foundation.BorderStroke(1.dp, if (isComparing) Rose400.copy(alpha = 0.4f) else Emerald600.copy(alpha = 0.4f))
            ) {
              Icon(
                if (isComparing) Icons.Default.RemoveCircleOutline else Icons.Default.CompareArrows,
                contentDescription = null,
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                if (isComparing) "Quitar de Comparar" else "Añadir a Comparar",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp)
              )
            }
          }
        }
      }
    }
  }
}

@Composable
fun ScoreMetricCard(
  title: String,
  score: Float,
  color: Color,
  modifier: Modifier = Modifier
) {
  Card(
    modifier = modifier,
    shape = RoundedCornerShape(6.dp),
    border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.3f)),
    colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f))
  ) {
    Column(
      modifier = Modifier.padding(8.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Text(
        text = String.format("%.1f", score),
        fontFamily = FontFamily.Monospace,
        fontSize = 18.sp,
        fontWeight = FontWeight.Bold,
        color = color
      )
      Text(
        text = title,
        style = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp),
        fontWeight = FontWeight.Medium,
        color = Slate300
      )
    }
  }
}

@Composable
fun BenchmarkItem(label: String, value: String) {
  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Text(
      text = value,
      fontFamily = FontFamily.Monospace,
      fontSize = 12.sp,
      fontWeight = FontWeight.Bold,
      color = Emerald400
    )
    Text(
      text = label,
      style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
      color = Slate400
    )
  }
}

@Composable
fun TechStackRow(label: String, value: String) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween
  ) {
    Text(
      text = label,
      style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp),
      fontWeight = FontWeight.SemiBold,
      color = Slate400
    )
    Text(
      text = value,
      style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp),
      fontWeight = FontWeight.Medium,
      color = Slate100
    )
  }
}

@Composable
fun FeatureCheckRow(label: String, isSupported: Boolean) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically
  ) {
    Text(
      text = label,
      style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
      color = Slate300
    )
    if (isSupported) {
      Icon(
        Icons.Default.CheckCircle,
        contentDescription = "Soportado",
        tint = Emerald400,
        modifier = Modifier.size(16.dp)
      )
    } else {
      Icon(
        Icons.Default.Cancel,
        contentDescription = "No soportado",
        tint = Slate700,
        modifier = Modifier.size(16.dp)
      )
    }
  }
}

fun getAndroidVersionName(apiLevel: Int): String {
  return when (apiLevel) {
    14 -> "4.0 (ICS)"
    21 -> "5.0 (Lollipop)"
    24 -> "7.0 (Nougat)"
    26 -> "8.0 (Oreo)"
    28 -> "9.0 (Pie)"
    29 -> "10"
    30 -> "11"
    31 -> "12"
    33 -> "13"
    34 -> "14"
    35 -> "15"
    else -> "API $apiLevel"
  }
}
