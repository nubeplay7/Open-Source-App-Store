package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class ClusterNode(
    val name: String,
    val endpoint: String,
    val type: String,
    val batteryPct: Int,
    val isOnline: Boolean
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF040711),
                    surface = Color(0xFF0F172A),
                    primary = Color(0xFF10B981),
                    secondary = Color(0xFF06B6D4),
                    onBackground = Color(0xFFF8FAFC),
                    onSurface = Color(0xFFE2E8F0)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SyncClusterScreen()
                }
            }
        }
    }
}

@Composable
fun SyncClusterScreen() {
    val clusterNodes = remember {
        mutableStateListOf(
            ClusterNode("Vivo V2341 (Local)", "192.168.1.133:5555", "ADB Wi-Fi", 91, true),
            ClusterNode("Samsung Galaxy A06", "192.168.1.105:5555", "ADB over SSH", 84, true),
            ClusterNode("ThinkPad T480s Gateway", "100.115.92.2:22", "Tailscale DERP", 100, true),
            ClusterNode("Lenovo ThinkCentre M720q", "192.168.1.200:5037", "PM2 Panopticon", 100, true)
        )
    }

    var activeEd25519Key by remember { mutableStateOf("ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOmeg47b8FossMeshKey2026") }
    var terminalOutput by remember { mutableStateOf("SyncCluster Daemon v2.4 online.\nSocket TCP 5037 enrutado correctamente.\nDispositivos sincronizados: 4/4") }
    var customCommand by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(16.dp)
    ) {
        // Encabezado
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(Color(0xFF10B981).copy(alpha = 0.2f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = null,
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "SyncCluster",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFF8FAFC)
                    )
                    Text(
                        text = "Multi-Node ADB & Keystore Manager",
                        fontSize = 11.sp,
                        color = Color(0xFF94A3B8)
                    )
                }
            }
            Badge(containerColor = Color(0xFF10B981)) {
                Text("CLÚSTER ACTIVO", color = Color.White, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Tarjeta de Llave Criptográfica Ed25519
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A))
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Lock, contentDescription = null, tint = Color(0xFF06B6D4), modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Llave Ed25519 Soberana", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE2E8F0))
                    }
                    Text("SHA-256: 8f4b...c31e", fontSize = 9.sp, color = Color(0xFF64748B))
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = activeEd25519Key,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    color = Color(0xFF38BDF8),
                    maxLines = 1
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Lista de Nodos
        Text("Nodos del Clúster Físico", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFCBD5E1))
        Spacer(modifier = Modifier.height(6.dp))

        LazyColumn(
            modifier = Modifier.fillMaxWidth().weight(0.9f),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(clusterNodes) { node ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0D1527))
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(node.name, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFF8FAFC))
                            Text("${node.type} | ${node.endpoint}", fontSize = 10.sp, color = Color(0xFF94A3B8))
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("${node.batteryPct}%", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(modifier = Modifier.size(8.dp).background(Color(0xFF10B981), CircleShape))
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Terminal ADB Integrada
        Text("Consola Forense de Comandos Clúster", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFCBD5E1))
        Spacer(modifier = Modifier.height(6.dp))

        // Botones de presets rápidos
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Button(
                onClick = {
                    terminalOutput = "> adb shell dumpsys battery\n  AC powered: false\n  USB powered: true\n  Wireless powered: false\n  level: 91\n  scale: 100\n  voltage: 4320mV\n  temperature: 28.4C\n  technology: Li-poly"
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(6.dp),
                contentPadding = PaddingValues(horizontal = 4.dp, vertical = 4.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))
            ) {
                Text("Batería", fontSize = 10.sp, color = Color(0xFF38BDF8))
            }

            Button(
                onClick = {
                    terminalOutput = "> adb shell pm list packages | grep aistudio\n  package:com.aistudio.voxverse.synth\n  package:com.aistudio.agentworkflow.orchestrator\n  package:com.aistudio.synccluster.mesh\n  package:com.aistudio.assistant.applet\n  package:com.aistudio.appmatrix.controller"
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(6.dp),
                contentPadding = PaddingValues(horizontal = 4.dp, vertical = 4.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))
            ) {
                Text("Apps FOSS", fontSize = 10.sp, color = Color(0xFF10B981))
            }

            Button(
                onClick = {
                    terminalOutput = "> adb shell getprop ro.product.model\n  V2341\n> adb shell getprop ro.build.version.release\n  14\n> adb shell uname -r\n  5.15.123-android14-g42"
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(6.dp),
                contentPadding = PaddingValues(horizontal = 4.dp, vertical = 4.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))
            ) {
                Text("Info SO", fontSize = 10.sp, color = Color(0xFFA855F7))
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Visor de Terminal
        Card(
            modifier = Modifier.fillMaxWidth().weight(1f),
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF000000))
        ) {
            LazyColumn(modifier = Modifier.fillMaxSize().padding(10.dp)) {
                item {
                    Text(
                        text = terminalOutput,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        color = Color(0xFF22C55E),
                        lineHeight = 14.sp
                    )
                }
            }
        }
    }
}
