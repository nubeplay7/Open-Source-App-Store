package com.example

import android.os.Bundle
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.util.Locale

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var isTtsReady by mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tts = TextToSpeech(this, this)

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF090D16),
                    surface = Color(0xFF131B2E),
                    primary = Color(0xFF38BDF8),
                    secondary = Color(0xFFA855F7),
                    onBackground = Color(0xFFF1F5F9),
                    onSurface = Color(0xFFE2E8F0)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    VoxVerseScreen(
                        isTtsReady = isTtsReady,
                        onSpeak = { text, pitch, speed ->
                            tts?.setPitch(pitch)
                            tts?.setSpeechRate(speed)
                            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "voxverse_id")
                        },
                        onStop = {
                            tts?.stop()
                        }
                    )
                }
            }
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale("es", "MX"))
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts?.setLanguage(Locale.US)
            }
            isTtsReady = true
        }
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }
}

@Composable
fun VoxVerseScreen(
    isTtsReady: Boolean,
    onSpeak: (String, Float, Float) -> Unit,
    onStop: () -> Unit
) {
    var promptText by remember { mutableStateOf("Hola. Este es el motor bioneural VoxVerse operando en vivo sobre el hardware del dispositivo.") }
    var pitch by remember { mutableFloatStateOf(1.0f) }
    var speed by remember { mutableFloatStateOf(1.0f) }
    var selectedPreset by remember { mutableStateOf("Dalia Soberana (Neural)") }
    var isSynthesizing by remember { mutableStateOf(false) }
    val speechLog = remember { mutableStateListOf("Motor bioneural VoxVerse cargado.", "Soporte de síntesis en español e inglés inicializado.") }

    val infiniteTransition = rememberInfiniteTransition(label = "wave")
    val waveOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1500, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "waveOffset"
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
                        .background(Color(0xFF8B5CF6).copy(alpha = 0.2f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = null,
                        tint = Color(0xFFA855F7),
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "VoxVerse Studio",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFF8FAFC)
                    )
                    Text(
                        text = "Bioneural Audio & Speech Lab",
                        fontSize = 12.sp,
                        color = Color(0xFF94A3B8)
                    )
                }
            }
            Badge(
                containerColor = if (isTtsReady) Color(0xFF10B981) else Color(0xFFEF4444)
            ) {
                Text(
                    text = if (isTtsReady) "MOTOR ONLINE" else "CARGANDO",
                    fontSize = 10.sp,
                    color = Color.White,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Visualizador espectral de onda
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(90.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF131B2E))
        ) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Canvas(modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
                    val canvasWidth = size.width
                    val canvasHeight = size.height
                    val centerY = canvasHeight / 2
                    val bars = 32
                    val barWidth = canvasWidth / bars

                    for (i in 0 until bars) {
                        val phase = (i * 12 + waveOffset) * (Math.PI / 180.0)
                        val amplitude = if (isSynthesizing) {
                            (Math.sin(phase) * (canvasHeight * 0.4)).toFloat()
                        } else {
                            (Math.sin(phase) * (canvasHeight * 0.15)).toFloat()
                        }
                        val x = i * barWidth + barWidth / 2
                        drawLine(
                            color = if (i % 2 == 0) Color(0xFF38BDF8) else Color(0xFFA855F7),
                            start = Offset(x, centerY - amplitude),
                            end = Offset(x, centerY + amplitude),
                            strokeWidth = 6.dp.toPx()
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Entrada de texto para sintetizar
        OutlinedTextField(
            value = promptText,
            onValueChange = { promptText = it },
            label = { Text("Texto a sintetizar (TTS)", color = Color(0xFF94A3B8)) },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 3,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFF38BDF8),
                unfocusedBorderColor = Color(0xFF334155),
                focusedTextColor = Color(0xFFF1F5F9),
                unfocusedTextColor = Color(0xFFE2E8F0)
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Controles de síntesis: Tono (Pitch) y Velocidad (Speed)
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF131B2E))
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Tono (Pitch)", fontSize = 11.sp, color = Color(0xFF94A3B8))
                        Text(String.format("%.1fx", pitch), fontSize = 11.sp, color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold)
                    }
                    Slider(
                        value = pitch,
                        onValueChange = { pitch = it },
                        valueRange = 0.5f..2.0f,
                        colors = SliderDefaults.colors(thumbColor = Color(0xFF38BDF8), activeTrackColor = Color(0xFF38BDF8))
                    )
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF131B2E))
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Velocidad", fontSize = 11.sp, color = Color(0xFF94A3B8))
                        Text(String.format("%.1fx", speed), fontSize = 11.sp, color = Color(0xFFA855F7), fontWeight = FontWeight.Bold)
                    }
                    Slider(
                        value = speed,
                        onValueChange = { speed = it },
                        valueRange = 0.5f..2.0f,
                        colors = SliderDefaults.colors(thumbColor = Color(0xFFA855F7), activeTrackColor = Color(0xFFA855F7))
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Botones de acción
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = {
                    if (isTtsReady && promptText.isNotBlank()) {
                        isSynthesizing = true
                        onSpeak(promptText, pitch, speed)
                        speechLog.add("Sintetizado: \"${promptText.take(24)}...\" | P:${String.format("%.1f", pitch)} S:${String.format("%.1f", speed)}")
                    }
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7))
            ) {
                Icon(imageVector = Icons.Default.PlayArrow, contentDescription = null)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Sintetizar & Play")
            }

            OutlinedButton(
                onClick = {
                    isSynthesizing = false
                    onStop()
                    speechLog.add("Reproducción de audio detenida.")
                },
                modifier = Modifier.weight(0.7f),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFEF4444))
            ) {
                Icon(imageVector = Icons.Default.Clear, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Detener")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "Bitácora de Eventos de Audio y VAD",
            fontWeight = FontWeight.SemiBold,
            fontSize = 13.sp,
            color = Color(0xFF94A3B8)
        )

        Spacer(modifier = Modifier.height(6.dp))

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF060911))
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                items(speechLog.reversed()) { entry ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            tint = Color(0xFF38BDF8),
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = entry, color = Color(0xFFCBD5E1), fontSize = 11.sp)
                    }
                }
            }
        }
    }
}
