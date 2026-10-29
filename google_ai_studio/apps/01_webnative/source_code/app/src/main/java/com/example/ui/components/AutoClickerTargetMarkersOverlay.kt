package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Adjust
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FindInPage
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Swipe
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.ui.theme.AmberEnergy
import com.example.ui.theme.CoralError
import com.example.ui.theme.DeepPurpleContainer
import com.example.ui.theme.ElegantCard
import com.example.ui.theme.LavenderPrimary
import com.example.ui.theme.MintSpeed
import com.example.ui.theme.TextGrayLight
import com.example.ui.theme.TextWhite
import com.example.ui.theme.VividCyan
import com.example.util.AutoClickTarget
import com.example.util.AutoClickerEngine
import com.example.util.AutoSwipeTarget
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.roundToInt
import kotlin.math.sin

/**
 * AutoClickerTargetMarkersOverlay:
 * Fullscreen interactive overlay over TurboWebView that renders:
 * - Dynamic configurable perimeter rings for click targets
 * - Multi-tab editing modal for stacked targets in the same perimeter zone
 * - Long-press & single-tap gestures with instant new click addition
 * - Swipe gesture lines with directional arrows and curve adjustments
 * - Pulsing ripples on trigger events
 */
@Composable
fun AutoClickerTargetMarkersOverlay(
    modifier: Modifier = Modifier
) {
    val isVisible by AutoClickerEngine.isControllerVisible.collectAsState()
    val areMarkersVisible by AutoClickerEngine.areMarkersVisible.collectAsState()
    val clickTargets by AutoClickerEngine.clickTargets.collectAsState()
    val swipeTargets by AutoClickerEngine.swipeTargets.collectAsState()
    val activeIndex by AutoClickerEngine.activeTargetIndex.collectAsState()
    val ripples by AutoClickerEngine.activeRipples.collectAsState()

    var activePerimeterTargets by remember { mutableStateOf<List<AutoClickTarget>?>(null) }
    var selectedEditSwipeTarget by remember { mutableStateOf<AutoSwipeTarget?>(null) }

    if (!isVisible) return

    BoxWithConstraints(
        modifier = modifier.fillMaxSize()
    ) {
        val density = LocalDensity.current
        val screenWidthPx = constraints.maxWidth.toFloat().coerceAtLeast(100f)
        val screenHeightPx = constraints.maxHeight.toFloat().coerceAtLeast(100f)

        // 1. RENDER SWIPE GESTURE CONNECTING LINES
        if (areMarkersVisible && swipeTargets.isNotEmpty()) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                swipeTargets.forEach { swipe ->
                    val startX = swipe.startXPercent * size.width
                    val startY = swipe.startYPercent * size.height
                    val endX = swipe.endXPercent * size.width
                    val endY = swipe.endYPercent * size.height

                    // Draw dashed guide line
                    drawLine(
                        color = VividCyan,
                        start = Offset(startX, startY),
                        end = Offset(endX, endY),
                        strokeWidth = 4.dp.toPx(),
                        cap = StrokeCap.Round,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(20f, 12f), 0f)
                    )

                    // Draw arrow head at end point
                    val angle = atan2(endY - startY, endX - startX)
                    val arrowLength = 28f
                    val arrowAngle = Math.PI / 6

                    val arrowP1 = Offset(
                        (endX - arrowLength * cos(angle - arrowAngle)).toFloat(),
                        (endY - arrowLength * sin(angle - arrowAngle)).toFloat()
                    )
                    val arrowP2 = Offset(
                        (endX - arrowLength * cos(angle + arrowAngle)).toFloat(),
                        (endY - arrowLength * sin(angle + arrowAngle)).toFloat()
                    )

                    val path = Path().apply {
                        moveTo(endX, endY)
                        lineTo(arrowP1.x, arrowP1.y)
                        lineTo(arrowP2.x, arrowP2.y)
                        close()
                    }
                    drawPath(path, color = VividCyan)
                }
            }
        }

        // 2. RENDER CLICK TARGET PERIMETER RINGS & BADGES (#1, #2, ...)
        if (areMarkersVisible) {
            // Background Canvas for Target Perimeter Area Circles
            Canvas(modifier = Modifier.fillMaxSize()) {
                clickTargets.forEachIndexed { index, target ->
                    val posX = target.xPercent * size.width
                    val posY = target.yPercent * size.height
                    val radiusPx = target.radiusDp.dp.toPx()
                    val isActive = activeIndex == index

                    // Outer perimeter circle
                    drawCircle(
                        color = if (isActive) MintSpeed.copy(alpha = 0.25f) else LavenderPrimary.copy(alpha = 0.12f),
                        radius = radiusPx,
                        center = Offset(posX, posY)
                    )
                    drawCircle(
                        color = if (isActive) MintSpeed else LavenderPrimary.copy(alpha = 0.5f),
                        radius = radiusPx,
                        center = Offset(posX, posY),
                        style = Stroke(
                            width = 1.5.dp.toPx(),
                            pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f), 0f)
                        )
                    )
                }
            }

            clickTargets.forEachIndexed { index, target ->
                val posX = (target.xPercent * screenWidthPx)
                val posY = (target.yPercent * screenHeightPx)
                val isActive = activeIndex == index

                TargetMarkerBadge(
                    target = target,
                    posX = posX,
                    posY = posY,
                    isActive = isActive,
                    onDragDelta = { dx, dy ->
                        val newX = (posX + dx) / screenWidthPx
                        val newY = (posY + dy) / screenHeightPx
                        AutoClickerEngine.updateClickTargetPosition(target.id, newX, newY)
                    },
                    onTap = {
                        // Find all targets within perimeter radius of this tap
                        val perimeterTargets = findTargetsInPerimeter(target, clickTargets, screenWidthPx, screenHeightPx, density.density)
                        activePerimeterTargets = perimeterTargets
                    },
                    onLongPress = {
                        // Long-press: open perimeter tab dialog directly
                        val perimeterTargets = findTargetsInPerimeter(target, clickTargets, screenWidthPx, screenHeightPx, density.density)
                        activePerimeterTargets = perimeterTargets
                    }
                )
            }

            // 3. RENDER SWIPE GESTURE START/END MARKERS
            swipeTargets.forEach { swipe ->
                val startX = swipe.startXPercent * screenWidthPx
                val startY = swipe.startYPercent * screenHeightPx
                val endX = swipe.endXPercent * screenWidthPx
                val endY = swipe.endYPercent * screenHeightPx

                // Start Node (e.g. 1A)
                SwipeNodeBadge(
                    text = "${swipe.id}A",
                    posX = startX,
                    posY = startY,
                    isStart = true,
                    onDragDelta = { dx, dy ->
                        val newX = (startX + dx) / screenWidthPx
                        val newY = (startY + dy) / screenHeightPx
                        AutoClickerEngine.updateSwipeStart(swipe.id, newX, newY)
                    },
                    onClick = {
                        selectedEditSwipeTarget = swipe
                    }
                )

                // End Node (e.g. 1B)
                SwipeNodeBadge(
                    text = "${swipe.id}B",
                    posX = endX,
                    posY = endY,
                    isStart = false,
                    onDragDelta = { dx, dy ->
                        val newX = (endX + dx) / screenWidthPx
                        val newY = (endY + dy) / screenHeightPx
                        AutoClickerEngine.updateSwipeEnd(swipe.id, newX, newY)
                    },
                    onClick = {
                        selectedEditSwipeTarget = swipe
                    }
                )
            }
        }

        // 4. TAP RIPPLE PULSE ANIMATIONS
        ripples.forEach { ripple ->
            val px = ripple.xPercent * screenWidthPx
            val py = ripple.yPercent * screenHeightPx

            ClickRippleEffect(
                posX = px,
                posY = py,
                isSwipe = ripple.isSwipe,
                isConditionSkipped = ripple.isConditionSkipped
            )
        }
    }

    // Stacked / Perimeter Multi-Tab Target Configuration Dialog
    activePerimeterTargets?.let { perimeterList ->
        TargetMultiTabPerimeterDialog(
            targetsInPerimeter = perimeterList,
            onSaveTarget = { updated ->
                AutoClickerEngine.updateClickTargetDetails(updated)
            },
            onDeleteTarget = { targetId ->
                AutoClickerEngine.removeTargetById(targetId)
                val remaining = AutoClickerEngine.clickTargets.value.filter { it.id != targetId }
                if (remaining.isEmpty()) {
                    activePerimeterTargets = null
                } else {
                    activePerimeterTargets = perimeterList.filter { it.id != targetId }
                    if (activePerimeterTargets.isNullOrEmpty()) {
                        activePerimeterTargets = null
                    }
                }
            },
            onAddTargetOnTop = { baseTarget ->
                val nextId = (AutoClickerEngine.clickTargets.value.maxOfOrNull { it.id } ?: 0) + 1
                val newTarget = AutoClickTarget(
                    id = nextId,
                    xPercent = baseTarget.xPercent,
                    yPercent = baseTarget.yPercent,
                    delayBeforeMs = 150L,
                    holdDurationMs = 40L,
                    loopRepeat = 1,
                    radiusDp = baseTarget.radiusDp,
                    label = "Clic #$nextId (Encima)"
                )
                AutoClickerEngine.addClickTarget(newTarget)
                activePerimeterTargets = (activePerimeterTargets ?: emptyList()) + newTarget
            },
            onDismiss = { activePerimeterTargets = null }
        )
    }

    // Quick Swipe Edit Dialog
    selectedEditSwipeTarget?.let { swipe ->
        SwipeQuickEditDialog(
            swipe = swipe,
            onSave = { updated ->
                AutoClickerEngine.updateSwipeTargetDetails(updated)
                selectedEditSwipeTarget = null
            },
            onDelete = {
                AutoClickerEngine.removeTargetById(swipe.id)
                selectedEditSwipeTarget = null
            },
            onDismiss = { selectedEditSwipeTarget = null }
        )
    }
}

