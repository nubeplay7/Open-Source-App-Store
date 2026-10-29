package com.example.core

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.provider.Settings
import androidx.core.app.NotificationCompat
import com.example.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel

/**
 * DualSpaceVirtualEngineService
 * High-priority, persistent Foreground Service that keeps cloned applications alive in
 * the background and protects them from Android's battery optimizations, Doze mode,
 * and the Low Memory Killer (LMK).
 *
 * Automatically manages:
 * - Continuous WakeLock protection
 * - Periodic state checkpoints to disk for crash resilience
 * - Anti-Kill background CPU & RAM throttling
 * - Interactive notification with Quick Optimization and Checkpoint actions
 */
class DualSpaceVirtualEngineService : Service() {

    companion object {
        const val CHANNEL_ID = "dual_space_virtual_engine"
        const val NOTIFICATION_ID = 2026

        const val ACTION_START_ENGINE = "com.example.action.START_VIRTUAL_ENGINE"
        const val ACTION_STOP_ENGINE = "com.example.action.STOP_VIRTUAL_ENGINE"
        const val ACTION_OPTIMIZE_RAM = "com.example.action.OPTIMIZE_RAM"
        const val ACTION_SAVE_CHECKPOINTS = "com.example.action.SAVE_CHECKPOINTS"

        const val EXTRA_ACTIVE_CONTAINERS = "extra_active_containers"
        const val EXTRA_ACTIVE_APP_NAME = "extra_active_app_name"
        const val EXTRA_IS_FINTECH_ACTIVE = "extra_is_fintech_active"

        fun startEngine(
            context: Context,
            activeContainers: Int = 1,
            activeAppName: String? = null,
            isFintechActive: Boolean = false
        ) {
            val intent = Intent(context, DualSpaceVirtualEngineService::class.java).apply {
                action = ACTION_START_ENGINE
                putExtra(EXTRA_ACTIVE_CONTAINERS, activeContainers)
                putExtra(EXTRA_ACTIVE_APP_NAME, activeAppName)
                putExtra(EXTRA_IS_FINTECH_ACTIVE, isFintechActive)
            }
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            } catch (_: Exception) {}
        }

        fun stopEngine(context: Context) {
            val intent = Intent(context, DualSpaceVirtualEngineService::class.java).apply {
                action = ACTION_STOP_ENGINE
            }
            try {
                context.startService(intent)
            } catch (_: Exception) {}
        }

        fun isIgnoringBatteryOptimizations(context: Context): Boolean {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
                powerManager?.isIgnoringBatteryOptimizations(context.packageName) ?: false
            } else {
                true
            }
        }

        @SuppressLint("BatteryLife")
        fun createBatteryOptimizationIntent(context: Context): Intent {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:${context.packageName}")
                }
            } else {
                Intent(Settings.ACTION_SETTINGS)
            }
        }
    }

    private var wakeLock: PowerManager.WakeLock? = null
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var lastActiveCount = 1
    private var lastActiveAppName: String? = null
    private var lastIsFintechActive = false

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()

        try {
            val pm = getSystemService(Context.POWER_SERVICE) as? PowerManager
            wakeLock = pm?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "DualSpace:PersistentEngineWakeLock")?.apply {
                setReferenceCounted(false)
            }
        } catch (_: Exception) {}

        // Start periodic checkpoint loop to guard against sudden process death
        DualSpaceCheckpointManager.startPeriodicCheckpointLoop(applicationContext, serviceScope, intervalMs = 30_000L)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP_ENGINE -> {
                wakeLock?.let { if (it.isHeld) it.release() }
                DualSpaceCheckpointManager.stopPeriodicCheckpointLoop()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_OPTIMIZE_RAM -> {
                DualSpaceResourceManager.optimizeAllBackgroundClones(applicationContext)
                updateNotification()
                return START_STICKY
            }
            ACTION_SAVE_CHECKPOINTS -> {
                val sessions = DualSpaceSessionVault.getAllSessions()
                sessions.forEach {
                    DualSpaceCheckpointManager.saveSessionCheckpoint(applicationContext, it, reason = "USER_NOTIFICATION_TRIGGER")
                }
                updateNotification()
                return START_STICKY
            }
        }

        lastActiveCount = intent?.getIntExtra(EXTRA_ACTIVE_CONTAINERS, lastActiveCount) ?: lastActiveCount
        lastActiveAppName = intent?.getStringExtra(EXTRA_ACTIVE_APP_NAME) ?: lastActiveAppName
        lastIsFintechActive = intent?.getBooleanExtra(EXTRA_IS_FINTECH_ACTIVE, lastIsFintechActive) ?: lastIsFintechActive

        // Hold partial wakelock so CPU keeps sockets alive
        try {
            wakeLock?.acquire(45 * 60 * 1000L) // 45 min safety lease
        } catch (_: Exception) {}

        val notification = buildKeepAliveNotification(lastActiveCount, lastActiveAppName, lastIsFintechActive)
        startForeground(NOTIFICATION_ID, notification)

        return START_STICKY
    }

    private fun updateNotification() {
        val notification = buildKeepAliveNotification(lastActiveCount, lastActiveAppName, lastIsFintechActive)
        val nm = getSystemService(NotificationManager::class.java)
        nm?.notify(NOTIFICATION_ID, notification)
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            wakeLock?.let { if (it.isHeld) it.release() }
        } catch (_: Exception) {}
        serviceScope.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "DualSpace Sandbox & Guardián Anti-Kill"
            val descriptionText = "Mantiene vivas las aplicaciones clonadas en segundo plano con protección contra optimizaciones de batería y cierres por memoria."
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setShowBadge(false)
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(channel)
        }
    }

    private fun buildKeepAliveNotification(
        containerCount: Int,
        activeAppName: String?,
        isFintechActive: Boolean
    ): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Action: Optimize RAM
        val optimizeIntent = Intent(this, DualSpaceVirtualEngineService::class.java).apply {
            action = ACTION_OPTIMIZE_RAM
        }
        val optimizePendingIntent = PendingIntent.getService(
            this,
            1,
            optimizeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Action: Checkpoint All
        val checkpointIntent = Intent(this, DualSpaceVirtualEngineService::class.java).apply {
            action = ACTION_SAVE_CHECKPOINTS
        }
        val checkpointPendingIntent = PendingIntent.getService(
            this,
            2,
            checkpointIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val title = if (isFintechActive) {
            "🛡️ Fintech Shield™ Activo: ${activeAppName ?: "Banca Segura"}"
        } else {
            "DualSpace Guardián Anti-Kill: $containerCount activa(s)"
        }

        val body = if (isFintechActive) {
            "Banca protegida contra Doze, Play Integrity y terminación de segundo plano."
        } else {
            "Memoria protegida • Puntos de restauración automáticos activos cada 30s."
        }

        val priority = if (isFintechActive) NotificationCompat.PRIORITY_DEFAULT else NotificationCompat.PRIORITY_LOW

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setPriority(priority)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .addAction(android.R.drawable.ic_menu_rotate, "Optimizar RAM", optimizePendingIntent)
            .addAction(android.R.drawable.ic_menu_save, "Crear Checkpoint", checkpointPendingIntent)
            .build()
    }
}
