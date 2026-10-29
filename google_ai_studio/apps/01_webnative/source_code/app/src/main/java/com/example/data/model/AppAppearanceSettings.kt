package com.example.data.model

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Palette Presets available for the application theme.
 */
enum class AppThemePreset(
    val title: String,
    val description: String,
    val backgroundColor: Color,
    val surfaceColor: Color,
    val cardColor: Color,
    val borderColor: Color,
    val isOled: Boolean = false,
    val isLight: Boolean = false
) {
    CYBER_DARK(
        title = "OLED Negro Puro",
        description = "Ahorro extremo de batería en pantallas AMOLED/OLED",
        backgroundColor = Color(0xFF000000),
        surfaceColor = Color(0xFF0D0D11),
        cardColor = Color(0xFF121217),
        borderColor = Color(0xFF262633),
        isOled = true
    ),
    TITANIUM_SLATE(
        title = "Titanio Slate",
        description = "Gris espacial moderno con estética aeroespacial",
        backgroundColor = Color(0xFF0B0F19),
        surfaceColor = Color(0xFF111827),
        cardColor = Color(0xFF1F2937),
        borderColor = Color(0xFF374151)
    ),
    VIOLET_NEON(
        title = "Violeta Neón M3",
        description = "Paleta insignia Material Design 3 con acentos púrpura",
        backgroundColor = Color(0xFF141218),
        surfaceColor = Color(0xFF1D1A22),
        cardColor = Color(0xFF2B2930),
        borderColor = Color(0xFF49454F)
    ),
    MIDNIGHT_NAVY(
        title = "Azul Medianoche",
        description = "Tono azul marino profundo para baja fatiga visual",
        backgroundColor = Color(0xFF070D18),
        surfaceColor = Color(0xFF0C1427),
        cardColor = Color(0xFF141F36),
        borderColor = Color(0xFF1E2E4E)
    ),
    EMERALD_NIGHT(
        title = "Esmeralda Turbo",
        description = "Verde cibernético con alto contraste y energía",
        backgroundColor = Color(0xFF05120E),
        surfaceColor = Color(0xFF0A1D17),
        cardColor = Color(0xFF102D24),
        borderColor = Color(0xFF1C4B3D)
    ),
    PRISTINE_LIGHT(
        title = "Modo Claro Moderno",
        description = "Fresco, limpio y de alto brillo para exteriores",
        backgroundColor = Color(0xFFF8FAFC),
        surfaceColor = Color(0xFFF1F5F9),
        cardColor = Color(0xFFFFFFFF),
        borderColor = Color(0xFFE2E8F0),
        isLight = true
    ),
    MATERIAL_YOU(
        title = "Material You Dinámico",
        description = "Sincronizado con el fondo de pantalla de tu dispositivo (Android 12+)",
        backgroundColor = Color(0xFF141218),
        surfaceColor = Color(0xFF1D1A22),
        cardColor = Color(0xFF2B2930),
        borderColor = Color(0xFF49454F)
    )
}

/**
 * Primary Accent Color Options.
 */
enum class AppAccentColor(
    val title: String,
    val primaryColor: Color,
    val onPrimaryColor: Color,
    val containerColor: Color
) {
    LAVENDER(
        title = "Lavanda Eléctrica",
        primaryColor = Color(0xFFD0BCFF),
        onPrimaryColor = Color(0xFF381E72),
        containerColor = Color(0xFF4F378B)
    ),
    MINT(
        title = "Menta Turbo",
        primaryColor = Color(0xFF34D399),
        onPrimaryColor = Color(0xFF064E3B),
        containerColor = Color(0xFF065F46)
    ),
    CYAN(
        title = "Cian Cyber",
        primaryColor = Color(0xFF38BDF8),
        onPrimaryColor = Color(0xFF082F49),
        containerColor = Color(0xFF075985)
    ),
    AMBER(
        title = "Ámbar Solar",
        primaryColor = Color(0xFFFBBF24),
        onPrimaryColor = Color(0xFF451A03),
        containerColor = Color(0xFF78350F)
    ),
    ROSE(
        title = "Rosa Magenta",
        primaryColor = Color(0xFFF472B6),
        onPrimaryColor = Color(0xFF500724),
        containerColor = Color(0xFF831843)
    ),
    SUNSET(
        title = "Atardecer Coral",
        primaryColor = Color(0xFFFB923C),
        onPrimaryColor = Color(0xFF431407),
        containerColor = Color(0xFF7C2D12)
    ),
    SAPPHIRE(
        title = "Azul Zafiro",
        primaryColor = Color(0xFF60A5FA),
        onPrimaryColor = Color(0xFF172554),
        containerColor = Color(0xFF1E40AF)
    )
}

