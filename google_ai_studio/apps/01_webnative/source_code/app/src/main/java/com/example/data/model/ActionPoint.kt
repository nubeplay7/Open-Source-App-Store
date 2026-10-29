package com.example.data.model

import android.graphics.Bitmap

enum class GestureType {
    CLICK,
    SWIPE,
    LONG_PRESS,
    MULTI_TAP
}

/**
 * VisualAnchorConfig:
 * Configuration for visual computer vision recognition and element anchor detection.
 */
data class VisualAnchorConfig(
    val referenceImageBase64: String? = null,
    val referenceBitmap: Bitmap? = null,
    val minSimilarity: Float = 0.75f,
    val conditionType: String = "NONE", // "NONE", "VISUAL_TEMPLATE", "DOM_SELECTOR", "DOM_TEXT", "OCR_SCREEN_TEXT"
    val conditionValue: String = "",
    val onConditionFail: String = "SKIP", // "SKIP", "RETRY", "STOP"
    val conditionTimeoutMs: Long = 1000L,
    val anchorLabel: String = ""
)

/**
 * ActionPoint:
 * Unified data model for an interactive automation point.
 */
data class ActionPoint(
    val id: Long = System.currentTimeMillis(),
    val label: String = "Punto de Acción",
    val gestureType: GestureType = GestureType.CLICK,
    val xPercent: Float = 0.5f,
    val yPercent: Float = 0.5f,
    // Swipe specific coordinates
    val endXPercent: Float = 0.5f,
    val endYPercent: Float = 0.7f,
    // Time & Interval parameters
    val delayBeforeMs: Long = 150L,
    val holdDurationMs: Long = 50L,
    val swipeDurationMs: Long = 300L,
    val loopRepeat: Int = 1,
    // Radius & Precision selector (in dp / px)
    val radiusPx: Int = 24,
    val radiusDp: Int = 24,
    // Speed & Acceleration curves
    val speedPxPerSec: Int = 800,
    val swipeCurve: String = "EASE_IN_OUT", // "EASE_IN_OUT", "LINEAR", "ACCELERATE", "DECELERATE"
    // Visual Recognition Layer
    val visualAnchor: VisualAnchorConfig = VisualAnchorConfig(),
    val isEnabled: Boolean = true,
    val customDomSelector: String = ""
)
