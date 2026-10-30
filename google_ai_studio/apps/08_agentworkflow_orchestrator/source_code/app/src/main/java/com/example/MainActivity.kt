package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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

data class AgentNode(
    val id: String,
    val name: String,
    val role: String,
    val model: String,
    val status: String,
    val tasksCompleted: Int
)

data class DagTask(
    val id: String,
    val title: String,
    val assignedNode: String,
    var state: String, // PENDING, RUNNING, COMPLETED
    val progress: Float
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF0A0F1D),
                    surface = Color(0xFF151D30),
                    primary = Color(0xFF6366F1),
                    secondary = Color(0xFF10B981),
                    onBackground = Color(0xFFF8FAFC),
                    onSurface = Color(0xFFF8FAFC)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AgentWorkflowScreen()
                }
            }
        }
    }
}

@Composable
fun AgentWorkflowScreen() {
    val nodes = remember {
        mutableStateListOf(
            AgentNode("node_asus", "ASUS Master", "Lead Planner", "Gemini 2.5 Pro", "ACTIVE", 48),
            AgentNode("node_thinkpad", "ThinkPad T480s", "Tool Worker", "Gemini 2.5 Flash", "ACTIVE", 72),
            AgentNode("node_lenovo", "Lenovo Edge", "Safety Sentinel", "Claude 3.7 Sonnet", "IDLE", 34),
            AgentNode("node_galaxy", "Galaxy A06", "Hardware Node", "Local SLM", "ONLINE", 19)
        )
    }

    val dagTasks = remember {
        mutableStateListOf(
            DagTask("T-101", "Triangulación forense de binarios", "ASUS Master", "COMPLETED", 1.0f),
            DagTask("T-102", "Compilación distribuida en Cloud", "ThinkPad T480s", "RUNNING", 0.65f),
            DagTask("T-103", "Verificación criptográfica SHA-256", "Lenovo Edge", "PENDING", 0.0f),
            DagTask("T-104", "Despliegue e inyección ADB silencioso", "Galaxy A06", "PENDING", 0.0f)
        )
    }

    var isExecutingPipeline by remember { mutableStateOf(false) }
    var newTaskTitle by remember { mutableStateOf("") }
    val executionLogs = remember { mutableStateListOf("Motor DAG cargado. Topología de malla conectada.") }

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
                        .background(Color(0xFF6366F1).copy(alpha = 0.2f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = null,
                        tint = Color(0xFF818CF8),
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "AgentWorkflow",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFF8FAFC)
                    )
                    Text(
                        text = "Autonomous Swarm DAG & Pipeline Director",
                        fontSize = 11.sp,
                        color = Color(0xFF94A3B8)
                    )
                }
            }
            Badge(containerColor = Color(0xFF10B981)) {
                Text("4 NODOS", color = Color.White, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Nodos activos en la malla
        Text("Nodos del Enjambre (Swarm Topology)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFCBD5E1))
        Spacer(modifier = Modifier.height(8.dp))

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(nodes) { node ->
                Card(
                    modifier = Modifier.width(160.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF151D30))
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(node.name, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFFF1F5F9))
                            Box(modifier = Modifier.size(8.dp).background(if (node.status == "ACTIVE") Color(0xFF10B981) else Color(0xFFF59E0B), CircleShape))
                        }
                        Text(node.role, fontSize = 10.sp, color = Color(0xFF94A3B8))
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(node.model, fontSize = 9.sp, color = Color(0xFF818CF8))
                        Text("${node.tasksCompleted} tareas resueltas", fontSize = 9.sp, color = Color(0xFF64748B))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Pipeline DAG en Ejecución
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Pipeline DAG Activo", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFCBD5E1))
            Button(
                onClick = {
                    isExecutingPipeline = !isExecutingPipeline
                    if (isExecutingPipeline) {
                        executionLogs.add("Pipeline DAG iniciado. Transición T-102 -> T-103 despachada.")
                    } else {
                        executionLogs.add("Pipeline pausado manualmente.")
                    }
                },
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1))
            ) {
                Icon(imageVector = if (isExecutingPipeline) Icons.Default.Close else Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(if (isExecutingPipeline) "Pausar DAG" else "Ejecutar DAG", fontSize = 11.sp)
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Card(
            modifier = Modifier.fillMaxWidth().weight(1f),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF111827))
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(dagTasks) { task ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF1F2937))
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    val iconColor = when (task.state) {
                                        "COMPLETED" -> Color(0xFF10B981)
                                        "RUNNING" -> Color(0xFF6366F1)
                                        else -> Color(0xFF64748B)
                                    }
                                    Icon(
                                        imageVector = if (task.state == "COMPLETED") Icons.Default.CheckCircle else Icons.Default.Refresh,
                                        contentDescription = null,
                                        tint = iconColor,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(task.title, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFF9FAFB))
                                }
                                Text(task.assignedNode, fontSize = 10.sp, color = Color(0xFF9CA3AF))
                            }
                            if (task.state == "RUNNING") {
                                Spacer(modifier = Modifier.height(6.dp))
                                LinearProgressIndicator(
                                    progress = { task.progress },
                                    modifier = Modifier.fillMaxWidth().height(4.dp),
                                    color = Color(0xFF6366F1),
                                    trackColor = Color(0xFF374151)
                                )
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Agregar nueva tarea al DAG
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
                value = newTaskTitle,
                onValueChange = { newTaskTitle = it },
                placeholder = { Text("Nueva tarea para el DAG...", fontSize = 11.sp, color = Color(0xFF6B7280)) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF6366F1),
                    unfocusedBorderColor = Color(0xFF374151),
                    focusedTextColor = Color(0xFFF9FAFB),
                    unfocusedTextColor = Color(0xFFE5E7EB)
                )
            )
            Button(
                onClick = {
                    if (newTaskTitle.isNotBlank()) {
                        dagTasks.add(DagTask("T-${100 + dagTasks.size + 1}", newTaskTitle, "ASUS Master", "PENDING", 0f))
                        executionLogs.add("Tarea agregada: \"$newTaskTitle\" al DAG.")
                        newTaskTitle = ""
                    }
                },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
            }
        }
    }
}
