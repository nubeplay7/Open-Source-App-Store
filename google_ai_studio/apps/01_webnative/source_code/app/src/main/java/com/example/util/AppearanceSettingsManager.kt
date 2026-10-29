package com.example.util

import android.content.Context
import com.example.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject

object AppearanceSettingsManager {
    private const val PREFS_NAME = "webnative_appearance_prefs"

    // Theme & UI Design keys
    private const val KEY_THEME_PRESET = "key_theme_preset"
    private const val KEY_ACCENT_COLOR = "key_accent_color"
    private const val KEY_CORNER_STYLE = "key_corner_style"
    private const val KEY_DENSITY = "key_density"
    private const val KEY_FONT_SCALE = "key_font_scale"
    private const val KEY_CARD_STYLE = "key_card_style"
    private const val KEY_NAVBAR_STYLE = "key_navbar_style"
    private const val KEY_ANIMATION_SPEED = "key_animation_speed"
    private const val KEY_CUSTOM_PRIMARY_HEX = "key_custom_primary_hex"
    private const val KEY_CUSTOM_CORNER_RADIUS_DP = "key_custom_corner_radius_dp"
    private const val KEY_CUSTOM_PANEL_SPACING_DP = "key_custom_panel_spacing_dp"
    private const val KEY_CUSTOM_PANEL_PADDING_DP = "key_custom_panel_padding_dp"
    private const val KEY_CUSTOM_MARGIN_HORIZ_DP = "key_custom_margin_horiz_dp"
    private const val KEY_CUSTOM_MARGIN_VERT_DP = "key_custom_margin_vert_dp"
    private const val KEY_CUSTOM_FONT_SCALE_MULT = "key_custom_font_scale_mult"
    private const val KEY_CUSTOM_LINE_HEIGHT_MULT = "key_custom_line_height_mult"
    private const val KEY_GLOBAL_OVERRIDE_ENFORCED = "key_global_override_enforced"
    private const val KEY_SAVED_PROFILES_JSON = "key_saved_profiles_json"
    private const val KEY_SECTION_CONFIGS_JSON = "key_section_configs_json"

    // Web & System keys
    private const val KEY_DOCK_POSITION = "key_dock_position"
    private const val KEY_DEFAULT_HOME_URL = "key_default_home_url"
    private const val KEY_AUTO_INJECT_COPY = "key_auto_inject_copy"
    private const val KEY_GLOBAL_IMMERSIVE_FULLSCREEN = "key_global_immersive_fullscreen"
    private const val KEY_HARDWARE_ACCELERATION = "key_hardware_acceleration"
    private const val KEY_AGGRESSIVE_CACHE_OPTIMIZATION = "key_aggressive_cache_optimization"
    private const val KEY_DEBUG_MODE_ENABLED = "key_debug_mode_enabled"
    private const val KEY_SHOW_FPS_OVERLAY = "key_show_fps_overlay"
    private const val KEY_SHOW_FLOATING_DOCK = "key_show_floating_dock"
    private const val KEY_SHOW_DEV_INSPECTOR = "key_show_dev_inspector"
    private const val KEY_SHOW_BLOCKED_ADS_BADGE = "key_show_blocked_ads_badge"
    private const val KEY_SHOW_QUICK_NAV_ARROWS = "key_show_quick_nav_arrows"

    // Volume Keys Combo & Floating Button Visibility Configuration
    private const val KEY_VOLUME_COMBO_TOGGLE_ENABLED = "key_volume_combo_toggle_enabled"
    private const val KEY_VOLUME_COMBO_REQUIRED_PRESSES = "key_volume_combo_required_presses"
    private const val KEY_FLOATING_BUTTON_VISIBLE = "key_floating_button_visible"
    private const val KEY_SHOW_SNAPTUBE_DOWNLOAD_BUTTON = "key_show_snaptube_download_button"

    // Sandbox Profile Card Layout & Widget Visibility keys
    private const val KEY_SANDBOX_CARD_LAYOUT = "key_sandbox_card_layout"
    private const val KEY_SANDBOX_WIDGETS_JSON = "key_sandbox_widgets_json"

    // Reactive Master Settings Flow
    private val _settingsFlow = MutableStateFlow(AppAppearanceSettings())
    val settingsFlow: StateFlow<AppAppearanceSettings> = _settingsFlow.asStateFlow()

    // Individual reactive flows for legacy/direct listeners
    private val _floatingButtonVisibilityFlow = MutableStateFlow(true)
    val floatingButtonVisibilityFlow: StateFlow<Boolean> = _floatingButtonVisibilityFlow.asStateFlow()

    private val _debugModeFlow = MutableStateFlow(false)
    val debugModeFlow: StateFlow<Boolean> = _debugModeFlow.asStateFlow()

    private val _hardwareAccelerationFlow = MutableStateFlow(true)
    val hardwareAccelerationFlow: StateFlow<Boolean> = _hardwareAccelerationFlow.asStateFlow()

    const val DOCK_POS_BOTTOM_CENTER = "BOTTOM_CENTER"
    const val DOCK_POS_BOTTOM_RIGHT = "BOTTOM_RIGHT"
    const val DOCK_POS_TOP_RIGHT = "TOP_RIGHT"

