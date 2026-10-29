package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.*
import com.example.ui.theme.*

@Composable
fun StoreCardList(
  stores: List<AppStoreInfo>,
  searchQuery: String,
  selectedCategory: StoreCategory,
  onSelectStore: (AppStoreInfo) -> Unit,
  onToggleCompare: (AppStoreInfo) -> Unit,
  comparedStores: List<AppStoreInfo>
) {
  val filteredStores = stores.filter { store ->
    val matchesCategory = selectedCategory == StoreCategory.ALL || store.category == selectedCategory
    val matchesSearch = searchQuery.isBlank() ||
        store.name.contains(searchQuery, ignoreCase = true) ||
        store.tagline.contains(searchQuery, ignoreCase = true) ||
        store.keyDifferentiator.contains(searchQuery, ignoreCase = true) ||
        store.bestForUseCase.contains(searchQuery, ignoreCase = true) ||
        store.techStack.primaryLanguage.contains(searchQuery, ignoreCase = true)
    matchesCategory && matchesSearch
  }

  LazyColumn(
    modifier = Modifier
      .fillMaxSize()
      .background(Slate950)
      .padding(horizontal = 12.dp, vertical = 6.dp),
    verticalArrangement = Arrangement.spacedBy(10.dp)
  ) {
    items(filteredStores) { store ->
      val isComparing = comparedStores.any { it.id == store.id }
      StoreCardItem(
        store = store,
        onSelect = { onSelectStore(store) },
        onToggleCompare = { onToggleCompare(store) },
        isComparing = isComparing
      )
    }
  }
}

@Composable
fun StoreCardItem(
  store: AppStoreInfo,
  onSelect: () -> Unit,
  onToggleCompare: () -> Unit,
  isComparing: Boolean
) {
  Card(
    modifier = Modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(10.dp))
      .border(1.dp, Slate800, RoundedCornerShape(10.dp))
      .clickable { onSelect() },
    shape = RoundedCornerShape(10.dp),
    colors = CardDefaults.cardColors(containerColor = Slate900)
  ) {
    Column(
      modifier = Modifier.padding(14.dp),
      verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      // Top row: Title + Version + Stars
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column(modifier = Modifier.weight(1f)) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
              text = store.name,
              style = MaterialTheme.typography.titleMedium.copy(fontSize = 15.sp),
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
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 1.dp)
              )
            }
          }
          Text(
            text = store.tagline,
            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
            color = Slate400,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
          )
        }

        // Star badge
        Surface(
          shape = RoundedCornerShape(6.dp),
          color = Slate800,
          border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
          ) {
            Icon(
              Icons.Default.Star,
              contentDescription = null,
              tint = Amber400,
              modifier = Modifier.size(13.dp)
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

      // Badges: Category & Project Status
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = Color(store.category.badgeColorHex).copy(alpha = 0.15f),
          border = androidx.compose.foundation.BorderStroke(1.dp, Color(store.category.badgeColorHex).copy(alpha = 0.35f))
        ) {
          Text(
            text = store.category.label,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
            fontWeight = FontWeight.SemiBold,
            color = Color(store.category.badgeColorHex),
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
          )
        }

        Surface(
          shape = RoundedCornerShape(4.dp),
          color = if (store.projectStatus.isHealthy) Emerald900.copy(alpha = 0.4f) else Rose500.copy(alpha = 0.15f),
          border = androidx.compose.foundation.BorderStroke(1.dp, if (store.projectStatus.isHealthy) Emerald500.copy(alpha = 0.4f) else Rose400.copy(alpha = 0.35f))
        ) {
          Text(
            text = store.projectStatus.label,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
            fontWeight = FontWeight.SemiBold,
            color = if (store.projectStatus.isHealthy) Emerald400 else Rose400,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
          )
        }
      }

      // Key Differentiator Box
      Surface(
        shape = RoundedCornerShape(6.dp),
        color = Slate950,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(8.dp)) {
          Text(
            text = "⚡ DIFERENCIADOR CLAVE",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp, letterSpacing = 0.5.sp),
            fontWeight = FontWeight.Bold,
            color = Emerald400
          )
          Text(
            text = store.keyDifferentiator,
            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
            color = Slate300,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
          )
        }
      }

      // Metric score chips
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        ScorePill(title = "UX", score = store.easeOfUseScore, color = Sky400)
        ScorePill(title = "Seguridad", score = store.securityScore, color = Emerald400)
        ScorePill(title = "Repos", score = store.repoEcosystemScore, color = Violet400)
        ScorePill(title = "Perf", score = store.performance.overallPerformanceScore, color = Amber400)
        BenchmarkPill(label = "RAM Idle", value = "${store.performance.ramUsageIdleMb} MB")
        BenchmarkPill(label = "Cold Start", value = "${store.performance.coldStartTimeMs} ms")
      }

      // Bottom actions
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "${store.techStack.primaryLanguage} • ${store.techStack.database} • ${store.techStack.apkPayloadSizeMb} MB",
          style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
          color = Slate500
        )

        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
          OutlinedButton(
            onClick = { onToggleCompare() },
            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
            colors = ButtonDefaults.outlinedButtonColors(
              contentColor = if (isComparing) Emerald400 else Slate400
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, if (isComparing) Emerald400 else Slate800),
            shape = RoundedCornerShape(6.dp)
          ) {
            Icon(
              if (isComparing) Icons.Default.Check else Icons.Default.CompareArrows,
              contentDescription = null,
              modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              if (isComparing) "En VS" else "Comparar",
              style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp)
            )
          }

          FilledTonalButton(
            onClick = { onSelect() },
            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
            colors = ButtonDefaults.filledTonalButtonColors(
              containerColor = Emerald900,
              contentColor = Emerald400
            ),
            shape = RoundedCornerShape(6.dp)
          ) {
            Text("Ver Ficha", style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp), fontWeight = FontWeight.Bold)
          }
        }
      }
    }
  }
}

@Composable
fun ScorePill(title: String, score: Float, color: Color) {
  Surface(
    shape = RoundedCornerShape(4.dp),
    color = color.copy(alpha = 0.12f),
    border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.3f))
  ) {
    Row(
      verticalAlignment = Alignment.CenterVertically,
      modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
    ) {
      Text(
        text = "$title: ",
        style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
        fontWeight = FontWeight.Medium,
        color = Slate400
      )
      Text(
        text = String.format("%.1f", score),
        fontFamily = FontFamily.Monospace,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = color
      )
    }
  }
}

@Composable
fun BenchmarkPill(label: String, value: String) {
  Surface(
    shape = RoundedCornerShape(4.dp),
    color = Slate800,
    border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
  ) {
    Row(
      verticalAlignment = Alignment.CenterVertically,
      modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
    ) {
      Text(
        text = "$label: ",
        style = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp),
        color = Slate500
      )
      Text(
        text = value,
        fontFamily = FontFamily.Monospace,
        fontSize = 9.sp,
        fontWeight = FontWeight.Bold,
        color = Emerald400
      )
    }
  }
}
