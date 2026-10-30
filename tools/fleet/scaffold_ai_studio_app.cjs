/**
 * scaffold_ai_studio_app.cjs
 * Generador automático de proyectos nativos Android (Kotlin + Jetpack Compose)
 * a partir de especificaciones y applets de Google AI Studio.
 * 
 * Cumple con:
 * - Regla 5: Cloud-Only Compilation (genera proyectos compatibles con Gradle 9.3.1 y AGP 9.1.1 en GitHub Actions).
 * - Regla 11: Honestidad Epistémica (IDs de paquete y binarios únicos).
 * - Regla 7: Río Subterráneo (sin interfaces interactivas).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const TEMPLATE_DIR = path.join(ROOT_DIR, 'google_ai_studio/templates/golden_native_chassis');
const WORKFLOW_FILE = path.join(ROOT_DIR, '.github/workflows/build-native-apps.yml');
const DEPLOYER_FILE = path.join(ROOT_DIR, 'tools/fleet/civer_cloud_deployer.cjs');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const ent of entries) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function scaffoldApp(appId, applicationId, appName, subtitle = "Civer Sovereign Applet") {
  console.log(`\n==================================================`);
  console.log(`[Scaffolder] Ensamblando proyecto nativo: ${appId}`);
  console.log(`  Package: ${applicationId}`);
  console.log(`  Nombre:  ${appName}`);
  console.log(`==================================================`);

  const appDir = path.join(ROOT_DIR, 'google_ai_studio/apps', appId);
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }

  const sourceCodeDir = path.join(appDir, 'source_code');
  if (fs.existsSync(sourceCodeDir)) {
    console.log(`  [AVISO] source_code ya existía. Reemplazando con Golden Chassis limpio...`);
    fs.rmSync(sourceCodeDir, { recursive: true, force: true });
  }

  // 1. Clonar chasis
  copyRecursive(TEMPLATE_DIR, sourceCodeDir);

  // 2. Personalizar app/build.gradle.kts
  const appGradlePath = path.join(sourceCodeDir, 'app/build.gradle.kts');
  let appGradle = fs.readFileSync(appGradlePath, 'utf8');
  appGradle = appGradle.replace('__APPLICATION_ID__', applicationId);
  fs.writeFileSync(appGradlePath, appGradle, 'utf8');

  // 3. Personalizar strings.xml
  const stringsPath = path.join(sourceCodeDir, 'app/src/main/res/values/strings.xml');
  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${appName}</string>
</resources>`;
  fs.writeFileSync(stringsPath, stringsXml, 'utf8');

  // 4. Crear MainActivity.kt nativo con Jetpack Compose
  const javaDir = path.join(sourceCodeDir, 'app/src/main/java/com/example');
  fs.mkdirSync(javaDir, { recursive: true });

  const mainActivityKt = `package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF0F172A),
                    surface = Color(0xFF1E293B),
                    primary = Color(0xFF10B981),
                    onPrimary = Color.White,
                    onBackground = Color(0xFFF8FAFC),
                    onSurface = Color(0xFFF8FAFC)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppletScreen(
                        appId = "${appId}",
                        appName = "${appName}",
                        appSubtitle = "${subtitle}",
                        applicationId = "${applicationId}"
                    )
                }
            }
        }
    }
}

@Composable
fun AppletScreen(
    appId: String,
    appName: String,
    appSubtitle: String,
    applicationId: String
) {
    var isRunning by remember { mutableStateOf(true) }
    var eventCounter by remember { mutableIntStateOf(1) }
    val logs = remember { mutableStateListOf("Sistema inicializado correctamente.", "Conectado al nodo local.") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(16.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        Text(
                            text = appName,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFF8FAFC)
                        )
                        Text(
                            text = appSubtitle,
                            fontSize = 13.sp,
                            color = Color(0xFF94A3B8)
                        )
                    }
                    Badge(
                        containerColor = if (isRunning) Color(0xFF10B981) else Color(0xFF64748B)
                    ) {
                        Text(
                            text = if (isRunning) "ACTIVO" else "PAUSADO",
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "ID: " + applicationId,
                    fontSize = 11.sp,
                    color = Color(0xFF64748B)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = {
                    isRunning = !isRunning
                    logs.add("Estado alternado: " + (if (isRunning) "Activo" else "Pausado"))
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isRunning) Color(0xFFEF4444) else Color(0xFF10B981)
                )
            ) {
                Icon(
                    imageVector = if (isRunning) Icons.Default.Info else Icons.Default.PlayArrow,
                    contentDescription = null
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(if (isRunning) "Pausar" else "Reanudar")
            }

            OutlinedButton(
                onClick = {
                    eventCounter++
                    logs.add("Ping emitido #" + eventCounter + " en la malla.")
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(imageVector = Icons.Default.Refresh, contentDescription = null)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Emitir Pulso")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Telemetría y Eventos en Vivo",
            fontWeight = FontWeight.SemiBold,
            fontSize = 14.sp,
            color = Color(0xFFCBD5E1)
        )

        Spacer(modifier = Modifier.height(8.dp))

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF020617))
        ) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                items(logs.reversed()) { logEntry ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = logEntry,
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
    }
}
`;
  fs.writeFileSync(path.join(javaDir, 'MainActivity.kt'), mainActivityKt, 'utf8');

  // 5. Actualizar build-native-apps.yml
  let wf = fs.readFileSync(WORKFLOW_FILE, 'utf8');
  if (!wf.includes(`"${appId}":`)) {
    wf = wf.replace(
      '"10_omnistore_hub": "9.3.1",',
      `"10_omnistore_hub": "9.3.1",\n            "${appId}": "9.3.1",`
    );
    fs.writeFileSync(WORKFLOW_FILE, wf, 'utf8');
    console.log(`  [OK] Registrado ${appId} en workflow de GitHub Actions`);
  }

  // 6. Actualizar civer_cloud_deployer.cjs
  let dep = fs.readFileSync(DEPLOYER_FILE, 'utf8');
  if (!dep.includes(`'${appId}':`)) {
    const metaBlock = `  '${appId}': {\n    packageName: '${applicationId}',\n    name: '${appName}'\n  },\n`;
    dep = dep.replace("const APPS_METADATA = {\n", "const APPS_METADATA = {\n" + metaBlock);
    fs.writeFileSync(DEPLOYER_FILE, dep, 'utf8');
    console.log(`  [OK] Registrado ${appId} en civer_cloud_deployer.cjs`);
  }

  console.log(`  [ÉXITO] ${appId} ensamblado y listo para compilación en la nube.`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log("Uso: node scaffold_ai_studio_app.cjs <appId> <applicationId> <appName> [subtitle]");
    process.exit(1);
  }
  scaffoldApp(args[0], args[1], args[2], args[3]);
}

module.exports = { scaffoldApp };
