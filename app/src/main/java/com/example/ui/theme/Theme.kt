package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color


private val SophisticatedDarkColorScheme = darkColorScheme(
  primary = Emerald400,
  onPrimary = Slate950,
  primaryContainer = Emerald900,
  onPrimaryContainer = Emerald400,
  inversePrimary = Emerald600,

  secondary = Sky400,
  onSecondary = Slate950,
  secondaryContainer = Sky900,
  onSecondaryContainer = Sky400,

  tertiary = Amber400,
  onTertiary = Slate950,
  tertiaryContainer = Amber900,
  onTertiaryContainer = Amber400,

  background = Slate950,
  onBackground = Slate100,

  surface = Slate900,
  onSurface = Slate100,
  surfaceVariant = Slate800,
  onSurfaceVariant = Slate400,
  surfaceContainer = Slate900,
  surfaceContainerHigh = Slate850,
  surfaceContainerHighest = Slate800,
  surfaceContainerLow = Slate950,

  outline = Slate700,
  outlineVariant = Slate800,

  error = Rose400,
  onError = Slate950,
  errorContainer = Color(0xFF4C0519),
  onErrorContainer = Rose400
)

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = true,
  dynamicColor: Boolean = false,
  content: @Composable () -> Unit,
) {
  MaterialTheme(
    colorScheme = SophisticatedDarkColorScheme,
    typography = Typography,
    content = content
  )
}

