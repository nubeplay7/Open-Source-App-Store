package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Devices
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.ClonedAppEntity
import com.example.ui.theme.DeepSpaceBorder
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.DeepSpaceSurfaceVariant
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun ContainerFingerprintDialog(
    app: ClonedAppEntity,
    onDismiss: () -> Unit,
    onSaveFingerprint: (androidId: String, model: String, mac: String, keepAlive: Boolean) -> Unit
) {
    var androidId by remember { mutableStateOf(app.virtualAndroidId) }
    var deviceModel by remember { mutableStateOf(app.virtualDeviceModel) }
    var macAddress by remember { mutableStateOf(app.virtualMacAddress) }
    var keepAlive by remember { mutableStateOf(app.keepAlive) }
    var isRegenerating by remember { mutableStateOf(false) }

    val phoneModels = listOf(
        "Galaxy S24 Ultra (Sandbox)",
        "Pixel 9 Pro (Isolated)",
        "Xiaomi 14 Ultra (Virtual)",
        "OnePlus 12 (DualSpace)",
        "Sony Xperia 1 VI (Sandbox)"
    )

    fun regenerateIdentity() {
        androidId = "v8a_%08x%08x".format((0..Int.MAX_VALUE).random(), (0..Int.MAX_VALUE).random())
        deviceModel = phoneModels.filter { it != deviceModel }.random()
        macAddress = "02:00:00:%02X:%02X:%02X".format((0..255).random(), (0..255).random(), (0..255).random())
        isRegenerating = true
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("container_fingerprint_dialog"),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = DeepSpaceSurface),
            border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(22.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(NeonCyan.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = null,
                            tint = NeonCyan
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "Isolated Container Identity",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Distinct Hardware Fingerprint for ${app.appName}",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Explanatory badge
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = NeonCyan.copy(alpha = 0.08f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NeonCyan.copy(alpha = 0.3f))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = NeonCyan,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "This container runs with spoofed hardware parameters so third-party servers recognize it as a completely distinct physical device.",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Virtual Android ID
                FingerprintAttributeRow(
                    label = "Virtual Android ID",
                    value = androidId,
                    mono = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Virtual Device Model
                FingerprintAttributeRow(
                    label = "Spoofed Device Model",
                    value = deviceModel,
                    mono = false
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Virtual MAC Address
                FingerprintAttributeRow(
                    label = "Isolated Virtual MAC",
                    value = macAddress,
                    mono = true
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Keep-Alive Service toggle (prevents apps from closing)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(DeepSpaceSurfaceVariant)
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Crash Guard & Keep-Alive",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Prevents OS memory killer from closing this app",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }
                    Switch(
                        checked = keepAlive,
                        onCheckedChange = { keepAlive = it },
                        modifier = Modifier.testTag("keep_alive_switch"),
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.Black,
                            checkedTrackColor = EmeraldSuccess,
                            uncheckedThumbColor = TextMuted,
                            uncheckedTrackColor = DeepSpaceSurface
                        )
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Generate New Fingerprint button
                OutlinedButton(
                    onClick = { regenerateIdentity() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("regenerate_fingerprint_btn"),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = NeonCyan)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Regenerate Distinct Fingerprint", fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Cancel", color = TextSecondary)
                    }

                    Button(
                        onClick = { onSaveFingerprint(androidId, deviceModel, macAddress, keepAlive) },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("save_fingerprint_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = NeonCyan, contentColor = Color.Black),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Apply Fingerprint", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun FingerprintAttributeRow(
    label: String,
    value: String,
    mono: Boolean
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = DeepSpaceSurfaceVariant
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(text = label, fontSize = 11.sp, color = TextMuted)
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = value,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                fontFamily = if (mono) FontFamily.Monospace else FontFamily.Default
            )
        }
    }
}
