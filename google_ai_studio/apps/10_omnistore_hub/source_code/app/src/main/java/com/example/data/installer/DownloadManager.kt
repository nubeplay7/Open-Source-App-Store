package com.example.data.installer

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.FileProvider
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.isActive
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.io.RandomAccessFile
import java.util.concurrent.TimeUnit

/**
 * Kotlin DownloadManager class to handle APK file downloads in the background
 * with support for HTTP Range resumption and system progress notifications.
 */
class DownloadManager(
    private val context: Context,
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .followRedirects(true)
        .followSslRedirects(true)
        .build()
) {

    companion object {
        const val CHANNEL_ID = "apk_download_channel"
        const val CHANNEL_NAME = "Descargas de APK"
        const val CHANNEL_DESC = "Notificaciones de progreso y finalización de descargas de APKs"
    }

    private val notificationManager: NotificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = CHANNEL_DESC
                setShowBadge(false)
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    sealed class DownloadState {
        data class Progress(val percentage: Float, val downloadedBytes: Long, val totalBytes: Long) : DownloadState()
        data class Completed(val file: File, val totalBytes: Long) : DownloadState()
        data class Failed(val error: String, val throwable: Throwable? = null) : DownloadState()
        object Cancelled : DownloadState()
    }

    /**
     * Downloads an APK file with resume support (HTTP Range) and system notification updates.
     */
    fun downloadApk(
        downloadUrl: String,
        fileName: String,
        notificationId: Int = (System.currentTimeMillis() % 10000).toInt(),
        appName: String = fileName.substringBeforeLast(".apk")
    ): Flow<DownloadState> = flow {
        val downloadDir = File(context.getExternalFilesDir(null), "apks").apply { mkdirs() }
        val targetFile = File(downloadDir, fileName)
        val partFile = File(downloadDir, "$fileName.part")

        var existingLength = 0L
        if (partFile.exists()) {
            existingLength = partFile.length()
        }

        updateNotificationProgress(notificationId, appName, 0, true)

        try {
            val requestBuilder = Request.Builder()
                .url(downloadUrl)
                .header("User-Agent", "Mozilla/5.0 (Linux; Android 14) OmniStore/1.0")

            // Support for resumption: send Range header if part file already has bytes
            if (existingLength > 0) {
                requestBuilder.header("Range", "bytes=$existingLength-")
            }

            val request = requestBuilder.build()
            val response = client.newCall(request).execute()

            if (!response.isSuccessful && response.code != 206) {
                // If Range not satisfiable (e.g. 416), delete part file and retry full download
                if (response.code == 416) {
                    partFile.delete()
                    existingLength = 0L
                    val freshResponse = client.newCall(
                        Request.Builder()
                            .url(downloadUrl)
                            .header("User-Agent", "Mozilla/5.0 (Linux; Android 14) OmniStore/1.0")
                            .build()
                    ).execute()
                    if (!freshResponse.isSuccessful) {
                        throw IllegalStateException("Error del servidor: HTTP ${freshResponse.code}")
                    }
                    processDownloadBody(
                        response = freshResponse,
                        partFile = partFile,
                        targetFile = targetFile,
                        existingBytes = 0L,
                        notificationId = notificationId,
                        appName = appName,
                        emitState = { emit(it) }
                    )
                } else {
                    throw IllegalStateException("HTTP ${response.code}: ${response.message}")
                }
            } else {
                val isResuming = response.code == 206
                val initialBytes = if (isResuming) existingLength else 0L
                if (!isResuming && partFile.exists()) {
                    partFile.delete()
                }

                processDownloadBody(
                    response = response,
                    partFile = partFile,
                    targetFile = targetFile,
                    existingBytes = initialBytes,
                    notificationId = notificationId,
                    appName = appName,
                    emitState = { emit(it) }
                )
            }
        } catch (e: CancellationException) {
            cancelNotification(notificationId)
            emit(DownloadState.Cancelled)
            throw e
        } catch (e: Exception) {
            showNotificationError(notificationId, appName, e.message ?: "Error desconocido")
            emit(DownloadState.Failed(e.message ?: "Fallo en la descarga", e))
        }
    }.flowOn(Dispatchers.IO)

    private suspend fun processDownloadBody(
        response: okhttp3.Response,
        partFile: File,
        targetFile: File,
        existingBytes: Long,
        notificationId: Int,
        appName: String,
        emitState: suspend (DownloadState) -> Unit
    ) {
        val body = response.body ?: throw IllegalStateException("Cuerpo de respuesta vacío")
        val contentLength = body.contentLength()
        val totalBytes = if (contentLength > 0) existingBytes + contentLength else -1L

        var bytesDownloaded = existingBytes
        var lastNotifiedPercent = -1

        val randomAccessFile = RandomAccessFile(partFile, "rw")
        randomAccessFile.seek(existingBytes)

        val buffer = ByteArray(8 * 1024)
        val inputStream: InputStream = body.byteStream()

        inputStream.use { input ->
            randomAccessFile.use { output ->
                var read: Int
                while (input.read(buffer).also { read = it } != -1) {
                    if (!currentCoroutineContext().isActive) {
                        throw CancellationException("Descarga cancelada")
                    }
                    output.write(buffer, 0, read)
                    bytesDownloaded += read

                    if (totalBytes > 0) {
                        val progress = bytesDownloaded.toFloat() / totalBytes.toFloat()
                        val currentPercent = (progress * 100).toInt()

                        emitState(DownloadState.Progress(progress, bytesDownloaded, totalBytes))

                        // Update notification when percentage changes by at least 2% to avoid notification spam
                        if (currentPercent != lastNotifiedPercent && currentPercent % 2 == 0) {
                            lastNotifiedPercent = currentPercent
                            updateNotificationProgress(notificationId, appName, currentPercent, false)
                        }
                    } else {
                        emitState(DownloadState.Progress(0f, bytesDownloaded, -1L))
                    }
                }
            }
        }

        // Rename .part to .apk upon successful completion
        if (targetFile.exists()) {
            targetFile.delete()
        }
        val renamed = partFile.renameTo(targetFile)
        val finalFile = if (renamed) targetFile else partFile

        showNotificationCompleted(notificationId, appName, finalFile)
        emitState(DownloadState.Completed(finalFile, bytesDownloaded))
    }

    private fun updateNotificationProgress(
        notificationId: Int,
        appName: String,
        progressPercent: Int,
        indeterminate: Boolean
    ) {
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_download)
            .setContentTitle("Descargando $appName")
            .setContentText(if (indeterminate) "Iniciando descarga..." else "$progressPercent% completado")
            .setProgress(100, progressPercent, indeterminate)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        notificationManager.notify(notificationId, notification)
    }

    private fun showNotificationCompleted(
        notificationId: Int,
        appName: String,
        apkFile: File
    ) {
        // PendingIntent to launch native installation on tap
        val apkUri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            apkFile
        )
        val installIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            installIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_download_done)
            .setContentTitle("Descarga completada: $appName")
            .setContentText("Toca aquí para instalar la aplicación")
            .setProgress(0, 0, false)
            .setOngoing(false)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()

        notificationManager.notify(notificationId, notification)
    }

    private fun showNotificationError(
        notificationId: Int,
        appName: String,
        errorMessage: String
    ) {
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_notify_error)
            .setContentTitle("Error al descargar $appName")
            .setContentText(errorMessage)
            .setProgress(0, 0, false)
            .setOngoing(false)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        notificationManager.notify(notificationId, notification)
    }

    fun cancelNotification(notificationId: Int) {
        notificationManager.cancel(notificationId)
    }

    fun getDownloadedApksSize(): Long {
        val downloadDir = File(context.getExternalFilesDir(null), "apks")
        if (!downloadDir.exists()) return 0L
        return downloadDir.walkTopDown().filter { it.isFile }.map { it.length() }.sum()
    }

    fun clearDownloadedApks(): Long {
        val downloadDir = File(context.getExternalFilesDir(null), "apks")
        if (!downloadDir.exists()) return 0L
        val size = getDownloadedApksSize()
        downloadDir.listFiles()?.forEach { file ->
            try { file.delete() } catch (ignored: Exception) {}
        }
        return size
    }
}
