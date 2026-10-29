package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.*
import com.example.ui.dialogs.AdminModularizationDialog
import com.example.ui.dialogs.DevicePermissionsDialog
import com.example.ui.dialogs.RemoteControlOtaDialog
import com.example.ui.dialogs.VisualBlockBuilderDialog
import com.example.ui.theme.*
import com.example.ui.viewmodel.WebAppUiState
import com.example.util.AppearanceSettingsManager
import com.example.util.CustomMenuFolder
import com.example.util.DashboardBlock
import com.example.util.LayoutCustomizerManager
import com.example.util.OtaUpdateManager
import com.example.util.SitePermissionManager

@Composable
fun TurboStudioTab(
    state: WebAppUiState,
    onRequestBatteryBypass: () -> Unit,
    onClearAllCache: () -> Unit,
    modifier: Modifier = Modifier,
    selectedCustomMenuId: String? = null,
    onClearCustomMenuFilter: (() -> Unit)? = null,
    onOpenUrl: (String, String) -> Unit = { _, _ -> }
) {
    val context = LocalContext.current
    val appInfo = remember { OtaUpdateManager.getAppVersionInfo(context) }
    val blocks by LayoutCustomizerManager.blocksFlow.collectAsStateWithLifecycle()
    val customMenus by LayoutCustomizerManager.customMenusFlow.collectAsStateWithLifecycle()
    val isCompactDensity by LayoutCustomizerManager.isCompactDensityFlow.collectAsStateWithLifecycle()

    var showOtaDialog by remember { mutableStateOf(false) }
    var showDevicePermissionsDialog by remember { mutableStateOf(false) }
    var showBlockBuilderDialog by remember { mutableStateOf(false) }
    var showAdminModularizationDialog by remember { mutableStateOf(false) }
    var isReorderModeActive by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    var activeCategoryFilter by remember { mutableStateOf<String?>(null) }
    val liteModeSettings by com.example.util.LiteModeManager.settingsFlow.collectAsStateWithLifecycle()

    // Engine settings
    var hwAcceleration by remember { mutableStateOf(true) }
    var domStorage by remember { mutableStateOf(true) }
    var highRefreshRateRequested by remember { mutableStateOf(true) }

    if (showOtaDialog) {
        RemoteControlOtaDialog(
            onDismissRequest = { showOtaDialog = false },
            onSheetsSyncClick = { }
        )
    }

    if (showDevicePermissionsDialog) {
        DevicePermissionsDialog(
            onDismiss = { showDevicePermissionsDialog = false }
        )
    }

    if (showBlockBuilderDialog) {
        WidgetLayoutEditorDialog(
            onDismissRequest = { showBlockBuilderDialog = false }
        )
    }

    if (showAdminModularizationDialog) {
        AdminModularizationDialog(
            onDismissRequest = { showAdminModularizationDialog = false }
        )
    }

    // Filter blocks based on selected menu, search, visibility, and modular LiteMode status
    val activeCustomMenu = customMenus.find { it.id == selectedCustomMenuId }
    val filteredBlocks = remember(blocks, selectedCustomMenuId, searchQuery, activeCategoryFilter, liteModeSettings) {
        blocks.filter { block ->
            val matchesMenu = if (selectedCustomMenuId != null) {
                block.assignedMenuId == selectedCustomMenuId
            } else {
                block.assignedMenuId == null || block.defaultTab == "TURBO_STUDIO"
            }

            val matchesSearch = if (searchQuery.isBlank()) true else {
                block.title.contains(searchQuery, ignoreCase = true) ||
                block.subtitle.contains(searchQuery, ignoreCase = true)
            }

            val matchesCategory = when (activeCategoryFilter) {
                "Rendimiento" -> block.id in listOf("block_resource_monitor", "block_energy_bypass", "block_web_inspector")
                "DevOps & CI" -> block.id in listOf("block_ota_updates", "block_activity_log", "block_system_logs", "block_database_maint", "block_test_runner")
                "Automatización" -> block.id in listOf("block_automation_studio", "block_google_account")
                "Personalización" -> block.id in listOf("block_ui_customization")
                else -> true
            }

            val isModuleActive = when (block.id) {
                "block_extensions_snaptube" -> liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.SNAPTUBE_MEDIA) || liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.WEB_EXTENSIONS_SCRIPTS)
                "block_adblock_stealth" -> liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.QUANTUM_ADBLOCK)
                "block_automation_studio" -> liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.AUTOMATION_BOT_CLUSTER)
                "block_web_inspector" -> liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.THERMAL_HARDWARE_SENTINEL)
                "block_sandbox_profiles", "block_sandbox_app_hub", "block_sandbox_optimization", "block_sandbox_hardware_audit", "block_sandbox_snapshots" ->
                    liteModeSettings.isModuleActive(com.example.data.model.AppModuleId.SANDBOX_ISOLATION)
                else -> true
            }

            block.isVisible && matchesMenu && matchesSearch && matchesCategory && isModuleActive
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 14.dp),
        contentPadding = PaddingValues(bottom = 90.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        // Hero Header & Quick Filter Toolbar
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = ElegantNav),
                border = androidx.compose.foundation.BorderStroke(1.dp, ElegantCardBorder)
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
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (activeCustomMenu != null) Color(activeCustomMenu.colorHex) else LavenderPrimary),
                                contentAlignment = Alignment.Center
                            ) {
                                if (activeCustomMenu != null) {
                                    Text(activeCustomMenu.iconEmoji, fontSize = 18.sp)
                                } else {
                                    Icon(
                                        Icons.Default.Speed,
                                        contentDescription = null,
                                        tint = DeepPurpleOnPrimary,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = activeCustomMenu?.name ?: "Turbo Studio & Rendimiento",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.5.sp,
                                    color = TextWhite
                                )
                                Text(
                                    text = if (activeCustomMenu != null) "Menú personalizado • ${filteredBlocks.size} módulos" else "Centro de Control & Diagnóstico de Alto Rendimiento",
                                    fontSize = 10.5.sp,
                                    color = TextGrayLight
                                )
                                if (activeCustomMenu != null && onClearCustomMenuFilter != null) {
                                    Text(
                                        text = "✕ Volver a todos los módulos",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = LavenderPrimary,
                                        modifier = Modifier
                                            .clickable { onClearCustomMenuFilter() }
                                            .padding(top = 2.dp)
                                    )
                                }
                            }
                        }

                        // Reorder & Customize Toolbar Button
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isReorderModeActive) LavenderPrimary else Color(0xFF22222A))
                                    .clickable { isReorderModeActive = !isReorderModeActive }
                                    .padding(horizontal = 8.dp, vertical = 5.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.SwapVert,
                                        contentDescription = "Reordenar",
                                        tint = if (isReorderModeActive) DeepPurpleOnPrimary else LavenderPrimary,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = if (isReorderModeActive) "Listo" else "Reordenar",
                                        fontSize = 10.5.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isReorderModeActive) DeepPurpleOnPrimary else TextWhite
                                    )
                                }
                            }

                            Box(
                                modifier = Modifier
                                    .size(30.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF22222A))
                                    .clickable { showAdminModularizationDialog = true },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.Tune,
                                    contentDescription = "Panel de Administración y Módulos",
                                    tint = MintSpeed,
                                    modifier = Modifier.size(16.dp)
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .size(30.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF22222A))
                                    .clickable { showBlockBuilderDialog = true },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.DashboardCustomize,
                                    contentDescription = "Editor de Bloques",
                                    tint = Color(0xFFFBBF24),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }

                    // Category Filter Pills
                    Spacer(modifier = Modifier.height(10.dp))
                    val categories = listOf("Todos", "Rendimiento", "DevOps & CI", "Automatización", "Personalización")
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(categories) { cat ->
                            val isSelected = (activeCategoryFilter == null && cat == "Todos") || activeCategoryFilter == cat
                            FilterChip(
                                selected = isSelected,
                                onClick = { activeCategoryFilter = if (cat == "Todos") null else cat },
                                label = { Text(cat, fontSize = 10.5.sp) },
                                shape = RoundedCornerShape(8.dp)
                            )
                        }
                    }
                }
            }
        }

        // Render Dynamic Customizable Blocks
        items(filteredBlocks, key = { it.id }) { block ->
            when (block.id) {
                "block_extensions_snaptube" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Extension,
                        iconTint = VividCyan,
                        badgeText = "Chrome & Snaptube",
                        badgeColor = Color(0xFF0F172A),
                        badgeTextColor = VividCyan,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        com.example.ui.components.ExtensionManagementCard(
                            onNavigateUrl = { targetUrl -> onOpenUrl(targetUrl, "Navegador Web") }
                        )
                    }
                }

                "block_adblock_stealth" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Security,
                        iconTint = MintSpeed,
                        badgeText = "15 Fases",
                        badgeColor = Color(0xFF064E3B),
                        badgeTextColor = MintSpeed,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        AdBlockConfigurationCard()
                    }
                }

                "block_google_account" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.AccountCircle,
                        iconTint = Color(0xFF4285F4),
                        badgeText = "Suite 16 Apps",
                        badgeColor = Color(0xFF1E293B),
                        badgeTextColor = Color(0xFF60A5FA),
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        GoogleAccountCard(onOpenUrl = onOpenUrl)
                    }
                }

                "block_automation_studio" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.AutoAwesome,
                        iconTint = Color(0xFF38BDF8),
                        badgeText = "Multi-Bot",
                        badgeColor = Color(0xFF0C4A6E),
                        badgeTextColor = Color(0xFF38BDF8),
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        FullAutomationStudioCard()
                    }
                }

                "block_ui_customization" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Palette,
                        iconTint = Color(0xFFE879F9),
                        badgeText = "Modo Debug & FPS",
                        badgeColor = DeepPurpleContainer,
                        badgeTextColor = LavenderPrimary,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        AppUiCustomizationCard()
                    }
                }

                "block_resource_monitor" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Memory,
                        iconTint = MintSpeed,
                        badgeText = "RAM & CPU",
                        badgeColor = Color(0xFF064E3B),
                        badgeTextColor = MintSpeed,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        SystemResourceMonitorCard(
                            onRequestBatteryBypass = onRequestBatteryBypass,
                            onClearCache = onClearAllCache
                        )
                    }
                }

                "block_web_inspector" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Terminal,
                        iconTint = AmberEnergy,
                        badgeText = "JS DevTools",
                        badgeColor = Color(0xFF451A03),
                        badgeTextColor = AmberEnergy,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        WebInspectorCard()
                    }
                }

                "block_energy_bypass" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.ElectricBolt,
                        iconTint = RoseAccent,
                        badgeText = if (state.isBatterySaverBypassed) "Activo" else "Inactivo",
                        badgeColor = if (state.isBatterySaverBypassed) Color(0xFF4C0519) else Color(0xFF27272A),
                        badgeTextColor = if (state.isBatterySaverBypassed) RoseAccent else TextGrayLight,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Aceleración de Renderizado sin Restricciones", fontWeight = FontWeight.SemiBold, fontSize = 12.5.sp, color = TextWhite)
                                Text("Bypassa la limitación de batería para mantener 120 FPS y WebSockets en segundo plano", fontSize = 10.5.sp, color = TextGrayLight)
                            }
                            Switch(
                                checked = state.isBatterySaverBypassed,
                                onCheckedChange = { onRequestBatteryBypass() },
                                colors = SwitchDefaults.colors(checkedThumbColor = LavenderPrimary, checkedTrackColor = DeepPurpleContainer)
                            )
                        }
                    }
                }

                "block_ota_updates" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.RocketLaunch,
                        iconTint = Color(0xFFA78BFA),
                        badgeText = "v${appInfo.versionName}",
                        badgeColor = DeepPurpleContainer,
                        badgeTextColor = LavenderPrimary,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        Column(modifier = Modifier.fillMaxWidth().padding(4.dp)) {
                            GitHubControlPanelCard()
                            Spacer(modifier = Modifier.height(8.dp))
                            BuildMonitorView()
                        }
                    }
                }

                "block_database_maint" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Storage,
                        iconTint = Color(0xFF34D399),
                        badgeText = "SQLite Room",
                        badgeColor = Color(0xFF064E3B),
                        badgeTextColor = Color(0xFF34D399),
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        DatabaseMaintenanceCard()
                    }
                }

                "block_test_runner" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.FactCheck,
                        iconTint = Color(0xFF60A5FA),
                        badgeText = "Health Check",
                        badgeColor = Color(0xFF1E293B),
                        badgeTextColor = Color(0xFF60A5FA),
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        TestRunnerCard()
                    }
                }

                "block_activity_log" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.History,
                        iconTint = LavenderPrimary,
                        badgeText = "Historial",
                        badgeColor = DeepPurpleContainer,
                        badgeTextColor = LavenderPrimary,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        DevelopmentActivityLogCard()
                    }
                }

                "block_system_audit" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.HealthAndSafety,
                        iconTint = MintSpeed,
                        badgeText = "Auditoría 360°",
                        badgeColor = Color(0xFF064E3B),
                        badgeTextColor = MintSpeed,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        SystemAuditPanelCard()
                    }
                }

                "block_agent_bridge" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Terminal,
                        iconTint = LavenderPrimary,
                        badgeText = "MCP & ADB",
                        badgeColor = DeepPurpleContainer,
                        badgeTextColor = LavenderPrimary,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        AgentBridgeControlCard()
                    }
                }

                "block_system_logs" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Description,
                        iconTint = Color(0xFFFBBF24),
                        badgeText = "AppLogger",
                        badgeColor = Color(0xFF451A03),
                        badgeTextColor = Color(0xFFFBBF24),
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        SystemLogsCard()
                    }
                }

                "block_sandbox_profiles" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Shield,
                        iconTint = MintSpeed,
                        badgeText = "Aislamiento",
                        badgeColor = Color(0xFF064E3B),
                        badgeTextColor = MintSpeed,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        Text("Módulo de Perfiles Aislados sincronizado con el gestor de Sandbox", color = TextGrayLight, fontSize = 11.sp, modifier = Modifier.padding(6.dp))
                    }
                }

                "block_sandbox_app_hub" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Apps,
                        iconTint = Color(0xFFE879F9),
                        badgeText = "Hub Aislado",
                        badgeColor = DeepPurpleContainer,
                        badgeTextColor = LavenderPrimary,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        ContainerAppHubSection(searchQuery = "")
                    }
                }

                "block_sandbox_optimization" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.CloudSync,
                        iconTint = Color(0xFF38BDF8),
                        badgeText = "Firestore & Room",
                        badgeColor = Color(0xFF0C4A6E),
                        badgeTextColor = Color(0xFF38BDF8),
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        GlobalContainerOptimizationCard()
                        Spacer(modifier = Modifier.height(8.dp))
                        FirestoreSyncCard()
                    }
                }

                "block_sandbox_hardware_audit" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Security,
                        iconTint = Color(0xFFF87171),
                        badgeText = "Auditoría de Seguridad",
                        badgeColor = Color(0xFF450A0A),
                        badgeTextColor = Color(0xFFF87171),
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        com.example.ui.components.sandbox.SandboxHardwareAuditSection()
                    }
                }

                "block_sandbox_snapshots" -> {
                    CollapsablePanel(
                        panelId = block.id,
                        title = block.title,
                        subtitle = block.subtitle,
                        icon = Icons.Default.Restore,
                        iconTint = Color(0xFFA78BFA),
                        badgeText = "Snapshots",
                        badgeColor = DeepPurpleContainer,
                        badgeTextColor = LavenderPrimary,
                        isReorderable = isReorderModeActive,
                        onMoveUp = { LayoutCustomizerManager.moveBlockUp(context, block.id) },
                        onMoveDown = { LayoutCustomizerManager.moveBlockDown(context, block.id) },
                        onHideBlock = { LayoutCustomizerManager.setBlockVisibility(context, block.id, false) }
                    ) {
                        com.example.ui.components.sandbox.SandboxSnapshotsSection()
                    }
                }
            }
        }

        // Section: Engine Configuration & Device Permissions (Always accessible at bottom or collapsible)
        item {
            CollapsablePanel(
                panelId = "panel_engine_and_permissions",
                title = "Motor WebEngine & Permisos de Hardware",
                subtitle = "GPU Vulkan, Almacenamiento DOM, 120Hz y Reglas de Cámara/Mic",
                icon = Icons.Default.Tune,
                iconTint = LavenderPrimary,
                badgeText = "Hardware",
                badgeColor = DeepPurpleContainer,
                badgeTextColor = LavenderPrimary
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(4.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    // GPU Accel
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Aceleración GPU por Capas", fontWeight = FontWeight.Bold, color = TextWhite, fontSize = 12.5.sp)
                            Text("Renderiza gráficos y animaciones CSS a través de Vulkan/OpenGL", fontSize = 10.5.sp, color = TextGrayLight)
                        }
                        Switch(
                            checked = hwAcceleration,
                            onCheckedChange = { hwAcceleration = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = LavenderPrimary, checkedTrackColor = DeepPurpleContainer)
                        )
                    }

                    // DOM Storage
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Almacenamiento DOM & Carga Instantánea", fontWeight = FontWeight.Bold, color = TextWhite, fontSize = 12.5.sp)
                            Text("Guarda estados y assets localmente para abrir a velocidad relámpago", fontSize = 10.5.sp, color = TextGrayLight)
                        }
                        Switch(
                            checked = domStorage,
                            onCheckedChange = { domStorage = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = LavenderPrimary, checkedTrackColor = DeepPurpleContainer)
                        )
                    }

                    // High Refresh Rate
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Forzar Tasa de Refresco 120Hz / 90Hz", fontWeight = FontWeight.Bold, color = TextWhite, fontSize = 12.5.sp)
                            Text("Fluidez ultra suave en desplazamientos y animaciones", fontSize = 10.5.sp, color = TextGrayLight)
                        }
                        Switch(
                            checked = highRefreshRateRequested,
                            onCheckedChange = { highRefreshRateRequested = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = LavenderPrimary, checkedTrackColor = DeepPurpleContainer)
                        )
                    }

                    // Device Permissions Dialog Trigger
                    Button(
                        onClick = { showDevicePermissionsDialog = true },
                        modifier = Modifier.fillMaxWidth().height(42.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = LavenderPrimary),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = DeepPurpleOnPrimary, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Gestionar Permisos del Dispositivo", color = DeepPurpleOnPrimary, fontWeight = FontWeight.Bold, fontSize = 11.5.sp)
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
