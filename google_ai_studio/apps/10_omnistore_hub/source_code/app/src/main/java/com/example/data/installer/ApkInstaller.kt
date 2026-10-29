package com.example.data.installer

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageInstaller
import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileInputStream

object ApkInstaller {
    private const val TAG = "ApkInstaller"

    /**
     * Checks if the app has permission to install unknown packages.
     * Required on Android 8.0 (API 26) and higher.
     */
    fun canInstallPackages(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.packageManager.canRequestPackageInstalls()
        } else {
            true
        }
    }

    /**
     * Returns an intent to navigate directly to the settings screen for granting install permission.
     */
    fun getInstallPermissionIntent(context: Context): Intent {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:${context.packageName}")
            ).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        } else {
            Intent(Settings.ACTION_SECURITY_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        }
    }

    /**
     * Installs an APK file using FileProvider and the Android Package Installer.
     * This brings up the standard Android system installer dialog seamlessly.
     */
    fun installViaIntent(context: Context, apkFile: File): Result<Unit> {
        return try {
            if (!apkFile.exists() || apkFile.length() == 0L) {
                return Result.failure(IllegalArgumentException("El archivo APK no existe o está vacío."))
            }

            val apkUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                apkFile
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(apkUri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            context.startActivity(intent)
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(TAG, "Error installing APK via intent: ${e.message}", e)
            Result.failure(e)
        }
    }

    /**
     * Native PackageInstaller Session installer (stream-based installation).
     */
    fun installViaPackageInstallerSession(context: Context, apkFile: File): Result<Unit> {
        var session: PackageInstaller.Session? = null
        try {
            val packageInstaller = context.packageManager.packageInstaller
            val params = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                // On Android 12+, request unattended install if permitted
                params.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED)
            }

            val sessionId = packageInstaller.createSession(params)
            session = packageInstaller.openSession(sessionId)

            val length = apkFile.length()
            val inputStream = FileInputStream(apkFile)
            val outputStream = session.openWrite("package_install", 0, length)

            val buffer = ByteArray(65536)
            var bytesRead: Int
            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
            }

            session.fsync(outputStream)
            inputStream.close()
            outputStream.close()

            // Pending intent for completion callback or fallback intent
            val callbackIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(
                    FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", apkFile),
                    "application/vnd.android.package-archive"
                )
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            val pendingIntent = PendingIntent.getActivity(
                context,
                sessionId,
                callbackIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
            )

            session.commit(pendingIntent.intentSender)
            return Result.success(Unit)
        } catch (e: Exception) {
            Log.w(TAG, "PackageInstaller session fallback to standard intent: ${e.message}")
            session?.abandon()
            // Fallback to standard FileProvider intent
            return installViaIntent(context, apkFile)
        }
    }

    /**
     * Checks if a package is installed on the device, returning its installed version if so.
     */
    fun getInstalledPackageInfo(context: Context, packageName: String): PackageInfo? {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.packageManager.getPackageInfo(
                    packageName,
                    PackageManager.PackageInfoFlags.of(0)
                )
            } else {
                @Suppress("DEPRECATION")
                context.packageManager.getPackageInfo(packageName, 0)
            }
        } catch (_: PackageManager.NameNotFoundException) {
            null
        } catch (e: Exception) {
            Log.d(TAG, "Exception querying package $packageName: ${e.message}")
            null
        }
    }

    /**
     * Inspects a downloaded APK file on disk to extract real package metadata.
     */
    data class ApkMetadata(
        val packageName: String,
        val versionName: String,
        val versionCode: Long,
        val label: String,
        val icon: Drawable? = null
    )

    fun readApkFileDetails(context: Context, apkFile: File): ApkMetadata? {
        if (!apkFile.exists()) return null
        return try {
            val pm = context.packageManager
            val info = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                pm.getPackageArchiveInfo(apkFile.absolutePath, PackageManager.PackageInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                pm.getPackageArchiveInfo(apkFile.absolutePath, 0)
            } ?: return null

            info.applicationInfo?.sourceDir = apkFile.absolutePath
            info.applicationInfo?.publicSourceDir = apkFile.absolutePath

            val label = info.applicationInfo?.let { pm.getApplicationLabel(it).toString() } ?: apkFile.nameWithoutExtension
            val icon = info.applicationInfo?.let { pm.getApplicationIcon(it) }
            val vCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                info.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                info.versionCode.toLong()
            }

            ApkMetadata(
                packageName = info.packageName,
                versionName = info.versionName ?: "1.0",
                versionCode = vCode,
                label = label,
                icon = icon
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to read APK file details: ${e.message}")
            null
        }
    }

    /**
     * Launches the installed app if present on device.
     */
    fun launchInstalledApp(context: Context, packageName: String): Boolean {
        return try {
            val intent = context.packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error launching $packageName: ${e.message}")
            false
        }
    }
}
