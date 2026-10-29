package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.DeepSpaceBackground
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.DeepSpaceSurfaceVariant
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun CalculatorDisguiseScreen(
    secretPin: String,
    onSecretPinMatched: () -> Unit,
    onVibrate: () -> Unit
) {
    var displayValue by remember { mutableStateOf("0") }
    var previousValue by remember { mutableStateOf<Double?>(null) }
    var pendingOperation by remember { mutableStateOf<String?>(null) }
    var clearOnNextDigit by remember { mutableStateOf(false) }
    var showHint by remember { mutableStateOf(false) }

    fun onDigit(digit: String) {
        onVibrate()
        if (displayValue == "0" || clearOnNextDigit) {
            displayValue = digit
            clearOnNextDigit = false
        } else {
            if (displayValue.length < 12) {
                displayValue += digit
            }
        }
    }

    fun onOp(op: String) {
        onVibrate()
        val current = displayValue.toDoubleOrNull() ?: 0.0
        previousValue = current
        pendingOperation = op
        clearOnNextDigit = true
    }

    fun onEquals() {
        onVibrate()
        // Check if user entered the secret PIN directly!
        if (displayValue == secretPin) {
            onSecretPinMatched()
            return
        }

        // Otherwise perform normal calculation
        val current = displayValue.toDoubleOrNull() ?: 0.0
        val prev = previousValue
        if (prev != null && pendingOperation != null) {
            val result = when (pendingOperation) {
                "+" -> prev + current
                "-" -> prev - current
                "×" -> prev * current
                "÷" -> if (current != 0.0) prev / current else 0.0
                else -> current
            }
            displayValue = if (result % 1.0 == 0.0) result.toLong().toString() else "%.2f".format(result)
            previousValue = null
            pendingOperation = null
            clearOnNextDigit = true
        }
    }

    fun onClear() {
        onVibrate()
        displayValue = "0"
        previousValue = null
        pendingOperation = null
        clearOnNextDigit = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepSpaceBackground)
            .padding(20.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Bar disguised as normal calculator
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Calculator",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Medium,
                    color = TextSecondary
                )
            )

            IconButton(onClick = { showHint = !showHint }) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = "Disguise Hint",
                    tint = TextMuted
                )
            }
        }

        if (showHint) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                color = DeepSpaceSurfaceVariant
            ) {
                Text(
                    text = "🔒 Incognito Mode Active: Enter your PIN ($secretPin) and press '=' to unlock Parallel Space.",
                    color = NeonCyan,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(10.dp),
                    textAlign = TextAlign.Center
                )
            }
        }

        // Display Area
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 24.dp),
            horizontalAlignment = Alignment.End
        ) {
            if (pendingOperation != null && previousValue != null) {
                Text(
                    text = "${previousValue} $pendingOperation",
                    color = TextMuted,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Light
                )
            }
            Text(
                text = displayValue,
                color = TextPrimary,
                fontSize = 48.sp,
                fontWeight = FontWeight.Light,
                textAlign = TextAlign.End,
                maxLines = 1,
                modifier = Modifier.testTag("calc_display")
            )
        }

        // Keypad Grid
        val buttons = listOf(
            listOf("C", "±", "%", "÷"),
            listOf("7", "8", "9", "×"),
            listOf("4", "5", "6", "-"),
            listOf("1", "2", "3", "+"),
            listOf("0", ".", "=")
        )

        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            buttons.forEach { row ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    row.forEach { label ->
                        val isOp = label in listOf("÷", "×", "-", "+", "=")
                        val isTop = label in listOf("C", "±", "%")
                        val weight = if (label == "0") 2.1f else 1f

                        Surface(
                            modifier = Modifier
                                .weight(weight)
                                .height(64.dp)
                                .clip(RoundedCornerShape(32.dp))
                                .clickable {
                                    when (label) {
                                        "C" -> onClear()
                                        "±" -> {
                                            if (displayValue != "0") {
                                                displayValue = if (displayValue.startsWith("-")) displayValue.drop(1) else "-$displayValue"
                                            }
                                        }
                                        "%" -> {
                                            val v = displayValue.toDoubleOrNull() ?: 0.0
                                            displayValue = (v / 100.0).toString()
                                        }
                                        "÷", "×", "-", "+" -> onOp(label)
                                        "=" -> onEquals()
                                        "." -> {
                                            if (!displayValue.contains(".")) {
                                                displayValue += "."
                                            }
                                        }
                                        else -> onDigit(label)
                                    }
                                }
                                .testTag("calc_btn_$label"),
                            shape = RoundedCornerShape(32.dp),
                            color = when {
                                label == "=" -> NeonCyan
                                isOp -> DeepSpaceSurfaceVariant
                                isTop -> Color(0xFF2E3856)
                                else -> DeepSpaceSurface
                            }
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = label,
                                    color = when {
                                        label == "=" -> Color.Black
                                        isOp -> NeonCyan
                                        isTop -> TextPrimary
                                        else -> TextPrimary
                                    },
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
