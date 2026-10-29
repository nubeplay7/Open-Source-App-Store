package com.example.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Pin
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.ClonedAppEntity
import com.example.ui.theme.DeepSpaceBorder
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import kotlinx.coroutines.delay

@Composable
fun BiometricUnlockDialog(
    app: ClonedAppEntity,
    onSuccess: () -> Unit,
    onUsePinFallback: () -> Unit,
    onDismiss: () -> Unit
) {
    var isAuthenticating by remember { mutableStateOf(false) }
    var isVerified by remember { mutableStateOf(false) }

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.12f,
        animationSpec = infiniteRepeatable(
            animation = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("biometric_auth_dialog"),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = DeepSpaceSurface),
            border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Biometric Verification",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Touch the fingerprint sensor to unlock ${app.appName}",
                    fontSize = 12.sp,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(28.dp))

                // Interactive Biometric Fingerprint Sensor Target
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .scale(if (isAuthenticating) pulseScale else 1f)
                        .clip(CircleShape)
                        .background(
                            if (isVerified) EmeraldSuccess.copy(alpha = 0.2f)
                            else if (isAuthenticating) NeonCyan.copy(alpha = 0.2f)
                            else DeepSpaceBorder.copy(alpha = 0.5f)
                        )
                        .border(
                            width = 2.dp,
                            color = if (isVerified) EmeraldSuccess else if (isAuthenticating) NeonCyan else DeepSpaceBorder,
                            shape = CircleShape
                        )
                        .clickable {
                            if (!isAuthenticating && !isVerified) {
                                isAuthenticating = true
                            }
                        }
                        .testTag("fingerprint_touch_target"),
                    contentAlignment = Alignment.Center
                ) {
                    if (isVerified) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Verified",
                            tint = EmeraldSuccess,
                            modifier = Modifier.size(52.dp)
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Fingerprint,
                            contentDescription = "Fingerprint Sensor",
                            tint = if (isAuthenticating) NeonCyan else TextPrimary,
                            modifier = Modifier.size(56.dp)
                        )
                    }
                }

                LaunchedEffect(isAuthenticating) {
                    if (isAuthenticating) {
                        delay(600)
                        isVerified = true
                        delay(400)
                        onSuccess()
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = if (isVerified) "Identity Verified! Unlocking sandbox..."
                    else if (isAuthenticating) "Scanning fingerprint..."
                    else "Tap sensor or place finger",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isVerified) EmeraldSuccess else if (isAuthenticating) NeonCyan else TextMuted
                )

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(
                        onClick = onUsePinFallback,
                        modifier = Modifier.testTag("use_pin_fallback_btn")
                    ) {
                        Icon(Icons.Default.Pin, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Use PIN instead", fontSize = 13.sp, color = NeonCyan)
                    }

                    TextButton(onClick = onDismiss) {
                        Text("Cancel", fontSize = 13.sp, color = TextSecondary)
                    }
                }
            }
        }
    }
}