/**
 * Calculates which targets are inside or overlapping the selection perimeter
 */
private fun findTargetsInPerimeter(
    pivotTarget: AutoClickTarget,
    allTargets: List<AutoClickTarget>,
    screenWidthPx: Float,
    screenHeightPx: Float,
    density: Float
): List<AutoClickTarget> {
    val pivotX = pivotTarget.xPercent * screenWidthPx
    val pivotY = pivotTarget.yPercent * screenHeightPx
    val pivotRadiusPx = (pivotTarget.radiusDp + 16) * density

    return allTargets.filter { target ->
        if (target.id == pivotTarget.id) return@filter true
        val tx = target.xPercent * screenWidthPx
        val ty = target.yPercent * screenHeightPx
        val distance = hypot(pivotX - tx, pivotY - ty)
        distance <= (pivotRadiusPx + target.radiusDp * density)
    }.sortedBy { it.id }
}

/**
 * Draggable Circular Badge for Tap Targets (#1, #2...) with Long-Press and Tap support
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun TargetMarkerBadge(
    target: AutoClickTarget,
    posX: Float,
    posY: Float,
    isActive: Boolean,
    onDragDelta: (Float, Float) -> Unit,
    onTap: () -> Unit,
    onLongPress: () -> Unit
) {
    val badgeSize = 44.dp
    val badgeRadiusPx = with(LocalDensity.current) { (badgeSize / 2).toPx() }

    Box(
        modifier = Modifier
            .offset {
                IntOffset(
                    (posX - badgeRadiusPx).roundToInt(),
                    (posY - badgeRadiusPx).roundToInt()
                )
            }
            .size(badgeSize)
            .pointerInput(target.id) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    onDragDelta(dragAmount.x, dragAmount.y)
                }
            }
            .combinedClickable(
                onClick = { onTap() },
                onLongClick = { onLongPress() }
            )
    ) {
        // Outer glowing ring
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clip(CircleShape)
                .background(
                    if (isActive) MintSpeed.copy(alpha = 0.35f) else LavenderPrimary.copy(alpha = 0.25f)
                )
                .border(
                    width = 2.dp,
                    color = if (isActive) MintSpeed else LavenderPrimary,
                    shape = CircleShape
                )
        )

        // Center crosshair and badge number
        Box(
            modifier = Modifier
                .size(30.dp)
                .align(Alignment.Center)
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            if (isActive) MintSpeed else LavenderPrimary,
                            DeepPurpleContainer
                        )
                    )
                )
                .border(1.dp, TextWhite.copy(alpha = 0.8f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "${target.id}",
                color = TextWhite,
                fontSize = 14.sp,
                fontWeight = FontWeight.Black
            )
        }

        // Center pinpoint crosshair dot
        Box(
            modifier = Modifier
                .size(4.dp)
                .align(Alignment.Center)
                .clip(CircleShape)
                .background(Color.White)
        )
    }
}

/**
 * Draggable Circular Badge for Swipe Start and End Nodes
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun SwipeNodeBadge(
    text: String,
    posX: Float,
    posY: Float,
    isStart: Boolean,
    onDragDelta: (Float, Float) -> Unit,
    onClick: () -> Unit
) {
    val nodeSize = 36.dp
    val nodeRadiusPx = with(LocalDensity.current) { (nodeSize / 2).toPx() }
    val nodeColor = if (isStart) VividCyan else AmberEnergy

    Box(
        modifier = Modifier
            .offset {
                IntOffset(
                    (posX - nodeRadiusPx).roundToInt(),
                    (posY - nodeRadiusPx).roundToInt()
                )
            }
            .size(nodeSize)
            .pointerInput(text) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    onDragDelta(dragAmount.x, dragAmount.y)
                }
            }
            .clip(CircleShape)
            .combinedClickable(onClick = onClick)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clip(CircleShape)
                .background(nodeColor.copy(alpha = 0.3f))
                .border(2.dp, nodeColor, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = text,
                color = TextWhite,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

/**
 * Expanding ripple pulse effect on click coordinate
 */
