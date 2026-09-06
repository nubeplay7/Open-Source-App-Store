package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.model.AppStoreInfo
import com.example.ui.theme.*

@Composable
fun ExportModal(
  stores: List<AppStoreInfo>,
  onDismiss: () -> Unit
) {
  val context = LocalContext.current
  val markdownContent = remember(stores) {
    generateMarkdownTable(stores)
  }

  Dialog(onDismissRequest = onDismiss) {
    Surface(
      modifier = Modifier
        .fillMaxWidth(0.95f)
        .fillMaxHeight(0.85f),
      shape = RoundedCornerShape(12.dp),
      border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
      color = Slate950
    ) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(16.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Share, contentDescription = null, tint = Emerald400, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "EXPORTAR MATRIZ COMPARATIVA",
              style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, letterSpacing = 0.5.sp),
              fontWeight = FontWeight.Bold,
              color = Slate50
            )
          }
          IconButton(onClick = onDismiss) {
            Icon(Icons.Default.Close, contentDescription = "Cerrar", tint = Slate400)
          }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
          text = "Formato Markdown listo para copiar a documentación, GitHub README o reportes técnicos:",
          style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
          color = Slate400
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Monospace preview box
        Surface(
          modifier = Modifier
            .weight(1f)
            .fillMaxWidth(),
          shape = RoundedCornerShape(8.dp),
          border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
          color = Slate900
        ) {
          Box(modifier = Modifier.fillMaxSize().padding(10.dp)) {
            Text(
              text = markdownContent,
              fontFamily = FontFamily.Monospace,
              fontSize = 10.sp,
              modifier = Modifier.verticalScroll(rememberScrollState()),
              color = Slate200
            )
          }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.End,
          verticalAlignment = Alignment.CenterVertically
        ) {
          OutlinedButton(
            onClick = onDismiss,
            shape = RoundedCornerShape(6.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Slate400)
          ) {
            Text("Cerrar", style = MaterialTheme.typography.labelSmall)
          }
          Spacer(modifier = Modifier.width(8.dp))
          Button(
            onClick = {
              val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
              val clip = ClipData.newPlainText("FOSS Store Matrix", markdownContent)
              clipboard.setPrimaryClip(clip)
              Toast.makeText(context, "Tabla copiada al portapapeles", Toast.LENGTH_SHORT).show()
            },
            shape = RoundedCornerShape(6.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Emerald900, contentColor = Emerald400),
            border = androidx.compose.foundation.BorderStroke(1.dp, Emerald600.copy(alpha = 0.4f))
          ) {
            Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Copiar Markdown", style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp), fontWeight = FontWeight.Bold)
          }
        }
      }
    }
  }
}

fun generateMarkdownTable(stores: List<AppStoreInfo>): String {
  val sb = StringBuilder()
  sb.append("# Comparativa Exhaustiva de Alternativas FOSS a Google Play Store\n\n")
  sb.append("| Tienda / App | Categoría | Versión | UX (1-10) | Seguridad (1-10) | Repos (1-10) | RAM Reposo | RAM Index | Cold Start | Sync Speed | Stack UI | Silencioso sin Root | Diferenciador Clave |\n")
  sb.append("|---|---|---|---|---|---|---|---|---|---|---|---|---|\n")

  stores.forEach { s ->
    val silent = if (s.features.unattendedRootlessUpdates) "✅ Sí (Shizuku/Session)" else "❌ Manual"
    sb.append("| **${s.name}** | ${s.category.label} | ${s.latestVersion} | ${s.easeOfUseScore} | ${s.securityScore} | ${s.repoEcosystemScore} | ${s.performance.ramUsageIdleMb} MB | ${s.performance.ramUsageIndexingMb} MB | ${s.performance.coldStartTimeMs} ms | ${s.performance.indexSyncSpeedSec} s | ${s.techStack.uiArchitecture} | $silent | ${s.keyDifferentiator} |\n")
  }

  return sb.toString()
}
