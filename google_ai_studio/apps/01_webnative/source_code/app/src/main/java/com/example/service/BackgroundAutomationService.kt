package com.example.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.webkit.CookieManager
import androidx.core.app.NotificationCompat
import com.example.MainActivity
import com.example.util.AppLogger
import com.example.util.WebMacroAutomationEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * BackgroundAutomationService:
 * High-priority Foreground Service with a persistent interactive notification
 * that holds a WakeLock, flushes cookies, and keeps the WebView JavaScript runtime,
 * DOM state, and WebMacro automation engine actively executing even when
 * the application is minimized, backgrounded, or the screen is locked.
 */
class BackgroundAutomationService : Service() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var wakeLock: PowerManager.WakeLock? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
        _isServiceRunning.value = true
        AppLogger.log(this, "[BackgroundService] Servicio de persistencia y automatización en segundo plano iniciado (WakeLock activo)")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action

        when (action) {
            ACTION_STOP_SERVICE, ACTION_STOP_MACRO -> {
                AppLogger.log(this, "[BackgroundService] Deteniendo motor y servicio por acción de usuario.")
                WebMacroAutomationEngine.stopPlayback()
                try {
                    com.example.util.ConcurrentAutomationClusterEngine.stopAllBots()
                } catch (_: Exception) {}
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_PAUSE_MACRO -> {
                WebMacroAutomationEngine.togglePause()
                try {
                    com.example.util.ConcurrentAutomationClusterEngine.pauseAllBots()
                } catch (_: Exception) {}
                updateNotification()
                return START_STICKY
            }
            ACTION_RESUME_MACRO -> {
                WebMacroAutomationEngine.togglePause()
                try {
                    com.example.util.ConcurrentAutomationClusterEngine.resumeAllBots()
                } catch (_: Exception) {}
                updateNotification()
                return START_STICKY
            }
            ACTION_UPDATE_PROGRESS -> {
                val step = intent.getIntExtra(EXTRA_STEP, 0)
                val totalSteps = intent.getIntExtra(EXTRA_TOTAL_STEPS, 0)
                val iteration = intent.getIntExtra(EXTRA_ITERATION, 1)
                val maxIterations = intent.getIntExtra(EXTRA_MAX_ITERATIONS, 1)
                val title = intent.getStringExtra(EXTRA_TITLE) ?: _currentTaskTitle.value
                val statusText = intent.getStringExtra(EXTRA_SUBTITLE) ?: _currentTaskSubtitle.value

                _currentStep.value = step
                _totalSteps.value = totalSteps
                _currentIteration.value = iteration
                _maxIterations.value = maxIterations
                _currentTaskTitle.value = title
                _currentTaskSubtitle.value = statusText

                updateNotification()
                return START_STICKY
            }
            else -> {
                val title = intent?.getStringExtra(EXTRA_TITLE) ?: _currentTaskTitle.value.ifBlank { "Automatización Web Activa" }
                val subtitle = intent?.getStringExtra(EXTRA_SUBTITLE) ?: _currentTaskSubtitle.value.ifBlank { "Manteniendo WebView y motor de macros en 2º plano..." }

                _currentTaskTitle.value = title
                _currentTaskSubtitle.value = subtitle

                val notification = buildPersistentNotification(title, subtitle)
                startForeground(NOTIFICATION_ID, notification)
            }
        }

        // Flush cookies and keep WebView state synced to persistent storage
        try {
            CookieManager.getInstance().flush()
        } catch (_: Exception) {}

        return START_STICKY
    }

    private fun updateNotification() {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
        val notification = buildPersistentNotification(_currentTaskTitle.value, _currentTaskSubtitle.value)
        manager?.notify(NOTIFICATION_ID, notification)
    }

    override fun onDestroy() {
        super.onDestroy()
        releaseWakeLock()
        serviceScope.cancel()
        _isServiceRunning.value = false
        _currentTaskTitle.value = "Inactivo"
        _currentTaskSubtitle.value = ""
        AppLogger.log(this, "[BackgroundService] Servicio en segundo plano finalizado.")
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun acquireWakeLock() {
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "WebNative::BackgroundAutomationWakeLock"
            ).apply {
                setReferenceCounted(false)
                acquire(12 * 60 * 60 * 1000L) // 12 hours max safe keep-alive
            }
        } catch (e: Exception) {
            AppLogger.log(this, "[BackgroundService] Error al adquirir WakeLock: ${e.message}")
        }
    }

    private fun releaseWakeLock() {
        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
        } catch (e: Exception) {
            AppLogger.log(this, "[BackgroundService] Error al liberar WakeLock: ${e.message}")
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Motor de Automatización & Macros Web",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Mantiene los procesos del navegador web y macros ejecutándose en segundo plano"
                setShowBadge(false)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildPersistentNotification(title: String, subtitle: String): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        // Action: Stop Macro / Stop Service
        val stopIntent = Intent(this, BackgroundAutomationService::class.java).apply {
            action = ACTION_STOP_MACRO
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        // Action: Pause / Resume Toggle
        val isPaused = WebMacroAutomationEngine.isPaused.value
        val isPlaying = WebMacroAutomationEngine.isPlaying.value
        val toggleAction = if (isPaused) ACTION_RESUME_MACRO else ACTION_PAUSE_MACRO
        val toggleIntent = Intent(this, BackgroundAutomationService::class.java).apply {
            action = toggleAction
        }
        val togglePendingIntent = PendingIntent.getService(
            this,
            2,
            toggleIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("⚡ $title")
            .setContentText(subtitle)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)

        // If a macro is actively running, show progress indicator and quick action buttons
        val total = _totalSteps.value
        val current = _currentStep.value
        if (total > 0 && isPlaying) {
            builder.setProgress(total, current, false)
            builder.setSubText("Iteración ${_currentIteration.value}/${_maxIterations.value} • Paso $current/$total")
            
            // Add Toggle Pause / Resume Action
            builder.addAction(
                if (isPaused) android.R.drawable.ic_media_play else android.R.drawable.ic_media_pause,
                if (isPaused) "Reanudar" else "Pausar",
                togglePendingIntent
            )

            // Add Stop Action
            builder.addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Detener",
                stopPendingIntent
            )
        } else {
            builder.setProgress(0, 0, false)
            builder.addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Apagar Motor 2º Plano",
                stopPendingIntent
            )
        }

        return builder.build()
    }

    companion object {
        const val CHANNEL_ID = "background_automation_channel"
        const val NOTIFICATION_ID = 4040

        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_SUBTITLE = "extra_subtitle"
        const val EXTRA_STEP = "extra_step"
        const val EXTRA_TOTAL_STEPS = "extra_total_steps"
        const val EXTRA_ITERATION = "extra_iteration"
        const val EXTRA_MAX_ITERATIONS = "extra_max_iterations"

        const val ACTION_STOP_SERVICE = "action_stop_service"
        const val ACTION_STOP_MACRO = "action_stop_macro"
        const val ACTION_PAUSE_MACRO = "action_pause_macro"
        const val ACTION_RESUME_MACRO = "action_resume_macro"
        const val ACTION_UPDATE_PROGRESS = "action_update_progress"

        private val _isServiceRunning = MutableStateFlow(false)
        val isServiceRunning: StateFlow<Boolean> = _isServiceRunning.asStateFlow()

        private val _currentTaskTitle = MutableStateFlow("Inactivo")
        val currentTaskTitle: StateFlow<String> = _currentTaskTitle.asStateFlow()

        private val _currentTaskSubtitle = MutableStateFlow("")
        val currentTaskSubtitle: StateFlow<String> = _currentTaskSubtitle.asStateFlow()

        private val _currentStep = MutableStateFlow(0)
        private val _totalSteps = MutableStateFlow(0)
        private val _currentIteration = MutableStateFlow(1)
        private val _maxIterations = MutableStateFlow(1)

        fun start(context: Context, title: String = "Automatización en segundo plano", subtitle: String = "Procesos continuos activos") {
            val intent = Intent(context, BackgroundAutomationService::class.java).apply {
                putExtra(EXTRA_TITLE, title)
                putExtra(EXTRA_SUBTITLE, subtitle)
            }
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            } catch (e: Exception) {
                AppLogger.log(context, "[BackgroundService] Error iniciando servicio: ${e.message}")
            }
        }

        fun updateMacroProgress(
            context: Context,
            step: Int,
            totalSteps: Int,
            iteration: Int,
            maxIterations: Int,
            macroTitle: String,
            statusText: String
        ) {
            val intent = Intent(context, BackgroundAutomationService::class.java).apply {
                action = ACTION_UPDATE_PROGRESS
                putExtra(EXTRA_STEP, step)
                putExtra(EXTRA_TOTAL_STEPS, totalSteps)
                putExtra(EXTRA_ITERATION, iteration)
                putExtra(EXTRA_MAX_ITERATIONS, maxIterations)
                putExtra(EXTRA_TITLE, macroTitle)
                putExtra(EXTRA_SUBTITLE, statusText)
            }
            try {
                context.startService(intent)
            } catch (_: Exception) {}
        }

        fun updateClusterProgress(
            context: Context,
            activeBots: Int,
            totalBots: Int,
            totalActions: Long,
            statusSummary: String
        ) {
            val intent = Intent(context, BackgroundAutomationService::class.java).apply {
                action = ACTION_UPDATE_PROGRESS
                putExtra(EXTRA_STEP, activeBots)
                putExtra(EXTRA_TOTAL_STEPS, totalBots)
                putExtra(EXTRA_ITERATION, 1)
                putExtra(EXTRA_MAX_ITERATIONS, 1)
                putExtra(EXTRA_TITLE, "Cluster Multi-Bot Activo ($activeBots/$totalBots)")
                putExtra(EXTRA_SUBTITLE, statusSummary)
            }
            try {
                context.startService(intent)
            } catch (_: Exception) {}
        }

        fun stop(context: Context) {
            val intent = Intent(context, BackgroundAutomationService::class.java).apply {
                action = ACTION_STOP_SERVICE
            }
            try {
                context.stopService(intent)
            } catch (_: Exception) {}
        }
    }
}