    /**
     * Initializes all appearance settings from SharedPreferences on app startup.
     */
    fun initialize(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        val themePresetName = prefs.getString(KEY_THEME_PRESET, AppThemePreset.VIOLET_NEON.name)
        val themePreset = runCatching { AppThemePreset.valueOf(themePresetName ?: "") }.getOrDefault(AppThemePreset.VIOLET_NEON)

        val accentColorName = prefs.getString(KEY_ACCENT_COLOR, AppAccentColor.LAVENDER.name)
        val accentColor = runCatching { AppAccentColor.valueOf(accentColorName ?: "") }.getOrDefault(AppAccentColor.LAVENDER)

        val cornerStyleName = prefs.getString(KEY_CORNER_STYLE, AppCornerStyle.ROUNDED.name)
        val cornerStyle = runCatching { AppCornerStyle.valueOf(cornerStyleName ?: "") }.getOrDefault(AppCornerStyle.ROUNDED)

        val densityName = prefs.getString(KEY_DENSITY, AppDensity.BALANCED.name)
        val density = runCatching { AppDensity.valueOf(densityName ?: "") }.getOrDefault(AppDensity.BALANCED)

        val fontScaleName = prefs.getString(KEY_FONT_SCALE, AppFontScale.DEFAULT.name)
        val fontScale = runCatching { AppFontScale.valueOf(fontScaleName ?: "") }.getOrDefault(AppFontScale.DEFAULT)

        val cardStyleName = prefs.getString(KEY_CARD_STYLE, AppCardStyle.GLASS_BLUR.name)
        val cardStyle = runCatching { AppCardStyle.valueOf(cardStyleName ?: "") }.getOrDefault(AppCardStyle.GLASS_BLUR)

        val navbarStyleName = prefs.getString(KEY_NAVBAR_STYLE, AppNavbarStyle.STANDARD_LABELED.name)
        val navbarStyle = runCatching { AppNavbarStyle.valueOf(navbarStyleName ?: "") }.getOrDefault(AppNavbarStyle.STANDARD_LABELED)

        val animationSpeedName = prefs.getString(KEY_ANIMATION_SPEED, AppAnimationSpeed.SMOOTH.name)
        val animationSpeed = runCatching { AppAnimationSpeed.valueOf(animationSpeedName ?: "") }.getOrDefault(AppAnimationSpeed.SMOOTH)

        val isFullscreen = prefs.getBoolean(KEY_GLOBAL_IMMERSIVE_FULLSCREEN, true)
        val isHardware = prefs.getBoolean(KEY_HARDWARE_ACCELERATION, true)
        val isCache = prefs.getBoolean(KEY_AGGRESSIVE_CACHE_OPTIMIZATION, true)
        val isFloatBtn = prefs.getBoolean(KEY_FLOATING_BUTTON_VISIBLE, true)
        val isVolCombo = prefs.getBoolean(KEY_VOLUME_COMBO_TOGGLE_ENABLED, true)
        val volPresses = prefs.getInt(KEY_VOLUME_COMBO_REQUIRED_PRESSES, 3).coerceIn(1, 10)
        val isDebug = prefs.getBoolean(KEY_DEBUG_MODE_ENABLED, false)
        val isFps = prefs.getBoolean(KEY_SHOW_FPS_OVERLAY, false)
        val isFloatDock = prefs.getBoolean(KEY_SHOW_FLOATING_DOCK, false)
        val isDevInsp = prefs.getBoolean(KEY_SHOW_DEV_INSPECTOR, false)
        val isAdsBadge = prefs.getBoolean(KEY_SHOW_BLOCKED_ADS_BADGE, false)
        val isQuickNav = prefs.getBoolean(KEY_SHOW_QUICK_NAV_ARROWS, false)
        val isAutoInject = prefs.getBoolean(KEY_AUTO_INJECT_COPY, true)
        val isSnaptubeBtn = prefs.getBoolean(KEY_SHOW_SNAPTUBE_DOWNLOAD_BUTTON, true)
        val isGlobalOverride = prefs.getBoolean(KEY_GLOBAL_OVERRIDE_ENFORCED, false)
        val dockPos = prefs.getString(KEY_DOCK_POSITION, DOCK_POS_BOTTOM_RIGHT) ?: DOCK_POS_BOTTOM_RIGHT

        val customPrimaryHex = if (prefs.contains(KEY_CUSTOM_PRIMARY_HEX)) prefs.getLong(KEY_CUSTOM_PRIMARY_HEX, 0L).let { if (it == 0L) null else it } else null
        val customCornerRadiusDp = prefs.getInt(KEY_CUSTOM_CORNER_RADIUS_DP, 16).coerceIn(0, 36)
        val customPanelSpacingDp = prefs.getInt(KEY_CUSTOM_PANEL_SPACING_DP, 12).coerceIn(2, 36)
        val customPanelPaddingDp = prefs.getInt(KEY_CUSTOM_PANEL_PADDING_DP, 12).coerceIn(2, 32)
        val customMarginHorizDp = prefs.getInt(KEY_CUSTOM_MARGIN_HORIZ_DP, 14).coerceIn(0, 32)
        val customMarginVertDp = prefs.getInt(KEY_CUSTOM_MARGIN_VERT_DP, 8).coerceIn(0, 24)
        val customFontScaleMult = prefs.getFloat(KEY_CUSTOM_FONT_SCALE_MULT, 1.0f).coerceIn(0.7f, 1.5f)
        val customLineHeightMult = prefs.getFloat(KEY_CUSTOM_LINE_HEIGHT_MULT, 1.0f).coerceIn(0.7f, 1.5f)

        // Load section configs
        val sectionConfigsMap = parseSectionConfigs(prefs.getString(KEY_SECTION_CONFIGS_JSON, null))
        // Load saved design profiles
        val savedProfilesList = parseSavedProfiles(prefs.getString(KEY_SAVED_PROFILES_JSON, null))

        val sandboxLayoutName = prefs.getString(KEY_SANDBOX_CARD_LAYOUT, SandboxProfileCardLayout.CYBER_GLASS.name)
        val sandboxLayout = runCatching { SandboxProfileCardLayout.valueOf(sandboxLayoutName ?: "") }.getOrDefault(SandboxProfileCardLayout.CYBER_GLASS)
        val sandboxWidgets = parseSandboxWidgets(prefs.getString(KEY_SANDBOX_WIDGETS_JSON, null))

        val loaded = AppAppearanceSettings(
            themePreset = themePreset,
            accentColor = accentColor,
            customPrimaryColorHex = customPrimaryHex,
            customCornerRadiusDp = customCornerRadiusDp,
            customPanelSpacingDp = customPanelSpacingDp,
            customPanelPaddingDp = customPanelPaddingDp,
            customMarginHorizontalDp = customMarginHorizDp,
            customMarginVerticalDp = customMarginVertDp,
            customFontScaleMultiplier = customFontScaleMult,
            customLineHeightMultiplier = customLineHeightMult,
            cornerStyle = cornerStyle,
            density = density,
            fontScale = fontScale,
            cardStyle = cardStyle,
            navbarStyle = navbarStyle,
            animationSpeed = animationSpeed,
            isGlobalOverrideEnforced = isGlobalOverride,
            sectionConfigs = sectionConfigsMap,
            savedDesignProfiles = savedProfilesList,
            isGlobalImmersiveFullscreen = isFullscreen,
            isHardwareAcceleration = isHardware,
            isAggressiveCacheOptimization = isCache,
            isFloatingButtonVisible = isFloatBtn,
            isVolumeComboToggleEnabled = isVolCombo,
            volumeComboRequiredPresses = volPresses,
            isDebugModeEnabled = isDebug,
            isShowFpsOverlay = isFps,
            isShowFloatingDock = isFloatDock,
            isShowDevInspector = isDevInsp,
            isShowBlockedAdsBadge = isAdsBadge,
            isShowQuickNavArrows = isQuickNav,
            isAutoInjectCopy = isAutoInject,
            isSnaptubeDownloadButtonVisible = isSnaptubeBtn,
            dockPosition = dockPos,
            sandboxCardLayout = sandboxLayout,
            sandboxWidgets = sandboxWidgets
        )

        _settingsFlow.value = loaded
        _floatingButtonVisibilityFlow.value = isFloatBtn
        _debugModeFlow.value = isDebug
        _hardwareAccelerationFlow.value = isHardware
    }

