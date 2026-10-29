package com.example.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import com.example.data.model.AppAppearanceSettings
import com.example.data.model.AppCornerStyle
import com.example.data.model.AppThemePreset
import com.example.util.AppearanceSettingsManager
import com.example.util.DynamicThemeManager
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.unit.dp

val LocalAppAppearance = staticCompositionLocalOf { AppAppearanceSettings() }

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = true,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val context = LocalContext.current
    val appearanceSettings by AppearanceSettingsManager.settingsFlow.collectAsState()
    val dynamicPalette by DynamicThemeManager.currentPalette.collectAsState()
    val isDynamicEnabled by DynamicThemeManager.isDynamicThemeEnabled.collectAsState()

    val preset = appearanceSettings.themePreset
    val accent = appearanceSettings.accentColor
    val isLightMode = preset == AppThemePreset.PRISTINE_LIGHT || (!darkTheme && preset != AppThemePreset.CYBER_DARK)

    val effectivePrimary = appearanceSettings.customPrimaryColorHex?.let { Color(it) } ?: accent.primaryColor
    val effectiveContainer = appearanceSettings.customPrimaryColorHex?.let { Color(it).copy(alpha = 0.25f) } ?: accent.containerColor

    val colorScheme: ColorScheme = when {
        isDynamicEnabled && dynamicPalette != null -> {
            val palette = dynamicPalette!!
            darkColorScheme(
                primary = palette.primary,
                onPrimary = palette.onPrimary,
                primaryContainer = palette.primaryContainer,
                onPrimaryContainer = palette.onPrimaryContainer,
                secondary = palette.secondary,
                onSecondary = Color.White,
                secondaryContainer = palette.primaryContainer,
                onSecondaryContainer = palette.primary,
                tertiary = AmberEnergy,
                onTertiary = DeepPurpleOnPrimary,
                background = palette.background,
                onBackground = TextWhite,
                surface = palette.surface,
                onSurface = TextWhite,
                surfaceVariant = palette.surface,
                onSurfaceVariant = TextGrayLight,
                outline = palette.border,
                error = CoralError
            )
        }
        preset == AppThemePreset.MATERIAL_YOU && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (isLightMode) dynamicLightColorScheme(context) else dynamicDarkColorScheme(context)
        }
        isLightMode -> {
            lightColorScheme(
                primary = effectivePrimary,
                onPrimary = Color.White,
                primaryContainer = effectiveContainer,
                onPrimaryContainer = Color.White,
                secondary = effectivePrimary,
                onSecondary = Color.White,
                secondaryContainer = Color(0xFFE2E8F0),
                onSecondaryContainer = Color(0xFF1E293B),
                tertiary = AmberEnergy,
                onTertiary = TextDark,
                background = preset.backgroundColor,
                onBackground = TextDark,
                surface = preset.surfaceColor,
                onSurface = TextDark,
                surfaceVariant = preset.cardColor,
                onSurfaceVariant = TextGrayMuted,
                outline = preset.borderColor,
                error = CoralError
            )
        }
        else -> {
            // Dark Theme Palette driven by ThemePreset + AccentColor / Custom Primary
            darkColorScheme(
                primary = effectivePrimary,
                onPrimary = Color.White,
                primaryContainer = effectiveContainer,
                onPrimaryContainer = effectivePrimary,
                secondary = RoseAccent,
                onSecondary = RoseDarkText,
                secondaryContainer = preset.cardColor,
                onSecondaryContainer = effectivePrimary,
                tertiary = AmberEnergy,
                onTertiary = DeepPurpleOnPrimary,
                background = preset.backgroundColor,
                onBackground = TextWhite,
                surface = preset.surfaceColor,
                onSurface = TextWhite,
                surfaceVariant = preset.cardColor,
                onSurfaceVariant = TextGrayLight,
                outline = preset.borderColor,
                error = CoralError
            )
        }
    }

    val customRadius = appearanceSettings.customCornerRadiusDp.dp
    val shapes = Shapes(
        extraSmall = RoundedCornerShape((customRadius.value * 0.25f).coerceAtLeast(2f).dp),
        small = RoundedCornerShape((customRadius.value * 0.5f).coerceAtLeast(4f).dp),
        medium = RoundedCornerShape((customRadius.value * 0.75f).coerceAtLeast(6f).dp),
        large = RoundedCornerShape(customRadius),
        extraLarge = RoundedCornerShape((customRadius.value * 1.3f).coerceAtLeast(14f).dp)
    )

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                val statusBarColor = when {
                    isDynamicEnabled && dynamicPalette != null -> dynamicPalette!!.background
                    else -> preset.backgroundColor
                }
                val navBarColor = when {
                    isDynamicEnabled && dynamicPalette != null -> dynamicPalette!!.surface
                    else -> preset.surfaceColor
                }
                window.statusBarColor = statusBarColor.toArgb()
                window.navigationBarColor = navBarColor.toArgb()
                val insetsController = WindowCompat.getInsetsController(window, view)
                insetsController.isAppearanceLightStatusBars = isLightMode
                insetsController.isAppearanceLightNavigationBars = isLightMode
            }
        }
    }

    CompositionLocalProvider(
        LocalAppAppearance provides appearanceSettings
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            shapes = shapes,
            typography = Typography,
            content = content
        )
    }
}
