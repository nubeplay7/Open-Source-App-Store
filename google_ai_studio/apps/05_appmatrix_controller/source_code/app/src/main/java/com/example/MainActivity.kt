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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class ManagedDevice(
    val id: String,
    val name: String,
    val model: String,
    val ip: String,
    val batteryPct: Int,
    val tempC: Float,
    var isEnabled: Boolean,
    val appsInstalledCount: Int
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF0B132B),
                    surface = Color(0xFF1C2541),
                    primary = Color(0xFF48CAE4),
                    secondary = Color(0xFF5BC0BE),
                    onBackground = Color(0xFFF8FAFC),
                    onSurface = Color(0xFFE2E8F0)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppMatrixControllerScreen()
                }
            }
        }
    }
}

@Composable
fun AppMatrixControllerScreen() {
    val devices = remember {
        mutableStateListOf(
            ManagedDevice("dev-01", "Vivo V2341", "V2339C (Android 14)", "192.168.1.133:5555", 91, 28.5f, true, 10),
            ManagedDevice("dev-02", "Samsung Galaxy A06", "SM-A065M (Android 14)", "192.168.1.105:5555", 84, 30.1f, true, 8),
            ManagedDevice("dev-03", "ThinkPad T480s Gateway", "Linux Pop!_OS 22.04", "100.115.92.2:22", 100, 42.0f, true, 18),
            ManagedDevice("dev-04", "Lenovo M720q Server", "Windows 11 Pro Core", "192.168.1.200:5037", 100, 39.5f, true, 24)
        )
    }

    val actionLogs = remember {
        mutableStateListOf(
            "Controlador AppMatrix inicializado.",
            "Handshake ADB exitoso con 4 nodos.",
            "Canal seguro Ed25519 activo."
        )
    }

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
                        .background(Color(0xFF0284C7).copy(alpha = 0.2f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = null,
                        tint = Color(0xFF38BDF8),
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text("AppMatrix Controller", fontSize = 19.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF8FAFC))
                    Text("Multi-Device Fleet & App Lifecycle", fontSize = 11.sp, color = Color(0xFF94A3B8))
                }
            }
            Badge(containerColor = Color(0xFF0284C7)) {
                Text("4/4 ONLINE", color = Color.White, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Métricas globales de la matriz
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1C2541))
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text("Batería Promedio", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    Text("93.7%", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                }
            }
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1C2541))
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text("Apps Totales", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    Text("60 Activas", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF38BDF8))
                }
            }
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1C2541))
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text("Temp Media", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    Text("35.0 °C", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B))
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Lista de dispositivos controlados
        Text("Dispositivos Bajo Control", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFCBD5E1))
        Spacer(modifier = Modifier.height(6.dp))

        LazyColumn(
            modifier = Modifier.fillMaxWidth().weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(devices) { dev ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1C2541))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(dev.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF8FAFC))
                                Text("${dev.model} • ${dev.ip}", fontSize = 10.sp, color = Color(0xFF94A3B8))
                            }
                            Switch(
                                checked = dev.isEnabled,
                                onCheckedChange = {
                                    dev.isEnabled = it
                                    actionLogs.add("${dev.name}: Estado cambiado a " + if (it) "HABILITADO" else "EN REPOSO")
                                },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = Color(0xFF10B981)
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Batería: ${dev.batteryPct}% | Temp: ${dev.tempC}°C", fontSize = 10.sp, color = Color(0xFF38BDF8))
                            Text("${dev.appsInstalledCount} paquetes", fontSize = 10.sp, color = Color(0xFF9CA3AF))
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Acciones rápidas de orquestación
        Text("Comandos de Flota", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFCBD5E1))
        Spacer(modifier = Modifier.height(6.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = {
                    actionLogs.add("Captura de pantalla solicitada a todos los nodos.")
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7))
            ) {
                Icon(imageVector = Icons.Default.Info, contentDescription = null, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Capturar Frame", fontSize = 10.sp)
            }

            Button(
                onClick = {
                    actionLogs.add("Comando 'sync-packages' despachado a la malla.")
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
            ) {
                Icon(imageVector = Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Sincronizar Apps", fontSize = 10.sp)
            }
        }
    }
}
