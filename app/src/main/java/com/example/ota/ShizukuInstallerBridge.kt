package com.example.ota

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.IBinder
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader

/**
 * Estado de disponibilidad del servicio Shizuku en el dispositivo
 */
sealed interface ShizukuState {
    object NotInstalled : ShizukuState
    object InstalledNotRunning : ShizukuState
    object RunningNoPermission : ShizukuState
    object ReadyAndAuthorized : ShizukuState
}

/**
 * Resultado de un intento de instalación
 */
sealed interface InstallResult {
    object Success : InstallResult
    data class FallbackNeeded(val reason: String) : InstallResult
    data class Error(val message: String) : InstallResult
}

/**
 * Puente de Interoperabilidad con Shizuku para Instalación Desatendida (Silent Update)
 * Utiliza detección de servicio por IPC y ejecución privilegiada con fallback nativo.
 */
class ShizukuInstallerBridge(private val context: Context) {

    companion object {
        private const val TAG = "CiverShizukuBridge"
        const val SHIZUKU_PACKAGE = "moe.shizuku.privileged.api"
        const val SHIZUKU_PERMISSION = "moe.shizuku.manager.permission.API_V23"
    }

    /**
     * Evalúa el estado del servicio Shizuku en tiempo de ejecución
     */
    fun checkShizukuState(): ShizukuState {
        // 1. Verificar si la app de Shizuku está instalada
        val isInstalled = try {
            context.packageManager.getPackageInfo(SHIZUKU_PACKAGE, 0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }

        if (!isInstalled) {
            return ShizukuState.NotInstalled
        }

        // 2. Verificar si el Binder de Shizuku está activo (pingBinder)
        val isRunning = isShizukuServerAlive()
        if (!isRunning) {
            return ShizukuState.InstalledNotRunning
        }

        // 3. Verificar si se ha otorgado el permiso
        val hasPermission = checkPermissionGranted()
        return if (hasPermission) {
            ShizukuState.ReadyAndAuthorized
        } else {
            ShizukuState.RunningNoPermission
        }
    }

    /**
     * Comprueba si el servidor Shizuku está activo a través del Binder o clase de Shizuku
     */
    private fun isShizukuServerAlive(): Boolean {
        return try {
            val shizukuClass = Class.forName("rikka.shizuku.Shizuku")
            val pingMethod = shizukuClass.getMethod("pingBinder")
            val result = pingMethod.invoke(null) as? Boolean
            result ?: false
        } catch (e: Throwable) {
            // Alternativa: consultar ServiceManager por binder "moe.shizuku.privileged.api.service"
            checkServiceManagerBinder()
        }
    }

    private fun checkServiceManagerBinder(): Boolean {
        return try {
            val serviceManager = Class.forName("android.os.ServiceManager")
            val getService = serviceManager.getMethod("getService", String::class.java)
            val binder = getService.invoke(null, "shizuku") as? IBinder
            binder?.isBinderAlive ?: false
        } catch (e: Throwable) {
            false
        }
    }

    /**
     * Verifica si la aplicación tiene permiso para invocar la API de Shizuku
     */
    private fun checkPermissionGranted(): Boolean {
        // Primero intenta vía API de Shizuku
        try {
            val shizukuClass = Class.forName("rikka.shizuku.Shizuku")
            val checkMethod = shizukuClass.getMethod("checkSelfPermission")
            val result = checkMethod.invoke(null) as? Int
            if (result == PackageManager.PERMISSION_GRANTED) {
                return true
            }
        } catch (e: Throwable) {
            // Ignorado, evaluar permiso Android estándar
        }

        return context.checkCallingOrSelfPermission(SHIZUKU_PERMISSION) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Lanza la aplicación Shizuku para que el usuario pueda iniciarla o autorizar permisos
     */
    fun openShizukuApp() {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(SHIZUKU_PACKAGE)
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(launchIntent)
        }
    }

    /**
     * Ejecuta la instalación desatendida mediante el comando pm de Shizuku
     */
    suspend fun installSilently(apkFile: File): InstallResult = withContext(Dispatchers.IO) {
        if (!apkFile.exists()) {
            return@withContext InstallResult.Error("El archivo APK no existe: ${apkFile.absolutePath}")
        }

        val state = checkShizukuState()
        if (state != ShizukuState.ReadyAndAuthorized) {
            return@withContext InstallResult.FallbackNeeded(
                "Shizuku no está listo para instalación desatendida (Estado: $state)"
            )
        }

        try {
            Log.i(TAG, "Iniciando instalación silenciosa con Shizuku: ${apkFile.absolutePath}")
            val shizukuClass = Class.forName("rikka.shizuku.Shizuku")
            val newProcessMethod = shizukuClass.getMethod(
                "newProcess",
                Array<String>::class.java,
                Array<String>::class.java,
                String::class.java
            )

            val cmd = arrayOf("pm", "install", "-r", "-d", apkFile.absolutePath)
            val process = newProcessMethod.invoke(null, cmd, null, null) as Process

            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val output = StringBuilder()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                output.append(line).append("\n")
            }
            val exitCode = process.waitFor()

            Log.i(TAG, "Resultado pm install (Exit code: $exitCode): $output")

            if (exitCode == 0 && output.contains("Success", ignoreCase = true)) {
                InstallResult.Success
            } else {
                InstallResult.FallbackNeeded("Fallo pm install vía Shizuku: $output")
            }
        } catch (e: Throwable) {
            Log.e(TAG, "Error al invocar proceso Shizuku: ${e.message}", e)
            InstallResult.FallbackNeeded("Excepción Shizuku: ${e.message}")
        }
    }
}