/**
 * Corner Radius Style for cards, buttons, dialogs, and text fields.
 */
enum class AppCornerStyle(
    val title: String,
    val cardRadius: Dp,
    val buttonRadius: Dp,
    val chipRadius: Dp
) {
    SHARP(
        title = "Recto / Brutalist",
        cardRadius = 6.dp,
        buttonRadius = 4.dp,
        chipRadius = 4.dp
    ),
    COMPACT(
        title = "Compacto M2",
        cardRadius = 10.dp,
        buttonRadius = 8.dp,
        chipRadius = 6.dp
    ),
    ROUNDED(
        title = "Moderno M3 (Estándar)",
        cardRadius = 16.dp,
        buttonRadius = 12.dp,
        chipRadius = 8.dp
    ),
    PILL(
        title = "Ultra Curvo / Píldora",
        cardRadius = 24.dp,
        buttonRadius = 20.dp,
        chipRadius = 16.dp
    )
}

/**
 * Visual density and padding level.
 */
enum class AppDensity(
    val title: String,
    val horizontalPadding: Dp,
    val verticalPadding: Dp,
    val itemSpacing: Dp
) {
    COMPACT(
        title = "Compacta (Más información)",
        horizontalPadding = 10.dp,
        verticalPadding = 8.dp,
        itemSpacing = 8.dp
    ),
    BALANCED(
        title = "Equilibrada (Estándar)",
        horizontalPadding = 16.dp,
        verticalPadding = 12.dp,
        itemSpacing = 12.dp
    ),
    SPACIOUS(
        title = "Espaciosa (Mayor holgura)",
        horizontalPadding = 20.dp,
        verticalPadding = 16.dp,
        itemSpacing = 18.dp
    )
}

/**
 * Font Scale adjustment.
 */
enum class AppFontScale(
    val title: String,
    val scaleFactor: Float
) {
    COMPACT("Compacto (85%)", 0.85f),
    DEFAULT("Estándar (100%)", 1.0f),
    LARGE("Grande (115%)", 1.15f),
    EXTRA_LARGE("Extra Grande (130%)", 1.30f)
}

/**
 * Card Rendering & Material Style.
 */
enum class AppCardStyle(
    val title: String,
    val description: String,
    val alpha: Float,
    val borderAlpha: Float,
    val elevation: Dp
) {
    GLASS_BLUR(
        title = "Glassmorphism Traslúcido",
        description = "Efecto translúcido moderno con reflejos de borde",
        alpha = 0.82f,
        borderAlpha = 0.45f,
        elevation = 2.dp
    ),
    FLAT_MINIMAL(
        title = "Minimalista Plano",
        description = "Colores sólidos planos para máximo rendimiento y claridad",
        alpha = 1.0f,
        borderAlpha = 0.25f,
        elevation = 0.dp
    ),
    OLED_HIGH_CONTRAST(
        title = "Alto Contraste OLED",
        description = "Bordes luminosos nítidos sobre fondos oscuros",
        alpha = 1.0f,
        borderAlpha = 0.75f,
        elevation = 0.dp
    ),
    ELEVATED(
        title = "Elevado Material 3",
        description = "Profundidad y sombras suaves estilo Material You",
        alpha = 1.0f,
        borderAlpha = 0.2f,
        elevation = 6.dp
    )
}

