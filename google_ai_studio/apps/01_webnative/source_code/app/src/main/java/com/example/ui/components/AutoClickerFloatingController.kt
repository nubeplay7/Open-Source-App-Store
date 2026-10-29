package com.example.ui.components

import android.webkit.WebView
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DragHandle
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Swipe
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.local.AppDatabase
import com.example.data.model.WebMacroEntity
import com.example.ui.dialogs.AutoClickerSettingsDialog
import com.example.ui.theme.AmberEnergy
import com.example.ui.theme.CoralError
import com.example.ui.theme.DeepPurpleContainer
import com.example.ui.theme.ElegantCard
import com.example.ui.theme.LavenderPrimary
import com.example.ui.theme.MintSpeed
import com.example.ui.theme.TextGrayLight
import com.example.ui.theme.TextWhite
import com.example.ui.theme.VividCyan
import com.example.util.AutoClickerEngine
import com.example.util.AutoClickerMode
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.math.roundToInt

/**
 * AutoClickerFloatingController:
 * Draggable Floating HUD Controller modeled precisely after True Developer Studio's Auto Clicker.
 * Provides live Play/Pause, Add Target (+), Add Swipe Gesture (🔀), Remove (-), Target Eye (👁️),
 * Settings (⚙️), Save/Load Profile, and Collapse features right on top of TurboWebView.
 */
