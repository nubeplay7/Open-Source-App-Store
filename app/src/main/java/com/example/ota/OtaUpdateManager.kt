package com.example.ota

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.util.Log
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.*
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

/**
 * Representa el payload de una actualización OTA disponible desde la plataforma Civer
 */
data class OtaAppUpdate(
    val appId: String,
    val appName: String,
    val versionName: String,
    val versionCode: Int,
    val downloadUrl: String,
    val fallbackDownloadUrl: String? = null,
    val sha256Checksum: String,
    val releaseNotes: String,
    val fileSizeMb: Double = 0.0
)

/**
 * Estados reactivos del ciclo de vida de actualización OTA
 */
sealed interface OtaStatus {
    object Idle : OtaStatus
    object Checking : OtaStatus
    data class Available(val update: OtaAppUpdate) : OtaStatus
    data class Downloading(val progress: Int, val downloadedBytes: Long, val totalBytes: Long) : OtaStatus
    object VerifyingChecksum : OtaStatus
    object InstallingSilently : OtaStatus
    data class ReadyToInstall(val file: File, val update: OtaAppUpdate) : OtaStatus
    object UpToDate : OtaStatus
    data class Error(val message: String) : OtaStatus
}

/**
 * Motor Nativo de Auto-Actualización Continua (Civer OTA Engine)
 * Consulta manifiestos con conmutación por error (HTTPS Cloudflare -> HTTP local -> Tailscale),
 * valida integridad SHA-256 e instala el paquete mediante Shizuku (desatendido) o FileProvider.
 */
class OtaUpdateManager(private val context: Context) {

    private val _status = MutableStateFlow<OtaStatus>(OtaStatus.Idle)
    val status: StateFlow<OtaStatus> = _status.asStateFlow()

    val settingsManager = OtaSettingsManager.getInstance(context)
    val shizukuBridge = ShizukuInstallerBridge(context)

    companion object {
        private const val TAG = "CiverOtaEngine"
        val DEFAULT_ENDPOINTS = listOf(
            "https://appstore.civer.cloud/api/v1/ota/manifest.json",
            "http://appstore.civer.cloud:3000/api/v1/ota/manifest.json",
            "http://100.96.218.12:3000/api/v1/ota/manifest.json",
            "http://10.0.2.2:3000/api/v1/ota/manifest.json"
        )
    }

    /**
     * Consulta el manifiesto con conmutación automática por error
     */
    suspend fun checkForUpdates(currentVersionCode: Int, isManual: Boolean = false): OtaAppUpdate? = withContext(Dispatchers.IO) {
        // Si no es manual y el usuario desactivó la actualización automática, salir
        if (!isManual && !settingsManager.isAutoUpdateEnabled) {
            Log.i(TAG, "Actualización automática desactivada por el usuario en configuración.")
            _status.value = OtaStatus.Idle
            return@withContext null
        }

        _status.value = OtaStatus.Checking
        settingsManager.recordCheckTimestamp()

        for (endpoint in DEFAULT_ENDPOINTS) {
            try {
                val update = checkSingleEndpoint(endpoint, currentVersionCode)
                if (update != null) {
                    _status.value = OtaStatus.Available(update)
                    return@withContext update
                }
            } catch (e: Exception) {
                // Siguiente endpoint en la cadena de failover
                Log.w(TAG, "Fallo al conectar con endpoint $endpoint: ${e.message}")
                continue
            }
        }
        _status.value = OtaStatus.UpToDate
        return@withContext null
    }

    /**
     * Comprobación a demanda activada explícitamente por el usuario desde la UI
     */
    suspend fun checkOnDemand(currentVersionCode: Int): OtaAppUpdate? {
        return checkForUpdates(currentVersionCode, isManual = true)
    }

    private fun checkSingleEndpoint(manifestUrl: String, currentVersionCode: Int): OtaAppUpdate? {
        val url = URL(manifestUrl)
        val connection = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 4000
            readTimeout = 4000
            setRequestProperty("Accept", "application/json")
        }

