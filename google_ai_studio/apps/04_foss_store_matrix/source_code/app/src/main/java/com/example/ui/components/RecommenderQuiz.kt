package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.example.model.*
import com.example.ui.theme.*

@Composable
fun RecommenderQuiz(
  allStores: List<AppStoreInfo>,
  onSelectStore: (AppStoreInfo) -> Unit
) {
  var needPlayStoreApps by remember { mutableStateOf(false) }
  var prioritizeBleedingEdgeGit by remember { mutableStateOf(false) }
  var lowRamDevice by remember { mutableStateOf(false) }
  var maximumCryptoSecurity by remember { mutableStateOf(false) }
  var wantShizukuSilentUpdates by remember { mutableStateOf(true) }

  val scoredRecommendations = remember(
    needPlayStoreApps,
    prioritizeBleedingEdgeGit,
    lowRamDevice,
    maximumCryptoSecurity,
    wantShizukuSilentUpdates
  ) {
    allStores.map { store ->
      var matchScore = 50

      if (needPlayStoreApps) {
        if (store.category == StoreCategory.PLAY_STORE_CLIENT) matchScore += 45
        else matchScore -= 20
      } else {
        if (store.category == StoreCategory.FDROID_CLIENT) matchScore += 25
      }

      if (prioritizeBleedingEdgeGit) {
        if (store.gitReleasesDirectSupport) matchScore += 40
        if (store.id == "obtainium") matchScore += 20
      }

      if (lowRamDevice) {
        if (store.performance.ramUsageIdleMb < 40) matchScore += 35
        if (store.techStack.apkPayloadSizeMb < 6.0f) matchScore += 20
        if (store.performance.ramUsageIndexingMb > 130) matchScore -= 25
      }

      if (maximumCryptoSecurity) {
        if (store.securityScore >= 9.8f) matchScore += 40
        if (store.id == "accrescent" || store.id == "app-manager") matchScore += 25
      }

      if (wantShizukuSilentUpdates) {
        if (store.installMethods.contains(InstallMethod.SHIZUKU)) matchScore += 20
        if (store.features.unattendedRootlessUpdates) matchScore += 15
      }

      val finalScore = matchScore.coerceIn(10, 99)
      Pair(store, finalScore)
    }.sortedByDescending { it.second }
  }

  LazyColumn(
    modifier = Modifier
      .fillMaxSize()
      .background(Slate950)
      .padding(14.dp),
    verticalArrangement = Arrangement.spacedBy(14.dp)
  ) {
    item {
      Card(
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        colors = CardDefaults.cardColors(containerColor = Slate900)
      ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Psychology, contentDescription = null, tint = Emerald400, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "ASISTENTE DE RECOMENDACIÓN INTELIGENTE",
              style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, letterSpacing = 0.5.sp),
              fontWeight = FontWeight.Bold,
              color = Slate50
            )
          }
          Text(
            text = "Configura tus requerimientos específicos. El motor de afinidad calcula la mejor alternativa para tu perfil en tiempo real.",
            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
            color = Slate400
          )
        }
      }
    }

    // Interactive Quiz Switches
    item {
      Card(
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        colors = CardDefaults.cardColors(containerColor = Slate900)
      ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text(
            text = "PARÁMETROS Y PREFERENCIAS",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, letterSpacing = 0.5.sp),
            fontWeight = FontWeight.Bold,
            color = Emerald400
          )

          QuizOptionRow(
            title = "¿Necesitas apps comerciales de Google Play (Banca, WhatsApp)?",
            subtitle = "Requiere pasarela con los servidores de Play Store para descargar APKs propietarias",
            checked = needPlayStoreApps,
            onCheckedChange = { needPlayStoreApps = it }
          )

          Divider(color = Slate800.copy(alpha = 0.5f))

          QuizOptionRow(
            title = "¿Priorizas releases 'Día Cero' directo de GitHub / GitLab?",
            subtitle = "Descarga APKs recién compiladas directamente de los repositorios sin intermediarios",
            checked = prioritizeBleedingEdgeGit,
            onCheckedChange = { prioritizeBleedingEdgeGit = it }
          )

          Divider(color = Slate800.copy(alpha = 0.5f))

          QuizOptionRow(
            title = "¿Dispositivo con poca memoria RAM o hardware antiguo?",
            subtitle = "Prioriza tiendas de consumo ultrabajo (<35MB RAM) y tamaño de APK mínimo",
            checked = lowRamDevice,
            onCheckedChange = { lowRamDevice = it }
          )

          Divider(color = Slate800.copy(alpha = 0.5f))

          QuizOptionRow(
            title = "¿Máxima seguridad criptográfica y mitigación anti-downgrade?",
            subtitle = "Valida firmas del autor por hardware y verificación criptográfica estricta",
            checked = maximumCryptoSecurity,
            onCheckedChange = { maximumCryptoSecurity = it }
          )

          Divider(color = Slate800.copy(alpha = 0.5f))

          QuizOptionRow(
            title = "¿Actualizaciones automáticas silenciosas sin Root (Shizuku)?",
            subtitle = "Instala actualizaciones de apps en segundo plano de forma desatendida",
            checked = wantShizukuSilentUpdates,
            onCheckedChange = { wantShizukuSilentUpdates = it }
          )
        }
      }
    }

    // Results Header
    item {
      Text(
        text = "🎯 TIENDAS RECOMENDADAS (ORDENADAS POR AFINIDAD)",
        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, letterSpacing = 0.5.sp),
        fontWeight = FontWeight.Bold,
        color = Slate400
      )
    }

    // Recommended Items List
    items(scoredRecommendations) { (store, score) ->
      Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        colors = CardDefaults.cardColors(containerColor = Slate900)
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(14.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(
                text = store.name,
                style = MaterialTheme.typography.titleMedium.copy(fontSize = 14.sp),
                fontWeight = FontWeight.Bold,
                color = Slate50
              )
              Spacer(modifier = Modifier.width(8.dp))
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(store.category.badgeColorHex).copy(alpha = 0.15f),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(store.category.badgeColorHex).copy(alpha = 0.35f))
              ) {
                Text(
                  text = store.category.label,
                  style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                  color = Color(store.category.badgeColorHex),
                  modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
              }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = store.bestForUseCase,
              style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
              color = Emerald400
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
              Text(
                text = "RAM: ${store.performance.ramUsageIdleMb} MB",
                fontFamily = FontFamily.Monospace,
                fontSize = 10.sp,
                color = Sky400
              )
              Text("•", color = Slate600, fontSize = 10.sp)
              Text(
                text = "Seg: ${store.securityScore}/10",
                fontFamily = FontFamily.Monospace,
                fontSize = 10.sp,
                color = Emerald400
              )
              Text("•", color = Slate600, fontSize = 10.sp)
              Text(
                text = "UX: ${store.easeOfUseScore}/10",
                fontFamily = FontFamily.Monospace,
                fontSize = 10.sp,
                color = Slate300
              )
            }
          }

          Column(
            horizontalAlignment = Alignment.End,
            modifier = Modifier.padding(start = 12.dp)
          ) {
            Surface(
              shape = RoundedCornerShape(6.dp),
              color = if (score >= 80) Emerald900.copy(alpha = 0.5f) else Slate800,
              border = androidx.compose.foundation.BorderStroke(1.dp, if (score >= 80) Emerald500.copy(alpha = 0.4f) else Slate700)
            ) {
              Text(
                text = "$score% Match",
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = if (score >= 80) Emerald400 else Slate300,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
            Spacer(modifier = Modifier.height(6.dp))
            FilledTonalButton(
              onClick = { onSelectStore(store) },
              contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
              colors = ButtonDefaults.filledTonalButtonColors(containerColor = Slate800, contentColor = Slate200),
              shape = RoundedCornerShape(6.dp)
            ) {
              Text("Ficha", style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp))
            }
          }
        }
      }
    }
  }
}

@Composable
fun QuizOptionRow(
  title: String,
  subtitle: String,
  checked: Boolean,
  onCheckedChange: (Boolean) -> Unit
) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.SpaceBetween
  ) {
    Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
      Text(
        text = title,
        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
        fontWeight = FontWeight.SemiBold,
        color = Slate100
      )
      Text(
        text = subtitle,
        style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp),
        color = Slate400
      )
    }
    Switch(
      checked = checked,
      onCheckedChange = onCheckedChange,
      colors = SwitchDefaults.colors(
        checkedThumbColor = Slate950,
        checkedTrackColor = Emerald400,
        uncheckedThumbColor = Slate400,
        uncheckedTrackColor = Slate800
      )
    )
  }
}
