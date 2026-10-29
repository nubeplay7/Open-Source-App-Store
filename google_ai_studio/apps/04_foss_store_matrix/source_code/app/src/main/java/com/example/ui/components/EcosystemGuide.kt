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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*

@Composable
fun EcosystemGuideView() {
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
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.MenuBook, contentDescription = null, tint = Emerald400, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "GUÍA ARQUITECTÓNICA DEL ECOSISTEMA FOSS EN ANDROID",
              style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, letterSpacing = 0.5.sp),
              fontWeight = FontWeight.Bold,
              color = Slate50
            )
          }
          Text(
            text = "Análisis conceptual de paradigmas de distribución de paquetes, protocolos de sincronización y métodos de instalación desatendida en Android.",
            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
            color = Slate400
          )
        }
      }
    }

    // Concept 1: The 4 Paradigms of App Distribution
    item {
      Card(
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        colors = CardDefaults.cardColors(containerColor = Slate900)
      ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text(
            text = "1. LOS 4 PARADIGMAS DE DISTRIBUCIÓN DE APLICACIONES",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, letterSpacing = 0.5.sp),
            fontWeight = FontWeight.Bold,
            color = Emerald400
          )

          ParadigmCard(
            title = "A. Compilación Centralizada (F-Droid Oficial)",
            description = "F-Droid descarga el código fuente y lo compila en sus propios servidores controlados, firmando el APK con su clave propia. Garantiza 0 binarios propietarios opacos, aunque las actualizaciones tardan 2-5 días en procesarse.",
            badge = "Compilación Propia",
            color = Sky400
          )

          ParadigmCard(
            title = "B. Repositorios de Binarios de Autor (IzzyOnDroid / Accrescent)",
            description = "Las aplicaciones son compiladas y firmadas directamente por el desarrollador original. La tienda solo indexa y verifica firmas criptográficas, permitiendo actualizaciones inmediatas el mismo día de lanzamiento.",
            badge = "Firma de Autor",
            color = Emerald400
          )

          ParadigmCard(
            title = "C. Actualizadores Directos de Repositorios (Obtainium)",
            description = "Sin servidores de catálogo intermediarios: la app rastrea directamente la API de GitHub/GitLab/Codeberg y descarga los assets de la sección de Releases cuando el desarrollador publica un nuevo tag.",
            badge = "Día Cero / Sin Intermediarios",
            color = Amber400
          )

          ParadigmCard(
            title = "D. Clientes Proxy de Google Play (Aurora Store)",
            description = "Interactúa con los servidores CDN oficiales de Google Play mediante cuentas de servicio y token dispensers anónimos. Descarga los mismos APKs comerciales que Play Store sin telemetría ni Google Services.",
            badge = "Google Play Proxy",
            color = Violet400
          )
        }
      }
    }

    // Concept 2: Installation Mechanisms Explained
    item {
      Card(
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        colors = CardDefaults.cardColors(containerColor = Slate900)
      ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text(
            text = "2. MÉTODOS DE INSTALACIÓN: ¿CÓMO ACTUALIZAR SIN PULSAR 'ACEPTAR'?",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, letterSpacing = 0.5.sp),
            fontWeight = FontWeight.Bold,
            color = Emerald400
          )

          InstallMethodExplanation(
            name = "SessionInstaller de Android 12+ (Sin Root)",
            desc = "Google introdujo APIs que permiten a una tienda que instaló originalmente una app actualizarla en segundo plano sin pedir confirmación manual al usuario, siempre que no pida permisos nuevos peligrosos."
          )

          InstallMethodExplanation(
            name = "Shizuku (Sin Root vía depuración inalámbrica ADB)",
            desc = "Shizuku expone APIs de nivel de sistema con permisos privilegiados de shell a aplicaciones de terceros. Permite a Droid-ify, Neo Store y Obtainium realizar instalaciones 100% silenciosas sin modificar el sistema."
          )

          InstallMethodExplanation(
            name = "Privileged Extension (Sistema / Magisk / KernelSU)",
            desc = "Módulo instalado en la partición de sistema (`/system/priv-app`) que otorga a F-Droid o Aurora permisos nativos de instalador maestro del sistema operativo."
          )
        }
      }
    }

    // Concept 3: Privacy & Tracker Auditing (Exodus)
    item {
      Card(
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
        colors = CardDefaults.cardColors(containerColor = Slate900)
      ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text(
            text = "3. AUDITORÍA DE PRIVACIDAD CON EXODUS PRIVACY",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, letterSpacing = 0.5.sp),
            fontWeight = FontWeight.Bold,
            color = Emerald400
          )
          Text(
            text = "Tiendas como Neo Store, Aurora Store y App Manager integran la base de firmas de Exodus Privacy. Al ver una ficha de app, analizan las clases compiladas en el DEX para detectar librerías de rastreo comercial (Facebook SDK, Google Analytics, AppsFlyer, Adjust, etc.) antes de que instales la aplicación.",
            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
            color = Slate300
          )
        }
      }
    }
  }
}

@Composable
fun ParadigmCard(title: String, description: String, badge: String, color: Color) {
  Surface(
    shape = RoundedCornerShape(6.dp),
    color = Slate950,
    border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.35f)),
    modifier = Modifier.fillMaxWidth()
  ) {
    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(text = title, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), fontWeight = FontWeight.Bold, color = color)
        Surface(shape = RoundedCornerShape(4.dp), color = color.copy(alpha = 0.15f), border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.3f))) {
          Text(text = badge, style = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp), fontWeight = FontWeight.Bold, color = color, modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp))
        }
      }
      Text(text = description, style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp), color = Slate400)
    }
  }
}

@Composable
fun InstallMethodExplanation(name: String, desc: String) {
  Column(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
    Row(verticalAlignment = Alignment.CenterVertically) {
      Icon(Icons.Default.Bolt, contentDescription = null, tint = Emerald400, modifier = Modifier.size(14.dp))
      Spacer(modifier = Modifier.width(6.dp))
      Text(text = name, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), fontWeight = FontWeight.Bold, color = Slate100)
    }
    Text(text = desc, style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp), color = Slate400, modifier = Modifier.padding(start = 20.dp))
  }
}
