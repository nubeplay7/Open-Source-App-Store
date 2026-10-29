package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Apps
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.ViewAgenda
import androidx.compose.material.icons.filled.ViewSidebar
import androidx.compose.material.icons.outlined.Apps
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Speed
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
import com.example.ui.dialogs.GoogleSheetsSyncDialog
import com.example.ui.dialogs.CreateWebAppDialog
import com.example.ui.dialogs.EditWebAppDialog
import com.example.ui.screens.AppLibraryTab
import com.example.ui.screens.ExploreCatalogTab
import com.example.ui.screens.InAppBrowserScreen
import com.example.ui.screens.TurboStudioTab
import com.example.ui.theme.DeepPurpleContainer
import com.example.ui.theme.DeepPurpleOnPrimary
import com.example.ui.theme.ElegantBackground
import com.example.ui.theme.ElegantCard
import com.example.ui.theme.ElegantCardBorder
import com.example.ui.theme.ElegantNav
import com.example.ui.theme.LavenderOnContainer
import com.example.ui.theme.LavenderPrimary
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.RoseAccent
import com.example.ui.theme.TextGrayLight
import com.example.ui.theme.TextGrayMuted
import com.example.ui.theme.TextWhite
import com.example.ui.viewmodel.MainNavTab
import com.example.ui.viewmodel.WebAppViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: WebAppViewModel by viewModels()
    private var openOtaDialogOnLaunch = false

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        // Initialize Global Crash & Exception Watchdog
        com.example.util.GlobalCrashWatchdog.init(this)

        // Validate startup state, intent extras and storage via InitializationGuard
        val startupResult = com.example.util.InitializationGuard.validateLaunchIntent(this, intent)

        // Clear any sticky notification on launch if the user opened the app
        com.example.util.OtaNotificationHelper.dismissNotification(this)

        // Dynamic Instance Switcher & TaskStack Configuration
        val instanceMode = com.example.util.InitializationGuard.getInstanceModePreference(this)
        if (instanceMode == com.example.util.InitializationGuard.InstanceLaunchMode.SINGLE_INSTANCE) {
            intent?.addFlags(android.content.Intent.FLAG_ACTIVITY_SINGLE_TOP or android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }

        // Check if opened from update notification
        if (intent?.getBooleanExtra("EXTRA_OPEN_OTA_DIALOG", false) == true ||
            intent?.hasExtra("EXTRA_AUTO_UPDATE_VERSION") == true) {
            openOtaDialogOnLaunch = true
        }

        // Initialize Notification channel for OTA Updates
        com.example.util.OtaNotificationHelper.createNotificationChannel(this)

        // Record Startup Benchmark in PerformanceAudit
        com.example.util.PerformanceAuditManager.recordAppStartup(this, isColdStart = true)

        // Initialize UserProfileManager to restore session from Room database automatically
        com.example.util.UserProfileManager.initialize(this)

        // Initialize DynamicThemeManager
        com.example.util.DynamicThemeManager.initialize(this)

        // Initialize Containerization & Sandboxing Engine
        com.example.util.ContainerManager.initialize(this)

        // Initialize AutomatedCleanupService background maintenance
        com.example.util.AutomatedCleanupService.initialize(this)

        // Start MCP & ADB Agent Bridge Server for external control and forensics
        com.example.util.AgentBridgeServer.startServer(this)

        // Initialize Central Modularization & Decoupled Domain Architecture Registry
        com.example.core.ModularizationRegistry.initialize(this)

        // Initialize Outbound Cloud Relay Engine for remote agent access across WAN / Internet
        com.example.util.AgentCloudRelayClient.init(this)

        // Initialize Floating Button visibility state
        com.example.util.AppearanceSettingsManager.initFloatingButtonVisibility(this)

        // Initialize Layout Customizer & Reorderable Block Manager
        com.example.util.LayoutCustomizerManager.initialize(this)

        // Initialize Chrome Web Store & Firefox Extension Manager
        com.example.util.ExtensionManager.initialize(this)

        // Reschedule active automated web macros
        com.example.util.WebMacroScheduler.rescheduleAllActiveMacros(this)

        // Initialize Concurrent Multi-Bot Automation Cluster Engine with Immortal Watchdog
        com.example.util.ConcurrentAutomationClusterEngine.initialize(this)

        // Initialize Lite Mode Anti-Crash & Modular Subsystem Framework
        com.example.util.LiteModeManager.initialize(this)

        // Handle incoming Agent Handshake DeepLink (webnative://agent/handshake?pin=...)
        val dataUri = intent?.data
        if (dataUri != null && dataUri.scheme == "webnative" && dataUri.host == "agent") {
            val pin = dataUri.getQueryParameter("pin") ?: dataUri.getQueryParameter("secret") ?: ""
            if (pin.isNotBlank()) {
                val res = com.example.util.AgentHandshakeManager.verifyHandshake(this, pin, "deeplink_intent")
                android.widget.Toast.makeText(this, "Enlace con Agente: ${res.message}", android.widget.Toast.LENGTH_LONG).show()
                com.example.util.AppLogger.log(this, "DeepLink de Agente procesado: ${res.message}", tag = "DEEPLINK_HANDSHAKE")
            }
        }

        setContent {
            MyApplicationTheme(darkTheme = true) {
                MainScreen(
                    viewModel = viewModel,
                    initialShowOtaDialog = openOtaDialogOnLaunch
                )
            }
        }
    }

    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        com.example.util.LiteModeManager.onSystemTrimMemory(this, level)
    }

    override fun onLowMemory() {
        super.onLowMemory()
        com.example.util.LiteModeManager.triggerEmergencyMemoryTrim(this)
    }

    override fun dispatchKeyEvent(event: android.view.KeyEvent): Boolean {
        if (com.example.util.VolumeShortcutManager.handleKeyEvent(this, event)) {
            return true
        }
        return super.dispatchKeyEvent(event)
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        com.example.util.OtaNotificationHelper.dismissNotification(this)
    }

    override fun onResume() {
        super.onResume()
        viewModel.refreshBatteryOptimizationStatus(this)
        com.example.util.OtaNotificationHelper.dismissNotification(this)
        com.example.util.TaskThrottlingController.setAppForegroundState(true)
        com.example.util.AdaptivePowerPolicyGovernor.applyPolicy(this, this)
        com.example.util.IntelligentDiskCacheBudgetEngine.evaluateAndEnforceBudget(this)
    }

    override fun onPause() {
        super.onPause()
        com.example.util.TaskThrottlingController.setAppForegroundState(false)
        val activeApp = viewModel.uiState.value.activeRunningApp
        val activeTabId = activeApp?.let { "tab_${it.id}" } ?: "tab_main"
        com.example.util.TabHibernationManager.checkAndHibernateInactiveTabs(this, activeForegroundTabId = activeTabId)
    }
}

