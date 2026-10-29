package com.example.data.installer

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.util.Log
import android.widget.Toast
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.InputStream
import java.io.OutputStream

/**
 * Android Service that manages native APK installations using Android's PackageInstaller API.
 */
class PackageInstallerService : Service() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    companion object {
        private const val TAG = "PackageInstallerService"
        const val ACTION_INSTALL_APK = "com.example.action.INSTALL_APK"
        const val EXTRA_APK_PATH = "extra_apk_path"
        const val EXTRA_APP_NAME = "extra_app_name"

        const val ACTION_INSTALL_STATUS = "com.example.action.INSTALL_STATUS"
        const val NOTIFICATION_CHANNEL_ID = "package_installer_channel"

        fun startInstall(context: Context, apkFile: File, appName: String = apkFile.nameWithoutExtension) {
            val intent = Intent(context, PackageInstallerService::class.java).apply {
                action = ACTION_INSTALL_APK
                putExtra(EXTRA_APK_PATH, apkFile.absolutePath)
                putExtra(EXTRA_APP_NAME, appName)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_INSTALL_APK) {
            val apkPath = intent.getStringExtra(EXTRA_APK_PATH)
            val appName = intent.getStringExtra(EXTRA_APP_NAME) ?: "Aplicación"

            if (!apkPath.isNullOrBlank()) {
                val apkFile = File(apkPath)
                if (apkFile.exists()) {
                    startForegroundNotification(appName)
                    serviceScope.launch {
                        processApkInstallation(apkFile, appName)
                        stopForeground(STOP_FOREGROUND_REMOVE)
                        stopSelf(startId)
                    }
                } else {
                    Log.e(TAG, "APK file not found: $apkPath")
                    stopSelf(startId)
                }
            } else {
                stopSelf(startId)
            }
        }
        return START_NOT_STICKY
    }

    private fun startForegroundNotification(appName: String) {
        val notification = NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_upload)
            .setContentTitle("Instalando $appName")
            .setContentText("Preparando sesión nativa de instalación...")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
        startForeground(1001, notification)
    }

    private suspend fun processApkInstallation(apkFile: File, appName: String) = withContext(Dispatchers.IO) {
        val packageInstaller = packageManager.packageInstaller
        val params = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL).apply {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED)
            }
        }

        var sessionId = -1
        try {
            sessionId = packageInstaller.createSession(params)
            val session = packageInstaller.openSession(sessionId)

            val inputStream: InputStream = FileInputStream(apkFile)
            val outputStream: OutputStream = session.openWrite("package_install_stream", 0, apkFile.length())

            val buffer = ByteArray(64 * 1024)
            var bytesRead: Int
            inputStream.use { input ->
                outputStream.use { output ->
                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                    }
                    session.fsync(output)
                }
            }

            // Target receiver intent for installation status
            val callbackIntent = Intent(this@PackageInstallerService, PackageInstallStatusReceiver::class.java).apply {
                action = ACTION_INSTALL_STATUS
                putExtra(EXTRA_APP_NAME, appName)
            }

            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }

            val pendingIntent = PendingIntent.getBroadcast(
                this@PackageInstallerService,
                sessionId,
                callbackIntent,
                flags
            )

            // Commit the session
            session.commit(pendingIntent.intentSender)
            session.close()
            Log.i(TAG, "PackageInstaller session #$sessionId committed successfully for $appName")
        } catch (e: Exception) {
            Log.e(TAG, "Failed during PackageInstaller session for $appName", e)
            if (sessionId != -1) {
                try {
                    packageInstaller.abandonSession(sessionId)
                } catch (ignored: Exception) {}
            }
            // Fallback to standard view intent if package installer session throws
            withContext(Dispatchers.Main) {
                Toast.makeText(
                    this@PackageInstallerService,
                    "Iniciando instalador alternativo para $appName",
                    Toast.LENGTH_SHORT
                ).show()
            }
            ApkInstaller.installViaIntent(this@PackageInstallerService, apkFile)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Servicio de Instalación Nativa",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Progreso del servicio nativo PackageInstaller"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }
}

/**
 * BroadcastReceiver to handle status callbacks from PackageInstaller.Session.commit
 */
class PackageInstallStatusReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "InstallStatusReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE)
        val message = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE)
        val appName = intent.getStringExtra(PackageInstallerService.EXTRA_APP_NAME) ?: "Aplicación"

        when (status) {
            PackageInstaller.STATUS_PENDING_USER_ACTION -> {
                // User confirmation dialog from Android system package installer
                val confirmationIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    intent.getParcelableExtra(Intent.EXTRA_INTENT, Intent::class.java)
                } else {
                    @Suppress("DEPRECATION")
                    intent.getParcelableExtra(Intent.EXTRA_INTENT)
                }
                confirmationIntent?.let {
                    it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(it)
                }
            }
            PackageInstaller.STATUS_SUCCESS -> {
                Log.i(TAG, "Successfully installed: $appName")
                Toast.makeText(context, "¡$appName se instaló con éxito!", Toast.LENGTH_LONG).show()
            }
            PackageInstaller.STATUS_FAILURE,
            PackageInstaller.STATUS_FAILURE_ABORTED,
            PackageInstaller.STATUS_FAILURE_BLOCKED,
            PackageInstaller.STATUS_FAILURE_CONFLICT,
            PackageInstaller.STATUS_FAILURE_INCOMPATIBLE,
            PackageInstaller.STATUS_FAILURE_INVALID,
            PackageInstaller.STATUS_FAILURE_STORAGE -> {
                Log.e(TAG, "Installation failed with status $status: $message")
                Toast.makeText(
                    context,
                    "No se pudo completar la instalación de $appName ($message)",
                    Toast.LENGTH_LONG
                ).show()
            }
            else -> {
                Log.d(TAG, "Installation status: $status ($message)")
            }
        }
    }
}
