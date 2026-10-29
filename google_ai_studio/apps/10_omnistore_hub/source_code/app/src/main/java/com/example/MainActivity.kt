package com.example

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.screens.AddSourceScreen
import com.example.ui.screens.AppDetailDialog
import com.example.ui.screens.ChatScreen
import com.example.ui.screens.DownloadsScreen
import com.example.ui.screens.SettingsScreen
import com.example.ui.screens.StoreScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                OmniStoreApp(viewModel = viewModel)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.refreshPermissionsAndStatus()
    }
}

enum class NavigationTab(val title: String) {
    STORE("Tienda"),
    DOWNLOADS("Descargas"),
    ADD_SOURCE("Añadir Fuentes"),
    AI_CHAT("AI Chat"),
    SETTINGS("Ajustes")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OmniStoreApp(viewModel: MainViewModel) {
    val storeState by viewModel.storeUiState.collectAsStateWithLifecycle()
    val chatState by viewModel.chatUiState.collectAsStateWithLifecycle()
    val localSearchQuery by viewModel.localSearchQuery.collectAsStateWithLifecycle()
    val selectedLocalCategory by viewModel.selectedLocalCategory.collectAsStateWithLifecycle()
    val filteredLocalApks by viewModel.filteredLocalApks.collectAsStateWithLifecycle()
    var selectedTab by remember { mutableIntStateOf(0) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.toastEvent.collect { message ->
            scope.launch {
                snackbarHostState.showSnackbar(message)
            }
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = when (selectedTab) {
                            0 -> "OmniStore APK"
                            1 -> "Descargas & Instalador"
                            2 -> "Añadir Fuentes en la Nube"
                            3 -> "OmniStore AI Asistente"
                            else -> "Ajustes del Sistema"
                        },
                        fontWeight = FontWeight.ExtraBold
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                modifier = Modifier.testTag("bottom_navigation_bar")
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Storefront, contentDescription = "Tienda") },
                    label = { Text("Tienda") },
                    modifier = Modifier.testTag("nav_item_store")
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.Download, contentDescription = "Descargas") },
                    label = { Text("Descargas") },
                    modifier = Modifier.testTag("nav_item_downloads")
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.AddCircle, contentDescription = "Fuentes") },
                    label = { Text("Fuentes") },
                    modifier = Modifier.testTag("nav_item_add_source")
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.AutoAwesome, contentDescription = "AI Chat") },
                    label = { Text("AI Chat") },
                    modifier = Modifier.testTag("nav_item_ai_chat")
                )
                NavigationBarItem(
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4 },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Ajustes") },
                    label = { Text("Ajustes") },
                    modifier = Modifier.testTag("nav_item_settings")
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                0 -> StoreScreen(
                    state = storeState,
                    onSearchChanged = viewModel::onSearchQueryChanged,
                    onCategorySelected = viewModel::onCategorySelected,
                    onSelectApp = viewModel::selectAppForDetail,
                    onDownloadAndInstall = viewModel::downloadAndInstall,
                    onLaunchApp = viewModel::launchApp,
                    onRequestInstallPermission = viewModel::openInstallPermissionSettings
                )
                1 -> DownloadsScreen(
                    state = storeState,
                    localSearchQuery = localSearchQuery,
                    onLocalSearchQueryChanged = viewModel::onLocalSearchQueryChanged,
                    filteredLocalApks = filteredLocalApks,
                    selectedCategory = selectedLocalCategory,
                    onCategorySelected = viewModel::onLocalCategorySelected,
                    onUpdateApkCategory = viewModel::updateApkCategory,
                    onInstallApp = viewModel::installDownloaded,
                    onLaunchApp = viewModel::launchApp,
                    onDeleteApp = viewModel::deleteApp,
                    onInstallApkEntity = viewModel::installLocalApk,
                    onDeleteApkEntity = viewModel::deleteLocalApk,
                    onClearCache = viewModel::clearCache,
                    onRequestInstallPermission = viewModel::openInstallPermissionSettings,
                    onExportBackup = { viewModel.exportApkMetadataBackup(autoShare = false) },
                    onShareBackup = viewModel::shareLatestBackup,
                    onRestoreBackup = viewModel::restoreLatestBackup
                )
                2 -> AddSourceScreen(
                    state = storeState,
                    onAddApp = viewModel::addNewApp,
                    onImportFeed = viewModel::importFeed,
                    onRestoreLatestBackup = viewModel::restoreLatestBackup,
                    onRestoreJsonBackup = viewModel::restoreBackupFromJson,
                    onExportBackup = { viewModel.exportApkMetadataBackup(autoShare = false) },
                    onShareBackup = viewModel::shareLatestBackup
                )
                3 -> ChatScreen(
                    state = chatState,
                    onSendMessage = viewModel::sendChatMessage,
                    onClearChat = viewModel::clearChatHistory,
                    onOpenSettings = { selectedTab = 4 }
                )
                4 -> SettingsScreen(
                    storeState = storeState,
                    chatState = chatState,
                    onSaveChatSettings = viewModel::updateChatSettings,
                    onRequestInstallPermission = viewModel::openInstallPermissionSettings,
                    onClearCache = viewModel::clearCache,
                    onExportBackup = { viewModel.exportApkMetadataBackup(autoShare = false) },
                    onShareBackup = viewModel::shareLatestBackup,
                    onRestoreBackup = viewModel::restoreLatestBackup
                )
            }

            // App Detail Dialog
            storeState.selectedAppForDetail?.let { app ->
                val isInstalled = storeState.installedPackages.contains(app.packageName)
                AppDetailDialog(
                    app = app,
                    isInstalled = isInstalled,
                    onDismiss = { viewModel.selectAppForDetail(null) },
                    onDownloadAndInstall = { viewModel.downloadAndInstall(app) },
                    onDownloadOnly = { viewModel.downloadOnly(app) },
                    onInstallDownloaded = { viewModel.installDownloaded(app) },
                    onLaunchApp = { viewModel.launchApp(app) },
                    onDeleteApp = { viewModel.deleteApp(app) }
                )
            }
        }
    }
}

// Kept for backward compatibility and test verification
@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(text = "Hello $name!", modifier = modifier)
}
