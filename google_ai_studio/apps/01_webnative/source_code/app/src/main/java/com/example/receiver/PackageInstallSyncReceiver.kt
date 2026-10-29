package com.example.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.example.util.AppCloneDataSyncManager
import com.example.util.AppLogger
import com.example.util.NativeAppCloneManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * BroadcastReceiver listening for package additions/replacements (e.g. newly installed or updated apps).
 *
 * Automatically triggers background WorkManager synchronization of data, Room databases,
 * and cookies from the origin device's snapshot, guaranteeing seamless identical state
 * without requiring manual user intervention after installing the APK.
 */
class PackageInstallSyncReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent == null) return
        val action = intent.action ?: return
        
        if (action == Intent.ACTION_PACKAGE_ADDED || action == Intent.ACTION_PACKAGE_REPLACED || action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            val packageName = intent.data?.schemeSpecificPart ?: intent.getStringExtra(Intent.EXTRA_PACKAGE_NAME) ?: ""
            if (packageName.isBlank() || packageName == context.packageName) return

            val isReplacing = intent.getBooleanExtra(Intent.EXTRA_REPLACING, false)
            AppLogger.log(
                context,
                "Paquete detectado instalado/actualizado: $packageName (Acción: $action, Reemplazando: $isReplacing)",
                tag = "INSTALL_RECEIVER"
            )

            // Asynchronously match with pending clone snapshots and trigger WorkManager sync
            val pendingResult = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    NativeAppCloneManager.initialize(context)
                    val allSnapshots = NativeAppCloneManager.clonedSnapshots.value
                    val matchingSnapshot = allSnapshots.firstOrNull { it.packageName.equals(packageName, ignoreCase = true) }

                    if (matchingSnapshot != null) {
                        AppLogger.log(
                            context,
                            "Encontrado snapshot coincidente para $packageName (${matchingSnapshot.appName}). Disparando WorkManager automático...",
                            tag = "INSTALL_RECEIVER"
                        )

                        AppCloneDataSyncManager.enqueueDataSync(
                            context = context,
                            snapshotId = matchingSnapshot.snapshotId,
                            zipPath = matchingSnapshot.zipPath,
                            packageName = packageName,
                            autoLaunch = true,
                            restoreRoot = true
                        )
                    } else {
                        AppLogger.log(
                            context,
                            "No se encontró snapshot pendiente para $packageName. Monitoreando para futuras sincronizaciones.",
                            tag = "INSTALL_RECEIVER"
                        )
                    }
                } catch (e: Exception) {
                    AppLogger.log(
                        context,
                        "Error en PackageInstallSyncReceiver para $packageName: ${e.message}",
                        tag = "INSTALL_RECEIVER"
                    )
                } finally {
                    pendingResult.finish()
                }
            }
        }
    }
}
