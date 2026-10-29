package com.example.service

import android.app.DownloadManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.example.MainActivity
import com.example.util.AppLogger
import com.example.util.SnaptubeAudioTagger
import com.example.util.SnaptubeDownloadStatus
import com.example.util.SnaptubeMediaEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * SnaptubeDownloadForegroundService:
 * Native Foreground Service managing the Snaptube media download queue,
 * updating real-time notification progress, and triggering automatic ID3 tagging
 * upon completion of audio downloads.
 */
class SnaptubeDownloadForegroundService : Service() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var monitorJob: Job? = null

    companion object {
        const val CHANNEL_ID = "snaptube_download_service_channel"
        const val NOTIFICATION_ID = 8842

        const val ACTION_START_QUEUE = "com.example.snaptube.ACTION_START_QUEUE"
        const val ACTION_STOP_QUEUE = "com.example.snaptube.ACTION_STOP_QUEUE"

        fun start(context: Context) {
            try {
                val intent = Intent(context, SnaptubeDownloadForegroundService::class.java).apply {
                    action = ACTION_START_QUEUE
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            } catch (e: Exception) {
                AppLogger.log(context, "Aviso iniciando ForegroundService Snaptube: ${e.message}", tag = "SNAPTUBE_SERVICE")
            }
        }

        fun stop(context: Context) {
            try {
                val intent = Intent(context, SnaptubeDownloadForegroundService::class.java).apply {
                    action = ACTION_STOP_QUEUE
                }
                context.startService(intent)
            } catch (_: Exception) {}
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP_QUEUE) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            return START_NOT_STICKY
        }

        startForeground(NOTIFICATION_ID, buildProgressNotification("Iniciando cola de descargas...", 0, true))
        startDownloadMonitoring()

        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        serviceScope.cancel()
        super.onDestroy()
    }

    private fun startDownloadMonitoring() {
        monitorJob?.cancel()
        monitorJob = serviceScope.launch {
            val downloadManager = getSystemService(Context.DOWNLOAD_SERVICE) as? DownloadManager
            var consecutiveIdles = 0

            while (isActive) {
                val tasks = SnaptubeMediaEngine.activeDownloadsFlow.value
                val activeTasks = tasks.filter { it.status == SnaptubeDownloadStatus.DOWNLOADING }

                if (activeTasks.isNotEmpty() && downloadManager != null) {
                    consecutiveIdles = 0
                    var totalPercent = 0
                    var taskCount = 0

                    activeTasks.forEach { task ->
                        val query = DownloadManager.Query().setFilterById(task.downloadId)
                        try {
                            downloadManager.query(query)?.use { cursor ->
                                if (cursor.moveToFirst()) {
                                    val bytesDownloaded = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR))
                                    val bytesTotal = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES))
                                    val status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))

                                    if (status == DownloadManager.STATUS_SUCCESSFUL) {
                                        SnaptubeMediaEngine.updateDownloadStatus(task.downloadId, SnaptubeDownloadStatus.COMPLETED, 100)
                                    } else if (status == DownloadManager.STATUS_FAILED) {
                                        SnaptubeMediaEngine.updateDownloadStatus(task.downloadId, SnaptubeDownloadStatus.FAILED, 0)
                                    } else if (bytesTotal > 0) {
                                        val percent = ((bytesDownloaded * 100) / bytesTotal).toInt()
                                        totalPercent += percent
                                        taskCount++
                                        SnaptubeMediaEngine.updateDownloadStatus(task.downloadId, SnaptubeDownloadStatus.DOWNLOADING, percent)
                                    }
                                }
                            }
                        } catch (_: Exception) {}
                    }

                    val avgPercent = if (taskCount > 0) totalPercent / taskCount else 0
                    val notif = buildProgressNotification(
                        "Descargando ${activeTasks.size} archivos multimedia (${avgPercent}%)",
                        avgPercent,
                        false
                    )
                    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    manager.notify(NOTIFICATION_ID, notif)

                } else {
                    consecutiveIdles++
                    if (consecutiveIdles >= 4) { // ~6 seconds without active downloads
                        // Auto-tag any finished MP3s
                        try {
                            val tagged = SnaptubeMediaEngine.autoTagDownloadedAudios(this@SnaptubeDownloadForegroundService)
                            if (tagged > 0) {
                                AppLogger.log(this@SnaptubeDownloadForegroundService, "Auto-ID3 completado para $tagged archivos.", tag = "SNAPTUBE_ID3")
                            }
                        } catch (_: Exception) {}

                        val finalNotif = buildProgressNotification("Descargas Snaptube finalizadas y listas", 100, false)
                        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                        manager.notify(NOTIFICATION_ID, finalNotif)
                        delay(2500)
                        stopForeground(STOP_FOREGROUND_REMOVE)
                        stopSelf()
                        break
                    }
                }

                delay(1500)
            }
        }
    }

    private fun buildProgressNotification(statusText: String, progress: Int, indeterminate: Boolean): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, SnaptubeDownloadForegroundService::class.java).apply {
            action = ACTION_STOP_QUEUE
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Snaptube Media Downloader")
            .setContentText(statusText)
            .setSmallIcon(android.R.drawable.stat_sys_download)
            .setContentIntent(pendingIntent)
            .setProgress(100, progress, indeterminate)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Detener", stopPendingIntent)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Snaptube Descargas",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Progreso de descargas y etiquetado ID3 de Snaptube"
                setShowBadge(false)
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }
}
