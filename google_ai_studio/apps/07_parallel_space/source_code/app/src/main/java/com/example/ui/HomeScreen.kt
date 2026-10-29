package com.example.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.AddCloneBottomSheet
import com.example.ui.components.AddCloneGridButton
import com.example.ui.components.AppLaunchSplashDialog
import com.example.ui.components.AppSecurityLockDialog
import com.example.ui.components.BiometricUnlockDialog
import com.example.ui.components.CalculatorDisguiseScreen
import com.example.ui.components.ClonedAppGridItem
import com.example.ui.components.ContainerFingerprintDialog
import com.example.ui.components.ContainerHealthDialog
import com.example.ui.components.CustomizeCloneDialog
import com.example.ui.components.InstalledAppsScreen
import com.example.ui.components.PinLockDialog
import com.example.ui.components.SandboxedWebViewScreen
import com.example.ui.components.SettingsBottomSheet
import com.example.ui.components.SpeedBoostDialog
import com.example.ui.components.StorageAnalyticsScreen
import com.example.ui.components.StorageManagerDialog
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Apps
import androidx.compose.material.icons.filled.BugReport
import com.example.ui.components.MultitaskRunningDock
import com.example.ui.components.CrawlerAuditorDialog
import com.example.ui.components.ResourceAndCheckpointDialog
import androidx.compose.material.icons.filled.Memory
import com.example.ui.theme.DeepSpaceBackground
import com.example.ui.theme.DeepSpaceBorder
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.DeepSpaceSurfaceVariant
import com.example.ui.theme.ElectricViolet
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun HomeScreen(
    viewModel: ParallelSpaceViewModel
) {
    val isDisguiseActive by viewModel.isDisguiseActive.collectAsState()
    val activeWebSandbox by viewModel.activeWebSandbox.collectAsState()

    // If Calculator Disguise is on, show calculator as the whole screen
    if (isDisguiseActive) {
        CalculatorDisguiseScreen(
            secretPin = viewModel.securityPrefs.pin,
            onSecretPinMatched = { viewModel.unlockDisguiseWithSecretPin() },
            onVibrate = { viewModel.vibrate(30) }
        )
        return
    }

    // If Active Sandboxed Web Container is open, display the in-app browser session
    if (activeWebSandbox != null) {
        SandboxedWebViewScreen(
            app = activeWebSandbox!!,
            onMinimize = { viewModel.minimizeWebSandbox() },
            onClose = { viewModel.closeWebSandbox() },
            onSwitchToApp = { viewModel.switchToWebSandbox(it) }
        )
        return
    }

    val selectedTab by viewModel.selectedTab.collectAsState()
    val filteredApps by viewModel.filteredApps.collectAsState()
    val allClonedApps by viewModel.allClonedApps.collectAsState()
    val runningSessions by viewModel.runningSessions.collectAsState()
    val isCrawlerDialogVisible by viewModel.isCrawlerDialogVisible.collectAsState()
    val isCrawlerRunning by viewModel.isCrawlerRunning.collectAsState()
    val crawlerStepText by viewModel.crawlerStepText.collectAsState()
    val crawlerStepIndex by viewModel.crawlerStepIndex.collectAsState()
    val crawlerSummary by viewModel.crawlerSummary.collectAsState()
    val crawlerLogs by viewModel.crawlerLogs.collectAsState()
    val isAddCloneSheetVisible by viewModel.isAddCloneSheetVisible.collectAsState()
    val installedApps by viewModel.installedApps.collectAsState()
    val popularPresets = viewModel.popularPresets
    val selectedPackagesToClone by viewModel.selectedAppsToClone.collectAsState()
    val editingClone by viewModel.editingClone.collectAsState()
    val isPinPromptVisible by viewModel.isPinPromptVisible.collectAsState()
    val speedBoostState by viewModel.speedBoostState.collectAsState()
    val storageState by viewModel.storageState.collectAsState()
    val launchSplashState by viewModel.launchSplashState.collectAsState()
    val isSettingsVisible by viewModel.isSettingsVisible.collectAsState()
    val isInstalledCatalogVisible by viewModel.isInstalledCatalogVisible.collectAsState()
    val isStorageAnalyticsVisible by viewModel.isStorageAnalyticsVisible.collectAsState()
    val securityLockApp by viewModel.securityLockApp.collectAsState()
    val fingerprintApp by viewModel.fingerprintApp.collectAsState()
    val diagnosticsApp by viewModel.diagnosticsApp.collectAsState()
    val fintechShieldApp by viewModel.fintechShieldApp.collectAsState()
    val biometricPromptApp by viewModel.biometricPromptApp.collectAsState()
    val isResourceCheckpointDialogVisible by viewModel.isResourceCheckpointDialogVisible.collectAsState()
    val systemMemory by viewModel.systemMemory.collectAsState()
    val cloneMetrics by viewModel.cloneMetrics.collectAsState()
    val currentResourceProfile by viewModel.currentResourceProfile.collectAsState()

    // Full Screen Installed Apps Device Catalog
    if (isInstalledCatalogVisible) {
        InstalledAppsScreen(
            installedApps = installedApps,
            existingClones = allClonedApps,
            onCloneSingleApp = { viewModel.cloneSingleApp(it) },
            onCloneMultipleApps = { list -> list.forEach { viewModel.cloneSingleApp(it) } },
            onBack = { viewModel.closeInstalledCatalog() }
        )
        return
    }

    // Full Screen Storage Analytics with interactive Canvas charts
    if (isStorageAnalyticsVisible) {
        StorageAnalyticsScreen(
            clonedApps = allClonedApps,
            onCleanCache = { viewModel.clearCloneCache(it) },
            onCleanAllCache = { viewModel.cleanAllClonesStorage() },
            onBack = { viewModel.closeStorageAnalytics() }
        )
        return
    }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .testTag("home_screen"),
        containerColor = DeepSpaceBackground,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { viewModel.showAddCloneSheet() },
                containerColor = NeonCyan,
                contentColor = Color.Black,
                shape = CircleShape,
                modifier = Modifier.testTag("fab_add_clone")
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Clone New App",
                    modifier = Modifier.size(28.dp)
                )
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Top App Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Parallel Space",
                            style = MaterialTheme.typography.headlineSmall.copy(
                                fontWeight = FontWeight.ExtraBold,
                                color = TextPrimary
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = ElectricViolet.copy(alpha = 0.25f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, ElectricViolet)
                        ) {
                            Text(
                                text = "DUAL APP",
                                color = ElectricViolet,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Text(
                        text = "Simultaneous Multi-Account Engine",
                        style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary)
                    )
                }

                // Quick Action Bar: Catalog, Analytics, Speed Booster, Settings
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = { viewModel.openInstalledCatalog() },
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("top_installed_catalog_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Apps,
                            contentDescription = "Device Installed Apps",
                            tint = TextSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    IconButton(
                        onClick = { viewModel.openStorageAnalytics() },
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("top_storage_analytics_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.BarChart,
                            contentDescription = "Storage Analytics",
                            tint = NeonCyan,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    IconButton(
                        onClick = { viewModel.startSpeedBoost() },
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("top_speed_boost_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.RocketLaunch,
                            contentDescription = "Speed Boost",
                            tint = EmeraldSuccess,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    IconButton(
                        onClick = { viewModel.openCrawlerDialog() },
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("top_crawler_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.BugReport,
                            contentDescription = "Crawler y Estabilidad",
                            tint = Color(0xFFF59E0B),
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    IconButton(
                        onClick = { viewModel.openResourceCheckpointDialog() },
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("top_resource_checkpoint_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Memory,
                            contentDescription = "Guardián de Recursos y Checkpoints",
                            tint = NeonCyan,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    IconButton(
                        onClick = { viewModel.openSettings() },
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("top_settings_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = TextSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            // Quick Status Header Card (RAM Load + One-Tap Boost)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = DeepSpaceSurface
                ),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    Brush.horizontalGradient(
                        listOf(NeonCyan.copy(alpha = 0.4f), ElectricViolet.copy(alpha = 0.2f))
                    )
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(NeonCyan.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.RocketLaunch,
                                contentDescription = null,
                                tint = NeonCyan,
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column {
                            Text(
                                text = "Virtual Sandbox Active",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                            )
                            Text(
                                text = "${allClonedApps.size} Cloned Apps • 64-bit Engine",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = TextMuted
                                )
                            )
                        }
                    }

                    Button(
                        onClick = { viewModel.startSpeedBoost() },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = NeonCyan.copy(alpha = 0.2f),
                            contentColor = NeonCyan
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.height(34.dp)
                    ) {
                        Text(
                            text = "Boost",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Multitask Running Apps Dock (active apps in background without kill/reset)
            MultitaskRunningDock(
                runningSessions = runningSessions,
                onRestoreSession = { viewModel.restoreWebSandbox(it) },
                onCloseSession = { viewModel.closeRunningSession(it) },
                onOpenCrawler = { viewModel.openCrawlerDialog() }
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Space Category Selector Tabs
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(SpaceTab.entries.toTypedArray()) { tab ->
                    val isSelected = selectedTab == tab
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .clickable { viewModel.selectTab(tab) }
                            .testTag("tab_${tab.name.lowercase()}"),
                        shape = RoundedCornerShape(20.dp),
                        color = if (isSelected) NeonCyan else DeepSpaceSurface,
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isSelected) NeonCyan else DeepSpaceBorder
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (tab == SpaceTab.FINTECH) {
                                Icon(
                                    imageVector = Icons.Default.Security,
                                    contentDescription = null,
                                    tint = if (isSelected) Color.Black else Color(0xFF10B981),
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                            } else if (tab == SpaceTab.PRIVATE) {
                                Icon(
                                    imageVector = Icons.Default.Lock,
                                    contentDescription = null,
                                    tint = if (isSelected) Color.Black else Color(0xFFFB7185),
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                            }
                            Text(
                                text = tab.label,
                                color = if (isSelected) Color.Black else TextSecondary,
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Cloned Apps Grid
            LazyVerticalGrid(
                columns = GridCells.Fixed(3),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                contentPadding = PaddingValues(bottom = 80.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Cloned App Cards
                items(filteredApps, key = { it.id }) { app ->
                    ClonedAppGridItem(
                        app = app,
                        onClick = { viewModel.onAppClicked(app) },
                        onMoreClick = { viewModel.openCustomizeClone(app) }
                    )
                }

                // Add Clone Tile Card
                item {
                    AddCloneGridButton(
                        onClick = { viewModel.showAddCloneSheet() }
                    )
                }
            }
        }
    }

    // Modal / Sheets / Dialogs

    // 1. Add Clone Bottom Sheet
    if (isAddCloneSheetVisible) {
        AddCloneBottomSheet(
            popularApps = popularPresets,
            installedApps = installedApps,
            selectedPackages = selectedPackagesToClone,
            onToggleSelect = { viewModel.toggleAppSelectionToClone(it) },
            onCloneSingle = { viewModel.cloneSingleApp(it) },
            onConfirmBatch = { viewModel.commitAddSelectedClones() },
            onDismiss = { viewModel.hideAddCloneSheet() }
        )
    }

    // 2. Customize Clone Dialog
    editingClone?.let { app ->
        CustomizeCloneDialog(
            app = app,
            onSave = { viewModel.saveCloneCustomization(it) },
            onDelete = { viewModel.deleteClone(it) },
            onClearCache = { viewModel.clearCloneCache(it) },
            onOpenSecurity = { viewModel.openSecurityLock(it) },
            onOpenFingerprint = { viewModel.openFingerprint(it) },
            onOpenDiagnostics = { viewModel.openDiagnostics(it) },
            onDuplicate = { viewModel.duplicateClone(it) },
            onOpenFintechShield = { viewModel.openFintechShield(it) },
            onDismiss = { viewModel.dismissCustomizeClone() }
        )
    }

    // Fintech & Banking Shield Dialog
    fintechShieldApp?.let { app ->
        com.example.ui.components.FintechShieldDialog(
            app = app,
            onDismiss = { viewModel.closeFintechShield() },
            onSaveShieldSettings = { isProtected, playIntegrity, antiCloak, flagSecure, keepAlive ->
                viewModel.updateFintechShieldSettings(
                    app = app,
                    isProtected = isProtected,
                    playIntegrity = playIntegrity,
                    antiCloak = antiCloak,
                    flagSecure = flagSecure,
                    keepAlive = keepAlive
                )
            },
            onLaunchShieldedApp = {
                viewModel.closeFintechShield()
                viewModel.onAppClicked(app)
            }
        )
    }

    // Individual App Security & Biometric Lock Configuration Dialog
    securityLockApp?.let { app ->
        AppSecurityLockDialog(
            app = app,
            masterPin = viewModel.securityPrefs.pin,
            onDismiss = { viewModel.closeSecurityLock() },
            onSaveSecuritySettings = { isLocked: Boolean, customPin: String?, isBiometricEnabled: Boolean, timeoutMinutes: Int ->
                viewModel.updateAppSecurity(
                    app = app,
                    isLocked = isLocked,
                    customPin = customPin,
                    isBiometricEnabled = isBiometricEnabled,
                    autoLockTimeoutMinutes = timeoutMinutes
                )
            }
        )
    }

    // Isolated Hardware Fingerprint Spoofer Dialog
    fingerprintApp?.let { app ->
        ContainerFingerprintDialog(
            app = app,
            onDismiss = { viewModel.closeFingerprint() },
            onSaveFingerprint = { androidId, model, mac, keepAlive ->
                viewModel.updateFingerprint(
                    app = app,
                    androidId = androidId,
                    deviceModel = model,
                    macAddress = mac,
                    keepAlive = keepAlive
                )
            }
        )
    }

    // Container Diagnostics & Auto-Repair Dialog
    diagnosticsApp?.let { app ->
        ContainerHealthDialog(
            app = app,
            onDismiss = { viewModel.closeDiagnostics() },
            onRepairComplete = { viewModel.repairContainer(app) }
        )
    }

    // Biometric Unlock Prompt for locked containers
    biometricPromptApp?.let { app ->
        BiometricUnlockDialog(
            app = app,
            onSuccess = { viewModel.onBiometricVerified() },
            onUsePinFallback = {
                viewModel.closeBiometricPrompt()
                viewModel.onAppClicked(app.copy(isBiometricEnabled = false))
            },
            onDismiss = { viewModel.closeBiometricPrompt() }
        )
    }

    // 3. PIN Lock Prompt Dialog
    if (isPinPromptVisible) {
        PinLockDialog(
            correctPin = viewModel.securityPrefs.pin,
            onSuccess = { viewModel.onPinVerified() },
            onDismiss = { viewModel.dismissPinPrompt() },
            onVibrate = { viewModel.vibrate(30) }
        )
    }

    // 4. Speed Booster Dialog
    if (speedBoostState.isDialogVisible) {
        SpeedBoostDialog(
            state = speedBoostState,
            onDismiss = { viewModel.closeSpeedBoost() }
        )
    }

    // 5. Storage Cleaner Dialog
    if (storageState.isDialogVisible) {
        StorageManagerDialog(
            clonedApps = allClonedApps,
            storageState = storageState,
            onCleanAll = { viewModel.cleanAllClonesStorage() },
            onDismiss = { viewModel.closeStorageManager() }
        )
    }

    // 6. Settings Bottom Sheet
    if (isSettingsVisible) {
        SettingsBottomSheet(
            securityPrefs = viewModel.securityPrefs,
            onToggleCalculatorDisguise = { viewModel.toggleCalculatorDisguise(it) },
            onChangePin = { viewModel.setSecurityPin(it) },
            onDismiss = { viewModel.closeSettings() }
        )
    }

    // 7. Virtual Engine Launch Splash
    AppLaunchSplashDialog(state = launchSplashState)

    // 8. Crawler & Stability Auditor Dialog
    if (isCrawlerDialogVisible) {
        CrawlerAuditorDialog(
            isRunning = isCrawlerRunning,
            currentStepText = crawlerStepText,
            currentStepIndex = crawlerStepIndex,
            totalSteps = 6,
            summary = crawlerSummary,
            liveLogs = crawlerLogs,
            onStartCrawler = { viewModel.runCrawlerAudit() },
            onDismiss = { viewModel.closeCrawlerDialog() }
        )
    }

    // 9. Resource & Checkpoint Guardian Dialog
    if (isResourceCheckpointDialogVisible) {
        ResourceAndCheckpointDialog(
            systemMemory = systemMemory,
            activeMetrics = cloneMetrics,
            selectedProfile = currentResourceProfile,
            onSelectProfile = { viewModel.setResourceProfile(it) },
            onOptimizeRam = { viewModel.optimizeRam() },
            onManualCheckpoint = { viewModel.saveCheckpointForApp(it) },
            onCheckpointAll = { viewModel.saveCheckpointForAll() },
            onDismiss = { viewModel.closeResourceCheckpointDialog() }
        )
    }
}
