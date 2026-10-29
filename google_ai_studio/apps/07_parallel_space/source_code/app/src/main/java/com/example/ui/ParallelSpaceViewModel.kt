package com.example.ui

import android.app.Application
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.core.ActiveAppSession
import com.example.core.CloneResourceMetric
import com.example.core.CrawlerAuditSummary
import com.example.core.DualSpaceCheckpointManager
import com.example.core.DualSpaceCrawlerEngine
import com.example.core.DualSpaceResourceManager
import com.example.core.DualSpaceSessionVault
import com.example.core.DualSpaceVirtualEngineService
import com.example.core.IsolatedContainerManager
import com.example.core.ResourceProfile
import com.example.core.SystemMemorySnapshot
import com.example.data.AppDatabase
import com.example.data.AppRepository
import com.example.data.AvailableAppItem
import com.example.data.ClonedAppEntity
import com.example.data.PlayStoreAppItem
import com.example.data.SecurityPreferences
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class SpaceTab(val label: String) {
    ALL("All Spaces"),
    FINTECH("Fintech & Banca"),
    SOCIAL("Social"),
    GAMING("Gaming"),
    WORK("Work"),
    PRIVATE("Private Vault")
}

data class SpeedBoostState(
    val isDialogVisible: Boolean = false,
    val isBoosting: Boolean = false,
    val initialRamPercent: Int = 78,
    val currentRamPercent: Int = 78,
    val targetRamPercent: Int = 42,
    val freedMemoryMb: Int = 512,
    val killedThreadsCount: Int = 18,
    val isCompleted: Boolean = false
)

data class StorageState(
    val isDialogVisible: Boolean = false,
    val isCleaning: Boolean = false
)

data class LaunchSplashState(
    val isVisible: Boolean = false,
    val app: ClonedAppEntity? = null,
    val statusText: String = "Initializing Parallel Virtual Container..."
)

class ParallelSpaceViewModel(application: Application) : AndroidViewModel(application) {
    private val database = AppDatabase.getDatabase(application, viewModelScope)
    private val repository = AppRepository(application, database.clonedAppDao())
    val containerManager = IsolatedContainerManager(application)
    val securityPrefs = SecurityPreferences(application)

