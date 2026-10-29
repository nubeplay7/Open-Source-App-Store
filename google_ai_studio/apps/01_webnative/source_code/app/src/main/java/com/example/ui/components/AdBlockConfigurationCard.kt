package com.example.ui.components

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.dialogs.AdBlockSettingsDialog
import com.example.ui.theme.*
import com.example.util.AdBlockConfigManager
import com.example.util.AdBlockStealthMode

@Composable
fun AdBlockConfigurationCard(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val config by AdBlockConfigManager.configFlow.collectAsStateWithLifecycle()
    var showFullSettingsDialog by remember { mutableStateOf(false) }

    if (showFullSettingsDialog) {
        AdBlockSettingsDialog(
            onDismissRequest = { showFullSettingsDialog = false }
        )
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF14141C)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF262634)),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                Brush.linearGradient(
                                    listOf(MintSpeed.copy(alpha = 0.25f), LavenderPrimary.copy(alpha = 0.25f))
                                )
                            )
                            .border(1.dp, MintSpeed.copy(alpha = 0.5f), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(20.dp))
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                "Quantum AdBlock Stealth Hub",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.5.sp,
                                color = TextWhite
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(MintSpeed.copy(alpha = 0.2f))
                                    .padding(horizontal = 5.dp, vertical = 1.dp)
                            ) {
                                Text(
                                    if (config.globalAdBlockEnabled) "ACTIVO" else "PAUSADO",
                                    color = if (config.globalAdBlockEnabled) MintSpeed else CoralError,
                                    fontSize = 8.5.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                        }
                        Text(
                            "Sistema Multi-Fase de Evasión e Indetección Total",
                            fontSize = 10.sp,
                            color = TextGrayLight
                        )
                    }
                }

                Button(
                    onClick = { showFullSettingsDialog = true },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF22222E)),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    modifier = Modifier.height(30.dp)
                ) {
                    Icon(Icons.Default.Tune, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("15 Fases", fontSize = 11.sp, color = TextWhite, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Quick Stats Grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                QuickMetricTile(
                    label = "Ads Bloqueados",
                    value = "${config.totalAdsBlocked}",
                    color = MintSpeed,
                    modifier = Modifier.weight(1f)
                )
                QuickMetricTile(
                    label = "Trackers",
                    value = "${config.totalTrackersBlocked}",
                    color = Color(0xFF38BDF8),
                    modifier = Modifier.weight(1f)
                )
                QuickMetricTile(
                    label = "Videos Saltados",
                    value = "${config.totalVideoAdsSkipped}",
                    color = RoseAccent,
                    modifier = Modifier.weight(1f)
                )
                QuickMetricTile(
                    label = "Ahorro Datos",
                    value = "${String.format("%.1f", config.estimatedBandwidthSavedMb)} MB",
                    color = AmberEnergy,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Stealth Preset Quick Switcher
            Text("Modo de Evasión Activo:", fontSize = 10.5.sp, fontWeight = FontWeight.SemiBold, color = TextGrayLight)
            Spacer(modifier = Modifier.height(6.dp))

            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(AdBlockStealthMode.values()) { mode ->
                    val isSelected = config.stealthMode == mode
                    val modeColor = when (mode) {
                        AdBlockStealthMode.BALANCED -> Color(0xFF60A5FA)
                        AdBlockStealthMode.AGGRESSIVE -> AmberEnergy
                        AdBlockStealthMode.QUANTUM_STEALTH -> MintSpeed
                        AdBlockStealthMode.HARDCORE_TITAN -> RoseAccent
                    }
                    val label = when (mode) {
                        AdBlockStealthMode.BALANCED -> "Equilibrado"
                        AdBlockStealthMode.AGGRESSIVE -> "Agresivo"
                        AdBlockStealthMode.QUANTUM_STEALTH -> "Sigilo Cuántico"
                        AdBlockStealthMode.HARDCORE_TITAN -> "Titán Hardcore"
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) modeColor.copy(alpha = 0.2f) else Color(0xFF1E1E28))
                            .border(1.dp, if (isSelected) modeColor else Color(0xFF2E2E3C), RoundedCornerShape(8.dp))
                            .clickable {
                                AdBlockConfigManager.applyPreset(context, mode)
                                Toast.makeText(context, "Modo '$label' activado", Toast.LENGTH_SHORT).show()
                            }
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Text(
                            label,
                            fontSize = 10.5.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) modeColor else TextGrayLight
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Quick Phase Toggles Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                QuickPhaseToggle(
                    icon = Icons.Default.FastForward,
                    label = "Video Turbo (${config.videoSkipSpeedMultiplier.toInt()}x)",
                    isActive = config.videoAdTurboSkipperEnabled,
                    onClick = {
                        AdBlockConfigManager.saveConfig(
                            context,
                            config.copy(videoAdTurboSkipperEnabled = !config.videoAdTurboSkipperEnabled)
                        )
                    }
                )

                QuickPhaseToggle(
                    icon = Icons.Default.VisibilityOff,
                    label = "Anti-Adblock Honeypot",
                    isActive = config.antiAdblockDefeaterEnabled,
                    onClick = {
                        AdBlockConfigManager.saveConfig(
                            context,
                            config.copy(antiAdblockDefeaterEnabled = !config.antiAdblockDefeaterEnabled)
                        )
                    }
                )

                QuickPhaseToggle(
                    icon = Icons.Default.Cookie,
                    label = "Auto Cookie CMP",
                    isActive = config.cookieConsentAnnihilatorEnabled,
                    onClick = {
                        AdBlockConfigManager.saveConfig(
                            context,
                            config.copy(cookieConsentAnnihilatorEnabled = !config.cookieConsentAnnihilatorEnabled)
                        )
                    }
                )
            }
        }
    }
}

@Composable
private fun QuickMetricTile(
    label: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = 0.1f))
            .border(1.dp, color.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
            .padding(vertical = 6.dp, horizontal = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(value, fontSize = 12.sp, fontWeight = FontWeight.Black, color = color)
            Text(label, fontSize = 8.sp, color = TextGrayLight, maxLines = 1)
        }
    }
}

@Composable
private fun QuickPhaseToggle(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    isActive: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(if (isActive) MintSpeed.copy(alpha = 0.15f) else Color(0xFF1E1E28))
            .border(1.dp, if (isActive) MintSpeed.copy(alpha = 0.4f) else Color(0xFF2B2B38), RoundedCornerShape(6.dp))
            .clickable { onClick() }
            .padding(horizontal = 8.dp, vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            icon,
            contentDescription = null,
            tint = if (isActive) MintSpeed else TextGrayLight,
            modifier = Modifier.size(13.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            label,
            fontSize = 9.5.sp,
            fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
            color = if (isActive) MintSpeed else TextGrayLight
        )
    }
}
