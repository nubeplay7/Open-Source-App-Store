package com.example.ui.components

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.*
import com.example.ui.theme.*
import com.example.util.AppearanceSettingsManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppearanceConfigurationHub(
    modifier: Modifier = Modifier,
    onClose: (() -> Unit)? = null
) {
    val context = LocalContext.current
    val settings by AppearanceSettingsManager.settingsFlow.collectAsState()

    var selectedSectionIndex by remember { mutableIntStateOf(0) }
    var showResetConfirmDialog by remember { mutableStateOf(false) }
    var previewMode by remember { mutableStateOf("WEBVIEW_LIVE") } // "WEBVIEW_LIVE" vs "COMPOSE_NATIVE"

    val sections = listOf(
        "⚡ Modo Lite & Módulos",
        "🎨 Tema & Color",
        "📦 Perfiles Sandbox & Widgets",
        "📐 Geometría & Densidad",
        "🎴 Tarjetas & Navbar",
        "⚡ Rendimiento & GPU",
        "🛠️ Controles & Debug"
    )

    if (showResetConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showResetConfirmDialog = false },
            title = { Text("Restablecer Apariencia", fontWeight = FontWeight.Bold) },
            text = { Text("¿Deseas restaurar todos los parámetros de diseño, colores, fuentes y geometría a sus valores de fábrica?") },
            confirmButton = {
                Button(
                    onClick = {
                        AppearanceSettingsManager.resetToDefaults(context)
                        showResetConfirmDialog = false
                        Toast.makeText(context, "Apariencia restablecida a valores por defecto", Toast.LENGTH_SHORT).show()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Restablecer", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetConfirmDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Header Banner
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.large,
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(MaterialTheme.shapes.medium)
                                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
                                .border(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.5f), MaterialTheme.shapes.medium),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Filled.Palette,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Centro de Diseño & Apariencia",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Black,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Personalización profunda de cada elemento visual",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    if (onClose != null) {
                        IconButton(onClick = onClose) {
                            Icon(Icons.Default.Close, contentDescription = "Cerrar", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Preview Mode Switcher (Isolated WebView Real-Time vs Native Compose)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Modo de Vista Previa",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        FilterChip(
                            selected = previewMode == "WEBVIEW_LIVE",
                            onClick = { previewMode = "WEBVIEW_LIVE" },
                            label = { Text("🌐 WebView Live (WindowMetrics)", fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.25f),
                                selectedLabelColor = MaterialTheme.colorScheme.primary
                            )
                        )
                        FilterChip(
                            selected = previewMode == "COMPOSE_NATIVE",
                            onClick = { previewMode = "COMPOSE_NATIVE" },
                            label = { Text("📱 Compose Nativo", fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.25f),
                                selectedLabelColor = MaterialTheme.colorScheme.primary
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // LIVE INTERACTIVE PREVIEW (ISOLATED WEBVIEW / NATIVE COMPOSE)
                if (previewMode == "WEBVIEW_LIVE") {
                    IsolatedCustomizerWebViewPreview(settings = settings)
                } else {
                    LiveAppearancePreviewCard(settings = settings)
                }
            }
        }

        // Section Tabs Carousel
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(sections.indices.toList()) { index ->
                val isSelected = selectedSectionIndex == index
                val tabColor by animateColorAsState(
                    targetValue = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                    animationSpec = tween(200)
                )
                val textColor = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant

                Box(
                    modifier = Modifier
                        .clip(MaterialTheme.shapes.medium)
                        .background(tabColor)
                        .border(
                            1.dp,
                            if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline,
                            MaterialTheme.shapes.medium
                        )
                        .clickable { selectedSectionIndex = index }
                        .padding(horizontal = 14.dp, vertical = 9.dp)
                ) {
                    Text(
                        text = sections[index],
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = textColor
                    )
                }
            }
        }

        // TAB CONTENT
        when (selectedSectionIndex) {
            0 -> LiteModeAndModularizationHub()
            1 -> ThemeAndPaletteSection(settings = settings, context = context)
            2 -> SandboxProfilesAndWidgetsSection(settings = settings, context = context)
            3 -> GeometryAndDensitySection(settings = settings, context = context)
            4 -> CardAndNavbarSection(settings = settings, context = context)
            5 -> PerformanceAndGpuSection(settings = settings, context = context)
            6 -> ControlsAndDebugSection(settings = settings, context = context)
        }

        // Global Reset to Defaults Button
        OutlinedButton(
            onClick = { showResetConfirmDialog = true },
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.medium,
            colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.5f))
        ) {
            Icon(Icons.Default.RestartAlt, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Restablecer Valores Predeterminados de Diseño", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }
    }
}

/**
 * Real-time Live Interactive Preview showing colors, typography, corners, and card styling.
 */
@Composable
fun LiveAppearancePreviewCard(settings: AppAppearanceSettings) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = when (settings.cornerStyle) {
            AppCornerStyle.SHARP -> RoundedCornerShape(6.dp)
            AppCornerStyle.COMPACT -> RoundedCornerShape(10.dp)
            AppCornerStyle.ROUNDED -> RoundedCornerShape(16.dp)
            AppCornerStyle.PILL -> RoundedCornerShape(24.dp)
        },
        colors = CardDefaults.cardColors(
            containerColor = settings.themePreset.cardColor.copy(alpha = settings.cardStyle.alpha)
        ),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            settings.themePreset.borderColor.copy(alpha = settings.cardStyle.borderAlpha)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = settings.cardStyle.elevation)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(settings.accentColor.primaryColor)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "VISTA PREVIA EN VIVO",
                        fontSize = (10 * settings.fontScale.scaleFactor).sp,
                        fontWeight = FontWeight.Black,
                        color = settings.accentColor.primaryColor,
                        letterSpacing = 1.sp
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(settings.accentColor.primaryColor.copy(alpha = 0.18f))
                        .border(1.dp, settings.accentColor.primaryColor.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = settings.themePreset.title,
                        fontSize = (9 * settings.fontScale.scaleFactor).sp,
                        fontWeight = FontWeight.Bold,
                        color = settings.accentColor.primaryColor
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "WebNative Hub Pro",
                        fontSize = (15 * settings.fontScale.scaleFactor).sp,
                        fontWeight = FontWeight.Bold,
                        color = if (settings.themePreset.isLight) Color(0xFF0F172A) else TextWhite
                    )
                    Text(
                        text = "Densidad: ${settings.density.title} • Esquinas: ${settings.cornerStyle.title}",
                        fontSize = (11 * settings.fontScale.scaleFactor).sp,
                        color = if (settings.themePreset.isLight) Color(0xFF64748B) else TextGrayLight
                    )
                }

                Button(
                    onClick = {},
                    shape = when (settings.cornerStyle) {
                        AppCornerStyle.SHARP -> RoundedCornerShape(4.dp)
                        AppCornerStyle.COMPACT -> RoundedCornerShape(8.dp)
                        AppCornerStyle.ROUNDED -> RoundedCornerShape(12.dp)
                        AppCornerStyle.PILL -> RoundedCornerShape(20.dp)
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = settings.accentColor.primaryColor,
                        contentColor = settings.accentColor.onPrimaryColor
                    ),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                    modifier = Modifier.height(34.dp)
                ) {
                    Text("Acción", fontSize = (11 * settings.fontScale.scaleFactor).sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

/**
 * Section 1: Themes & Accent Color
 */
@Composable
fun ThemeAndPaletteSection(settings: AppAppearanceSettings, context: android.content.Context) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(
                "Paleta de Tema Principal",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            // Preset Themes Grid
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                AppThemePreset.values().forEach { preset ->
                    val isSelected = settings.themePreset == preset
                    val borderColor = if (isSelected) settings.accentColor.primaryColor else MaterialTheme.colorScheme.outline

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { AppearanceSettingsManager.setThemePreset(context, preset) },
                        shape = MaterialTheme.shapes.medium,
                        colors = CardDefaults.cardColors(containerColor = preset.cardColor),
                        border = androidx.compose.foundation.BorderStroke(if (isSelected) 2.dp else 1.dp, borderColor)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(preset.backgroundColor)
                                        .border(2.dp, preset.borderColor, CircleShape)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        preset.title,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = if (preset.isLight) Color(0xFF0F172A) else TextWhite
                                    )
                                    Text(
                                        preset.description,
                                        fontSize = 11.sp,
                                        color = if (preset.isLight) Color(0xFF64748B) else TextGrayLight
                                    )
                                }
                            }

                            if (isSelected) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = "Seleccionado",
                                    tint = settings.accentColor.primaryColor,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                        }
                    }
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))

            Text(
                "Color de Acento Primario",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            // Accent Palette Circular Chips
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(AppAccentColor.values()) { accent ->
                    val isSelected = settings.accentColor == accent
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier
                            .clickable { AppearanceSettingsManager.setAccentColor(context, accent) }
                            .padding(4.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(accent.primaryColor)
                                .border(
                                    if (isSelected) 3.dp else 1.dp,
                                    if (isSelected) MaterialTheme.colorScheme.onSurface else Color.Transparent,
                                    CircleShape
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isSelected) {
                                Icon(
                                    Icons.Default.Check,
                                    contentDescription = null,
                                    tint = accent.onPrimaryColor,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            accent.title.split(" ").first(),
                            fontSize = 10.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}

/**
 * Section 2: Geometry, Density & Typography
 */
@Composable
fun GeometryAndDensitySection(settings: AppAppearanceSettings, context: android.content.Context) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(
                "Estilo de Bordes y Esquinas (Geometría)",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                AppCornerStyle.values().forEach { style ->
                    val isSelected = settings.cornerStyle == style
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(
                                when (style) {
                                    AppCornerStyle.SHARP -> RoundedCornerShape(4.dp)
                                    AppCornerStyle.COMPACT -> RoundedCornerShape(8.dp)
                                    AppCornerStyle.ROUNDED -> RoundedCornerShape(12.dp)
                                    AppCornerStyle.PILL -> RoundedCornerShape(20.dp)
                                }
                            )
                            .background(if (isSelected) settings.accentColor.primaryColor else MaterialTheme.colorScheme.surface)
                            .border(
                                1.dp,
                                if (isSelected) settings.accentColor.primaryColor else MaterialTheme.colorScheme.outline,
                                when (style) {
                                    AppCornerStyle.SHARP -> RoundedCornerShape(4.dp)
                                    AppCornerStyle.COMPACT -> RoundedCornerShape(8.dp)
                                    AppCornerStyle.ROUNDED -> RoundedCornerShape(12.dp)
                                    AppCornerStyle.PILL -> RoundedCornerShape(20.dp)
                                }
                            )
                            .clickable { AppearanceSettingsManager.setCornerStyle(context, style) }
                            .padding(vertical = 12.dp, horizontal = 4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            style.title.split(" ").first(),
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) settings.accentColor.onPrimaryColor else MaterialTheme.colorScheme.onSurface,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))

            Text(
                "Densidad de la Interfaz & Espaciado",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                AppDensity.values().forEach { density ->
                    val isSelected = settings.density == density
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(MaterialTheme.shapes.medium)
                            .background(if (isSelected) settings.accentColor.primaryColor.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface)
                            .border(
                                1.dp,
                                if (isSelected) settings.accentColor.primaryColor else MaterialTheme.colorScheme.outline,
                                MaterialTheme.shapes.medium
                            )
                            .clickable { AppearanceSettingsManager.setDensity(context, density) }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(density.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
                            Text("Padding: ${density.horizontalPadding} • Espaciado: ${density.itemSpacing}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        RadioButton(
                            selected = isSelected,
                            onClick = { AppearanceSettingsManager.setDensity(context, density) }
                        )
                    }
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))

            Text(
                "Escala de Tipografía y Textos",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                AppFontScale.values().forEach { fontScale ->
                    val isSelected = settings.fontScale == fontScale
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(MaterialTheme.shapes.medium)
                            .background(if (isSelected) settings.accentColor.primaryColor else MaterialTheme.colorScheme.surface)
                            .border(1.dp, if (isSelected) settings.accentColor.primaryColor else MaterialTheme.colorScheme.outline, MaterialTheme.shapes.medium)
                            .clickable { AppearanceSettingsManager.setFontScale(context, fontScale) }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            fontScale.title.split(" ").first(),
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) settings.accentColor.onPrimaryColor else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}

/**
 * Section 3: Cards & Navigation Bar
 */
@Composable
fun CardAndNavbarSection(settings: AppAppearanceSettings, context: android.content.Context) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(
                "Estilo de Tarjetas y Superficies",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                AppCardStyle.values().forEach { cardStyle ->
                    val isSelected = settings.cardStyle == cardStyle
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { AppearanceSettingsManager.setCardStyle(context, cardStyle) },
                        shape = MaterialTheme.shapes.medium,
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        ),
                        border = androidx.compose.foundation.BorderStroke(
                            if (isSelected) 2.dp else 1.dp,
                            if (isSelected) settings.accentColor.primaryColor else MaterialTheme.colorScheme.outline
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(cardStyle.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
                                Text(cardStyle.description, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            RadioButton(
                                selected = isSelected,
                                onClick = { AppearanceSettingsManager.setCardStyle(context, cardStyle) }
                            )
                        }
                    }
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))

            Text(
                "Disposición & Barra de Navegación",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                AppNavbarStyle.values().forEach { navStyle ->
                    val isSelected = settings.navbarStyle == navStyle
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(MaterialTheme.shapes.medium)
                            .background(if (isSelected) settings.accentColor.primaryColor.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface)
                            .border(
                                1.dp,
                                if (isSelected) settings.accentColor.primaryColor else MaterialTheme.colorScheme.outline,
                                MaterialTheme.shapes.medium
                            )
                            .clickable { AppearanceSettingsManager.setNavbarStyle(context, navStyle) }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(
                                if (navStyle.isSidebar) Icons.Default.ViewSidebar else Icons.Default.ViewAgenda,
                                contentDescription = null,
                                tint = if (isSelected) settings.accentColor.primaryColor else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    navStyle.title,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    if (navStyle.isSidebar) "Barra lateral con accesos directos por sección y botones integrados" else "Navegación tradicional en la parte inferior de la pantalla",
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        RadioButton(
                            selected = isSelected,
                            onClick = { AppearanceSettingsManager.setNavbarStyle(context, navStyle) }
                        )
                    }
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))

            Text(
                "Velocidad de Animaciones y Transiciones",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                AppAnimationSpeed.values().forEach { speed ->
                    val isSelected = settings.animationSpeed == speed
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(MaterialTheme.shapes.medium)
                            .background(if (isSelected) settings.accentColor.primaryColor else MaterialTheme.colorScheme.surface)
                            .border(1.dp, if (isSelected) settings.accentColor.primaryColor else MaterialTheme.colorScheme.outline, MaterialTheme.shapes.medium)
                            .clickable { AppearanceSettingsManager.setAnimationSpeed(context, speed) }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            speed.title.split(" ").first(),
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) settings.accentColor.onPrimaryColor else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}

/**
 * Section 4: Performance & Hardware Acceleration
 */
@Composable
fun PerformanceAndGpuSection(settings: AppAppearanceSettings, context: android.content.Context) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(
                "Motor Gráfico WebView & Renderizado",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            AppearanceSwitchRow(
                icon = Icons.Default.Speed,
                title = "Aceleración por Hardware (GPU Turbo)",
                subtitle = "Renderizado acelerado por hardware GPU para WebGL, Canvas y animaciones fluidas 120Hz",
                checked = settings.isHardwareAcceleration,
                onCheckedChange = { AppearanceSettingsManager.setHardwareAccelerationEnabled(context, it) }
            )

            AppearanceSwitchRow(
                icon = Icons.Default.Fullscreen,
                title = "Pantalla Completa Inmersiva Global",
                subtitle = "Oculta barras del sistema para máxima inmersión en todas las aplicaciones web",
                checked = settings.isGlobalImmersiveFullscreen,
                onCheckedChange = { AppearanceSettingsManager.setGlobalImmersiveFullscreenEnabled(context, it) }
            )

            AppearanceSwitchRow(
                icon = Icons.Default.Storage,
                title = "Optimización Agresiva de Caché",
                subtitle = "Carga instantánea sin conexión y preservación de recursos en memoria",
                checked = settings.isAggressiveCacheOptimization,
                onCheckedChange = { AppearanceSettingsManager.setAggressiveCacheOptimizationEnabled(context, it) }
            )

            AppearanceSwitchRow(
                icon = Icons.Default.ContentCopy,
                title = "Inyección Automática de Selección / Copiado",
                subtitle = "Habilita copiar textos en páginas con restricciones de portapapeles",
                checked = settings.isAutoInjectCopy,
                onCheckedChange = { AppearanceSettingsManager.setAutoInjectCopyEnabled(context, it) }
            )
        }
    }
}

/**
 * Section 5: Controls, Floating Dock & Debug Mode
 */
@Composable
fun ControlsAndDebugSection(settings: AppAppearanceSettings, context: android.content.Context) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(
                "Controles Flotantes & Atajos de Hardware",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            AppearanceSwitchRow(
                icon = Icons.Default.TouchApp,
                title = "Botón Flotante de Ajustes",
                subtitle = "Muestra el botón flotante en pantalla para acceder a los ajustes durante la navegación",
                checked = settings.isFloatingButtonVisible,
                onCheckedChange = { AppearanceSettingsManager.setFloatingButtonVisible(context, it) }
            )

            AppearanceSwitchRow(
                icon = Icons.Default.Download,
                title = "Botón Flotante Descargador Snaptube",
                subtitle = "Muestra el botón flotante de descarga cuando se detecten videos o pistas de audio",
                checked = settings.isSnaptubeDownloadButtonVisible,
                onCheckedChange = { AppearanceSettingsManager.setSnaptubeDownloadButtonVisible(context, it) }
            )

            AppearanceSwitchRow(
                icon = Icons.Default.VolumeUp,
                title = "Atajo Teclas de Volumen (Vol+ / Vol-)",
                subtitle = "Presionar ambas teclas de volumen a la vez alterna la visibilidad del botón flotante",
                checked = settings.isVolumeComboToggleEnabled,
                onCheckedChange = { AppearanceSettingsManager.setVolumeComboToggleEnabled(context, it) }
            )

            if (settings.isVolumeComboToggleEnabled) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Pulsaciones Requeridas: ${settings.volumeComboRequiredPresses}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = { AppearanceSettingsManager.setVolumeComboRequiredPresses(context, settings.volumeComboRequiredPresses - 1) },
                            enabled = settings.volumeComboRequiredPresses > 1
                        ) {
                            Icon(Icons.Default.Remove, contentDescription = "Menos")
                        }
                        Text("${settings.volumeComboRequiredPresses}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        IconButton(
                            onClick = { AppearanceSettingsManager.setVolumeComboRequiredPresses(context, settings.volumeComboRequiredPresses + 1) },
                            enabled = settings.volumeComboRequiredPresses < 10
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Más")
                        }
                    }
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))

            Text(
                "Herramientas de Depuración & Overlays",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            AppearanceSwitchRow(
                icon = Icons.Default.BugReport,
                title = "Modo Desarrollador / Debug Master",
                subtitle = "Habilita herramientas técnicas e inspección en vivo de aplicaciones web",
                checked = settings.isDebugModeEnabled,
                onCheckedChange = { AppearanceSettingsManager.setDebugModeEnabled(context, it) }
            )

            AnimatedVisibility(visible = settings.isDebugModeEnabled) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    AppearanceSwitchRow(
                        icon = Icons.Default.Speed,
                        title = "Overlay FPS en Vivo",
                        subtitle = "Monitor flotante de cuadros por segundo en tiempo real",
                        checked = settings.isShowFpsOverlay,
                        onCheckedChange = { AppearanceSettingsManager.setShowFpsOverlayEnabled(context, it) }
                    )

                    AppearanceSwitchRow(
                        icon = Icons.Default.Code,
                        title = "Inspector Web / DevTools",
                        subtitle = "Botón para inspeccionar consola, red y árbol DOM",
                        checked = settings.isShowDevInspector,
                        onCheckedChange = { AppearanceSettingsManager.setShowDevInspectorEnabled(context, it) }
                    )

                    AppearanceSwitchRow(
                        icon = Icons.Default.Shield,
                        title = "Insignia de Anuncios Bloqueados",
                        subtitle = "Muestra el conteo de rastreadores y publicidad bloqueada",
                        checked = settings.isShowBlockedAdsBadge,
                        onCheckedChange = { AppearanceSettingsManager.setShowBlockedAdsBadgeEnabled(context, it) }
                    )

                    AppearanceSwitchRow(
                        icon = Icons.Default.ArrowForward,
                        title = "Flechas de Navegación Rápida",
                        subtitle = "Botones flotantes de Atrás / Adelante sobre la web",
                        checked = settings.isShowQuickNavArrows,
                        onCheckedChange = { AppearanceSettingsManager.setShowQuickNavArrowsEnabled(context, it) }
                    )
                }
            }
        }
    }
}