@Composable
private fun ClickRippleEffect(
    posX: Float,
    posY: Float,
    isSwipe: Boolean,
    isConditionSkipped: Boolean = false
) {
    val infiniteTransition = rememberInfiniteTransition(label = "ripple")
    val radius by infiniteTransition.animateFloat(
        initialValue = 10f,
        targetValue = 60f,
        animationSpec = infiniteRepeatable(
            animation = tween(450, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rippleRadius"
    )

    val color = when {
        isConditionSkipped -> AmberEnergy.copy(alpha = 0.7f)
        isSwipe -> VividCyan.copy(alpha = 0.5f)
        else -> MintSpeed.copy(alpha = 0.6f)
    }

    Canvas(modifier = Modifier.fillMaxSize()) {
        drawCircle(
            color = color,
            radius = radius,
            center = Offset(posX, posY),
            style = Stroke(width = 3.dp.toPx())
        )
    }
}

/**
 * Multi-Tab Configuration Dialog for Targets within the Selection Perimeter
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TargetMultiTabPerimeterDialog(
    targetsInPerimeter: List<AutoClickTarget>,
    onSaveTarget: (AutoClickTarget) -> Unit,
    onDeleteTarget: (Int) -> Unit,
    onAddTargetOnTop: (AutoClickTarget) -> Unit,
    onDismiss: () -> Unit
) {
    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val safeIndex = selectedTabIndex.coerceIn(0, (targetsInPerimeter.size - 1).coerceAtLeast(0))
    val currentTarget = targetsInPerimeter.getOrNull(safeIndex) ?: return

    var delayText by remember(currentTarget.id) { mutableStateOf(currentTarget.delayBeforeMs.toString()) }
    var holdText by remember(currentTarget.id) { mutableStateOf(currentTarget.holdDurationMs.toString()) }
    var repeatText by remember(currentTarget.id) { mutableStateOf(currentTarget.loopRepeat.toString()) }
    var labelText by remember(currentTarget.id) { mutableStateOf(currentTarget.label) }
    var selectorText by remember(currentTarget.id) { mutableStateOf(currentTarget.customSelector) }
    var radiusDpValue by remember(currentTarget.id) { mutableFloatStateOf(currentTarget.radiusDp.toFloat()) }
    var conditionType by remember(currentTarget.id) { mutableStateOf(currentTarget.conditionType) }
    var conditionValue by remember(currentTarget.id) { mutableStateOf(currentTarget.conditionValue) }
    var onConditionFail by remember(currentTarget.id) { mutableStateOf(currentTarget.onConditionFail) }
    var conditionTimeoutText by remember(currentTarget.id) { mutableStateOf(currentTarget.conditionTimeoutMs.toString()) }

    var isConditionDropdownExpanded by remember { mutableStateOf(false) }
    var isFailActionDropdownExpanded by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(22.dp),
            color = ElegantCard,
            border = androidx.compose.foundation.BorderStroke(1.5.dp, LavenderPrimary),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Layers, contentDescription = null, tint = LavenderPrimary, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Zona de Clics & Perímetro (${targetsInPerimeter.size} en este punto)",
                            color = TextWhite,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Cambia de pestaña para editar clics superpuestos",
                            color = TextGrayLight,
                            fontSize = 10.sp
                        )
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Cerrar", tint = TextGrayLight)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Multi-Tab Bar for Stacked Targets
                ScrollableTabRow(
                    selectedTabIndex = safeIndex,
                    containerColor = DeepPurpleContainer.copy(alpha = 0.5f),
                    contentColor = MintSpeed,
                    edgePadding = 4.dp
                ) {
                    targetsInPerimeter.forEachIndexed { idx, tgt ->
                        Tab(
                            selected = safeIndex == idx,
                            onClick = { selectedTabIndex = idx },
                            text = {
                                Text(
                                    "Clic #${tgt.id}${if (tgt.label.isNotBlank()) " (${tgt.label.take(8)})" else ""}",
                                    fontSize = 11.sp,
                                    fontWeight = if (safeIndex == idx) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Button: + Add Click on Top at same location
                Button(
                    onClick = { onAddTargetOnTop(currentTarget) },
                    colors = ButtonDefaults.buttonColors(containerColor = DeepPurpleContainer),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("+ Agregar Nuevo Clic Encima de Este", color = MintSpeed, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(12.dp))

                // RADIUS / PERIMETER SLIDER
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DeepPurpleContainer.copy(alpha = 0.4f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Adjust, contentDescription = null, tint = VividCyan, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Radio del Perímetro / Zona", color = TextWhite, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            }
                            Text("${radiusDpValue.roundToInt()} px (dp)", color = VividCyan, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }

                        Slider(
                            value = radiusDpValue,
                            onValueChange = { radiusDpValue = it },
                            valueRange = 12f..80f,
                            colors = SliderDefaults.colors(
                                thumbColor = VividCyan,
                                activeTrackColor = VividCyan,
                                inactiveTrackColor = TextGrayLight.copy(alpha = 0.3f)
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Interval & Hold Times
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = delayText,
                        onValueChange = { delayText = it.filter { ch -> ch.isDigit() } },
                        label = { Text("Intervalo (ms)", color = TextGrayLight, fontSize = 11.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = MintSpeed,
                            unfocusedBorderColor = DeepPurpleContainer
                        ),
                        modifier = Modifier.weight(1f)
                    )

                    OutlinedTextField(
                        value = holdText,
                        onValueChange = { holdText = it.filter { ch -> ch.isDigit() } },
                        label = { Text("Hold (ms)", color = TextGrayLight, fontSize = 11.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = AmberEnergy,
                            unfocusedBorderColor = DeepPurpleContainer
                        ),
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Label & Repeat
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = labelText,
                        onValueChange = { labelText = it },
                        label = { Text("Etiqueta / Nombre", color = TextGrayLight, fontSize = 11.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = LavenderPrimary,
                            unfocusedBorderColor = DeepPurpleContainer
                        ),
                        modifier = Modifier.weight(1.5f)
                    )

                    OutlinedTextField(
                        value = repeatText,
                        onValueChange = { repeatText = it.filter { ch -> ch.isDigit() } },
                        label = { Text("Repetir", color = TextGrayLight, fontSize = 11.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = LavenderPrimary,
                            unfocusedBorderColor = DeepPurpleContainer
                        ),
                        modifier = Modifier.weight(0.8f)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // VISUAL ANCHOR & CONDITION SECTION
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DeepPurpleContainer.copy(alpha = 0.4f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Visibility, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Ancla Visual & Detección de Elementos", color = MintSpeed, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        Text(
                            "Condiciona el clic: solo clicar si este elemento/texto está visible en la página.",
                            color = TextGrayLight,
                            fontSize = 10.sp
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Condition Type Dropdown
                        ExposedDropdownMenuBox(
                            expanded = isConditionDropdownExpanded,
                            onExpandedChange = { isConditionDropdownExpanded = !isConditionDropdownExpanded }
                        ) {
                            OutlinedTextField(
                                value = when (conditionType) {
                                    "DOM_SELECTOR" -> "Selector CSS (DOM)"
                                    "DOM_TEXT" -> "Texto en Página (DOM)"
                                    "OCR_SCREEN_TEXT" -> "Texto en Pantalla (OCR)"
                                    "VISUAL_TEMPLATE" -> "Plantilla Visual (Computer Vision)"
                                    else -> "Sin Condición (Siempre Clicar)"
                                },
                                onValueChange = {},
                                readOnly = true,
                                label = { Text("Tipo de Ancla", color = TextGrayLight, fontSize = 11.sp) },
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isConditionDropdownExpanded) },
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = TextWhite,
                                    unfocusedTextColor = TextWhite,
                                    focusedBorderColor = MintSpeed,
                                    unfocusedBorderColor = DeepPurpleContainer
                                ),
                                modifier = Modifier
                                    .menuAnchor()
                                    .fillMaxWidth()
                            )

                            ExposedDropdownMenu(
                                expanded = isConditionDropdownExpanded,
                                onDismissRequest = { isConditionDropdownExpanded = false }
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Sin Condición (Siempre Clicar)") },
                                    onClick = {
                                        conditionType = "NONE"
                                        isConditionDropdownExpanded = false
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Selector CSS (DOM)") },
                                    onClick = {
                                        conditionType = "DOM_SELECTOR"
                                        isConditionDropdownExpanded = false
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Texto en Página (DOM)") },
                                    onClick = {
                                        conditionType = "DOM_TEXT"
                                        isConditionDropdownExpanded = false
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Texto en Pantalla (OCR)") },
                                    onClick = {
                                        conditionType = "OCR_SCREEN_TEXT"
                                        isConditionDropdownExpanded = false
                                    }
                                )
                            }
                        }

                        if (conditionType != "NONE") {
                            Spacer(modifier = Modifier.height(8.dp))

                            OutlinedTextField(
                                value = conditionValue,
                                onValueChange = { conditionValue = it },
                                label = { Text("Texto / Selector Requerido", color = TextGrayLight, fontSize = 11.sp) },
                                placeholder = { Text("Ej: 'Confirmar' o '#submit-btn'", color = TextGrayLight.copy(alpha = 0.5f), fontSize = 11.sp) },
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = TextWhite,
                                    unfocusedTextColor = TextWhite,
                                    focusedBorderColor = MintSpeed,
                                    unfocusedBorderColor = DeepPurpleContainer
                                ),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            // If condition fails dropdown
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                ExposedDropdownMenuBox(
                                    expanded = isFailActionDropdownExpanded,
                                    onExpandedChange = { isFailActionDropdownExpanded = !isFailActionDropdownExpanded },
                                    modifier = Modifier.weight(1f)
                                ) {
                                    OutlinedTextField(
                                        value = when (onConditionFail) {
                                            "RETRY" -> "Reintentar"
                                            "STOP" -> "Detener"
                                            else -> "Omitir"
                                        },
                                        onValueChange = {},
                                        readOnly = true,
                                        label = { Text("Si no está:", color = TextGrayLight, fontSize = 10.sp) },
                                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isFailActionDropdownExpanded) },
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedTextColor = TextWhite,
                                            unfocusedTextColor = TextWhite,
                                            focusedBorderColor = AmberEnergy,
                                            unfocusedBorderColor = DeepPurpleContainer
                                        ),
                                        modifier = Modifier.menuAnchor()
                                    )

                                    ExposedDropdownMenu(
                                        expanded = isFailActionDropdownExpanded,
                                        onDismissRequest = { isFailActionDropdownExpanded = false }
                                    ) {
                                        DropdownMenuItem(
                                            text = { Text("Omitir este clic") },
                                            onClick = {
                                                onConditionFail = "SKIP"
                                                isFailActionDropdownExpanded = false
                                            }
                                        )
                                        DropdownMenuItem(
                                            text = { Text("Reintentar con timeout") },
                                            onClick = {
                                                onConditionFail = "RETRY"
                                                isFailActionDropdownExpanded = false
                                            }
                                        )
                                        DropdownMenuItem(
                                            text = { Text("Detener / Pausar") },
                                            onClick = {
                                                onConditionFail = "STOP"
                                                isFailActionDropdownExpanded = false
                                            }
                                        )
                                    }
                                }

                                if (onConditionFail == "RETRY") {
                                    OutlinedTextField(
                                        value = conditionTimeoutText,
                                        onValueChange = { conditionTimeoutText = it.filter { ch -> ch.isDigit() } },
                                        label = { Text("Espera (ms)", color = TextGrayLight, fontSize = 10.sp) },
                                        singleLine = true,
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedTextColor = TextWhite,
                                            unfocusedTextColor = TextWhite,
                                            focusedBorderColor = AmberEnergy,
                                            unfocusedBorderColor = DeepPurpleContainer
                                        ),
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Smart Element Inspection Button
                        Button(
                            onClick = {
                                AutoClickerEngine.inspectElementAt(currentTarget.xPercent, currentTarget.yPercent) { tag, text, selector ->
                                    if (text.isNotBlank()) {
                                        labelText = text
                                        conditionValue = text
                                        if (conditionType == "NONE") conditionType = "DOM_TEXT"
                                    } else if (tag.isNotBlank()) {
                                        labelText = "<$tag>"
                                    }
                                    if (selector.isNotBlank()) {
                                        selectorText = selector
                                        if (conditionType == "NONE") {
                                            conditionType = "DOM_SELECTOR"
                                            conditionValue = selector
                                        }
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = DeepPurpleContainer),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.FindInPage, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("🔍 Detectar Elemento Web Automático", color = MintSpeed, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Actions: Delete Target / Save Target
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { onDeleteTarget(currentTarget.id) },
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(CoralError.copy(alpha = 0.2f))
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = CoralError)
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    Button(
                        onClick = {
                            val newDelay = delayText.toLongOrNull()?.coerceAtLeast(10L) ?: currentTarget.delayBeforeMs
                            val newHold = holdText.toLongOrNull()?.coerceAtLeast(10L) ?: currentTarget.holdDurationMs
                            val newReps = repeatText.toIntOrNull()?.coerceAtLeast(1) ?: 1
                            val newTimeout = conditionTimeoutText.toLongOrNull()?.coerceAtLeast(100L) ?: 1000L
                            val updated = currentTarget.copy(
                                delayBeforeMs = newDelay,
                                holdDurationMs = newHold,
                                loopRepeat = newReps,
                                label = labelText,
                                customSelector = selectorText,
                                radiusDp = radiusDpValue.roundToInt(),
                                conditionType = conditionType,
                                conditionValue = conditionValue,
                                onConditionFail = onConditionFail,
                                conditionTimeoutMs = newTimeout
                            )
                            onSaveTarget(updated)
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MintSpeed),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Guardar Clic #${currentTarget.id}", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

/**
 * Micro-Configuration dialog for a specific Swipe Target with Curve and Speed controls
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SwipeQuickEditDialog(
    swipe: AutoSwipeTarget,
    onSave: (AutoSwipeTarget) -> Unit,
    onDelete: () -> Unit,
    onDismiss: () -> Unit
) {
    var delayText by remember { mutableStateOf(swipe.delayBeforeMs.toString()) }
    var durationText by remember { mutableStateOf(swipe.swipeDurationMs.toString()) }
    var labelText by remember { mutableStateOf(swipe.label) }
    var speedText by remember { mutableStateOf(swipe.speedPxPerSec.toString()) }
    var swipeCurve by remember { mutableStateOf(swipe.swipeCurve) }
    var isCurveDropdownExpanded by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = ElegantCard,
            border = androidx.compose.foundation.BorderStroke(1.5.dp, VividCyan),
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(18.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Swipe, contentDescription = null, tint = VividCyan, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Configuración Deslizar #${swipe.id}",
                        color = TextWhite,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Cerrar", tint = TextGrayLight)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Duración del Deslizamiento & Pausa previa
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = durationText,
                        onValueChange = { durationText = it.filter { ch -> ch.isDigit() } },
                        label = { Text("Duración (ms)", color = TextGrayLight, fontSize = 11.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = VividCyan,
                            unfocusedBorderColor = DeepPurpleContainer
                        ),
                        modifier = Modifier.weight(1f)
                    )

                    OutlinedTextField(
                        value = delayText,
                        onValueChange = { delayText = it.filter { ch -> ch.isDigit() } },
                        label = { Text("Pausa (ms)", color = TextGrayLight, fontSize = 11.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = AmberEnergy,
                            unfocusedBorderColor = DeepPurpleContainer
                        ),
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Curva de Desplazamiento
                ExposedDropdownMenuBox(
                    expanded = isCurveDropdownExpanded,
                    onExpandedChange = { isCurveDropdownExpanded = !isCurveDropdownExpanded }
                ) {
                    OutlinedTextField(
                        value = when (swipeCurve) {
                            "LINEAR" -> "Lineal (Constante)"
                            "ACCELERATE" -> "Acelerada"
                            "DECELERATE" -> "Desacelerada"
                            else -> "Suave (Ease In-Out)"
                        },
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Curva de Desplazamiento", color = TextGrayLight, fontSize = 11.sp) },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isCurveDropdownExpanded) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = VividCyan,
                            unfocusedBorderColor = DeepPurpleContainer
                        ),
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                    )

                    ExposedDropdownMenu(
                        expanded = isCurveDropdownExpanded,
                        onDismissRequest = { isCurveDropdownExpanded = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Suave (Ease In-Out)") },
                            onClick = {
                                swipeCurve = "EASE_IN_OUT"
                                isCurveDropdownExpanded = false
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Lineal (Constante)") },
                            onClick = {
                                swipeCurve = "LINEAR"
                                isCurveDropdownExpanded = false
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Acelerada") },
                            onClick = {
                                swipeCurve = "ACCELERATE"
                                isCurveDropdownExpanded = false
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Desacelerada") },
                            onClick = {
                                swipeCurve = "DECELERATE"
                                isCurveDropdownExpanded = false
                            }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Etiqueta
                OutlinedTextField(
                    value = labelText,
                    onValueChange = { labelText = it },
                    label = { Text("Etiqueta / Nombre Deslizamiento", color = TextGrayLight, fontSize = 11.sp) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextWhite,
                        unfocusedTextColor = TextWhite,
                        focusedBorderColor = VividCyan,
                        unfocusedBorderColor = DeepPurpleContainer
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(CoralError.copy(alpha = 0.2f))
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = CoralError)
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    Button(
                        onClick = {
                            val newDuration = durationText.toLongOrNull()?.coerceAtLeast(50L) ?: swipe.swipeDurationMs
                            val newDelay = delayText.toLongOrNull()?.coerceAtLeast(10L) ?: swipe.delayBeforeMs
                            val newSpeed = speedText.toIntOrNull()?.coerceAtLeast(100) ?: 1200
                            onSave(
                                swipe.copy(
                                    swipeDurationMs = newDuration,
                                    delayBeforeMs = newDelay,
                                    label = labelText,
                                    swipeCurve = swipeCurve,
                                    speedPxPerSec = newSpeed
                                )
                            )
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = VividCyan),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Guardar", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