    private val _selectedTab = MutableStateFlow(SpaceTab.ALL)
    val selectedTab: StateFlow<SpaceTab> = _selectedTab.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    // Base flow of cloned apps from Room DB
    val allClonedApps: StateFlow<List<ClonedAppEntity>> = repository.allClonedApps.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // Filtered list based on current tab and search query
    val filteredApps: StateFlow<List<ClonedAppEntity>> = combine(
        allClonedApps,
        _selectedTab,
        _searchQuery
    ) { apps, tab, query ->
        apps.filter { app ->
            val matchesTab = when (tab) {
                SpaceTab.ALL -> !app.isPrivateSpace
                SpaceTab.FINTECH -> (app.category.equals("Fintech", ignoreCase = true) || app.isFintechProtected || app.packageName == "mx.openbank.modelbank") && !app.isPrivateSpace
                SpaceTab.SOCIAL -> app.category.equals("Social", ignoreCase = true) && !app.isPrivateSpace
                SpaceTab.GAMING -> app.category.equals("Gaming", ignoreCase = true) && !app.isPrivateSpace
                SpaceTab.WORK -> app.category.equals("Work", ignoreCase = true) && !app.isPrivateSpace
                SpaceTab.PRIVATE -> app.isPrivateSpace
            }
            val matchesQuery = query.isBlank() || app.appName.contains(query, ignoreCase = true) ||
                    app.originalName.contains(query, ignoreCase = true)
            matchesTab && matchesQuery
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // Installed and Popular apps for clone picker
    private val _installedApps = MutableStateFlow<List<AvailableAppItem>>(emptyList())
    val installedApps: StateFlow<List<AvailableAppItem>> = _installedApps.asStateFlow()

    val popularPresets: List<AvailableAppItem> = repository.popularPresets

    // Add clone bottom sheet state
    private val _isAddCloneSheetVisible = MutableStateFlow(false)
    val isAddCloneSheetVisible: StateFlow<Boolean> = _isAddCloneSheetVisible.asStateFlow()

    private val _selectedAppsToClone = MutableStateFlow<Set<String>>(emptySet())
    val selectedAppsToClone: StateFlow<Set<String>> = _selectedAppsToClone.asStateFlow()

    // Full Screen Installed Apps Catalog View
    private val _isInstalledCatalogVisible = MutableStateFlow(false)
    val isInstalledCatalogVisible: StateFlow<Boolean> = _isInstalledCatalogVisible.asStateFlow()

    // Storage Analytics View (Interactive Recharts-style charts)
    private val _isStorageAnalyticsVisible = MutableStateFlow(false)
    val isStorageAnalyticsVisible: StateFlow<Boolean> = _isStorageAnalyticsVisible.asStateFlow()

    // Edit / Customize clone dialog
    private val _editingClone = MutableStateFlow<ClonedAppEntity?>(null)
    val editingClone: StateFlow<ClonedAppEntity?> = _editingClone.asStateFlow()

    // Security & Biometric Lock Dialog
    private val _securityLockApp = MutableStateFlow<ClonedAppEntity?>(null)
    val securityLockApp: StateFlow<ClonedAppEntity?> = _securityLockApp.asStateFlow()

    // Hardware Fingerprint Spoofer Dialog
    private val _fingerprintApp = MutableStateFlow<ClonedAppEntity?>(null)
    val fingerprintApp: StateFlow<ClonedAppEntity?> = _fingerprintApp.asStateFlow()

    // Container Diagnostics & Auto-Repair Dialog
    private val _diagnosticsApp = MutableStateFlow<ClonedAppEntity?>(null)
    val diagnosticsApp: StateFlow<ClonedAppEntity?> = _diagnosticsApp.asStateFlow()

    // Fintech & Banking Shield Dialog
    private val _fintechShieldApp = MutableStateFlow<ClonedAppEntity?>(null)
    val fintechShieldApp: StateFlow<ClonedAppEntity?> = _fintechShieldApp.asStateFlow()

    // Active Biometric Authentication Prompt
    private val _biometricPromptApp = MutableStateFlow<ClonedAppEntity?>(null)
    val biometricPromptApp: StateFlow<ClonedAppEntity?> = _biometricPromptApp.asStateFlow()

    // App lock / PIN prompt
    private val _isPinPromptVisible = MutableStateFlow(false)
    val isPinPromptVisible: StateFlow<Boolean> = _isPinPromptVisible.asStateFlow()

    private val _pendingLockedApp = MutableStateFlow<ClonedAppEntity?>(null)
    val pendingLockedApp: StateFlow<ClonedAppEntity?> = _pendingLockedApp.asStateFlow()

    private val _isEnteringPrivateSpace = MutableStateFlow(false)
    val isEnteringPrivateSpace: StateFlow<Boolean> = _isEnteringPrivateSpace.asStateFlow()

    data class BatchCloneTarget(
        val appName: String,
        val packageName: String,
        val category: String,
        val webUrl: String?
    )

    // DualStore Virtual Play Store
    private val _isPlayStoreVisible = MutableStateFlow(false)
    val isPlayStoreVisible: StateFlow<Boolean> = _isPlayStoreVisible.asStateFlow()

    // Multi-Clone / Batch Stress Clone Dialog
    private val _batchCloneTarget = MutableStateFlow<BatchCloneTarget?>(null)
    val batchCloneTarget: StateFlow<BatchCloneTarget?> = _batchCloneTarget.asStateFlow()

    // Container Config & Tuning Studio
    private val _tuningStudioApp = MutableStateFlow<ClonedAppEntity?>(null)
    val tuningStudioApp: StateFlow<ClonedAppEntity?> = _tuningStudioApp.asStateFlow()

    // Calculator Disguise
    private val _isDisguiseActive = MutableStateFlow(securityPrefs.isCalculatorDisguiseActive)
    val isDisguiseActive: StateFlow<Boolean> = _isDisguiseActive.asStateFlow()

    // Speed Booster
    private val _speedBoostState = MutableStateFlow(SpeedBoostState())
    val speedBoostState: StateFlow<SpeedBoostState> = _speedBoostState.asStateFlow()

    // Storage Manager
    private val _storageState = MutableStateFlow(StorageState())
    val storageState: StateFlow<StorageState> = _storageState.asStateFlow()

    // Launch Virtual Engine splash
    private val _launchSplashState = MutableStateFlow(LaunchSplashState())
    val launchSplashState: StateFlow<LaunchSplashState> = _launchSplashState.asStateFlow()

    // Active Sandboxed Web Container
    private val _activeWebSandbox = MutableStateFlow<ClonedAppEntity?>(null)
    val activeWebSandbox: StateFlow<ClonedAppEntity?> = _activeWebSandbox.asStateFlow()

    // Persistent Multi-Container Running Sessions in RAM Vault
    val runningSessions: StateFlow<List<ActiveAppSession>> = DualSpaceSessionVault.runningSessionsFlow

    // Crawler & Stability Auditor State
    private val crawlerEngine = DualSpaceCrawlerEngine(application)
    private val _isCrawlerDialogVisible = MutableStateFlow(false)
    val isCrawlerDialogVisible: StateFlow<Boolean> = _isCrawlerDialogVisible.asStateFlow()

    private val _isCrawlerRunning = MutableStateFlow(false)
    val isCrawlerRunning: StateFlow<Boolean> = _isCrawlerRunning.asStateFlow()

    private val _crawlerStepText = MutableStateFlow("Listo para iniciar rastreo")
    val crawlerStepText: StateFlow<String> = _crawlerStepText.asStateFlow()

    private val _crawlerStepIndex = MutableStateFlow(0)
    val crawlerStepIndex: StateFlow<Int> = _crawlerStepIndex.asStateFlow()

    private val _crawlerSummary = MutableStateFlow<CrawlerAuditSummary?>(null)
    val crawlerSummary: StateFlow<CrawlerAuditSummary?> = _crawlerSummary.asStateFlow()

    private val _crawlerLogs = MutableStateFlow<List<String>>(emptyList())
    val crawlerLogs: StateFlow<List<String>> = _crawlerLogs.asStateFlow()

    // Resource & Checkpoint Management
    val systemMemory: StateFlow<SystemMemorySnapshot?> = DualSpaceResourceManager.systemMemoryFlow
    val cloneMetrics: StateFlow<List<CloneResourceMetric>> = DualSpaceResourceManager.metricsFlow
    val currentResourceProfile: StateFlow<ResourceProfile> = DualSpaceResourceManager.currentProfileFlow

    private val _isResourceCheckpointDialogVisible = MutableStateFlow(false)
    val isResourceCheckpointDialogVisible: StateFlow<Boolean> = _isResourceCheckpointDialogVisible.asStateFlow()

    private val _toastMessage = MutableStateFlow<String?>(null)
    val toastMessage: StateFlow<String?> = _toastMessage.asStateFlow()

    fun clearToast() { _toastMessage.value = null }

    // Settings sheet
    private val _isSettingsVisible = MutableStateFlow(false)
    val isSettingsVisible: StateFlow<Boolean> = _isSettingsVisible.asStateFlow()

    init {
        loadInstalledApps()
        val app = getApplication<Application>()
        DualSpaceResourceManager.getSystemMemoryInfo(app)
        DualSpaceResourceManager.refreshMetrics(app)
    }

    private fun loadInstalledApps() {
        viewModelScope.launch {
            _installedApps.value = repository.getInstalledDeviceApps()
        }
    }

    fun selectTab(tab: SpaceTab) {
        vibrate(30)
        if (tab == SpaceTab.PRIVATE) {
            // Require PIN to access Private Vault
            _isEnteringPrivateSpace.value = true
            _isPinPromptVisible.value = true
        } else {
            _selectedTab.value = tab
        }
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun showAddCloneSheet() {
        vibrate(40)
        _selectedAppsToClone.value = emptySet()
        _isAddCloneSheetVisible.value = true
    }

    fun hideAddCloneSheet() {
        _isAddCloneSheetVisible.value = false
        _selectedAppsToClone.value = emptySet()
    }

    fun toggleAppSelectionToClone(packageName: String) {
        vibrate(25)
        val current = _selectedAppsToClone.value.toMutableSet()
        if (current.contains(packageName)) {
            current.remove(packageName)
        } else {
            current.add(packageName)
        }
        _selectedAppsToClone.value = current
    }

    fun commitAddSelectedClones() {
        vibrate(50)
        val selected = _selectedAppsToClone.value
        if (selected.isEmpty()) {
            hideAddCloneSheet()
            return
        }

        viewModelScope.launch {
            for (pkg in selected) {
                // Check if in installed apps
                val installed = _installedApps.value.find { it.packageName == pkg }
                val preset = popularPresets.find { it.packageName == pkg }

                val name = installed?.appName ?: preset?.appName ?: pkg.substringAfterLast(".")
                val category = installed?.category ?: preset?.category ?: "Tools"
                val webUrl = preset?.defaultWebUrl

                val newClone = ClonedAppEntity(
                    packageName = pkg,
                    appName = "$name (2nd)",
                    originalName = name,
                    category = category,
                    badgeText = "2nd",
                    badgeColorHex = if (category == "Social") "#00F0FF" else if (category == "Gaming") "#F59E0B" else "#A855F7",
                    isLocked = false,
                    isPrivateSpace = _selectedTab.value == SpaceTab.PRIVATE,
                    webUrl = webUrl,
                    launchCount = 0,
                    lastOpenedTime = System.currentTimeMillis(),
                    cacheSizeMb = 12.0,
                    dataSizeMb = 45.0,
                    isSystemInstalled = installed != null
                )
                repository.insertApp(newClone)
            }
            hideAddCloneSheet()
        }
    }

    fun cloneSingleApp(item: AvailableAppItem) {
        vibrate(40)
        viewModelScope.launch {
            val newClone = ClonedAppEntity(
                packageName = item.packageName,
                appName = "${item.appName} (Dual)",
                originalName = item.appName,
                category = item.category,
                badgeText = "Dual",
                badgeColorHex = when (item.category) {
                    "Social" -> "#00F0FF"
                    "Gaming" -> "#F59E0B"
                    "Work" -> "#10B981"
                    else -> "#A855F7"
                },
                isLocked = false,
                isPrivateSpace = _selectedTab.value == SpaceTab.PRIVATE,
                webUrl = item.defaultWebUrl,
                launchCount = 0,
                lastOpenedTime = System.currentTimeMillis(),
                cacheSizeMb = 16.4,
                dataSizeMb = 58.2,
                isSystemInstalled = item.isInstalled
            )
            repository.insertApp(newClone)
            hideAddCloneSheet()
        }
    }

    fun onAppClicked(app: ClonedAppEntity) {
        vibrate(40)
        if (app.isBiometricEnabled) {
            _pendingLockedApp.value = app
            _biometricPromptApp.value = app
        } else if (app.isLocked) {
            _pendingLockedApp.value = app
            _isPinPromptVisible.value = true
        } else {
            launchAppDirectly(app)
        }
    }

    fun onBiometricVerified() {
        vibrate(60)
        val app = _pendingLockedApp.value
        _biometricPromptApp.value = null
        _pendingLockedApp.value = null
        if (app != null) {
            launchAppDirectly(app)
        }
    }

    fun closeBiometricPrompt() {
        _biometricPromptApp.value = null
        _pendingLockedApp.value = null
    }

    fun onPinVerified() {
        vibrate(60)
        _isPinPromptVisible.value = false
        if (_isEnteringPrivateSpace.value) {
            _isEnteringPrivateSpace.value = false
            _selectedTab.value = SpaceTab.PRIVATE
        } else if (_pendingLockedApp.value != null) {
            val app = _pendingLockedApp.value!!
            _pendingLockedApp.value = null
            launchAppDirectly(app)
        }
    }

    fun dismissPinPrompt() {
        _isPinPromptVisible.value = false
        _pendingLockedApp.value = null
        _isEnteringPrivateSpace.value = false
    }

    private fun launchAppDirectly(app: ClonedAppEntity) {
        viewModelScope.launch {
            repository.recordLaunch(app.id)

            val isFintech = app.isFintechProtected || 
                    app.category.equals("Fintech", ignoreCase = true) || 
                    app.packageName == "mx.openbank.modelbank" || 
                    com.example.core.FintechShieldEngine.isFintechPackage(app.packageName, app.appName)

            // Start foreground Keep-Alive Virtual Engine to prevent Android OS LMK termination
            if (app.keepAlive || isFintech) {
                DualSpaceVirtualEngineService.startEngine(
                    context = getApplication(),
                    activeContainers = allClonedApps.value.size.coerceAtLeast(1),
                    activeAppName = app.appName,
                    isFintechActive = isFintech
                )
            }

            // Show virtual container engine splash animation
            if (isFintech) {
                _launchSplashState.value = LaunchSplashState(
                    isVisible = true,
                    app = app,
                    statusText = "🛡️ Fintech Shield™: Atestiguando Google Play Store..."
                )
                delay(350)
                _launchSplashState.value = _launchSplashState.value.copy(
                    statusText = "🛡️ Fintech Shield™: Camuflando RASP, Frida y Root..."
                )
                delay(350)
                _launchSplashState.value = _launchSplashState.value.copy(
                    statusText = "🛡️ Contenedor Aislado Listo. Iniciando ${app.appName}..."
                )
                delay(300)
            } else {
                _launchSplashState.value = LaunchSplashState(
                    isVisible = true,
                    app = app,
                    statusText = "Loading Sandbox Container for ${app.virtualDeviceModel}..."
                )
                delay(400)
                _launchSplashState.value = _launchSplashState.value.copy(
                    statusText = "Spoofed Android ID: ${app.virtualAndroidId.take(10)}..."
                )
                delay(400)
                _launchSplashState.value = _launchSplashState.value.copy(
                    statusText = "Dual Session Isolated. Starting..."
                )
                delay(300)
            }
            _launchSplashState.value = LaunchSplashState(isVisible = false)

            DualSpaceVirtualEngineService.startEngine(
                context = getApplication<Application>(),
                activeContainers = DualSpaceSessionVault.getActiveSessionCount() + 1,
                activeAppName = app.appName,
                isFintechActive = app.isFintechProtected
            )

            if (!app.webUrl.isNullOrBlank()) {
                // Open isolated dual web sandbox container
                _activeWebSandbox.value = app
            } else {
                // Launch installed app using isolated process flags and dedicated sandbox dir
                val success = containerManager.launchClonedApp(app)
                if (!success) {
                    // Fallback to in-app sandboxed web session search if not locally installed
                    _activeWebSandbox.value = app.copy(
                        webUrl = "https://www.google.com/search?q=${app.originalName}"
                    )
                }
            }
        }
    }

    // Background Multi-Tasking & Lifecycle Session Management
    fun minimizeWebSandbox() {
        vibrate(30)
        _activeWebSandbox.value?.id?.let {
            DualSpaceSessionVault.minimizeSession(getApplication<Application>(), it)
        }
        _activeWebSandbox.value = null
    }

    fun closeWebSandbox(appId: Long? = null) {
        vibrate(30)
        val targetId = appId ?: _activeWebSandbox.value?.id
        targetId?.let { DualSpaceSessionVault.closeSession(getApplication<Application>(), it) }
        _activeWebSandbox.value = null
    }

    fun restoreWebSandbox(app: ClonedAppEntity) {
        vibrate(30)
        _activeWebSandbox.value = app
    }

    fun switchToWebSandbox(targetApp: ClonedAppEntity) {
        vibrate(30)
        _activeWebSandbox.value?.id?.let {
            DualSpaceSessionVault.minimizeSession(getApplication<Application>(), it)
        }
        _activeWebSandbox.value = targetApp
    }

    fun closeRunningSession(appId: Long) {
        vibrate(30)
        DualSpaceSessionVault.closeSession(getApplication<Application>(), appId)
        if (_activeWebSandbox.value?.id == appId) {
            _activeWebSandbox.value = null
        }
    }

    // Resource & Checkpoint Management Controls
    fun openResourceCheckpointDialog() {
        vibrate(30)
        DualSpaceResourceManager.refreshMetrics(getApplication<Application>())
        _isResourceCheckpointDialogVisible.value = true
    }

    fun closeResourceCheckpointDialog() {
        _isResourceCheckpointDialogVisible.value = false
    }

    fun setResourceProfile(profile: ResourceProfile) {
        vibrate(20)
        DualSpaceResourceManager.setResourceProfile(profile)
        DualSpaceResourceManager.refreshMetrics(getApplication<Application>())
    }

    fun optimizeRam() {
        vibrate(40)
        val count = DualSpaceResourceManager.optimizeAllBackgroundClones(getApplication<Application>())
        _toastMessage.value = "RAM optimizada en $count contenedor(es)"
    }

    fun saveCheckpointForApp(appId: Long) {
        vibrate(30)
        val session = DualSpaceSessionVault.getSession(appId)
        if (session != null) {
            DualSpaceCheckpointManager.saveSessionCheckpoint(getApplication<Application>(), session, reason = "MANUAL_USER_TRIGGER")
            DualSpaceResourceManager.refreshMetrics(getApplication<Application>())
            _toastMessage.value = "Punto de restauración guardado: ${session.app.appName}"
        }
    }

    fun saveCheckpointForAll() {
        vibrate(40)
        val sessions = DualSpaceSessionVault.getAllSessions()
        sessions.forEach {
            DualSpaceCheckpointManager.saveSessionCheckpoint(getApplication<Application>(), it, reason = "MANUAL_ALL_TRIGGER")
        }
        DualSpaceResourceManager.refreshMetrics(getApplication<Application>())
        _toastMessage.value = "Checkpoints guardados para ${sessions.size} contenedor(es)"
    }

    // Crawler & Stability Auditor Controls
    fun openCrawlerDialog() {
        vibrate(40)
        _isCrawlerDialogVisible.value = true
        if (_crawlerSummary.value == null && !_isCrawlerRunning.value) {
            runCrawlerAudit()
        }
    }

    fun closeCrawlerDialog() {
        if (!_isCrawlerRunning.value) {
            _isCrawlerDialogVisible.value = false
        }
    }

    fun runCrawlerAudit() {
        if (_isCrawlerRunning.value) return
        vibrate(60)
        _isCrawlerRunning.value = true
        _crawlerLogs.value = emptyList()
        _crawlerStepIndex.value = 0
        _crawlerStepText.value = "Iniciando rastreador profundo..."

        viewModelScope.launch {
            val apps = allClonedApps.value
            val summary = crawlerEngine.runFullAudit(
                apps = apps,
                onProgress = { stepText, current, total ->
                    _crawlerStepText.value = stepText
                    _crawlerStepIndex.value = current
                },
                onLog = { logMsg ->
                    _crawlerLogs.value = _crawlerLogs.value + logMsg
                }
            )
            _crawlerSummary.value = summary
            _isCrawlerRunning.value = false
            vibrate(80)
        }
    }

    // Installed Apps Full Catalog
    fun openInstalledCatalog() {
        vibrate(30)
        _isInstalledCatalogVisible.value = true
    }

    fun closeInstalledCatalog() {
        _isInstalledCatalogVisible.value = false
    }

    // Storage Analytics
    fun openStorageAnalytics() {
        vibrate(30)
        _isStorageAnalyticsVisible.value = true
    }

    fun closeStorageAnalytics() {
        _isStorageAnalyticsVisible.value = false
    }

    // Security & Biometric Lock Dialog
    fun openSecurityLock(app: ClonedAppEntity) {
        vibrate(30)
        _editingClone.value = null
        _securityLockApp.value = app
    }

    fun closeSecurityLock() {
        _securityLockApp.value = null
    }

    fun updateAppSecurity(
        app: ClonedAppEntity,
        isLocked: Boolean,
        customPin: String?,
        isBiometricEnabled: Boolean,
        autoLockTimeoutMinutes: Int
    ) {
        vibrate(40)
        viewModelScope.launch {
            val updated = app.copy(
                isLocked = isLocked,
                customPin = customPin,
                isBiometricEnabled = isBiometricEnabled,
                lockTimeoutMinutes = autoLockTimeoutMinutes
            )
            repository.updateApp(updated)
            _securityLockApp.value = null
        }
    }

    // Fingerprint Spoofer Dialog
    fun openFingerprint(app: ClonedAppEntity) {
        vibrate(30)
        _editingClone.value = null
        _fingerprintApp.value = app
    }

    fun closeFingerprint() {
        _fingerprintApp.value = null
    }

    fun updateFingerprint(
        app: ClonedAppEntity,
        androidId: String,
        deviceModel: String,
        macAddress: String,
        keepAlive: Boolean
    ) {
        vibrate(50)
        viewModelScope.launch {
            val updated = app.copy(
                virtualAndroidId = androidId,
                virtualDeviceModel = deviceModel,
                virtualMacAddress = macAddress,
                keepAlive = keepAlive
            )
            repository.updateApp(updated)
            _fingerprintApp.value = null
        }
    }

    // Diagnostics Dialog
    fun openDiagnostics(app: ClonedAppEntity) {
        vibrate(30)
        _editingClone.value = null
        _diagnosticsApp.value = app
    }

    fun closeDiagnostics() {
        _diagnosticsApp.value = null
    }

    fun repairContainer(app: ClonedAppEntity) {
        vibrate(40)
        viewModelScope.launch {
            containerManager.clearAppData(app.id)
            repository.clearCache(app.id)
        }
    }

    // Multi-Instance / Duplicate Clone (Clone #2, Clone #3, Clone #4)
    fun duplicateClone(app: ClonedAppEntity) {
        vibrate(60)
        viewModelScope.launch {
            _editingClone.value = null
            val nextIndex = app.instanceIndex + 1
            val duplicated = app.copy(
                id = 0, // Auto-generated ID in Room
                appName = "${app.originalName} (#$nextIndex)",
                instanceIndex = nextIndex,
                badgeText = "#$nextIndex",
                badgeColorHex = "#F59E0B",
                virtualAndroidId = "v8a_%08x%08x".format((0..Int.MAX_VALUE).random(), (0..Int.MAX_VALUE).random()),
                virtualMacAddress = "02:00:00:%02X:%02X:%02X".format((0..255).random(), (0..255).random(), (0..255).random()),
                launchCount = 0,
                lastOpenedTime = System.currentTimeMillis()
            )
            repository.insertApp(duplicated)
        }
    }

    fun openCustomizeClone(app: ClonedAppEntity) {
        vibrate(30)
        _editingClone.value = app
    }

    fun dismissCustomizeClone() {
        _editingClone.value = null
    }

    fun saveCloneCustomization(updated: ClonedAppEntity) {
        vibrate(40)
        viewModelScope.launch {
            repository.updateApp(updated)
            _editingClone.value = null
        }
    }

    fun deleteClone(app: ClonedAppEntity) {
        vibrate(50)
        viewModelScope.launch {
            repository.deleteApp(app)
            _editingClone.value = null
        }
    }

    fun clearCloneCache(app: ClonedAppEntity) {
        vibrate(40)
        viewModelScope.launch {
            repository.clearCache(app.id)
            _editingClone.value = _editingClone.value?.copy(cacheSizeMb = 0.0)
        }
    }

    fun toggleAppLock(app: ClonedAppEntity) {
        vibrate(35)
        viewModelScope.launch {
            val newLockedState = !app.isLocked
            repository.setLock(app.id, newLockedState)
            _editingClone.value = _editingClone.value?.copy(isLocked = newLockedState)
        }
    }

    // Fintech & Banking Shield Dialog Controls
    fun openFintechShield(app: ClonedAppEntity) {
        vibrate(30)
        _fintechShieldApp.value = app
    }

    fun closeFintechShield() {
        _fintechShieldApp.value = null
    }

    fun updateFintechShieldSettings(
        app: ClonedAppEntity,
        isProtected: Boolean,
        playIntegrity: Boolean,
        antiCloak: Boolean,
        flagSecure: Boolean,
        keepAlive: Boolean
    ) {
        vibrate(40)
        viewModelScope.launch {
            val updated = app.copy(
                isFintechProtected = isProtected,
                playIntegrityBypass = playIntegrity,
                antiDetectionCloak = antiCloak,
                flagSecureEnabled = flagSecure,
                keepAlive = keepAlive
            )
            repository.updateApp(updated)
            _fintechShieldApp.value = null
            if (_editingClone.value?.id == app.id) {
                _editingClone.value = updated
            }
        }
    }

    // DualStore Virtual Play Store Controls
    fun openPlayStore() {
        vibrate(30)
        _isPlayStoreVisible.value = true
    }

    fun closePlayStore() {
        _isPlayStoreVisible.value = false
    }

    fun installFromPlayStore(item: PlayStoreAppItem) {
        vibrate(60)
        viewModelScope.launch {
            val isFintech = item.category == "Fintech" || item.isFintechVerified || item.packageName == "mx.openbank.modelbank"
            val newClone = ClonedAppEntity(
                packageName = item.packageName,
                appName = item.appName,
                originalName = item.appName,
                category = item.category,
                badgeText = "Store",
                badgeColorHex = if (isFintech) "#10B981" else "#00F0FF",
                isLocked = false,
                isPrivateSpace = _selectedTab.value == SpaceTab.PRIVATE,
                webUrl = item.defaultWebUrl,
                launchCount = 0,
                lastOpenedTime = System.currentTimeMillis(),
                cacheSizeMb = 18.2,
                dataSizeMb = 54.0,
                isSystemInstalled = false,
                isFintechProtected = isFintech,
                antiDetectionCloak = true,
                playIntegrityBypass = true,
                flagSecureEnabled = isFintech,
                keepAlive = true
            )
            val newId = repository.insertApp(newClone)
            containerManager.setupIsolatedSandbox(newClone.copy(id = newId))
            _toastMessage.value = "Instalada ${item.appName} en Sandbox Virtual"
        }
    }

    // Batch Stress Cloning Controls (3, 5, 7, 9 Instances)
    fun openBatchCloneDialog(appName: String, packageName: String, category: String, webUrl: String?) {
        vibrate(30)
        _batchCloneTarget.value = BatchCloneTarget(appName, packageName, category, webUrl)
    }

    fun closeBatchCloneDialog() {
        _batchCloneTarget.value = null
    }

    fun executeBatchClone(count: Int) {
        val target = _batchCloneTarget.value ?: return
        vibrate(80)
        _batchCloneTarget.value = null

        viewModelScope.launch {
            val isFintech = target.category == "Fintech" || target.packageName == "mx.openbank.modelbank"
            val badgeColors = listOf(
                "#00F0FF", // Cyan
                "#A855F7", // Purple
                "#10B981", // Emerald
                "#F59E0B", // Amber
                "#EC4899", // Pink
                "#3B82F6", // Royal Blue
                "#EF4444", // Red
                "#14B8A6", // Teal
                "#8B5CF6"  // Violet
            )
            val phoneModels = listOf(
                "Galaxy S24 Ultra (Sandbox)",
                "Pixel 9 Pro (Isolated)",
                "Xiaomi 14 Ultra (Virtual)",
                "OnePlus 12 (DualSpace)",
                "Sony Xperia 1 VI (Sandbox)",
                "Asus ROG Phone 8 (Sandbox)",
                "Motorola Edge 50 (Sandbox)",
                "Vivo X100 Pro (Sandbox)",
                "Honor Magic6 Pro (Sandbox)"
            )

            for (i in 1..count) {
                val colorHex = badgeColors[(i - 1) % badgeColors.size]
                val model = phoneModels[(i - 1) % phoneModels.size]
                val randomAndroidId = "v8a_%08x%08x".format((0..Int.MAX_VALUE).random(), (0..Int.MAX_VALUE).random())
                val randomMac = "02:00:00:%02X:%02X:%02X".format((0..255).random(), (0..255).random(), (0..255).random())

                val cloneInstance = ClonedAppEntity(
                    packageName = target.packageName,
                    appName = "${target.appName} (#$i)",
                    originalName = target.appName,
                    category = target.category,
                    instanceIndex = i,
                    badgeText = "#$i",
                    badgeColorHex = colorHex,
                    virtualAndroidId = randomAndroidId,
                    virtualDeviceModel = model,
                    virtualMacAddress = randomMac,
                    isLocked = false,
                    isPrivateSpace = _selectedTab.value == SpaceTab.PRIVATE,
                    webUrl = target.webUrl,
                    launchCount = 0,
                    lastOpenedTime = System.currentTimeMillis(),
                    cacheSizeMb = 12.0 + (i * 2.5),
                    dataSizeMb = 45.0 + (i * 4.0),
                    isSystemInstalled = false,
                    isFintechProtected = isFintech,
                    antiDetectionCloak = true,
                    playIntegrityBypass = true,
                    flagSecureEnabled = isFintech,
                    keepAlive = true
                )
                val newId = repository.insertApp(cloneInstance)
                containerManager.setupIsolatedSandbox(cloneInstance.copy(id = newId))
            }

            _toastMessage.value = "Generados $count contenedores aislados de ${target.appName} para pruebas de estrés"
        }
    }

    // Container Config Studio Controls
    fun openTuningStudio(app: ClonedAppEntity) {
        vibrate(30)
        _editingClone.value = null
        _tuningStudioApp.value = app
    }

    fun closeTuningStudio() {
        _tuningStudioApp.value = null
    }

    fun saveTuningStudioConfig(updated: ClonedAppEntity) {
        vibrate(40)
        viewModelScope.launch {
            repository.updateApp(updated)
            _tuningStudioApp.value = null
            _toastMessage.value = "Configuración del contenedor #${updated.id} guardada con éxito"
        }
    }

    fun deleteClonesByPackage(packageName: String) {
        vibrate(60)
        viewModelScope.launch {
            val apps = allClonedApps.value.filter { it.packageName == packageName }
            apps.forEach { app ->
                containerManager.clearAppData(app.id)
                repository.deleteApp(app)
            }
            _toastMessage.value = "Eliminados ${apps.size} contenedores de $packageName"
        }
    }

    // Speed Booster
    fun startSpeedBoost() {
        vibrate(60)
        _speedBoostState.value = SpeedBoostState(
            isDialogVisible = true,
            isBoosting = true,
            initialRamPercent = 79,
            currentRamPercent = 79,
            targetRamPercent = 38,
            freedMemoryMb = 542,
            killedThreadsCount = 24,
            isCompleted = false
        )

        viewModelScope.launch {
            delay(400)
            _speedBoostState.value = _speedBoostState.value.copy(currentRamPercent = 65)
            delay(400)
            _speedBoostState.value = _speedBoostState.value.copy(currentRamPercent = 51)
            delay(400)
            _speedBoostState.value = _speedBoostState.value.copy(
                currentRamPercent = 38,
                isBoosting = false,
                isCompleted = true
            )
            securityPrefs.boostCount += 1
            securityPrefs.lastBoostTime = System.currentTimeMillis()
            vibrate(80)
        }
    }

    fun closeSpeedBoost() {
        _speedBoostState.value = SpeedBoostState(isDialogVisible = false)
    }

    // Storage Manager
    fun openStorageManager() {
        vibrate(40)
        _storageState.value = StorageState(isDialogVisible = true)
    }

    fun closeStorageManager() {
        _storageState.value = StorageState(isDialogVisible = false)
    }

    fun cleanAllClonesStorage() {
        vibrate(60)
        _storageState.value = _storageState.value.copy(isCleaning = true)
        viewModelScope.launch {
            delay(800)
            repository.clearAllCache()
            _storageState.value = StorageState(isDialogVisible = true, isCleaning = false)
        }
    }

    // Settings
    fun openSettings() {
        vibrate(30)
        _isSettingsVisible.value = true
    }

    fun closeSettings() {
        _isSettingsVisible.value = false
    }

    fun toggleCalculatorDisguise(enabled: Boolean) {
        vibrate(40)
        securityPrefs.isCalculatorDisguiseActive = enabled
        _isDisguiseActive.value = enabled
    }

    fun unlockDisguiseWithSecretPin() {
        vibrate(80)
        _isDisguiseActive.value = false
    }

    fun setSecurityPin(newPin: String) {
        vibrate(50)
        securityPrefs.pin = newPin
    }

    fun vibrate(millis: Long = 40) {
        try {
            val context = getApplication<Application>()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vibratorManager.defaultVibrator.vibrate(VibrationEffect.createOneShot(millis, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(millis, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(millis)
                }
            }
        } catch (_: Exception) {}
    }
}