@Composable
fun AppearanceSwitchRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(MaterialTheme.shapes.medium)
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, MaterialTheme.colorScheme.outline, MaterialTheme.shapes.medium)
            .clickable { onCheckedChange(!checked) }
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = if (checked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
                Text(subtitle, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        Spacer(modifier = Modifier.width(8.dp))
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

/**
 * Section: Sandbox Profiles & Widget Customization
 */
@Composable
fun SandboxProfilesAndWidgetsSection(
    settings: AppAppearanceSettings,
    context: android.content.Context
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(
                "Diseño de Tarjetas de Perfil Sandbox",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                "Selecciona entre diferentes perfiles visuales diseñados para optimizar la visualización y trabajo con tus entornos aislados.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Layout Selector Cards
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                SandboxProfileCardLayout.values().forEach { layout ->
                    val isSelected = settings.sandboxCardLayout == layout
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { AppearanceSettingsManager.setSandboxCardLayout(context, layout) },
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surface
                        ),
                        border = androidx.compose.foundation.BorderStroke(
                            if (isSelected) 2.dp else 1.dp,
                            if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(layout.iconEmoji, fontSize = 24.sp)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    layout.title,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    layout.description,
                                    fontSize = 11.sp,
                                    color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f) else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            if (isSelected) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))

            Text(
                "Editor de Widgets y Elementos Visibles",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                "Activa o desactiva qué elementos y métricas deseas que aparezcan dentro de tus tarjetas de perfil.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                AppearanceSwitchRow(
                    icon = Icons.Default.AccountCircle,
                    title = "Banner de Cuenta Google",
                    subtitle = "Muestra la identidad y correo Google asociado a este sandbox",
                    checked = settings.sandboxWidgets.showGoogleAccountBanner,
                    onCheckedChange = { checked ->
                        AppearanceSettingsManager.updateSandboxWidgets(context) {
                            it.copy(showGoogleAccountBanner = checked)
                        }
                    }
                )

                AppearanceSwitchRow(
                    icon = Icons.Default.AutoAwesome,
                    title = "Botón Suite Google / IA",
                    subtitle = "Muestra el botón 'Suite Google/IA' dentro del contenedor para auto-instalar la suite",
                    checked = settings.sandboxWidgets.showGoogleSuiteButton,
                    onCheckedChange = { checked ->
                        AppearanceSettingsManager.updateSandboxWidgets(context) {
                            it.copy(showGoogleSuiteButton = checked)
                        }
                    }
                )

                AppearanceSwitchRow(
                    icon = Icons.Default.Speed,
                    title = "Métricas de Recursos (RAM, Cookies, Almacenamiento)",
                    subtitle = "Muestra el consumo de memoria en vivo y espacio asignado",
                    checked = settings.sandboxWidgets.showResourceMetrics,
                    onCheckedChange = { checked ->
                        AppearanceSettingsManager.updateSandboxWidgets(context) {
                            it.copy(showResourceMetrics = checked)
                        }
                    }
                )

                AppearanceSwitchRow(
                    icon = Icons.Default.Apps,
                    title = "Rejilla de WebApps Ancladas",
                    subtitle = "Visualiza y lanza las aplicaciones instaladas dentro del contenedor",
                    checked = settings.sandboxWidgets.showAppListGrid,
                    onCheckedChange = { checked ->
                        AppearanceSettingsManager.updateSandboxWidgets(context) {
                            it.copy(showAppListGrid = checked)
                        }
                    }
                )

                AppearanceSwitchRow(
                    icon = Icons.Default.Explore,
                    title = "Chips de Innovación (Mock GPS, VPN, E2EE)",
                    subtitle = "Acceso directo a spoofing cinemático, túnel de salida y sincronización",
                    checked = settings.sandboxWidgets.showInnovationChips,
                    onCheckedChange = { checked ->
                        AppearanceSettingsManager.updateSandboxWidgets(context) {
                            it.copy(showInnovationChips = checked)
                        }
                    }
                )

                AppearanceSwitchRow(
                    icon = Icons.Default.Bolt,
                    title = "Botones de Acción (Snapshot, Rollback, Gemelo, Purgar)",
                    subtitle = "Barra inferior de operaciones rápidas sobre el estado del sandbox",
                    checked = settings.sandboxWidgets.showActionButtons,
                    onCheckedChange = { checked ->
                        AppearanceSettingsManager.updateSandboxWidgets(context) {
                            it.copy(showActionButtons = checked)
                        }
                    }
                )
            }
        }
    }
}
