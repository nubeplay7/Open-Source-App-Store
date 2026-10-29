package com.example.ui.components

import android.graphics.BitmapFactory
import android.util.Base64
import android.webkit.WebView
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ActionPoint
import com.example.data.model.AutomationPreset
import com.example.data.model.GestureType
import com.example.ui.theme.*
import com.example.util.AutomationController
import com.example.util.AutomationPresetManager
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

/**
 * Persistent ModalBottomSheet for configuring an ActionPoint when long-pressed.
 * Tabs:
 * 1. Intervalo de Tiempo & Repetición (Delay, Hold, Repetir, Radio del Clic en Píxeles)
 * 2. Tipo de Gesto & Desplazamiento (Clic, Pulsación Larga, Deslizar, Coordenadas, Curva, Velocidad)
 * 3. Reconocimiento Visual & Anclaje (Captura de imagen de ancla, similitud %, omisión automática)
 * 4. Presets & Overlays (Guardar flujos de automatización, cargar presets, alternar Debug Bounding Boxes y Event Logger)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AutomationActionPointBottomSheet(
    currentWebView: WebView? = null,
    onDismissRequest: () -> Unit = { AutomationController.closePointBottomSheet() }
) {
    val isOpen by AutomationController.isBottomSheetOpen.collectAsState()
    val selectedPoint by AutomationController.selectedPointForBottomSheet.collectAsState()
    val allPoints by AutomationController.actionPoints.collectAsState()
    val isAnchorDebugVisible by AutomationController.isAnchorDebugOverlayVisible.collectAsState()
    val isEventLoggerVisible by AutomationController.isEventLoggerOverlayVisible.collectAsState()

    if (!isOpen || selectedPoint == null) return

    val point = selectedPoint ?: return
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var selectedTabIndex by remember(point.id) { mutableIntStateOf(0) }

    // Tab 1: Time & Precision
    var delayText by remember(point.id) { mutableStateOf(point.delayBeforeMs.toString()) }
    var holdText by remember(point.id) { mutableStateOf(point.holdDurationMs.toString()) }
    var repeatText by remember(point.id) { mutableStateOf(point.loopRepeat.toString()) }
    var radiusDpValue by remember(point.id) { mutableFloatStateOf(point.radiusDp.toFloat()) }
    var labelText by remember(point.id) { mutableStateOf(point.label) }

    // Tab 2: Gesture & Swipe
    var selectedGestureType by remember(point.id) { mutableStateOf(point.gestureType) }
    var swipeDurationText by remember(point.id) { mutableStateOf(point.swipeDurationMs.toString()) }
    var speedText by remember(point.id) { mutableStateOf(point.speedPxPerSec.toString()) }
    var swipeCurve by remember(point.id) { mutableStateOf(point.swipeCurve) }

    // Tab 3: Visual Anchoring
    var conditionType by remember(point.id) { mutableStateOf(point.visualAnchor.conditionType) }
    var conditionValue by remember(point.id) { mutableStateOf(point.visualAnchor.conditionValue) }
    var minSimilarityValue by remember(point.id) { mutableFloatStateOf(point.visualAnchor.minSimilarity) }
    var onConditionFail by remember(point.id) { mutableStateOf(point.visualAnchor.onConditionFail) }
    var conditionTimeoutText by remember(point.id) { mutableStateOf(point.visualAnchor.conditionTimeoutMs.toString()) }
    var isCapturingAnchor by remember { mutableStateOf(false) }

    // Tab 4: Presets
    var presetNameText by remember { mutableStateOf("") }
    var presetDescText by remember { mutableStateOf("") }
    val savedPresets by AutomationPresetManager.presets.collectAsState()

    LaunchedEffect(Unit) {
        AutomationPresetManager.loadPresets(context)
    }

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        sheetState = sheetState,
        containerColor = ElegantCard,
        contentColor = TextWhite,
        scrimColor = Color.Black.copy(alpha = 0.6f),
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        dragHandle = {
            BottomSheetDefaults.DragHandle(
                color = LavenderPrimary.copy(alpha = 0.6f),
                width = 44.dp,
                height = 5.dp
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 6.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Header Row with Point Title, ID and Quick Delete
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(LavenderPrimary.copy(alpha = 0.2f))
                            .border(1.5.dp, LavenderPrimary, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "#${point.id}",
                            color = LavenderPrimary,
                            fontWeight = FontWeight.Black,
                            fontSize = 14.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = point.label.ifBlank { "Punto de Automatización #${point.id}" },
                            color = TextWhite,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Posición: ${(point.xPercent * 100).toInt()}% X, ${(point.yPercent * 100).toInt()}% Y",
                            color = TextGrayLight,
                            fontSize = 11.sp
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = {
                            AutomationController.removeActionPoint(point.id, context)
                            onDismissRequest()
                        },
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(CoralError.copy(alpha = 0.15f))
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = CoralError, modifier = Modifier.size(18.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Configuration Tabs: [1. Tiempo] [2. Gesto] [3. Ancla Visual] [4. Presets & Overlays]
            TabRow(
                selectedTabIndex = selectedTabIndex,
                containerColor = DeepPurpleContainer.copy(alpha = 0.5f),
                contentColor = MintSpeed,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
            ) {
                Tab(
                    selected = selectedTabIndex == 0,
                    onClick = { selectedTabIndex = 0 },
                    text = {
                        Text("Tiempo", fontSize = 11.sp, fontWeight = if (selectedTabIndex == 0) FontWeight.Bold else FontWeight.Normal)
                    }
                )
                Tab(
                    selected = selectedTabIndex == 1,
                    onClick = { selectedTabIndex = 1 },
                    text = {
                        Text("Gesto", fontSize = 11.sp, fontWeight = if (selectedTabIndex == 1) FontWeight.Bold else FontWeight.Normal)
                    }
                )
                Tab(
                    selected = selectedTabIndex == 2,
                    onClick = { selectedTabIndex = 2 },
                    text = {
                        Text("Ancla Visual", fontSize = 11.sp, fontWeight = if (selectedTabIndex == 2) FontWeight.Bold else FontWeight.Normal)
                    }
                )
                Tab(
                    selected = selectedTabIndex == 3,
                    onClick = { selectedTabIndex = 3 },
                    text = {
                        Text("Presets & HUD", fontSize = 11.sp, fontWeight = if (selectedTabIndex == 3) FontWeight.Bold else FontWeight.Normal)
                    }
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // TAB 1: TIEMPO, PRECISIÓN & RADIO EN PÍXELES
            if (selectedTabIndex == 0) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Label Editor
                    OutlinedTextField(
                        value = labelText,
                        onValueChange = { labelText = it },
                        label = { Text("Nombre descriptivo del punto", color = TextGrayLight, fontSize = 12.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = LavenderPrimary,
                            unfocusedBorderColor = TextGrayLight.copy(alpha = 0.4f)
                        ),
                        singleLine = true
                    )

                    // Delay Before Action
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = delayText,
                            onValueChange = { delayText = it },
                            label = { Text("Espera Previa (ms)", color = TextGrayLight, fontSize = 11.sp) },
                            modifier = Modifier.weight(1f),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextWhite,
                                unfocusedTextColor = TextWhite,
                                focusedBorderColor = LavenderPrimary,
                                unfocusedBorderColor = TextGrayLight.copy(alpha = 0.4f)
                            ),
                            singleLine = true
                        )

                        OutlinedTextField(
                            value = holdText,
                            onValueChange = { holdText = it },
                            label = { Text("Duración Pulsación (ms)", color = TextGrayLight, fontSize = 11.sp) },
                            modifier = Modifier.weight(1f),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextWhite,
                                unfocusedTextColor = TextWhite,
                                focusedBorderColor = LavenderPrimary,
                                unfocusedBorderColor = TextGrayLight.copy(alpha = 0.4f)
                            ),
                            singleLine = true
                        )
                    }

                    // Loop Repeats
                    OutlinedTextField(
                        value = repeatText,
                        onValueChange = { repeatText = it },
                        label = { Text("Repeticiones del Bucle (veces)", color = TextGrayLight, fontSize = 11.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = LavenderPrimary,
                            unfocusedBorderColor = TextGrayLight.copy(alpha = 0.4f)
                        ),
                        singleLine = true
                    )

                    // Precision Radius Selector (Pixels & Dp)
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DeepPurpleContainer.copy(alpha = 0.45f)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Adjust, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Radio de Precisión del Clic:", color = TextWhite, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                                Text(
                                    text = "${radiusDpValue.roundToInt()} px (${radiusDpValue.roundToInt()} dp)",
                                    color = MintSpeed,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.ExtraBold
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Slider(
                                value = radiusDpValue,
                                onValueChange = { radiusDpValue = it },
                                valueRange = 14f..70f,
                                colors = SliderDefaults.colors(
                                    thumbColor = MintSpeed,
                                    activeTrackColor = MintSpeed,
                                    inactiveTrackColor = TextGrayLight.copy(alpha = 0.3f)
                                )
                            )
                        }
                    }
                }
            }

            // TAB 2: TIPO DE GESTO & DESPLAZAMIENTO (CLICK / SWIPE / LONG PRESS)
            if (selectedTabIndex == 1) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Selecciona el tipo de gesto interactivo:", color = TextGrayLight, fontSize = 12.sp)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        GestureType.values().forEach { gType ->
                            val isSelected = selectedGestureType == gType
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) LavenderPrimary else DeepPurpleContainer)
                                    .clickable { selectedGestureType = gType }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(
                                        imageVector = when (gType) {
                                            GestureType.CLICK -> Icons.Default.TouchApp
                                            GestureType.LONG_PRESS -> Icons.Default.Timer
                                            GestureType.SWIPE -> Icons.Default.Swipe
                                            GestureType.MULTI_TAP -> Icons.Default.TouchApp
                                        },
                                        contentDescription = null,
                                        tint = if (isSelected) DeepPurpleBackground else TextWhite,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = when (gType) {
                                            GestureType.CLICK -> "Clic"
                                            GestureType.LONG_PRESS -> "Pulsación"
                                            GestureType.SWIPE -> "Deslizar"
                                            GestureType.MULTI_TAP -> "Multi-Tap"
                                        },
                                        color = if (isSelected) DeepPurpleBackground else TextWhite,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }

                    if (selectedGestureType == GestureType.SWIPE) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = DeepPurpleContainer.copy(alpha = 0.45f)),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("Parámetros del Desplazamiento (Swipe)", color = VividCyan, fontWeight = FontWeight.Bold, fontSize = 12.sp)

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    OutlinedTextField(
                                        value = swipeDurationText,
                                        onValueChange = { swipeDurationText = it },
                                        label = { Text("Duración (ms)", fontSize = 11.sp) },
                                        modifier = Modifier.weight(1f),
                                        singleLine = true
                                    )

                                    OutlinedTextField(
                                        value = speedText,
                                        onValueChange = { speedText = it },
                                        label = { Text("Velocidad (px/s)", fontSize = 11.sp) },
                                        modifier = Modifier.weight(1f),
                                        singleLine = true
                                    )
                                }

                                Text("Curva de Velocidad:", color = TextGrayLight, fontSize = 11.sp)
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    listOf(
                                        "LINEAR" to "Lineal",
                                        "ACCELERATE" to "Acelerada",
                                        "DECELERATE" to "Freno"
                                    ).forEach { (curveKey, name) ->
                                        val isSelected = swipeCurve == curveKey
                                        Box(
                                            modifier = Modifier
                                                .weight(1f)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(if (isSelected) VividCyan else DeepPurpleContainer)
                                                .clickable { swipeCurve = curveKey }
                                                .padding(vertical = 6.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = name,
                                                color = if (isSelected) Color.Black else TextWhite,
                                                fontSize = 10.sp,
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // TAB 3: RECONOCIMIENTO VISUAL & ANCLAJE (COMPUTER VISION / IMAGE ANALYSIS)
            if (selectedTabIndex == 2) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Visibility, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Capa de Reconocimiento Visual & Validación", color = MintSpeed, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }

                    Text(
                        "Asocia una imagen de referencia (recorte). Si el elemento visual no es detectado en pantalla mediante ImageAnalysis/píxeles, el clic se omitirá automáticamente.",
                        color = TextGrayLight,
                        fontSize = 11.sp
                    )

                    // Reference Image Preview Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DeepPurpleContainer.copy(alpha = 0.5f)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            val anchorBitmap = remember(point.visualAnchor.referenceImageBase64) {
                                point.visualAnchor.referenceImageBase64?.let { b64 ->
                                    try {
                                        val bytes = Base64.decode(b64, Base64.DEFAULT)
                                        BitmapFactory.decodeByteArray(bytes, 0, bytes.size)?.asImageBitmap()
                                    } catch (_: Exception) { null }
                                }
                            }

                            if (anchorBitmap != null) {
                                Image(
                                    bitmap = anchorBitmap,
                                    contentDescription = "Ancla Visual",
                                    modifier = Modifier
                                        .size(64.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .border(1.5.dp, MintSpeed, RoundedCornerShape(8.dp))
                                )
                            } else {
                                Box(
                                    modifier = Modifier
                                        .size(64.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(DeepPurpleContainer),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.ImageNotSupported, contentDescription = null, tint = TextGrayLight)
                                }
                            }

                            Spacer(modifier = Modifier.width(10.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = if (anchorBitmap != null) "Ancla Visual Asociada" else "Sin Imagen de Ancla",
                                    color = if (anchorBitmap != null) MintSpeed else TextWhite,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )
                                Text(
                                    text = if (anchorBitmap != null) "Plantilla lista para comparación por píxeles" else "Captura la zona para validación",
                                    color = TextGrayLight,
                                    fontSize = 10.sp
                                )
                            }

                            Button(
                                onClick = {
                                    if (currentWebView != null) {
                                        isCapturingAnchor = true
                                        coroutineScope.launch {
                                            AutomationController.captureAndAssociateVisualAnchor(context, currentWebView, point.id)
                                            isCapturingAnchor = false
                                            conditionType = "VISUAL_TEMPLATE"
                                        }
                                    }
                                },
                                enabled = currentWebView != null && !isCapturingAnchor,
                                colors = ButtonDefaults.buttonColors(containerColor = MintSpeed),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.CameraAlt, contentDescription = null, tint = Color.Black, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = if (isCapturingAnchor) "..." else "Capturar",
                                    color = Color.Black,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    // Condition Type Selection
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf(
                            "NONE" to "Sin Condición",
                            "VISUAL_TEMPLATE" to "Imagen (Visión)",
                            "DOM_SELECTOR" to "DOM / CSS",
                            "DOM_TEXT" to "Texto Web"
                        ).forEach { (cType, label) ->
                            val isSelected = conditionType == cType
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isSelected) MintSpeed else DeepPurpleContainer)
                                    .clickable { conditionType = cType }
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = label,
                                    color = if (isSelected) Color.Black else TextWhite,
                                    fontSize = 10.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        }
                    }

                    if (conditionType == "VISUAL_TEMPLATE") {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = DeepPurpleContainer.copy(alpha = 0.45f)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Similitud Mínima de Píxeles:", color = TextWhite, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    Text("${(minSimilarityValue * 100).roundToInt()}%", color = MintSpeed, fontSize = 12.sp, fontWeight = FontWeight.ExtraBold)
                                }
                                Slider(
                                    value = minSimilarityValue,
                                    onValueChange = { minSimilarityValue = it },
                                    valueRange = 0.50f..0.98f,
                                    colors = SliderDefaults.colors(
                                        thumbColor = MintSpeed,
                                        activeTrackColor = MintSpeed,
                                        inactiveTrackColor = TextGrayLight.copy(alpha = 0.3f)
                                    )
                                )
                            }
                        }
                    }

                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DeepPurpleContainer.copy(alpha = 0.45f)),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("Si el elemento visual NO coincide:", color = TextWhite, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                listOf(
                                    "SKIP" to "Omitir Clic (Auto-Skip)",
                                    "RETRY" to "Reintentar Timeout",
                                    "STOP" to "Pausar Ejecución"
                                ).forEach { (failAction, title) ->
                                    val isSelected = onConditionFail == failAction
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(if (isSelected) AmberEnergy else DeepPurpleContainer)
                                            .clickable { onConditionFail = failAction }
                                            .padding(vertical = 8.dp, horizontal = 4.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = title,
                                            color = if (isSelected) Color.Black else TextWhite,
                                            fontSize = 9.sp,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // TAB 4: PRESETS DE AUTOMATIZACIÓN & OVERLAYS EN VIVO
            if (selectedTabIndex == 3) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Overlays Toggles Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DeepPurpleContainer.copy(alpha = 0.5f)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Visualización & Diagnóstico en Tiempo Real", color = VividCyan, fontWeight = FontWeight.Bold, fontSize = 12.sp)

                            // Bounding Box Debug Overlay
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Debug Overlay: Cajas de Anclas", color = TextWhite, fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold)
                                    Text("Renderiza bounding boxes y crosshairs en vivo sobre la web", color = TextGrayLight, fontSize = 10.sp)
                                }
                                Switch(
                                    checked = isAnchorDebugVisible,
                                    onCheckedChange = { AutomationController.setAnchorDebugOverlayVisible(it) },
                                    colors = SwitchDefaults.colors(checkedThumbColor = MintSpeed, checkedTrackColor = MintSpeed.copy(alpha = 0.4f))
                                )
                            }

                            Divider(color = Color(0xFF2C2C3A), thickness = 0.8.dp)

                            // Event Logger Overlay
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Event Logger en Pantalla", color = TextWhite, fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold)
                                    Text("Muestra cada clic, ancla, timestamp y estado en un HUD flotante", color = TextGrayLight, fontSize = 10.sp)
                                }
                                Switch(
                                    checked = isEventLoggerVisible,
                                    onCheckedChange = { AutomationController.setEventLoggerOverlayVisible(it) },
                                    colors = SwitchDefaults.colors(checkedThumbColor = LavenderPrimary, checkedTrackColor = LavenderPrimary.copy(alpha = 0.4f))
                                )
                            }
                        }
                    }

                    // Save Preset Section
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DeepPurpleContainer.copy(alpha = 0.45f)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Guardar Puntos Actuales como Preset", color = MintSpeed, fontWeight = FontWeight.Bold, fontSize = 12.sp)

                            OutlinedTextField(
                                value = presetNameText,
                                onValueChange = { presetNameText = it },
                                label = { Text("Nombre del Preset (ej. Login Automático)", fontSize = 11.sp) },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )

                            Button(
                                onClick = {
                                    if (presetNameText.isNotBlank()) {
                                        coroutineScope.launch {
                                            AutomationController.saveCurrentAsPreset(
                                                context = context,
                                                name = presetNameText.trim(),
                                                description = presetDescText.trim(),
                                                targetUrlPattern = currentWebView?.url ?: "*"
                                            )
                                            presetNameText = ""
                                            Toast.makeText(context, "Preset guardado con éxito", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                },
                                enabled = presetNameText.isNotBlank(),
                                colors = ButtonDefaults.buttonColors(containerColor = MintSpeed),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth().height(36.dp)
                            ) {
                                Icon(Icons.Default.Save, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Guardar Flujo de Automatización", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    // Presets List
                    if (savedPresets.isNotEmpty()) {
                        Text("Presets Guardados (${savedPresets.size})", color = TextWhite, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            savedPresets.forEach { preset ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color(0xFF1C1C26))
                                        .border(1.dp, Color(0xFF2C2C3A), RoundedCornerShape(8.dp))
                                        .padding(8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(preset.name, color = TextWhite, fontWeight = FontWeight.Bold, fontSize = 11.5.sp)
                                        Text("${preset.actionPoints.size} puntos • ${preset.targetUrlPattern}", color = TextGrayLight, fontSize = 9.5.sp)
                                    }

                                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Button(
                                            onClick = {
                                                AutomationController.loadPreset(preset, context)
                                                Toast.makeText(context, "Preset '${preset.name}' cargado", Toast.LENGTH_SHORT).show()
                                                onDismissRequest()
                                            },
                                            colors = ButtonDefaults.buttonColors(containerColor = LavenderPrimary),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                            shape = RoundedCornerShape(6.dp),
                                            modifier = Modifier.height(26.dp)
                                        ) {
                                            Text("Cargar", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                                        }

                                        IconButton(
                                            onClick = {
                                                coroutineScope.launch {
                                                    AutomationPresetManager.deletePreset(context, preset.id)
                                                }
                                            },
                                            modifier = Modifier.size(26.dp)
                                        ) {
                                            Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = CoralError, modifier = Modifier.size(15.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Save / Apply Button
            Button(
                onClick = {
                    val newDelay = delayText.toLongOrNull()?.coerceAtLeast(10L) ?: point.delayBeforeMs
                    val newHold = holdText.toLongOrNull()?.coerceAtLeast(10L) ?: point.holdDurationMs
                    val newReps = repeatText.toIntOrNull()?.coerceAtLeast(1) ?: 1
                    val newSwipeDur = swipeDurationText.toLongOrNull()?.coerceAtLeast(50L) ?: point.swipeDurationMs
                    val newSpeed = speedText.toIntOrNull()?.coerceAtLeast(100) ?: point.speedPxPerSec
                    val newTimeout = conditionTimeoutText.toLongOrNull()?.coerceAtLeast(100L) ?: 1000L

                    val updatedAnchor = point.visualAnchor.copy(
                        conditionType = conditionType,
                        conditionValue = conditionValue,
                        minSimilarity = minSimilarityValue,
                        onConditionFail = onConditionFail,
                        conditionTimeoutMs = newTimeout
                    )

                    val updated = point.copy(
                        label = labelText,
                        delayBeforeMs = newDelay,
                        holdDurationMs = newHold,
                        loopRepeat = newReps,
                        radiusPx = radiusDpValue.roundToInt(),
                        radiusDp = radiusDpValue.roundToInt(),
                        gestureType = selectedGestureType,
                        swipeDurationMs = newSwipeDur,
                        speedPxPerSec = newSpeed,
                        swipeCurve = swipeCurve,
                        visualAnchor = updatedAnchor
                    )

                    AutomationController.updateActionPoint(updated, context)
                    onDismissRequest()
                },
                colors = ButtonDefaults.buttonColors(containerColor = MintSpeed),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Icon(Icons.Default.Check, contentDescription = null, tint = Color.Black, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Guardar Configuración del Punto #${point.id}", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
