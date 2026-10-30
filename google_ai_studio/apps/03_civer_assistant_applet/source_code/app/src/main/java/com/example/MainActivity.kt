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

data class ChatMessage(val id: String, val role: String, val text: String, val timestamp: String)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF0F172A),
                    surface = Color(0xFF1E293B),
                    primary = Color(0xFF10B981),
                    secondary = Color(0xFF38BDF8),
                    onBackground = Color(0xFFF8FAFC),
                    onSurface = Color(0xFFE2E8F0)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    CiverAssistantScreen()
                }
            }
        }
    }
}

@Composable
fun CiverAssistantScreen() {
    var inputText by remember { mutableStateOf("") }
    var selectedModel by remember { mutableStateOf("Gemini 2.5 Pro") }
    val messages = remember {
        mutableStateListOf(
            ChatMessage("1", "assistant", "¡Hola! Soy el asistente inteligente de Civer FOSS Store Matrix. ¿En qué puedo ayudarte hoy?", "02:30"),
            ChatMessage("2", "user", "¿Qué aplicaciones libres están verificadas para compilar en la nube?", "02:31"),
            ChatMessage("3", "assistant", "Actualmente contamos con un catálogo verificado que incluye FOSS Store Matrix, Parallel Space Cloner, OmniComm P2P, VoxVerse Audio Studio, AgentWorkflow y SyncCluster.", "02:31")
        )
    }

    val quickPrompts = listOf(
        "Verificar estado de la flota",
        "Auditar trackers en APK",
        "Generar llaves Ed25519",
        "Consultar licencias FOSS"
    )

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
                        imageVector = Icons.Default.Face,
                        contentDescription = null,
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text("Civer Assistant", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF8FAFC))
                    Text("Sovereign Store AI Copilot", fontSize = 11.sp, color = Color(0xFF94A3B8))
                }
            }
            Badge(containerColor = Color(0xFF10B981)) {
                Text(selectedModel, color = Color.White, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Selector de modelo
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Gemini 2.5 Pro", "Gemini 2.5 Flash", "OmniRouter Local").forEach { model ->
                FilterChip(
                    selected = selectedModel == model,
                    onClick = { selectedModel = model },
                    label = { Text(model, fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF10B981),
                        selectedLabelColor = Color.White
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Sugerencias rápidas
        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(quickPrompts) { prompt ->
                SuggestionChip(
                    onClick = {
                        messages.add(ChatMessage("${messages.size + 1}", "user", prompt, "02:35"))
                        messages.add(ChatMessage("${messages.size + 2}", "assistant", "Comando \"$prompt\" procesado exitosamente por $selectedModel.", "02:35"))
                    },
                    label = { Text(prompt, fontSize = 10.sp, color = Color(0xFF38BDF8)) }
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Lista de Mensajes
        Card(
            modifier = Modifier.fillMaxWidth().weight(1f),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A))
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(messages) { msg ->
                    val isUser = msg.role == "user"
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
                    ) {
                        Card(
                            shape = RoundedCornerShape(
                                topStart = 14.dp,
                                topEnd = 14.dp,
                                bottomStart = if (isUser) 14.dp else 2.dp,
                                bottomEnd = if (isUser) 2.dp else 14.dp
                            ),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isUser) Color(0xFF0284C7) else Color(0xFF1E293B)
                            ),
                            modifier = Modifier.widthIn(max = 280.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = msg.text,
                                    fontSize = 12.sp,
                                    color = if (isUser) Color.White else Color(0xFFE2E8F0)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = msg.timestamp,
                                    fontSize = 9.sp,
                                    color = if (isUser) Color(0xFFBAE6FD) else Color(0xFF64748B),
                                    modifier = Modifier.align(Alignment.End)
                                )
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Input de mensaje
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Escribe una consulta al asistente...", fontSize = 11.sp, color = Color(0xFF64748B)) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFF334155),
                    focusedTextColor = Color(0xFFF8FAFC),
                    unfocusedTextColor = Color(0xFFE2E8F0)
                )
            )
            Button(
                onClick = {
                    if (inputText.isNotBlank()) {
                        messages.add(ChatMessage("${messages.size + 1}", "user", inputText, "02:36"))
                        messages.add(ChatMessage("${messages.size + 2}", "assistant", "Respuesta analizada con $selectedModel: Operación registrada en el Búnker Central.", "02:36"))
                        inputText = ""
                    }
                },
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
            ) {
                Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
            }
        }
    }
}
