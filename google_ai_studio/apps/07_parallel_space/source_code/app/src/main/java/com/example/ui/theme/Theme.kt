package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val ParallelSpaceDarkColorScheme = darkColorScheme(
    primary = NeonCyan,
    onPrimary = Color(0xFF041E28),
    primaryContainer = Color(0xFF004D56),
    onPrimaryContainer = Color(0xFF8CF4FF),
    secondary = ElectricViolet,
    onSecondary = Color(0xFF380062),
    secondaryContainer = Color(0xFF5B188F),
    onSecondaryContainer = Color(0xFFE9D5FF),
    tertiary = CyberPink,
    onTertiary = Color(0xFF4A0025),
    tertiaryContainer = Color(0xFF7A0740),
    onTertiaryContainer = Color(0xFFFFD9E4),
    background = DeepSpaceBackground,
    onBackground = TextPrimary,
    surface = DeepSpaceSurface,
    onSurface = TextPrimary,
    surfaceVariant = DeepSpaceSurfaceVariant,
    onSurfaceVariant = TextSecondary,
    outline = DeepSpaceBorder,
    outlineVariant = Color(0xFF1F2942),
    error = Color(0xFFFF5252),
    onError = Color.White
)

private val ParallelSpaceLightColorScheme = lightColorScheme(
    primary = Color(0xFF00758F),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFB5EFFF),
    onPrimaryContainer = Color(0xFF001F28),
    secondary = Color(0xFF7E22CE),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFF3E8FF),
    onSecondaryContainer = Color(0xFF2E0854),
    tertiary = Color(0xFFBE185D),
    onTertiary = Color.White,
    background = Color(0xFFF8FAFC),
    onBackground = Color(0xFF0F172A),
    surface = Color.White,
    onSurface = Color(0xFF0F172A),
    surfaceVariant = Color(0xFFF1F5F9),
    onSurfaceVariant = Color(0xFF475569),
    outline = Color(0xFFCBD5E1)
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = true, // Parallel Space signature is default cosmic dark mode
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> ParallelSpaceDarkColorScheme
        else -> ParallelSpaceLightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