@Composable
fun AutoClickerFloatingController(
    webView: WebView?,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val isVisible by AutoClickerEngine.isControllerVisible.collectAsState()
    val isPlaying by AutoClickerEngine.isPlaying.collectAsState()
    val isCollapsed by AutoClickerEngine.isCollapsed.collectAsState()
    val areMarkersVisible by AutoClickerEngine.areMarkersVisible.collectAsState()
    val mode by AutoClickerEngine.mode.collectAsState()
    val clickTargets by AutoClickerEngine.clickTargets.collectAsState()
    val swipeTargets by AutoClickerEngine.swipeTargets.collectAsState()
    val currentCycle by AutoClickerEngine.currentCycle.collectAsState()

    var showSettingsDialog by remember { mutableStateOf(false) }
    var showPresetsDialog by remember { mutableStateOf(false) }
    var showSaveProfileDialog by remember { mutableStateOf(false) }
    var showLoadProfileDialog by remember { mutableStateOf(false) }

    // Draggable position coordinates of the floating controller
    var offsetX by remember { mutableFloatStateOf(16f) }
    var offsetY by remember { mutableFloatStateOf(160f) }

    if (!isVisible) return

    val infiniteTransition = rememberInfiniteTransition(label = "hudGlow")
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 0.95f,
        animationSpec = infiniteRepeatable(
            animation = tween(700, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glowAlpha"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
    ) {
        // Render Draggable HUD Bar
        Box(
            modifier = Modifier
                .offset { IntOffset(offsetX.roundToInt(), offsetY.roundToInt()) }
                .pointerInput(Unit) {
                    detectDragGestures { change, dragAmount ->
                        change.consume()
                        offsetX = (offsetX + dragAmount.x).coerceIn(0f, 850f)
                        offsetY = (offsetY + dragAmount.y).coerceIn(40f, 1600f)
                    }
                }
                .testTag("autoclicker_floating_hud")
        ) {
            if (isCollapsed) {
                // Mini Floating Bubble
                Surface(
                    shape = CircleShape,
                    color = ElegantCard,
                    border = androidx.compose.foundation.BorderStroke(
                        2.dp,
                        if (isPlaying) MintSpeed.copy(alpha = glowAlpha) else LavenderPrimary
                    ),
                    shadowElevation = 8.dp,
                    modifier = Modifier
                        .size(54.dp)
                        .clickable { AutoClickerEngine.toggleCollapsed() }
                ) {
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                        Icon(
                            imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.TouchApp,
                            contentDescription = "Expandir AutoClicker",
                            tint = if (isPlaying) MintSpeed else LavenderPrimary,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }
            } else {
                // Full Expanded Vertical Toolbar (Replicating True Developer Studio's Auto Clicker)
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = ElegantCard.copy(alpha = 0.95f),
                    border = androidx.compose.foundation.BorderStroke(
                        1.5.dp,
                        if (isPlaying) MintSpeed.copy(alpha = glowAlpha) else LavenderPrimary.copy(alpha = 0.8f)
                    ),
                    shadowElevation = 12.dp,
                    modifier = Modifier.width(62.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(vertical = 8.dp, horizontal = 4.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        // Drag Handle & Minimize button
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(DeepPurpleContainer)
                                .clickable { AutoClickerEngine.toggleCollapsed() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.DragHandle,
                                contentDescription = "Arrastrar / Minimizar",
                                tint = TextGrayLight,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        // 1. PLAY / PAUSE BUTTON
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(
                                    if (isPlaying) CoralError.copy(alpha = 0.2f) else MintSpeed.copy(alpha = 0.2f)
                                )
                                .border(
                                    2.dp,
                                    if (isPlaying) CoralError else MintSpeed,
                                    CircleShape
                                )
                                .clickable {
                                    AutoClickerEngine.startOrResume(context)
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = if (isPlaying) "Pausar" else "Iniciar",
                                tint = if (isPlaying) CoralError else MintSpeed,
                                modifier = Modifier.size(28.dp)
                            )
                        }

                        // 2. ADD CLICK TARGET (+)
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(DeepPurpleContainer)
                                .border(1.dp, LavenderPrimary.copy(alpha = 0.6f), CircleShape)
                                .clickable { AutoClickerEngine.addClickTarget(context) },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Add,
                                contentDescription = "Añadir Punto",
                                tint = LavenderPrimary,
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        // 3. ADD SWIPE GESTURE (🔀)
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(DeepPurpleContainer)
                                .border(1.dp, VividCyan.copy(alpha = 0.6f), CircleShape)
                                .clickable { AutoClickerEngine.addSwipeTarget(context) },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Swipe,
                                contentDescription = "Añadir Deslizamiento",
                                tint = VividCyan,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        // 4. REMOVE TARGET (-)
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(DeepPurpleContainer)
                                .border(1.dp, CoralError.copy(alpha = 0.4f), CircleShape)
                                .clickable { AutoClickerEngine.removeLastTarget(context) },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Remove,
                                contentDescription = "Quitar Punto",
                                tint = CoralError,
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        // 5. TOGGLE VISIBILITY OF TARGETS (👁️)
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(DeepPurpleContainer)
                                .border(1.dp, AmberEnergy.copy(alpha = 0.5f), CircleShape)
                                .clickable { AutoClickerEngine.toggleMarkersVisibility() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (areMarkersVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = "Mostrar / Ocultar Puntos",
                                tint = AmberEnergy,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        // 6. SETTINGS (⚙️)
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(DeepPurpleContainer)
                                .border(1.dp, TextWhite.copy(alpha = 0.3f), CircleShape)
                                .clickable { showSettingsDialog = true },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Settings,
                                contentDescription = "Configuración",
                                tint = TextWhite,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        // 7. PRESET TEMPLATES (🌟)
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(DeepPurpleContainer)
                                .border(1.dp, AmberEnergy.copy(alpha = 0.6f), CircleShape)
                                .clickable { showPresetsDialog = true },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.AutoAwesome,
                                contentDescription = "Plantillas Rápidas",
                                tint = AmberEnergy,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        // 8. SAVE / LOAD PROFILES (💾)
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(DeepPurpleContainer)
                                .border(1.dp, MintSpeed.copy(alpha = 0.4f), CircleShape)
                                .clickable { showSaveProfileDialog = true },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Save,
                                contentDescription = "Guardar Perfil",
                                tint = MintSpeed,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        // 9. CLOSE HUD (❌)
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .background(CoralError.copy(alpha = 0.2f))
                                .border(1.dp, CoralError.copy(alpha = 0.5f), CircleShape)
                                .clickable { AutoClickerEngine.hideController() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Close,
                                contentDescription = "Cerrar AutoClicker",
                                tint = CoralError,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        // Status Info / Cycles indicator
                        if (currentCycle > 0) {
                            Text(
                                text = "x$currentCycle",
                                color = MintSpeed,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }

    // Settings Modal
    if (showSettingsDialog) {
        AutoClickerSettingsDialog(onDismiss = { showSettingsDialog = false })
    }

    // Presets Modal
    if (showPresetsDialog) {
        AutoClickerPresetsModalDialog(
            onDismiss = { showPresetsDialog = false }
        )
    }

    // Save Profile Modal
    if (showSaveProfileDialog) {
        SaveAutoClickerProfileDialog(
            currentDomain = webView?.url?.let {
                try { android.net.Uri.parse(it).host ?: "*" } catch (_: Exception) { "*" }
            } ?: "*",
            onSaved = { showSaveProfileDialog = false },
            onOpenLoadList = {
                showSaveProfileDialog = false
                showLoadProfileDialog = true
            },
            onDismiss = { showSaveProfileDialog = false }
        )
    }

    // Load Profile Modal
    if (showLoadProfileDialog) {
        LoadAutoClickerProfileDialog(
            onDismiss = { showLoadProfileDialog = false }
        )
    }
}

/**
 * Save current AutoClicker setup as a persistent named Profile / Macro
 */
@Composable
private fun SaveAutoClickerProfileDialog(
    currentDomain: String,
    onSaved: () -> Unit,
    onOpenLoadList: () -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var profileName by remember { mutableStateOf("AutoClicker $currentDomain") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = ElegantCard,
            border = androidx.compose.foundation.BorderStroke(1.5.dp, MintSpeed),
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Save, contentDescription = null, tint = MintSpeed)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Guardar Perfil de AutoClicker", color = TextWhite, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(14.dp))

                OutlinedTextField(
                    value = profileName,
                    onValueChange = { profileName = it },
                    label = { Text("Nombre del Perfil", color = TextGrayLight, fontSize = 12.sp) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextWhite,
                        unfocusedTextColor = TextWhite,
                        focusedBorderColor = MintSpeed,
                        unfocusedBorderColor = DeepPurpleContainer
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Button(
                        onClick = onOpenLoadList,
                        colors = ButtonDefaults.buttonColors(containerColor = DeepPurpleContainer),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.FolderOpen, contentDescription = null, tint = LavenderPrimary, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Cargar...", color = LavenderPrimary, fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            scope.launch {
                                AutoClickerEngine.saveCurrentAsMacro(context, profileName, currentDomain)
                                withContext(Dispatchers.Main) {
                                    Toast.makeText(context, "Perfil guardado con éxito", Toast.LENGTH_SHORT).show()
                                    onSaved()
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MintSpeed),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Guardar", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

/**
 * Load saved AutoClicker Profile
 */
@Composable
private fun LoadAutoClickerProfileDialog(
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var savedMacros by remember { mutableStateOf<List<WebMacroEntity>>(emptyList()) }

    androidx.compose.runtime.LaunchedEffect(Unit) {
        val db = AppDatabase.getDatabase(context)
        withContext(Dispatchers.IO) {
            savedMacros = db.webMacroDao().getAllMacros()
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = ElegantCard,
            border = androidx.compose.foundation.BorderStroke(1.5.dp, LavenderPrimary),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.6f)
                .padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.FolderOpen, contentDescription = null, tint = LavenderPrimary)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Cargar Perfil de Automatización", color = TextWhite, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.weight(1f))
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = null, tint = TextGrayLight)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                if (savedMacros.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No hay perfiles guardados aún", color = TextGrayLight, fontSize = 13.sp)
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(savedMacros) { macro ->
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = DeepPurpleContainer),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        AutoClickerEngine.loadFromSteps(macro.parseSteps())
                                        Toast.makeText(context, "Perfil '${macro.title}' cargado", Toast.LENGTH_SHORT).show()
                                        onDismiss()
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(macro.title, color = TextWhite, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        Text("${macro.targetDomain} • ${macro.stepsSummary}", color = TextGrayLight, fontSize = 11.sp)
                                    }
                                    Icon(Icons.Default.Check, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Dialog displaying ready-to-use AutoClicker preset templates
 */
@Composable
private fun AutoClickerPresetsModalDialog(
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val presets = remember { AutoClickerEngine.getBuiltInPresets() }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = ElegantCard,
            border = androidx.compose.foundation.BorderStroke(1.5.dp, AmberEnergy),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.7f)
                .padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = AmberEnergy)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Plantillas Rápidas AutoClicker",
                        color = TextWhite,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = null, tint = TextGrayLight)
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Aplica configuraciones profesionales preajustadas con 1 solo toque:",
                    color = TextGrayLight,
                    fontSize = 11.5.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(presets) { preset ->
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = DeepPurpleContainer),
                            border = androidx.compose.foundation.BorderStroke(1.dp, LavenderPrimary.copy(alpha = 0.4f)),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    AutoClickerEngine.applyPreset(preset, context)
                                    Toast.makeText(context, "Plantilla '${preset.name}' aplicada", Toast.LENGTH_SHORT).show()
                                    onDismiss()
                                }
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = preset.name,
                                        color = TextWhite,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.5.sp,
                                        modifier = Modifier.weight(1f)
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(if (preset.mode == AutoClickerMode.SINGLE_TARGET) MintSpeed.copy(alpha = 0.2f) else LavenderPrimary.copy(alpha = 0.2f))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = if (preset.mode == AutoClickerMode.SINGLE_TARGET) "Punto Único" else "Multi",
                                            color = if (preset.mode == AutoClickerMode.SINGLE_TARGET) MintSpeed else LavenderPrimary,
                                            fontSize = 9.5.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Text(
                                    text = preset.description,
                                    color = TextGrayLight,
                                    fontSize = 11.sp,
                                    lineHeight = 15.sp
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Intervalo: ${preset.intervalMs}ms • Puntos: ${preset.clickTargets.size} • Deslizamientos: ${preset.swipeTargets.size}",
                                        color = AmberEnergy,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = "Aplicar ➔",
                                        color = MintSpeed,
                                        fontSize = 11.5.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
