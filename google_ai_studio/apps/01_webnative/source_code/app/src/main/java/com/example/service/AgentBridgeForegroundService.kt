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
import androidx.core.app.NotificationCompat
import com.example.MainActivity
import com.example.R
import com.example.util.AgentBridgeServer
import com.example.util.AppLogger
import com.example.util.LogLevel

/**
 * AgentBridgeForegroundService:
 * Keeps the AgentBridgeServer (Port 8765) and MCP external gateway permanently active 24/7.
 * Prevents OS killing the process and holds a partial WakeLock so external agents can connect remotely anytime.
 */
class AgentBridgeForegroundService : Service() {

    private var wakeLock: PowerManager.WakeLock? = null

    companion object {
        const val CHANNEL_ID = "agent_bridge_server_channel"
        const val NOTIFICATION_ID = 8765

        fun startService(context: Context) {
            val intent = Intent(context, AgentBridgeForegroundService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stopService(context: Context) {
            val intent = Intent(context, AgentBridgeForegroundService::class.java)
            context.stopService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())

        try {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "WebNative:AgentBridgeWakeLock").apply {
                acquire(24 * 60 * 60 * 1000L) // 24 hours lock
            }
        } catch (_: Exception) {}

        // Ensure Server is running
        AgentBridgeServer.startServer(this)
        AppLogger.log(this, "AgentBridgeForegroundService 24/7 activo", tag = "MCP_SERVICE", level = LogLevel.SUCCESS)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        AgentBridgeServer.startServer(this)
        return START_STICKY
    }

    override fun onDestroy() {
        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
        } catch (_: Exception) {}
        AppLogger.log(this, "AgentBridgeForegroundService detenido", tag = "MCP_SERVICE", level = LogLevel.INFO)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Servidor de Agentes Externos (MCP / ADB Bridge)",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Mantiene el enlace de comunicación y control para agentes externos remoto."
                setShowBadge(false)
            }
            val nm = getSystemService(NotificationManager::class.java)
            nm?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Servidor de Control Externo Activo")
            .setContentText("Puerto 8765 online (MCP JSON-RPC + Acceso Remoto Agentes)")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
}