/**
 * Navigation Layout & Placement Style.
 */
enum class AppNavbarStyle(
    val title: String,
    val isSidebar: Boolean = false,
    val isExpandedSidebar: Boolean = false
) {
    STANDARD_LABELED("Barra Inferior (Con Etiquetas)", isSidebar = false, isExpandedSidebar = false),
    ICON_ONLY("Barra Inferior (Solo Iconos)", isSidebar = false, isExpandedSidebar = false),
    FLOATING_PILL("Píldora Flotante Inferior", isSidebar = false, isExpandedSidebar = false),
    LEFT_SIDEBAR_RAIL("Barra Lateral Izquierda (Rail)", isSidebar = true, isExpandedSidebar = false),
    LEFT_SIDEBAR_EXPANDED("Barra Lateral Expandida", isSidebar = true, isExpandedSidebar = true)
}

/**
 * Animation speed preset.
 */
enum class AppAnimationSpeed(
    val title: String,
    val durationMs: Int
) {
    INSTANT("Instantáneo (0ms - RendIMIENTO Máximo)", 0),
    FAST("Rápido (150ms)", 150),
    SMOOTH("Fluido (300ms - Estándar)", 300)
}

/**
 * Visual Layout Styles for Sandbox Profile Cards.
 */
enum class SandboxProfileCardLayout(
    val title: String,
    val description: String,
    val iconEmoji: String
) {
    CYBER_GLASS(
        title = "Cyber Glass Neón",
        description = "Acentos futuristas brillantes, fondo translúcido y bordes luminosos",
        iconEmoji = "🔮"
    ),
    DETAILED_PRO(
        title = "Tarjeta Detallada Pro",
        description = "Desglose técnico integral, medidores de recursos y herramientas rápidas",
        iconEmoji = "📊"
    ),
    COMPACT_MINIMAL(
        title = "Minimalista Compacto",
        description = "Densidad ultra eficiente, máxima claridad visual y cero distracciones",
        iconEmoji = "⚡"
    ),
    EXECUTIVE_GRID(
        title = "Terminal Ejecutivo",
        description = "Estilo consola de desarrollo con indicadores LED y tipografía técnica",
        iconEmoji = "💻"
    )
}

/**
 * Widget Visibility Configuration for Sandbox Profiles section.
 */
data class SandboxWidgetVisibility(
    val showGoogleAccountBanner: Boolean = true,
    val showGoogleSuiteButton: Boolean = true,
    val showResourceMetrics: Boolean = true,
    val showAppListGrid: Boolean = true,
    val showInnovationChips: Boolean = true, // Mock GPS, VPN, E2EE
    val showActionButtons: Boolean = true,   // Snapshot, Rollback, Gemelo, Purgar
    val showAppCountBadge: Boolean = true,
    val showHardwarePolicies: Boolean = true
)

/**
 * Section Design Scopes allowing independent palettes and dimensions per screen.
 */
enum class SectionDesignScope(val title: String, val id: String) {
    GLOBAL("Personalización Global", "GLOBAL"),
    SANDBOX("Sección Sandbox", "SANDBOX"),
    TURBO_STUDIO("Turbo Studio", "TURBO_STUDIO"),
    EXPLORE("Explorar / Web Apps", "EXPLORE"),
    MY_APPS("Mis Apps Ancladas", "MY_APPS")
}

/**
 * Section-specific layout and color overrides.
 */