        if (connection.responseCode == 200) {
            val response = connection.inputStream.bufferedReader().use { it.readText() }
            val json = JSONObject(response)
            val releases = json.optJSONObject("releases") ?: return null
            val civerRelease = releases.optJSONObject("civer-app-store") ?: return null

            val remoteVersionCode = civerRelease.optInt("versionCode", 0)
            if (remoteVersionCode > currentVersionCode) {
                return OtaAppUpdate(
                    appId = civerRelease.optString("appId", "com.civer.appstore"),
                    appName = civerRelease.optString("appName", "Civer App Store Mobile"),
                    versionName = civerRelease.optString("versionName", "1.0.2"),
                    versionCode = remoteVersionCode,
                    downloadUrl = civerRelease.optString("downloadUrl", ""),
                    fallbackDownloadUrl = civerRelease.optString("fallbackDownloadUrl", null),
                    sha256Checksum = civerRelease.optString("sha256Checksum", ""),
                    releaseNotes = civerRelease.optString("releaseNotes", "Actualización continua desde la plataforma Civer."),
                    fileSizeMb = civerRelease.optDouble("fileSizeMb", 13.1)
                )
            }
        }
        return null
    }

    /**
     * Descarga resiliente del APK con reporte de progreso y validación criptográfica SHA-256
     */
    suspend fun downloadUpdate(update: OtaAppUpdate): File? = withContext(Dispatchers.IO) {
        val fileName = "civer_app_store_v${update.versionName}_${update.versionCode}.apk"
        val destinationFile = File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), fileName)

        if (destinationFile.exists()) {
            destinationFile.delete()
        }

        val targetUrl = update.downloadUrl.ifEmpty { update.fallbackDownloadUrl ?: "" }
        if (targetUrl.isEmpty()) {
            _status.value = OtaStatus.Error("URL de descarga no válida")
            return@withContext null
        }

        try {
            val url = URL(targetUrl)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 8000
                readTimeout = 15000
                instanceFollowRedirects = true
            }

            val totalLength = connection.contentLength.toLong()
            var downloadedBytes = 0L

            connection.inputStream.use { input ->
                FileOutputStream(destinationFile).use { output ->
                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                        downloadedBytes += bytesRead
                        val progress = if (totalLength > 0) ((downloadedBytes * 100) / totalLength).toInt() else 0
                        _status.value = OtaStatus.Downloading(progress, downloadedBytes, totalLength)
                    }
                    output.flush()
                }
            }

            // Verificación criptográfica SHA-256
            _status.value = OtaStatus.VerifyingChecksum
            if (update.sha256Checksum.isNotEmpty()) {
                val computedHash = calculateSha256(destinationFile)
                if (!computedHash.equals(update.sha256Checksum, ignoreCase = true)) {
                    destinationFile.delete()
                    _status.value = OtaStatus.Error("Fallo de integridad SHA-256: la firma no coincide.")
                    return@withContext null
                }
            }

            _status.value = OtaStatus.ReadyToInstall(destinationFile, update)
            return@withContext destinationFile
        } catch (e: Exception) {
            _status.value = OtaStatus.Error("Error al descargar actualización: ${e.message}")
            return@withContext null
        }
    }

    /**
     * Calcula el hash SHA-256 de un archivo binario
     */
    private fun calculateSha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        FileInputStream(file).use { fis ->
            val buffer = ByteArray(8192)
            var bytesRead: Int
            while (fis.read(buffer).also { bytesRead = it } != -1) {
                digest.update(buffer, 0, bytesRead)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    /**
     * Ejecuta la instalación del paquete.
     * Si Shizuku está habilitado en las preferencias y autorizado, realiza la instalación desatendida.
     * Si Shizuku no está disponible o falla, realiza el fallback asistido mediante FileProvider.
     */
    suspend fun executeInstall(file: File, onFallbackRequested: () -> Unit = {}) = withContext(Dispatchers.IO) {
        if (!file.exists()) return@withContext

        // 1. Intentar instalación desatendida vía Shizuku si el usuario la tiene habilitada
        if (settingsManager.isShizukuEnabled) {
            val shizukuState = shizukuBridge.checkShizukuState()
            if (shizukuState == ShizukuState.ReadyAndAuthorized) {
                _status.value = OtaStatus.InstallingSilently
                Log.i(TAG, "Ejecutando instalación desatendida mediante Shizuku...")
                val result = shizukuBridge.installSilently(file)
                if (result is InstallResult.Success) {
                    Log.i(TAG, "Instalación desatendida completada con éxito.")
                    _status.value = OtaStatus.UpToDate
                    return@withContext
                } else {
                    Log.w(TAG, "Shizuku falló o requirió fallback: $result. Recurriendo a FileProvider.")
                }
            }
        }

        // 2. Fallback Asistido NATIVO con FileProvider
        withContext(Dispatchers.Main) {
            installApkWithFileProvider(file)
            onFallbackRequested()
        }
    }

    /**
     * Dispara el instalador de paquetes estándar de Android usando FileProvider
     */
    fun installApkWithFileProvider(file: File) {
        if (!file.exists()) return

        val apkUri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            FileProvider.getUriForFile(
                context,
                "${context.packageName}.provider",
                file
            )
        } else {
            Uri.fromFile(file)
        }

        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, "application/vnd.android.package-archive")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
        }

        context.startActivity(intent)
    }

    fun resetStatus() {
        _status.value = OtaStatus.Idle
    }
}
