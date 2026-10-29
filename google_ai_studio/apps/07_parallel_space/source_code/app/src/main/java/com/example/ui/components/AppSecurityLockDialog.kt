package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Pin
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.ClonedAppEntity
import com.example.ui.theme.DeepSpaceBackground
import com.example.ui.theme.DeepSpaceBorder
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.DeepSpaceSurfaceVariant
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun AppSecurityLockDialog(
    app: ClonedAppEntity,
    masterPin: String,
    onDismiss: () -> Unit,
    onSaveSecuritySettings: (isLocked: Boolean, customPin: String?, isBiometric: Boolean, timeoutMinutes: Int) -> Unit
) {
    var isLocked by remember { mutableStateOf(app.isLocked) }
    var useDedicatedPin by remember { mutableStateOf(!app.customPin.isNullOrBlank()) }
    var dedicatedPin by remember { mutableStateOf(app.customPin ?: "") }
    var isBiometricEnabled by remember { mutableStateOf(app.isBiometricEnabled) }
    var timeoutMinutes by remember { mutableIntStateOf(app.lockTimeoutMinutes) }
    var pinError by remember { mutableStateOf<String?>(null) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("app_security_lock_dialog"),
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
                            .background(if (isLocked) NeonCyan.copy(alpha = 0.15f) else DeepSpaceSurfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isLocked) Icons.Default.Lock else Icons.Default.LockOpen,
                            contentDescription = null,
                            tint = if (isLocked) NeonCyan else TextMuted
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "App Privacy & Lock",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Individual protection for ${app.appName}",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Toggle: Lock this individual app
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(DeepSpaceSurfaceVariant)
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Require Lock for this App",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Prompt credentials before entering container",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }
                    Switch(
                        checked = isLocked,
                        onCheckedChange = { isLocked = it },
                        modifier = Modifier.testTag("app_lock_switch"),
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.Black,
                            checkedTrackColor = NeonCyan,
                            uncheckedThumbColor = TextMuted,
                            uncheckedTrackColor = DeepSpaceSurface
                        )
                    )
                }

                AnimatedVisibility(visible = isLocked) {
                    Column {
                        Spacer(modifier = Modifier.height(14.dp))

                        // Toggle: Biometric Authentication (Fingerprint / Face)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(DeepSpaceSurfaceVariant)
                                .padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                modifier = Modifier.weight(1f),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Fingerprint,
                                    contentDescription = null,
                                    tint = if (isBiometricEnabled) EmeraldSuccess else TextMuted,
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "Biometric Fingerprint Lock",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = "Unlock with device fingerprint sensor",
                                        fontSize = 11.sp,
                                        color = TextMuted
                                    )
                                }
                            }
                            Switch(
                                checked = isBiometricEnabled,
                                onCheckedChange = { isBiometricEnabled = it },
                                modifier = Modifier.testTag("biometric_lock_switch"),
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.Black,
                                    checkedTrackColor = EmeraldSuccess,
                                    uncheckedThumbColor = TextMuted,
                                    uncheckedTrackColor = DeepSpaceSurface
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Custom PIN vs Master PIN
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(DeepSpaceSurfaceVariant)
                                .padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                modifier = Modifier.weight(1f),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Pin,
                                    contentDescription = null,
                                    tint = NeonCyan,
                                    modifier = Modifier.size(22.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "Individual Dedicated PIN",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = if (useDedicatedPin) "App uses its own separate 4-digit PIN" else "Using Master Space PIN ($masterPin)",
                                        fontSize = 11.sp,
                                        color = TextMuted
                                    )
                                }
                            }
                            Switch(
                                checked = useDedicatedPin,
                                onCheckedChange = { useDedicatedPin = it },
                                modifier = Modifier.testTag("custom_pin_switch"),
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.Black,
                                    checkedTrackColor = NeonCyan,
                                    uncheckedThumbColor = TextMuted,
                                    uncheckedTrackColor = DeepSpaceSurface
                                )
                            )
                        }

                        if (useDedicatedPin) {
                            Spacer(modifier = Modifier.height(10.dp))
                            OutlinedTextField(
                                value = dedicatedPin,
                                onValueChange = {
                                    if (it.length <= 6 && it.all { char -> char.isDigit() }) {
                                        dedicatedPin = it
                                        pinError = null
                                    }
                                },
                                label = { Text("Set 4-Digit App PIN", fontSize = 12.sp) },
                                placeholder = { Text("e.g. 5892") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                                visualTransformation = PasswordVisualTransformation(),
                                isError = pinError != null,
                                supportingText = pinError?.let { { Text(it, color = MaterialTheme.colorScheme.error) } },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("custom_pin_field"),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = NeonCyan,
                                    unfocusedBorderColor = DeepSpaceBorder,
                                    focusedLabelColor = NeonCyan
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Auto-lock timeout selector
                        Text(
                            text = "Auto-Lock Timeout",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(
                                0 to "Immediately",
                                1 to "1 min",
                                5 to "5 min"
                            ).forEach { (minutes, label) ->
                                val isSelected = timeoutMinutes == minutes
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(8.dp))
                                        .border(
                                            width = 1.dp,
                                            color = if (isSelected) NeonCyan else DeepSpaceBorder,
                                            shape = RoundedCornerShape(8.dp)
                                        )
                                        .clickable { timeoutMinutes = minutes },
                                    color = if (isSelected) NeonCyan.copy(alpha = 0.12f) else DeepSpaceSurfaceVariant
                                ) {
                                    Text(
                                        text = label,
                                        fontSize = 11.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        color = if (isSelected) NeonCyan else TextSecondary,
                                        modifier = Modifier.padding(vertical = 8.dp),
                                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

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
                        onClick = {
                            if (isLocked && useDedicatedPin && dedicatedPin.length < 4) {
                                pinError = "PIN must be at least 4 digits"
                                return@Button
                            }
                            val pinToSave = if (isLocked && useDedicatedPin) dedicatedPin else null
                            onSaveSecuritySettings(isLocked, pinToSave, isBiometricEnabled, timeoutMinutes)
                        },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("save_security_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = NeonCyan, contentColor = Color.Black),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Save Security", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