data class SectionAppearanceConfig(
    val sectionId: String = "GLOBAL",
    val customPrimaryColorHex: Long? = null,
    val customBackgroundColorHex: Long? = null,
    val customCardColorHex: Long? = null,
    val customBorderColorHex: Long? = null,
    val marginHorizontalDp: Int = 14,
    val marginVerticalDp: Int = 8,
    val paddingInternalDp: Int = 12,
    val spacingDp: Int = 12,
    val cornerRadiusDp: Int = 16,
    val fontScaleMultiplier: Float = 1.0f,
    val lineHeightMultiplier: Float = 1.0f,
    val iconScaleMultiplier: Float = 1.0f
)

/**
 * Saved custom design profile that users can name, store, export and re-apply.
 */
data class SavedDesignProfile(
    val id: String = "profile_${System.currentTimeMillis()}",
    val name: String = "Mi Perfil de Diseño",
    val description: String = "Perfil personalizado de colores y espaciados",
    val targetScope: String = "GLOBAL",
    val primaryColorHex: Long = 0xFF8B5CF6,
    val cornerRadiusDp: Int = 16,
    val spacingDp: Int = 12,
    val paddingDp: Int = 12,
    val marginHorizontalDp: Int = 14,
    val marginVerticalDp: Int = 8,
    val fontScaleMultiplier: Float = 1.0f,
    val themePresetName: String = "VIOLET_NEON",
    val createdAt: Long = System.currentTimeMillis()
)

/**
 * Master data class holding all design & appearance settings.
 */
data class AppAppearanceSettings(
    val themePreset: AppThemePreset = AppThemePreset.VIOLET_NEON,
    val accentColor: AppAccentColor = AppAccentColor.LAVENDER,
    val customPrimaryColorHex: Long? = null,
    val customCornerRadiusDp: Int = 16,
    val customPanelSpacingDp: Int = 12,
    val customPanelPaddingDp: Int = 12,
    val customMarginHorizontalDp: Int = 14,
    val customMarginVerticalDp: Int = 8,
    val customFontScaleMultiplier: Float = 1.0f,
    val customLineHeightMultiplier: Float = 1.0f,
    val cornerStyle: AppCornerStyle = AppCornerStyle.ROUNDED,
    val density: AppDensity = AppDensity.BALANCED,
    val fontScale: AppFontScale = AppFontScale.DEFAULT,
    val cardStyle: AppCardStyle = AppCardStyle.GLASS_BLUR,
    val navbarStyle: AppNavbarStyle = AppNavbarStyle.STANDARD_LABELED,
    val animationSpeed: AppAnimationSpeed = AppAnimationSpeed.SMOOTH,
    
    // Per-Section Overrides & Global Policy
    val isGlobalOverrideEnforced: Boolean = false,
    val activeEditingSection: SectionDesignScope = SectionDesignScope.GLOBAL,
    val sectionConfigs: Map<String, SectionAppearanceConfig> = emptyMap(),
    val savedDesignProfiles: List<SavedDesignProfile> = emptyList(),

    // WebView & Player UI controls
    val isGlobalImmersiveFullscreen: Boolean = true,
    val isHardwareAcceleration: Boolean = true,
    val isAggressiveCacheOptimization: Boolean = true,
    val isFloatingButtonVisible: Boolean = true,
    val isVolumeComboToggleEnabled: Boolean = true,
    val volumeComboRequiredPresses: Int = 3,
    val isDebugModeEnabled: Boolean = false,
    val isShowFpsOverlay: Boolean = false,
    val isShowFloatingDock: Boolean = false,
    val isShowDevInspector: Boolean = false,
    val isShowBlockedAdsBadge: Boolean = false,
    val isShowQuickNavArrows: Boolean = false,
    val isAutoInjectCopy: Boolean = true,
    val isSnaptubeDownloadButtonVisible: Boolean = true,
    val dockPosition: String = "BOTTOM_RIGHT",
    
    // Sandbox Customization & Profile Card Layouts
    val sandboxCardLayout: SandboxProfileCardLayout = SandboxProfileCardLayout.CYBER_GLASS,
    val sandboxWidgets: SandboxWidgetVisibility = SandboxWidgetVisibility()
)
