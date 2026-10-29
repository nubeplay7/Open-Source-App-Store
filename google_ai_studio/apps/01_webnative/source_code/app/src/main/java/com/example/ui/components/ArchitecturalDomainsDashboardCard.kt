package com.example.ui.components

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.core.ModularizationRegistry
import com.example.core.model.DomainHealthStatus
import com.example.core.model.DomainModuleId
import com.example.ui.theme.*

/**
 * ArchitecturalDomainsDashboardCard:
 * UI Dashboard presenting the 8 decoupled, production-grade architectural domains
 * defined in MODULARIZATION_PLAN.md with live telemetry, status indicators, and domain controls.
 */
@Composable
fun ArchitecturalDomainsDashboardCard(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val domainStatuses by ModularizationRegistry.domainsStatusFlow.collectAsStateWithLifecycle()
    var isExpanded by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        ModularizationRegistry.refreshDomainsStatus(context)
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF161622)),
        border = BorderStroke(1.dp, Color(0xFF2C2C3E))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { isExpanded = !isExpanded },
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(LavenderPrimary.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.AccountTree,
                            contentDescription = null,
                            tint = LavenderPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            "Arquitectura Modular (8 Dominios Desacoplados)",
                            fontWeight = FontWeight.Bold,
                            color = TextWhite,
                            fontSize = 13.sp
                        )
                        Text(
                            "Estructura orientada a dominio con aislamiento total",
                            color = TextGrayMuted,
                            fontSize = 10.5.sp
                        )
                    }
                }

                IconButton(
                    onClick = {
                        ModularizationRegistry.refreshDomainsStatus(context)
                        Toast.makeText(context, "Telemetría de dominios actualizada", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        Icons.Default.Refresh,
                        contentDescription = "Actualizar",
                        tint = MintSpeed,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            AnimatedVisibility(visible = isExpanded) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    DomainModuleId.values().forEach { domain ->
                        val statusInfo = domainStatuses.find { it.domainId == domain }
                        val health = statusInfo?.status ?: DomainHealthStatus.ACTIVE
                        val details = statusInfo?.details ?: "Inicializado"
                        val memory = statusInfo?.memoryUsageDesc ?: "Optimizado"

                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFF1E1E2C),
                            border = BorderStroke(1.dp, Color(0xFF2E2E42))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    modifier = Modifier.weight(1f),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(34.dp)
                                            .clip(CircleShape)
                                            .background(Color(0xFF2E2E3C)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            domain.icon,
                                            contentDescription = null,
                                            tint = LavenderPrimary,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(
                                                text = domain.title,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 12.sp,
                                                color = TextWhite
                                            )
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Surface(
                                                shape = RoundedCornerShape(4.dp),
                                                color = when (health) {
                                                    DomainHealthStatus.ACTIVE -> MintSpeed.copy(alpha = 0.15f)
                                                    DomainHealthStatus.STANDBY -> Color(0xFF38BDF8).copy(alpha = 0.15f)
                                                    DomainHealthStatus.THROTTLED -> AmberEnergy.copy(alpha = 0.15f)
                                                    DomainHealthStatus.SUSPENDED -> Color(0xFF818CF8).copy(alpha = 0.15f)
                                                    DomainHealthStatus.ERROR -> Color(0xFFEF4444).copy(alpha = 0.15f)
                                                }
                                            ) {
                                                Text(
                                                    text = health.label,
                                                    fontSize = 8.5.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = when (health) {
                                                        DomainHealthStatus.ACTIVE -> MintSpeed
                                                        DomainHealthStatus.STANDBY -> Color(0xFF38BDF8)
                                                        DomainHealthStatus.THROTTLED -> AmberEnergy
                                                        DomainHealthStatus.SUSPENDED -> Color(0xFF818CF8)
                                                        DomainHealthStatus.ERROR -> Color(0xFFEF4444)
                                                    },
                                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                                )
                                            }
                                        }
                                        Text(
                                            text = details,
                                            fontSize = 10.sp,
                                            color = TextGrayLight,
                                            maxLines = 1
                                        )
                                        Text(
                                            text = "Memoria: $memory • Paquete: ${domain.packagePath}",
                                            fontSize = 9.sp,
                                            color = TextGrayMuted,
                                            maxLines = 1
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
