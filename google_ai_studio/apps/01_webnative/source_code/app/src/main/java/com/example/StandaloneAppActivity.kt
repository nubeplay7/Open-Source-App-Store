package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.example.data.local.AppDatabase
import com.example.data.model.WebAppEntity
import com.example.ui.screens.InAppBrowserScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.util.ContainerManager
import com.example.util.ShortcutManagerService
import com.example.util.TurboPowerManager
import com.example.util.WebShortcutHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class StandaloneAppActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val insetsController = WindowCompat.getInsetsController(window, window.decorView)
        insetsController.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        insetsController.hide(WindowInsetsCompat.Type.systemBars())

        // InitializationGuard startup validation
        val startupResult = com.example.util.InitializationGuard.validateLaunchIntent(this, intent)

        val appId = intent.getLongExtra(WebShortcutHelper.EXTRA_WEB_APP_ID, -1L)
        val intentUrl = startupResult.targetUrl
        val intentName = startupResult.appName
        val containerId = startupResult.containerId

        val isImmortal = intent.getBooleanExtra("EXTRA_IMMORTAL_MODE", false)
        val isKeepAwake = intent.getBooleanExtra("EXTRA_KEEP_AWAKE", false)
        val isHardwareBoost = intent.getBooleanExtra("EXTRA_HARDWARE_BOOST", false)

        if (isKeepAwake) {
            TurboPowerManager.setKeepScreenOn(this, true)
        }

        // Ensure ContainerManager & TurboCacheManager are initialized
        ContainerManager.initialize(applicationContext)
        com.example.util.TurboCacheManager.initialize(applicationContext)

        // Only start Immortal Keep-Alive anchor if user explicitly enabled it
        if (isImmortal) {
            com.example.util.ImmortalKeepAliveService.startImmortalLock(this, intentName, intentUrl)
        }

        // Initialize Floating Button visibility state
        com.example.util.AppearanceSettingsManager.initFloatingButtonVisibility(this)

        setContent {
            MyApplicationTheme(darkTheme = true) {
                var loadedApp by remember { mutableStateOf<WebAppEntity?>(null) }
                var isContainerReady by remember { mutableStateOf(false) }

                LaunchedEffect(appId, containerId) {
                    var finalContainerId = containerId

                    if (appId > 0) {
                        withContext(Dispatchers.IO) {
                            val db = AppDatabase.getDatabase(applicationContext, CoroutineScope(Dispatchers.IO))
                            val app = db.webAppDao().getWebAppById(appId)
                            if (app != null) {
                                db.webAppDao().recordAppOpen(appId)
                                if (finalContainerId == null && !app.containerId.isNullOrBlank()) {
                                    finalContainerId = app.containerId
                                }
                                withContext(Dispatchers.Main) {
                                    loadedApp = app
                                }
                            }
                        }
                    } else {
                        loadedApp = WebAppEntity(
                            name = intentName,
                            url = intentUrl,
                            isFullscreen = true,
                            isHardwareBoostEnabled = true,
                            isAdBlockEnabled = true,
                            containerId = containerId
                        )
                    }

                    if (!finalContainerId.isNullOrBlank()) {
                        ContainerManager.switchContainer(applicationContext, finalContainerId!!)
                    }
                    isContainerReady = true
                }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.Black
                ) {
                    if (isContainerReady) {
                        InAppBrowserScreen(
                            app = loadedApp,
                            instantUrl = intentUrl,
                            onClose = { finish() }
                        )
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }

    override fun dispatchKeyEvent(event: android.view.KeyEvent): Boolean {
        if (com.example.util.VolumeShortcutManager.handleKeyEvent(this, event)) {
            return true
        }
        return super.dispatchKeyEvent(event)
    }

    override fun onDestroy() {
        super.onDestroy()
        TurboPowerManager.setKeepScreenOn(this, false)
        TurboPowerManager.releaseWakeLock()
    }
}