    private fun parseSectionConfigs(jsonStr: String?): Map<String, SectionAppearanceConfig> {
        if (jsonStr.isNullOrBlank()) return emptyMap()
        val result = mutableMapOf<String, SectionAppearanceConfig>()
        try {
            val root = JSONObject(jsonStr)
            val keys = root.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val obj = root.getJSONObject(key)
                result[key] = SectionAppearanceConfig(
                    sectionId = obj.optString("sectionId", key),
                    customPrimaryColorHex = if (obj.has("customPrimaryColorHex")) obj.optLong("customPrimaryColorHex") else null,
                    customBackgroundColorHex = if (obj.has("customBackgroundColorHex")) obj.optLong("customBackgroundColorHex") else null,
                    customCardColorHex = if (obj.has("customCardColorHex")) obj.optLong("customCardColorHex") else null,
                    customBorderColorHex = if (obj.has("customBorderColorHex")) obj.optLong("customBorderColorHex") else null,
                    marginHorizontalDp = obj.optInt("marginHorizontalDp", 14),
                    marginVerticalDp = obj.optInt("marginVerticalDp", 8),
                    paddingInternalDp = obj.optInt("paddingInternalDp", 12),
                    spacingDp = obj.optInt("spacingDp", 12),
                    cornerRadiusDp = obj.optInt("cornerRadiusDp", 16),
                    fontScaleMultiplier = obj.optDouble("fontScaleMultiplier", 1.0).toFloat(),
                    lineHeightMultiplier = obj.optDouble("lineHeightMultiplier", 1.0).toFloat(),
                    iconScaleMultiplier = obj.optDouble("iconScaleMultiplier", 1.0).toFloat()
                )
            }
        } catch (_: Exception) {}
        return result
    }

    private fun serializeSectionConfigs(map: Map<String, SectionAppearanceConfig>): String {
        val root = JSONObject()
        map.forEach { (k, v) ->
            val obj = JSONObject()
            obj.put("sectionId", v.sectionId)
            v.customPrimaryColorHex?.let { obj.put("customPrimaryColorHex", it) }
            v.customBackgroundColorHex?.let { obj.put("customBackgroundColorHex", it) }
            v.customCardColorHex?.let { obj.put("customCardColorHex", it) }
            v.customBorderColorHex?.let { obj.put("customBorderColorHex", it) }
            obj.put("marginHorizontalDp", v.marginHorizontalDp)
            obj.put("marginVerticalDp", v.marginVerticalDp)
            obj.put("paddingInternalDp", v.paddingInternalDp)
            obj.put("spacingDp", v.spacingDp)
            obj.put("cornerRadiusDp", v.cornerRadiusDp)
            obj.put("fontScaleMultiplier", v.fontScaleMultiplier.toDouble())
            obj.put("lineHeightMultiplier", v.lineHeightMultiplier.toDouble())
            obj.put("iconScaleMultiplier", v.iconScaleMultiplier.toDouble())
            root.put(k, obj)
        }
        return root.toString()
    }

    private fun parseSavedProfiles(jsonStr: String?): List<SavedDesignProfile> {
        if (jsonStr.isNullOrBlank()) {
            // Default pre-installed templates
            return listOf(
                SavedDesignProfile(
                    id = "profile_neon_cyber",
                    name = "Neón Cyber Pro",
                    description = "Paleta vibrante violeta con bordes nítidos y espaciado ágil",
                    targetScope = "GLOBAL",
                    primaryColorHex = 0xFF8B5CF6,
                    cornerRadiusDp = 16,
                    spacingDp = 12,
                    paddingDp = 12,
                    marginHorizontalDp = 14,
                    marginVerticalDp = 8,
                    fontScaleMultiplier = 1.0f,
                    themePresetName = "VIOLET_NEON"
                ),
                SavedDesignProfile(
                    id = "profile_compact_dev",
                    name = "Compacto Enterprise",
                    description = "Densidad ultra alta y bordes sutiles para maximizar espacio",
                    targetScope = "GLOBAL",
                    primaryColorHex = 0xFF38BDF8,
                    cornerRadiusDp = 8,
                    spacingDp = 6,
                    paddingDp = 8,
                    marginHorizontalDp = 8,
                    marginVerticalDp = 4,
                    fontScaleMultiplier = 0.9f,
                    themePresetName = "TITANIUM_SLATE"
                )
            )
        }
        val list = mutableListOf<SavedDesignProfile>()
        try {
            val arr = JSONArray(jsonStr)
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                list.add(
                    SavedDesignProfile(
                        id = obj.getString("id"),
                        name = obj.getString("name"),
                        description = obj.optString("description", ""),
                        targetScope = obj.optString("targetScope", "GLOBAL"),
                        primaryColorHex = obj.optLong("primaryColorHex", 0xFF8B5CF6),
                        cornerRadiusDp = obj.optInt("cornerRadiusDp", 16),
                        spacingDp = obj.optInt("spacingDp", 12),
                        paddingDp = obj.optInt("paddingDp", 12),
                        marginHorizontalDp = obj.optInt("marginHorizontalDp", 14),
                        marginVerticalDp = obj.optInt("marginVerticalDp", 8),
                        fontScaleMultiplier = obj.optDouble("fontScaleMultiplier", 1.0).toFloat(),
                        themePresetName = obj.optString("themePresetName", "VIOLET_NEON"),
                        createdAt = obj.optLong("createdAt", System.currentTimeMillis())
                    )
                )
            }
        } catch (_: Exception) {}
        return list
    }

    private fun serializeSavedProfiles(list: List<SavedDesignProfile>): String {
        val arr = JSONArray()
        list.forEach { p ->
            val obj = JSONObject()
            obj.put("id", p.id)
            obj.put("name", p.name)
            obj.put("description", p.description)
            obj.put("targetScope", p.targetScope)
            obj.put("primaryColorHex", p.primaryColorHex)
            obj.put("cornerRadiusDp", p.cornerRadiusDp)
            obj.put("spacingDp", p.spacingDp)
            obj.put("paddingDp", p.paddingDp)
            obj.put("marginHorizontalDp", p.marginHorizontalDp)
            obj.put("marginVerticalDp", p.marginVerticalDp)
            obj.put("fontScaleMultiplier", p.fontScaleMultiplier.toDouble())
            obj.put("themePresetName", p.themePresetName)
            obj.put("createdAt", p.createdAt)
            arr.put(obj)
        }
        return arr.toString()
    }

    private fun parseSandboxWidgets(jsonStr: String?): SandboxWidgetVisibility {
        if (jsonStr.isNullOrBlank()) return SandboxWidgetVisibility()
        return try {
            val obj = JSONObject(jsonStr)
            SandboxWidgetVisibility(
                showGoogleAccountBanner = obj.optBoolean("showGoogleAccountBanner", true),
                showGoogleSuiteButton = obj.optBoolean("showGoogleSuiteButton", true),
                showResourceMetrics = obj.optBoolean("showResourceMetrics", true),
                showAppListGrid = obj.optBoolean("showAppListGrid", true),
                showInnovationChips = obj.optBoolean("showInnovationChips", true),
                showActionButtons = obj.optBoolean("showActionButtons", true),
                showAppCountBadge = obj.optBoolean("showAppCountBadge", true),
                showHardwarePolicies = obj.optBoolean("showHardwarePolicies", true)
            )
        } catch (_: Exception) {
            SandboxWidgetVisibility()
        }
    }

    private fun serializeSandboxWidgets(widgets: SandboxWidgetVisibility): String {
        val obj = JSONObject()
        obj.put("showGoogleAccountBanner", widgets.showGoogleAccountBanner)
        obj.put("showGoogleSuiteButton", widgets.showGoogleSuiteButton)
        obj.put("showResourceMetrics", widgets.showResourceMetrics)
        obj.put("showAppListGrid", widgets.showAppListGrid)
        obj.put("showInnovationChips", widgets.showInnovationChips)
        obj.put("showActionButtons", widgets.showActionButtons)
        obj.put("showAppCountBadge", widgets.showAppCountBadge)
        obj.put("showHardwarePolicies", widgets.showHardwarePolicies)
        return obj.toString()
    }

    fun setSandboxCardLayout(context: Context, layout: SandboxProfileCardLayout) {
        updateSettings(context) { it.copy(sandboxCardLayout = layout) }
    }

    fun updateSandboxWidgets(context: Context, transform: (SandboxWidgetVisibility) -> SandboxWidgetVisibility) {
        updateSettings(context) { it.copy(sandboxWidgets = transform(it.sandboxWidgets)) }
    }

    fun updateSettings(context: Context, transform: (AppAppearanceSettings) -> AppAppearanceSettings) {
        val updated = transform(_settingsFlow.value)
        _settingsFlow.value = updated
        _floatingButtonVisibilityFlow.value = updated.isFloatingButtonVisible
        _debugModeFlow.value = updated.isDebugModeEnabled
        _hardwareAccelerationFlow.value = updated.isHardwareAcceleration

        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().apply {
            putString(KEY_THEME_PRESET, updated.themePreset.name)
            putString(KEY_ACCENT_COLOR, updated.accentColor.name)
            putString(KEY_CORNER_STYLE, updated.cornerStyle.name)
            putString(KEY_DENSITY, updated.density.name)
            putString(KEY_FONT_SCALE, updated.fontScale.name)
            putString(KEY_CARD_STYLE, updated.cardStyle.name)
            putString(KEY_NAVBAR_STYLE, updated.navbarStyle.name)
            putString(KEY_ANIMATION_SPEED, updated.animationSpeed.name)
            if (updated.customPrimaryColorHex != null) {
                putLong(KEY_CUSTOM_PRIMARY_HEX, updated.customPrimaryColorHex)
            } else {
                remove(KEY_CUSTOM_PRIMARY_HEX)
            }
            putInt(KEY_CUSTOM_CORNER_RADIUS_DP, updated.customCornerRadiusDp)
            putInt(KEY_CUSTOM_PANEL_SPACING_DP, updated.customPanelSpacingDp)
            putInt(KEY_CUSTOM_PANEL_PADDING_DP, updated.customPanelPaddingDp)
            putInt(KEY_CUSTOM_MARGIN_HORIZ_DP, updated.customMarginHorizontalDp)
            putInt(KEY_CUSTOM_MARGIN_VERT_DP, updated.customMarginVerticalDp)
            putFloat(KEY_CUSTOM_FONT_SCALE_MULT, updated.customFontScaleMultiplier)
            putFloat(KEY_CUSTOM_LINE_HEIGHT_MULT, updated.customLineHeightMultiplier)
            putBoolean(KEY_GLOBAL_OVERRIDE_ENFORCED, updated.isGlobalOverrideEnforced)
            putString(KEY_SECTION_CONFIGS_JSON, serializeSectionConfigs(updated.sectionConfigs))
            putString(KEY_SAVED_PROFILES_JSON, serializeSavedProfiles(updated.savedDesignProfiles))
            putString(KEY_SANDBOX_CARD_LAYOUT, updated.sandboxCardLayout.name)
            putString(KEY_SANDBOX_WIDGETS_JSON, serializeSandboxWidgets(updated.sandboxWidgets))
            putBoolean(KEY_GLOBAL_IMMERSIVE_FULLSCREEN, updated.isGlobalImmersiveFullscreen)
            putBoolean(KEY_HARDWARE_ACCELERATION, updated.isHardwareAcceleration)
            putBoolean(KEY_AGGRESSIVE_CACHE_OPTIMIZATION, updated.isAggressiveCacheOptimization)
            putBoolean(KEY_FLOATING_BUTTON_VISIBLE, updated.isFloatingButtonVisible)
            putBoolean(KEY_VOLUME_COMBO_TOGGLE_ENABLED, updated.isVolumeComboToggleEnabled)
            putInt(KEY_VOLUME_COMBO_REQUIRED_PRESSES, updated.volumeComboRequiredPresses)
            putBoolean(KEY_DEBUG_MODE_ENABLED, updated.isDebugModeEnabled)
            putBoolean(KEY_SHOW_FPS_OVERLAY, updated.isShowFpsOverlay)
            putBoolean(KEY_SHOW_FLOATING_DOCK, updated.isShowFloatingDock)
            putBoolean(KEY_SHOW_DEV_INSPECTOR, updated.isShowDevInspector)
            putBoolean(KEY_SHOW_BLOCKED_ADS_BADGE, updated.isShowBlockedAdsBadge)
            putBoolean(KEY_SHOW_QUICK_NAV_ARROWS, updated.isShowQuickNavArrows)
            putBoolean(KEY_AUTO_INJECT_COPY, updated.isAutoInjectCopy)
            putBoolean(KEY_SHOW_SNAPTUBE_DOWNLOAD_BUTTON, updated.isSnaptubeDownloadButtonVisible)
            putString(KEY_DOCK_POSITION, updated.dockPosition)
            apply()
        }

        WebViewOptimizationLayer.setForceHardwareAccelerationEnabled(context, updated.isHardwareAcceleration)
    }

    // --- Section Specific Layout Controls ---

    fun setActiveEditingSection(context: Context, scope: SectionDesignScope) {
        updateSettings(context) { it.copy(activeEditingSection = scope) }
    }

    fun setGlobalOverrideEnforced(context: Context, enforced: Boolean) {
        updateSettings(context) { it.copy(isGlobalOverrideEnforced = enforced) }
    }

    fun updateSectionConfig(
        context: Context,
        sectionId: String,
        transform: (SectionAppearanceConfig) -> SectionAppearanceConfig
    ) {
        updateSettings(context) { curr ->
            val currentMap = curr.sectionConfigs.toMutableMap()
            val existing = currentMap[sectionId] ?: SectionAppearanceConfig(
                sectionId = sectionId,
                customPrimaryColorHex = curr.customPrimaryColorHex,
                cornerRadiusDp = curr.customCornerRadiusDp,
                spacingDp = curr.customPanelSpacingDp,
                paddingInternalDp = curr.customPanelPaddingDp,
                marginHorizontalDp = curr.customMarginHorizontalDp,
                marginVerticalDp = curr.customMarginVerticalDp,
                fontScaleMultiplier = curr.customFontScaleMultiplier
            )
            currentMap[sectionId] = transform(existing)
            curr.copy(sectionConfigs = currentMap)
        }
    }

    fun getEffectiveSectionConfig(sectionId: String): SectionAppearanceConfig {
        val curr = _settingsFlow.value
        if (curr.isGlobalOverrideEnforced || sectionId == "GLOBAL") {
            return SectionAppearanceConfig(
                sectionId = "GLOBAL",
                customPrimaryColorHex = curr.customPrimaryColorHex,
                cornerRadiusDp = curr.customCornerRadiusDp,
                spacingDp = curr.customPanelSpacingDp,
                paddingInternalDp = curr.customPanelPaddingDp,
                marginHorizontalDp = curr.customMarginHorizontalDp,
                marginVerticalDp = curr.customMarginVerticalDp,
                fontScaleMultiplier = curr.customFontScaleMultiplier,
                lineHeightMultiplier = curr.customLineHeightMultiplier
            )
        }
        return curr.sectionConfigs[sectionId] ?: SectionAppearanceConfig(
            sectionId = sectionId,
            customPrimaryColorHex = curr.customPrimaryColorHex,
            cornerRadiusDp = curr.customCornerRadiusDp,
            spacingDp = curr.customPanelSpacingDp,
            paddingInternalDp = curr.customPanelPaddingDp,
            marginHorizontalDp = curr.customMarginHorizontalDp,
            marginVerticalDp = curr.customMarginVerticalDp,
            fontScaleMultiplier = curr.customFontScaleMultiplier,
            lineHeightMultiplier = curr.customLineHeightMultiplier
        )
    }

    // --- Saved Design Profiles Manager ---

    fun saveCustomDesignProfile(
        context: Context,
        name: String,
        description: String = "",
        targetScope: String = "GLOBAL"
    ): SavedDesignProfile {
        val curr = _settingsFlow.value
        val effective = getEffectiveSectionConfig(targetScope)
        val newProfile = SavedDesignProfile(
            id = "profile_${System.currentTimeMillis()}",
            name = name.ifBlank { "Perfil Personalizado" },
            description = description.ifBlank { "Diseño guardado para $targetScope" },
            targetScope = targetScope,
            primaryColorHex = effective.customPrimaryColorHex ?: 0xFF8B5CF6,
            cornerRadiusDp = effective.cornerRadiusDp,
            spacingDp = effective.spacingDp,
            paddingDp = effective.paddingInternalDp,
            marginHorizontalDp = effective.marginHorizontalDp,
            marginVerticalDp = effective.marginVerticalDp,
            fontScaleMultiplier = effective.fontScaleMultiplier,
            themePresetName = curr.themePreset.name
        )

        updateSettings(context) { settings ->
            val list = settings.savedDesignProfiles.toMutableList()
            list.add(0, newProfile)
            settings.copy(savedDesignProfiles = list)
        }
        AppLogger.log(context, "Perfil de diseño guardado: $name", tag = "APPEARANCE")
        return newProfile
    }

    fun applySavedDesignProfile(
        context: Context,
        profileId: String,
        targetScope: String
    ) {
        val profile = _settingsFlow.value.savedDesignProfiles.firstOrNull { it.id == profileId } ?: return
        if (targetScope == "GLOBAL" || _settingsFlow.value.isGlobalOverrideEnforced) {
            updateSettings(context) { curr ->
                val preset = runCatching { AppThemePreset.valueOf(profile.themePresetName) }.getOrDefault(curr.themePreset)
                curr.copy(
                    themePreset = preset,
                    customPrimaryColorHex = profile.primaryColorHex,
                    customCornerRadiusDp = profile.cornerRadiusDp,
                    customPanelSpacingDp = profile.spacingDp,
                    customPanelPaddingDp = profile.paddingDp,
                    customMarginHorizontalDp = profile.marginHorizontalDp,
                    customMarginVerticalDp = profile.marginVerticalDp,
                    customFontScaleMultiplier = profile.fontScaleMultiplier
                )
            }
        } else {
            updateSectionConfig(context, targetScope) { cfg ->
                cfg.copy(
                    customPrimaryColorHex = profile.primaryColorHex,
                    cornerRadiusDp = profile.cornerRadiusDp,
                    spacingDp = profile.spacingDp,
                    paddingInternalDp = profile.paddingDp,
                    marginHorizontalDp = profile.marginHorizontalDp,
                    marginVerticalDp = profile.marginVerticalDp,
                    fontScaleMultiplier = profile.fontScaleMultiplier
                )
            }
        }
        AppLogger.log(context, "Perfil '${profile.name}' aplicado a: $targetScope", tag = "APPEARANCE")
    }

    fun deleteSavedDesignProfile(context: Context, profileId: String) {
        updateSettings(context) { curr ->
            val list = curr.savedDesignProfiles.filter { it.id != profileId }
            curr.copy(savedDesignProfiles = list)
        }
    }

    // --- Standard Setters ---

    fun setThemePreset(context: Context, preset: AppThemePreset) {
        updateSettings(context) { it.copy(themePreset = preset) }
    }

    fun setAccentColor(context: Context, accent: AppAccentColor) {
        updateSettings(context) { it.copy(accentColor = accent) }
    }

    fun setCornerStyle(context: Context, cornerStyle: AppCornerStyle) {
        updateSettings(context) { it.copy(cornerStyle = cornerStyle) }
    }

    fun setDensity(context: Context, density: AppDensity) {
        updateSettings(context) { it.copy(density = density) }
    }

    fun setFontScale(context: Context, fontScale: AppFontScale) {
        updateSettings(context) { it.copy(fontScale = fontScale) }
    }

    fun setCardStyle(context: Context, cardStyle: AppCardStyle) {
        updateSettings(context) { it.copy(cardStyle = cardStyle) }
    }

    fun setNavbarStyle(context: Context, navbarStyle: AppNavbarStyle) {
        updateSettings(context) { it.copy(navbarStyle = navbarStyle) }
    }

    fun setAnimationSpeed(context: Context, speed: AppAnimationSpeed) {
        updateSettings(context) { it.copy(animationSpeed = speed) }
    }

    fun setCustomPrimaryColor(context: Context, colorHex: Long?, targetSection: String = "GLOBAL") {
        if (targetSection == "GLOBAL" || _settingsFlow.value.isGlobalOverrideEnforced) {
            updateSettings(context) { it.copy(customPrimaryColorHex = colorHex) }
        } else {
            updateSectionConfig(context, targetSection) { it.copy(customPrimaryColorHex = colorHex) }
        }
    }

    fun setCustomCornerRadiusDp(context: Context, radiusDp: Int, targetSection: String = "GLOBAL") {
        val clamped = radiusDp.coerceIn(0, 36)
        if (targetSection == "GLOBAL" || _settingsFlow.value.isGlobalOverrideEnforced) {
            updateSettings(context) { it.copy(customCornerRadiusDp = clamped) }
        } else {
            updateSectionConfig(context, targetSection) { it.copy(cornerRadiusDp = clamped) }
        }
    }

    fun setCustomPanelSpacingDp(context: Context, spacingDp: Int, targetSection: String = "GLOBAL") {
        val clamped = spacingDp.coerceIn(2, 36)
        if (targetSection == "GLOBAL" || _settingsFlow.value.isGlobalOverrideEnforced) {
            updateSettings(context) { it.copy(customPanelSpacingDp = clamped) }
        } else {
            updateSectionConfig(context, targetSection) { it.copy(spacingDp = clamped) }
        }
    }

    fun setCustomPanelPaddingDp(context: Context, paddingDp: Int, targetSection: String = "GLOBAL") {
        val clamped = paddingDp.coerceIn(2, 32)
        if (targetSection == "GLOBAL" || _settingsFlow.value.isGlobalOverrideEnforced) {
            updateSettings(context) { it.copy(customPanelPaddingDp = clamped) }
        } else {
            updateSectionConfig(context, targetSection) { it.copy(paddingInternalDp = clamped) }
        }
    }

    fun setCustomMarginHorizontalDp(context: Context, marginDp: Int, targetSection: String = "GLOBAL") {
        val clamped = marginDp.coerceIn(0, 32)
        if (targetSection == "GLOBAL" || _settingsFlow.value.isGlobalOverrideEnforced) {
            updateSettings(context) { it.copy(customMarginHorizontalDp = clamped) }
        } else {
            updateSectionConfig(context, targetSection) { it.copy(marginHorizontalDp = clamped) }
        }
    }

    fun setCustomMarginVerticalDp(context: Context, marginDp: Int, targetSection: String = "GLOBAL") {
        val clamped = marginDp.coerceIn(0, 24)
        if (targetSection == "GLOBAL" || _settingsFlow.value.isGlobalOverrideEnforced) {
            updateSettings(context) { it.copy(customMarginVerticalDp = clamped) }
        } else {
            updateSectionConfig(context, targetSection) { it.copy(marginVerticalDp = clamped) }
        }
    }

    fun setCustomFontScaleMultiplier(context: Context, mult: Float, targetSection: String = "GLOBAL") {
        val clamped = mult.coerceIn(0.7f, 1.5f)
        if (targetSection == "GLOBAL" || _settingsFlow.value.isGlobalOverrideEnforced) {
            updateSettings(context) { it.copy(customFontScaleMultiplier = clamped) }
        } else {
            updateSectionConfig(context, targetSection) { it.copy(fontScaleMultiplier = clamped) }
        }
    }

    fun resetToDefaults(context: Context) {
        val defaults = AppAppearanceSettings()
        updateSettings(context) { defaults }
        AppLogger.log(context, "Apariencia restablecida a valores predeterminados", tag = "APPEARANCE")
    }

    // --- Legacy / Direct Accessors ---

    fun initFloatingButtonVisibility(context: Context) = initialize(context)
    fun initDebugMode(context: Context) = initialize(context)
    fun initHardwareAcceleration(context: Context) = initialize(context)

    fun isVolumeComboToggleEnabled(context: Context): Boolean = _settingsFlow.value.isVolumeComboToggleEnabled
    fun setVolumeComboToggleEnabled(context: Context, enabled: Boolean) = updateSettings(context) { it.copy(isVolumeComboToggleEnabled = enabled) }

    fun getVolumeComboRequiredPresses(context: Context): Int = _settingsFlow.value.volumeComboRequiredPresses
    fun setVolumeComboRequiredPresses(context: Context, count: Int) = updateSettings(context) { it.copy(volumeComboRequiredPresses = count.coerceIn(1, 10)) }

    fun isFloatingButtonVisible(context: Context): Boolean = _settingsFlow.value.isFloatingButtonVisible
    fun setFloatingButtonVisible(context: Context, visible: Boolean) = updateSettings(context) { it.copy(isFloatingButtonVisible = visible) }

    fun toggleFloatingButtonVisibility(context: Context): Boolean {
        val newState = !_settingsFlow.value.isFloatingButtonVisible
        setFloatingButtonVisible(context, newState)
        return newState
    }

    fun isDebugModeEnabled(context: Context): Boolean = _settingsFlow.value.isDebugModeEnabled
    fun setDebugModeEnabled(context: Context, enabled: Boolean) = updateSettings(context) { it.copy(isDebugModeEnabled = enabled) }

    fun isShowFpsOverlayEnabled(context: Context): Boolean = _settingsFlow.value.isShowFpsOverlay
    fun setShowFpsOverlayEnabled(context: Context, enabled: Boolean) = updateSettings(context) { it.copy(isShowFpsOverlay = enabled) }

    fun isShowFloatingDockEnabled(context: Context): Boolean = _settingsFlow.value.isShowFloatingDock
    fun setShowFloatingDockEnabled(context: Context, enabled: Boolean) = updateSettings(context) { it.copy(isShowFloatingDock = enabled) }

    fun isShowDevInspectorEnabled(context: Context): Boolean = _settingsFlow.value.isShowDevInspector
    fun setShowDevInspectorEnabled(context: Context, enabled: Boolean) = updateSettings(context) { it.copy(isShowDevInspector = enabled) }

    fun isShowBlockedAdsBadgeEnabled(context: Context): Boolean = _settingsFlow.value.isShowBlockedAdsBadge
    fun setShowBlockedAdsBadgeEnabled(context: Context, enabled: Boolean) = updateSettings(context) { it.copy(isShowBlockedAdsBadge = enabled) }

    fun isShowQuickNavArrowsEnabled(context: Context): Boolean = _settingsFlow.value.isShowQuickNavArrows
    fun setShowQuickNavArrowsEnabled(context: Context, enabled: Boolean) = updateSettings(context) { it.copy(isShowQuickNavArrows = enabled) }

    fun isGlobalImmersiveFullscreenEnabled(context: Context): Boolean = _settingsFlow.value.isGlobalImmersiveFullscreen
    fun setGlobalImmersiveFullscreenEnabled(context: Context, enabled: Boolean) = updateSettings(context) { it.copy(isGlobalImmersiveFullscreen = enabled) }

    fun isHardwareAccelerationEnabled(context: Context): Boolean = _settingsFlow.value.isHardwareAcceleration
    fun setHardwareAccelerationEnabled(context: Context, enabled: Boolean) = updateSettings(context) { it.copy(isHardwareAcceleration = enabled) }

    fun isAggressiveCacheOptimizationEnabled(context: Context): Boolean = _settingsFlow.value.isAggressiveCacheOptimization
    fun setAggressiveCacheOptimizationEnabled(context: Context, enabled: Boolean) = updateSettings(context) { it.copy(isAggressiveCacheOptimization = enabled) }

    fun getDockPosition(context: Context): String = _settingsFlow.value.dockPosition
    fun setDockPosition(context: Context, position: String) = updateSettings(context) { it.copy(dockPosition = position) }

    fun getDefaultHomeUrl(context: Context): String {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_DEFAULT_HOME_URL, "https://google.com") ?: "https://google.com"
    }

    fun setDefaultHomeUrl(context: Context, url: String) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_DEFAULT_HOME_URL, url)
            .apply()
    }

    fun isAutoInjectCopyEnabled(context: Context): Boolean = _settingsFlow.value.isAutoInjectCopy
    fun setAutoInjectCopyEnabled(context: Context, enabled: Boolean) = updateSettings(context) { it.copy(isAutoInjectCopy = enabled) }

    fun isSnaptubeDownloadButtonVisible(context: Context): Boolean = _settingsFlow.value.isSnaptubeDownloadButtonVisible
    fun setSnaptubeDownloadButtonVisible(context: Context, visible: Boolean) = updateSettings(context) { it.copy(isSnaptubeDownloadButtonVisible = visible) }
}
