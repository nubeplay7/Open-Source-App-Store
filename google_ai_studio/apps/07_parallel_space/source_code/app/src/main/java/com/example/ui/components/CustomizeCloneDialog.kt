package com.example.ui.components

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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.ClonedAppEntity
import com.example.ui.theme.DeepSpaceBorder
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.DeepSpaceSurfaceVariant
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

import androidx.compose.material.icons.filled.ControlPointDuplicate
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Security

@Composable
fun CustomizeCloneDialog(
    app: ClonedAppEntity,
    onSave: (ClonedAppEntity) -> Unit,
    onDelete: (ClonedAppEntity) -> Unit,
    onClearCache: (ClonedAppEntity) -> Unit,
    onOpenSecurity: (ClonedAppEntity) -> Unit = {},
    onOpenFingerprint: (ClonedAppEntity) -> Unit = {},
    onOpenDiagnostics: (ClonedAppEntity) -> Unit = {},
    onDuplicate: (ClonedAppEntity) -> Unit = {},
    onOpenFintechShield: (ClonedAppEntity) -> Unit = {},
    onOpenTuningStudio: (ClonedAppEntity) -> Unit = {},
    onOpenBatchClone: (ClonedAppEntity) -> Unit = {},
    onDismiss: () -> Unit
) {
    var editedName by remember { mutableStateOf(app.appName) }
    var editedBadgeText by remember { mutableStateOf(app.badgeText) }
    var editedBadgeColorHex by remember { mutableStateOf(app.badgeColorHex) }
    var isLocked by remember { mutableStateOf(app.isLocked) }
    var notificationsEnabled by remember { mutableStateOf(app.notificationsEnabled) }

    val presetColors = listOf(
        "#00F0FF", // Cyan
        "#A855F7", // Violet
        "#10B981", // Emerald
        "#F59E0B", // Amber Gold
        "#EC4899", // Cyber Pink
        "#3B82F6"  // Royal Blue
    )

    val presetBadges = listOf("2nd", "Dual", "Work", "Private", "Alt", "VIP")

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DeepSpaceSurface,
        title = {
            Text(
                text = "Customize Cloned App",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp)
            ) {
                // App Name Input
                Text(
                    text = "App Label",
                    style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary)
                )
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = editedName,
                    onValueChange = { editedName = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("edit_app_name_input"),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = NeonCyan,
                        unfocusedBorderColor = DeepSpaceBorder,
                        focusedContainerColor = DeepSpaceSurfaceVariant,
                        unfocusedContainerColor = DeepSpaceSurfaceVariant,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Badge Text Quick Picker
                Text(
                    text = "Badge Text",
                    style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary)
                )
                Spacer(modifier = Modifier.height(6.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(presetBadges) { badge ->
                        val isSelected = editedBadgeText == badge
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) NeonCyan else DeepSpaceSurfaceVariant)
                                .clickable { editedBadgeText = badge }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = badge,
                                color = if (isSelected) Color.Black else TextPrimary,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Badge Color Quick Picker
                Text(
                    text = "Badge Color Accent",
                    style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    presetColors.forEach { hex ->
                        val color = try {
                            Color(android.graphics.Color.parseColor(hex))
                        } catch (_: Exception) {
                            Color.Cyan
                        }
                        val isSelected = editedBadgeColorHex.equals(hex, ignoreCase = true)
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(color)
                                .border(
                                    width = if (isSelected) 3.dp else 0.dp,
                                    color = if (isSelected) Color.White else Color.Transparent,
                                    shape = CircleShape
                                )
                                .clickable { editedBadgeColorHex = hex }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Privacy App Lock Switch
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (isLocked) Icons.Default.Lock else Icons.Default.LockOpen,
                            contentDescription = null,
                            tint = if (isLocked) Color(0xFFFB7185) else TextSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "App Lock Protection",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPrimary
                                )
                            )
                            Text(
                                text = "Require PIN to open this clone",
                                style = MaterialTheme.typography.labelSmall.copy(color = TextMuted)
                            )
                        }
                    }
                    Switch(
                        checked = isLocked,
                        onCheckedChange = { isLocked = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.Black,
                            checkedTrackColor = NeonCyan,
                            uncheckedTrackColor = DeepSpaceSurfaceVariant
                        )
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Advanced Container Isolation & Security Controls
                Text(
                    text = "Container Engine & Protection",
                    style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary)
                )
                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { onOpenFingerprint(app) },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("open_fingerprint_btn"),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = NeonCyan)
                    ) {
                        Icon(Icons.Default.Security, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Fingerprint", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = { onOpenSecurity(app) },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("open_security_lock_btn"),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = EmeraldSuccess)
                    ) {
                        Icon(Icons.Default.Fingerprint, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Lock & Bio", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { onOpenDiagnostics(app) },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("open_diagnostics_btn"),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary)
                    ) {
                        Icon(Icons.Default.HealthAndSafety, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Diagnostics", fontSize = 11.sp)
                    }

                    OutlinedButton(
                        onClick = { onDuplicate(app) },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("duplicate_instance_btn"),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFF59E0B))
                    ) {
                        Icon(Icons.Default.ControlPointDuplicate, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Duplicate (#${app.instanceIndex + 1})", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Fintech & Banking Shield Button
                OutlinedButton(
                    onClick = { onOpenFintechShield(app) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("open_fintech_shield_btn"),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF10B981)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.6f))
                ) {
                    Icon(Icons.Default.Security, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (app.isFintechProtected || app.category == "Fintech") "🛡️ Fintech & Banking Shield™ (Activo)" else "Fintech & Banking Shield™",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Container Tuning Studio Button
                Button(
                    onClick = { onOpenTuningStudio(app) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("open_container_studio_dialog_btn"),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = NeonCyan.copy(alpha = 0.2f),
                        contentColor = NeonCyan
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NeonCyan.copy(alpha = 0.5f))
                ) {
                    Text("🛠️ Container Tuning Studio™ (Configuración Profunda)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Multi-Clone Stress Test Button
                OutlinedButton(
                    onClick = { onOpenBatchClone(app) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("open_batch_clone_dialog_btn"),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFF59E0B)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.6f))
                ) {
                    Text("⚡ Multi-Clonar para Pruebas de Estrés (x3, x5, x7, x9)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Storage and Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { onClearCache(app) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = EmeraldSuccess
                        )
                    ) {
                        Icon(Icons.Default.CleaningServices, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Clear (${app.cacheSizeMb}MB)", fontSize = 11.sp)
                    }

                    OutlinedButton(
                        onClick = { onDelete(app) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color(0xFFFB7185)
                        )
                    ) {
                        Icon(Icons.Default.DeleteOutline, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Delete", fontSize = 11.sp)
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSave(
                        app.copy(
                            appName = editedName.ifBlank { app.originalName },
                            badgeText = editedBadgeText,
                            badgeColorHex = editedBadgeColorHex,
                            isLocked = isLocked,
                            notificationsEnabled = notificationsEnabled
                        )
                    )
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = NeonCyan,
                    contentColor = Color.Black
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Save Changes", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondary)
            }
        }
    )
}
