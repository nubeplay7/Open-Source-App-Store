package com.example.ui.components

import android.webkit.WebView
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.LavenderPrimary
import com.example.ui.theme.MintSpeed
import com.example.ui.theme.TextWhite
import com.example.util.AutomationController

/**
 * AutomationVisualAnchorDebugOverlay:
 * Renders real-time bounding boxes, crosshairs, and confidence markers around all tracked anchor elements.
 * Allows users to see exactly which elements the automation system is currently tracking on the web page.
 */
@Composable
fun AutomationVisualAnchorDebugOverlay(
    webView: WebView? = null,
    modifier: Modifier = Modifier
) {
    val isVisible by AutomationController.isAnchorDebugOverlayVisible.collectAsState()
    val actionPoints by AutomationController.actionPoints.collectAsState()

    if (!isVisible) return

    val density = LocalDensity.current

    // Pulsing radar animation for active tracking bounding boxes
    val infiniteTransition = rememberInfiniteTransition(label = "anchor_radar_pulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.35f,
        targetValue = 0.95f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_alpha"
    )

    val reticleRotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(8000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "reticle_rotation"
    )

    BoxWithConstraints(modifier = modifier.fillMaxSize()) {
        val screenW = maxWidth
        val screenH = maxHeight

        val screenWFloat = with(density) { screenW.toPx() }
        val screenHFloat = with(density) { screenH.toPx() }

        // Render Canvas with Cyber-Grid Bounding Boxes
        Canvas(modifier = Modifier.fillMaxSize()) {
            val strokeWidth = 2.dp.toPx()
            val cornerLength = 12.dp.toPx()
            val dashEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f)

            actionPoints.forEach { point ->
                val centerX = point.xPercent * screenWFloat
                val centerY = point.yPercent * screenHFloat
                val radiusPx = (point.radiusPx * 1.5f).coerceIn(40f, 180f)

                val boxLeft = centerX - radiusPx
                val boxTop = centerY - radiusPx
                val boxSize = radiusPx * 2

                val isVisual = point.visualAnchor.conditionType != "NONE"
                val boxColor = if (isVisual) MintSpeed.copy(alpha = pulseAlpha) else LavenderPrimary.copy(alpha = 0.7f)

                // 1. Draw dashed bounding box
                drawRect(
                    color = boxColor,
                    topLeft = Offset(boxLeft, boxTop),
                    size = Size(boxSize, boxSize),
                    style = Stroke(width = strokeWidth, pathEffect = dashEffect)
                )

                // 2. Draw high-tech corner brackets
                // Top-Left
                drawLine(boxColor, Offset(boxLeft, boxTop), Offset(boxLeft + cornerLength, boxTop), strokeWidth = strokeWidth * 1.5f)
                drawLine(boxColor, Offset(boxLeft, boxTop), Offset(boxLeft, boxTop + cornerLength), strokeWidth = strokeWidth * 1.5f)

                // Top-Right
                drawLine(boxColor, Offset(boxLeft + boxSize, boxTop), Offset(boxLeft + boxSize - cornerLength, boxTop), strokeWidth = strokeWidth * 1.5f)
                drawLine(boxColor, Offset(boxLeft + boxSize, boxTop), Offset(boxLeft + boxSize, boxTop + cornerLength), strokeWidth = strokeWidth * 1.5f)

                // Bottom-Left
                drawLine(boxColor, Offset(boxLeft, boxTop + boxSize), Offset(boxLeft + cornerLength, boxTop + boxSize), strokeWidth = strokeWidth * 1.5f)
                drawLine(boxColor, Offset(boxLeft, boxTop + boxSize), Offset(boxLeft, boxTop + boxSize - cornerLength), strokeWidth = strokeWidth * 1.5f)

                // Bottom-Right
                drawLine(boxColor, Offset(boxLeft + boxSize, boxTop + boxSize), Offset(boxLeft + boxSize - cornerLength, boxTop + boxSize), strokeWidth = strokeWidth * 1.5f)
                drawLine(boxColor, Offset(boxLeft + boxSize, boxTop + boxSize), Offset(boxLeft + boxSize, boxTop + boxSize - cornerLength), strokeWidth = strokeWidth * 1.5f)

                // 3. Center Target Crosshair
                drawLine(
                    color = boxColor.copy(alpha = 0.9f),
                    start = Offset(centerX - 10f, centerY),
                    end = Offset(centerX + 10f, centerY),
                    strokeWidth = 2f
                )
                drawLine(
                    color = boxColor.copy(alpha = 0.9f),
                    start = Offset(centerX, centerY - 10f),
                    end = Offset(centerX, centerY + 10f),
                    strokeWidth = 2f
                )
            }
        }

        // Render Floating Overlay Badges above each ActionPoint
        actionPoints.forEach { point ->
            val anchor = point.visualAnchor
            val isVisual = anchor.conditionType != "NONE"
            val badgeX = (point.xPercent * with(density) { screenW.toPx() })
            val badgeY = (point.yPercent * with(density) { screenH.toPx() }) - with(density) { (point.radiusDp + 36).dp.toPx() }

            val xOffsetDp = with(density) { badgeX.toDp() } - 60.dp
            val yOffsetDp = with(density) { badgeY.toDp() }

            Box(
                modifier = Modifier
                    .offset(x = xOffsetDp.coerceIn(8.dp, screenW - 130.dp), y = yOffsetDp.coerceIn(8.dp, screenH - 50.dp))
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = Color(0xEE101018),
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (isVisual) MintSpeed else LavenderPrimary),
                    shadowElevation = 6.dp
                ) {
                    Column(modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                "ANCLA #${point.id}",
                                color = if (isVisual) MintSpeed else LavenderPrimary,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                            if (isVisual) {
                                Text(
                                    "${(anchor.minSimilarity * 100).toInt()}%",
                                    color = TextWhite,
                                    fontSize = 8.5.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                        Text(
                            if (isVisual) anchor.anchorLabel.take(24) else "Sin ancla visual",
                            color = TextWhite.copy(alpha = 0.85f),
                            fontSize = 8.sp,
                            fontFamily = FontFamily.Monospace,
                            maxLines = 1
                        )
                    }
                }
            }
        }

        // Top Status HUD Banner
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = Color(0xEE101018),
            border = androidx.compose.foundation.BorderStroke(1.dp, MintSpeed.copy(alpha = 0.6f)),
            modifier = Modifier
                .align(Alignment.TopCenter)
                .statusBarsPadding()
                .padding(top = 10.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(MintSpeed, shape = androidx.compose.foundation.shape.CircleShape)
                )
                Text(
                    "Visual Anchor Debug: ${actionPoints.size} elementos rastreados en vivo",
                    color = TextWhite,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}
