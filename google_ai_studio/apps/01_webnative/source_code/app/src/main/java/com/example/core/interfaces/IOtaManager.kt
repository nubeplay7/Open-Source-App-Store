package com.example.core.interfaces

import android.content.Context
import com.example.util.AppVersionInfo
import com.example.util.UpdateStatus
import kotlinx.coroutines.flow.StateFlow

/**
 * Contract for the CI/CD Pipeline and Over-The-Air (OTA) Update Engine.
 * Coordinates GitHub Actions REST API, polling loops, download and APK installation.
 */
interface IOtaManager {
    val updateState: StateFlow<UpdateStatus>

    fun resetState()
    fun getAppVersionInfo(context: Context): AppVersionInfo
    fun getCurrentAppVersion(context: Context): String
    fun checkForUpdates(context: Context, isManualTrigger: Boolean = false, onComplete: ((UpdateStatus) -> Unit)? = null)
    fun downloadAndInstallUpdate(context: Context, downloadUrl: String, expectedVersion: String)
    fun triggerGitHubWorkflow(context: Context, token: String, branch: String = "main", onResult: (Boolean, String) -> Unit)
}
