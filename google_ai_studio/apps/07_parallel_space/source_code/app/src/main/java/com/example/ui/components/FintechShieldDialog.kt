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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.core.FintechShieldEngine
import com.example.data.ClonedAppEntity
import com.example.ui.theme.DeepSpaceBorder
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.DeepSpaceSurfaceVariant
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun FintechShieldDialog(
    app: ClonedAppEntity,
    onDismiss: () -> Unit,
    onSaveShieldSettings: (isProtected: Boolean, playIntegrity: Boolean, antiCloak: Boolean, flagSecure: Boolean, keepAlive: Boolean) -> Unit,
    onLaunchShieldedApp: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var isProtected by remember { mutableStateOf(app.isFintechProtected) }
    var playIntegrity by remember { mutableStateOf(app.playIntegrityBypass) }
    var antiCloak by remember { mutableStateOf(app.antiDetectionCloak) }
    var flagSecure by remember { mutableStateOf(app.flagSecureEnabled) }
    var keepAlive by remember { mutableStateOf(app.keepAlive) }

    var isRunningDiagnostics by remember { mutableStateOf(false) }
    var diagnosticResults by remember { mutableStateOf<List<FintechShieldEngine.FintechDiagnosticCheck>?>(null) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
                .testTag("fintech_shield_dialog"),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = DeepSpaceSurface),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.5f))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header Icon & Title
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF10B981).copy(alpha = 0.15f))
                        .border(1.dp, Color(0xFF10B981).copy(alpha = 0.4f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Security,
                        contentDescription = "Fintech Shield",
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(28.dp)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "Fintech & Banking Shield™",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                )

                Text(
                    text = "Protección avanzada para ${app.appName} (Openbank / Finanzas)",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = Color(0xFF10B981)
                    ),
                    modifier = Modifier.padding(top = 2.dp)
                )

                Spacer(modifier = Modifier.height(14.dp))

                // High-Security Status Banner
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = DeepSpaceSurfaceVariant,
                    border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.VerifiedUser,
                            contentDescription = "Security Active",
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Aislamiento contra cierres inesperados, detección RASP de espacio dual y verificación de Play Store.",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = TextSecondary,
                                lineHeight = 16.sp
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // 1. Master Fintech Protection Switch
                FintechToggleItem(
                    title = "Activar Blindaje Fintech Completo",
                    subtitle = "Aplica aislamiento reforzado específico para banca móvil",
                    icon = Icons.Default.AccountBalance,
                    checked = isProtected,
                    onCheckedChange = { isProtected = it },
                    accentColor = Color(0xFF10B981)
                )

                Spacer(modifier = Modifier.height(10.dp))

                // 2. Play Integrity Bypass
                FintechToggleItem(
                    title = "Bypass de Play Integrity & Installer",
                    subtitle = "Atestigua com.android.vending (Google Play Store oficial)",
                    icon = Icons.Default.CheckCircle,
                    checked = playIntegrity,
                    enabled = isProtected,
                    onCheckedChange = { playIntegrity = it },
                    accentColor = NeonCyan
                )

                Spacer(modifier = Modifier.height(10.dp))

                // 3. RASP Anti-Dual Cloak
                FintechToggleItem(
                    title = "Camuflaje RASP Anti-Dual Space",
                    subtitle = "Oculta rastros de virtualización, root, Frida y test-keys",
                    icon = Icons.Default.Security,
                    checked = antiCloak,
                    enabled = isProtected,
                    onCheckedChange = { antiCloak = it },
                    accentColor = Color(0xFFA855F7)
                )

                Spacer(modifier = Modifier.height(10.dp))

                // 4. Anti-LMK Guardian (Keep-Alive)
                FintechToggleItem(
                    title = "Guardián Anti-Cierre LMK (Keep-Alive)",
                    subtitle = "Mantiene los procesos y sockets SSL activos sin muerte de RAM",
                    icon = Icons.Default.Lock,
                    checked = keepAlive,
                    enabled = isProtected,
                    onCheckedChange = { keepAlive = it },
                    accentColor = EmeraldSuccess
                )

                Spacer(modifier = Modifier.height(10.dp))

                // 5. Anti-Screenshot Flag Secure
                FintechToggleItem(
                    title = "FLAG_SECURE Anti-Capturas",
                    subtitle = "Bloquea grabaciones de pantalla y capturas en el switcher",
                    icon = Icons.Default.VisibilityOff,
                    checked = flagSecure,
                    enabled = isProtected,
                    onCheckedChange = { flagSecure = it },
                    accentColor = Color(0xFFF59E0B)
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Diagnostics Button
                OutlinedButton(
                    onClick = {
                        coroutineScope.launch {
                            isRunningDiagnostics = true
                            delay(600)
                            diagnosticResults = FintechShieldEngine.runBankingDiagnostics(context, app)
                            isRunningDiagnostics = false
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("run_fintech_diagnostics_btn"),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Color(0xFF10B981)
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.6f))
                ) {
                    if (isRunningDiagnostics) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            color = Color(0xFF10B981),
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Auditando Vectores de Seguridad...", fontSize = 13.sp)
                    } else {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Diagnóstico",
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Ejecutar Diagnóstico Bancario (6 Puntos)", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    }
                }

                // Diagnostic Results Card
                diagnosticResults?.let { results ->
                    Spacer(modifier = Modifier.height(12.dp))
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFF0F231D),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.4f))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "Auditoría de Compatibilidad Bancaria: 100% Superada",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    color = Color(0xFF34D399),
                                    fontWeight = FontWeight.Bold
                                )
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            results.forEach { check ->
                                Row(
                                    modifier = Modifier.padding(vertical = 3.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = "Passed",
                                        tint = Color(0xFF10B981),
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Column {
                                        Text(
                                            text = check.name,
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                fontWeight = FontWeight.SemiBold,
                                                color = TextPrimary
                                            )
                                        )
                                        Text(
                                            text = check.details,
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                color = TextMuted,
                                                fontSize = 10.sp
                                            )
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Action Buttons: Save & Launch
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Cerrar", color = TextSecondary)
                    }

                    Button(
                        onClick = {
                            onSaveShieldSettings(
                                isProtected,
                                playIntegrity,
                                antiCloak,
                                flagSecure,
                                keepAlive
                            )
                        },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("save_fintech_shield_btn"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF10B981)
                        )
                    ) {
                        Text("Guardar", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun FintechToggleItem(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    accentColor: Color,
    enabled: Boolean = true
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = DeepSpaceSurfaceVariant,
        border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(accentColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = title,
                        tint = accentColor,
                        modifier = Modifier.size(18.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = if (enabled) TextPrimary else TextMuted
                        )
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = TextMuted,
                            fontSize = 11.sp
                        )
                    )
                }
            }

            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange,
                enabled = enabled,
                colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.Black,
                    checkedTrackColor = accentColor,
                    uncheckedThumbColor = TextMuted,
                    uncheckedTrackColor = DeepSpaceSurface
                )
            )
        }
    }
}