@Composable
fun MainScreen(
    viewModel: WebAppViewModel,
    initialShowOtaDialog: Boolean = false
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current

    var showOtaUpdateDialog by androidx.compose.runtime.remember {
        androidx.compose.runtime.mutableStateOf(initialShowOtaDialog)
    }
    var showAppearanceDialog by androidx.compose.runtime.remember {
        androidx.compose.runtime.mutableStateOf(false)
    }
    var showBlockBuilderDialog by androidx.compose.runtime.remember {
        androidx.compose.runtime.mutableStateOf(false)
    }
    var selectedCustomMenuId by androidx.compose.runtime.remember {
        androidx.compose.runtime.mutableStateOf<String?>(null)
    }

    val appearanceSettings by com.example.util.AppearanceSettingsManager.settingsFlow.collectAsStateWithLifecycle()
    val liteModeSettings by com.example.util.LiteModeManager.settingsFlow.collectAsStateWithLifecycle()
    val isSidebarMode = appearanceSettings.navbarStyle.isSidebar
    var isSidebarExpanded by remember { mutableStateOf(appearanceSettings.navbarStyle.isExpandedSidebar) }

    // Dismiss any pending notification when main screen is rendered
    LaunchedEffect(Unit) {
        com.example.util.OtaNotificationHelper.dismissNotification(context)

        // Start poller only if auto check is actively enabled and not suspended in Lite Mode
        val isOtaActive = com.example.util.OtaUpdateManager.isAutoCheckEnabled(context) &&
                (!liteModeSettings.isLiteModeEnabled || !liteModeSettings.disableContinuousOtaInLiteMode) &&
                com.example.util.LiteModeManager.isModuleActive(com.example.data.model.AppModuleId.OTA_CI_CD_ENGINE)

        if (isOtaActive) {
            com.example.util.OtaUpdateManager.startContinuousUpdatePoller(context, this)
        }

        // Start remote Sheets sync only if module is enabled
        val isSheetsActive = com.example.util.RemoteConfigEngine.isAutoSyncEnabled(context) &&
                com.example.util.LiteModeManager.isModuleActive(com.example.data.model.AppModuleId.SHEETS_CLOUD_SYNC)

        if (isSheetsActive) {
            com.example.util.RemoteConfigEngine.performRemoteSync(context, this)
        }
    }

    // If an app is running in the full-screen player
    if (state.activeRunningApp != null || state.instantBrowseUrl != null) {
        InAppBrowserScreen(
            app = state.activeRunningApp,
            instantUrl = state.instantBrowseUrl,
            onClose = { viewModel.closePlayer() }
        )
        return
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            containerColor = ElegantBackground,
            bottomBar = {
            if (!isSidebarMode) {
                NavigationBar(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, ElegantCardBorder, RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)),
                containerColor = ElegantNav,
                tonalElevation = 8.dp
            ) {
                // Tab 1: Mis Apps
                NavigationBarItem(
                    selected = state.activeTab == MainNavTab.MY_APPS,
                    onClick = { viewModel.setActiveTab(MainNavTab.MY_APPS) },
                    icon = {
                        Icon(
                            if (state.activeTab == MainNavTab.MY_APPS) Icons.Filled.Apps else Icons.Outlined.Apps,
                            contentDescription = "Mis Apps"
                        )
                    },
                    label = {
                        Text(
                            "Mis Apps",
                            fontWeight = if (state.activeTab == MainNavTab.MY_APPS) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = LavenderPrimary,
                        selectedTextColor = LavenderPrimary,
                        unselectedIconColor = TextGrayMuted,
                        unselectedTextColor = TextGrayMuted,
                        indicatorColor = DeepPurpleContainer
                    ),
                    modifier = Modifier.testTag("nav_tab_my_apps")
                )

                // Tab 2: Explorar
                NavigationBarItem(
                    selected = state.activeTab == MainNavTab.EXPLORE_CATALOG,
                    onClick = { viewModel.setActiveTab(MainNavTab.EXPLORE_CATALOG) },
                    icon = {
                        Icon(
                            if (state.activeTab == MainNavTab.EXPLORE_CATALOG) Icons.Filled.Explore else Icons.Outlined.Explore,
                            contentDescription = "Explorar"
                        )
                    },
                    label = {
                        Text(
                            "Explorar",
                            fontWeight = if (state.activeTab == MainNavTab.EXPLORE_CATALOG) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = LavenderPrimary,
                        selectedTextColor = LavenderPrimary,
                        unselectedIconColor = TextGrayMuted,
                        unselectedTextColor = TextGrayMuted,
                        indicatorColor = DeepPurpleContainer
                    ),
                    modifier = Modifier.testTag("nav_tab_explore")
                )

                // Tab 3: Turbo Studio
                NavigationBarItem(
                    selected = state.activeTab == MainNavTab.TURBO_STUDIO,
                    onClick = { viewModel.setActiveTab(MainNavTab.TURBO_STUDIO) },
                    icon = {
                        Icon(
                            if (state.activeTab == MainNavTab.TURBO_STUDIO) Icons.Filled.Speed else Icons.Outlined.Speed,
                            contentDescription = "Turbo Studio"
                        )
                    },
                    label = {
                        Text(
                            "Turbo Studio",
                            fontWeight = if (state.activeTab == MainNavTab.TURBO_STUDIO) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = LavenderPrimary,
                        selectedTextColor = LavenderPrimary,
                        unselectedIconColor = TextGrayMuted,
                        unselectedTextColor = TextGrayMuted,
                        indicatorColor = DeepPurpleContainer
                    ),
                    modifier = Modifier.testTag("nav_tab_turbo")
                )

                // Tab 4: Sandbox
                NavigationBarItem(
                    selected = state.activeTab == MainNavTab.CONTAINER_SANDBOX,
                    onClick = { viewModel.setActiveTab(MainNavTab.CONTAINER_SANDBOX) },
                    icon = {
                        Icon(
                            if (state.activeTab == MainNavTab.CONTAINER_SANDBOX) Icons.Filled.Shield else Icons.Outlined.Shield,
                            contentDescription = "Sandbox"
                        )
                    },
                    label = {
                        Text(
                            "Sandbox",
                            fontWeight = if (state.activeTab == MainNavTab.CONTAINER_SANDBOX) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = LavenderPrimary,
                        selectedTextColor = LavenderPrimary,
                        unselectedIconColor = TextGrayMuted,
                        unselectedTextColor = TextGrayMuted,
                        indicatorColor = DeepPurpleContainer
                    ),
                    modifier = Modifier.testTag("nav_tab_sandbox")
                )
            }
            }
        }
    ) { innerPadding ->
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .statusBarsPadding()
        ) {
            // Left Sidebar Navigation when enabled
            if (isSidebarMode) {
                com.example.ui.components.SidebarNavigation(
                    activeTab = state.activeTab,
                    onTabSelected = { 
                        viewModel.setActiveTab(it)
                        selectedCustomMenuId = null
                    },
                    selectedCustomMenuId = selectedCustomMenuId,
                    onSelectCustomMenu = { customId ->
                        selectedCustomMenuId = customId
                        viewModel.setActiveTab(MainNavTab.TURBO_STUDIO)
                    },
                    appearanceSettings = appearanceSettings,
                    isExpanded = isSidebarExpanded,
                    onToggleExpanded = { isSidebarExpanded = !isSidebarExpanded },
                    onCreateAppClick = { viewModel.openCreateDialog() },
                    onSheetsSyncClick = { viewModel.openGoogleSheetsSyncDialog() },
                    onOtaUpdateClick = { showOtaUpdateDialog = true },
                    onAppearanceClick = { showAppearanceDialog = true },
                    onClearCacheClick = { viewModel.clearWebData(context) },
                    onOpenBlockCustomizer = { showBlockBuilderDialog = true }
                )
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
            ) {
                // Persistent Top Header with instant global controls, search, cache clear, and block builder
                com.example.ui.components.PersistentTopHeader(
                    onOpenSearch = { viewModel.openCreateDialog() },
                    onOpenLayoutCustomizer = { showBlockBuilderDialog = true },
                    onOpenOtaDialog = { showOtaUpdateDialog = true },
                    onOpenAppearanceDialog = { showAppearanceDialog = true },
                    onOpenCreateAppDialog = { viewModel.openCreateDialog() },
                    onRefreshState = { viewModel.refreshBatteryOptimizationStatus(context) },
                    onClearCache = { viewModel.clearWebData(context) },
                    isSidebarMode = isSidebarMode,
                    onToggleSidebarMode = {
                        val newStyle = if (isSidebarMode) com.example.data.model.AppNavbarStyle.STANDARD_LABELED else com.example.data.model.AppNavbarStyle.LEFT_SIDEBAR_RAIL
                        com.example.util.AppearanceSettingsManager.setNavbarStyle(context, newStyle)
                    }
                )

                // Tab Content with Animated Transition
                AnimatedContent(
                    targetState = state.activeTab,
                    transitionSpec = { fadeIn() togetherWith fadeOut() },
                    label = "MainTabsAnimation",
                    modifier = Modifier.weight(1f)
                ) { targetTab ->
                    when (targetTab) {
                        MainNavTab.MY_APPS -> {
                            AppLibraryTab(
                                state = state,
                                onSearchChange = { viewModel.setSearchQuery(it) },
                                onCategoryChange = { viewModel.setSelectedCategory(it) },
                                onLayoutModeChange = { viewModel.setLayoutMode(it) },
                                onLaunchApp = { viewModel.launchAppInPlayer(it) },
                                onPinShortcut = { viewModel.pinShortcut(context, it) },
                                onEditApp = { viewModel.openEditDialog(it) },
                                onDeleteApp = { viewModel.deleteApp(it) },
                                onCreateAppClick = { viewModel.openCreateDialog() },
                                onOpenSheetsSync = { viewModel.openGoogleSheetsSyncDialog() },
                                onRestoreCiverCloud = { viewModel.restoreCiverCloudSuite() },
                                onOpenUrl = { _, url -> viewModel.launchInstantUrl(url) }
                            )
                        }
                        MainNavTab.EXPLORE_CATALOG -> {
                            ExploreCatalogTab(
                                onInstallApp = { name, url, icon, accent, cat, hw, ad ->
                                    viewModel.createOrSaveApp(
                                        name = name,
                                        url = url,
                                        iconType = "EMOJI",
                                        iconValue = icon,
                                        accentColor = accent,
                                        category = cat,
                                        isFullscreen = true,
                                        isHardwareBoostEnabled = hw,
                                        isAdBlockEnabled = ad,
                                        isBatterySaverBypassEnabled = true
                                    )
                                },
                                onLaunchDirect = { url ->
                                    viewModel.launchInstantUrl(url)
                                }
                            )
                        }
                        MainNavTab.TURBO_STUDIO -> {
                            TurboStudioTab(
                                state = state,
                                selectedCustomMenuId = selectedCustomMenuId,
                                onClearCustomMenuFilter = { selectedCustomMenuId = null },
                                onRequestBatteryBypass = { viewModel.requestBatterySaverBypass(context) },
                                onClearAllCache = { viewModel.clearWebData(context) },
                                onOpenUrl = { _, url ->
                                    viewModel.launchInstantUrl(url)
                                }
                            )
                        }
                        MainNavTab.CONTAINER_SANDBOX -> {
                            com.example.ui.screens.ContainerSandboxTab()
                        }
                    }
                }
            }
        }
        }

        // Floating Overlays (conditioned on Lite Mode settings & Thermal module state)
        val shouldShowOverlays = (!liteModeSettings.isLiteModeEnabled || !liteModeSettings.disableOverlaysInLiteMode) &&
                com.example.util.LiteModeManager.isModuleActive(com.example.data.model.AppModuleId.THERMAL_HARDWARE_SENTINEL)

        if (shouldShowOverlays) {
            // Floating Thermal Overheating Protection Overlay
            com.example.ui.components.ThermalProtectionOverlay()

            // Floating Real-Time CPU Resource Heatmap Diagnostic Overlay
            com.example.ui.components.CpuHeatmapDiagnosticOverlay()
        }
    }

    // Create App Dialog
    if (state.isCreateDialogOpen) {
        CreateWebAppDialog(
            onDismiss = { viewModel.closeCreateDialog() },
            onConfirm = { name, url, iconType, iconValue, accentColor, category, isFullscreen, isHardwareBoost, isAdBlock, isBatteryBypass, isDesktop, customCss, customJs, isOled ->
                viewModel.createOrSaveApp(
                    name = name,
                    url = url,
                    iconType = iconType,
                    iconValue = iconValue,
                    accentColor = accentColor,
                    category = category,
                    isFullscreen = isFullscreen,
                    isHardwareBoostEnabled = isHardwareBoost,
                    isAdBlockEnabled = isAdBlock,
                    isBatterySaverBypassEnabled = isBatteryBypass,
                    isDesktopMode = isDesktop,
                    customCss = customCss,
                    customJs = customJs,
                    isOledBlackMode = isOled
                )
            }
        )
    }

    // Google Sheets Sync Dialog
    if (state.isGoogleSheetsSyncOpen) {
        GoogleSheetsSyncDialog(
            onDismiss = { viewModel.closeGoogleSheetsSyncDialog() },
            onImportApps = { apps ->
                viewModel.importAppsFromGoogleSheets(apps)
            },
            onPinAllApps = {
                viewModel.pinAllApps(context)
            }
        )
    }

    // Edit App Dialog
    state.editingApp?.let { editingApp ->
        EditWebAppDialog(
            app = editingApp,
            onDismiss = { viewModel.closeEditDialog() },
            onSave = { updated -> viewModel.updateExistingApp(updated) },
            onDelete = { toDelete ->
                viewModel.deleteApp(toDelete)
                viewModel.closeEditDialog()
            }
        )
    }

    // OTA Update Dialog (from notification tap or deep-link or top bar)
    if (showOtaUpdateDialog) {
        com.example.ui.dialogs.RemoteControlOtaDialog(
            onDismissRequest = {
                showOtaUpdateDialog = false
                com.example.util.OtaNotificationHelper.dismissNotification(context)
            },
            onSheetsSyncClick = {
                showOtaUpdateDialog = false
                viewModel.openGoogleSheetsSyncDialog()
            }
        )
    }

    // Appearance & Design Configuration Dialog
    if (showAppearanceDialog) {
        androidx.compose.ui.window.Dialog(
            onDismissRequest = { showAppearanceDialog = false },
            properties = androidx.compose.ui.window.DialogProperties(
                usePlatformDefaultWidth = false
            )
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                shape = MaterialTheme.shapes.extraLarge,
                color = MaterialTheme.colorScheme.background,
                tonalElevation = 6.dp
            ) {
                androidx.compose.foundation.lazy.LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    item {
                        com.example.ui.components.AppearanceConfigurationHub(
                            onClose = { showAppearanceDialog = false }
                        )
                    }
                }
            }
        }
    }

    // Visual Drag & Drop Widget Layout Editor & Theme Customizer Dialog
    if (showBlockBuilderDialog) {
        com.example.ui.components.WidgetLayoutEditorDialog(
            onDismissRequest = { showBlockBuilderDialog = false }
        )
    }
}
