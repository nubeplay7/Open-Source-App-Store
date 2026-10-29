package com.example.ota

import android.content.Context
import com.example.core.interfaces.IOtaManager
import com.example.util.AppVersionInfo
import com.example.util.GitHubApiAutomation
import com.example.util.OtaUpdateManager
import com.example.util.UpdateStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/**
 * Domain Facade for CI/CD and OTA updates.
 * Provides a clean boundary for update checks, build workflow triggering, and APK installation.
 */
object OtaManagerFacade : IOtaManager {

    private val otaScope = CoroutineScope(Dispatchers.IO)

    override val updateState: StateFlow<UpdateStatus>
        get() = OtaUpdateManager.updateState

    override fun resetState() {
        OtaUpdateManager.resetState()
    }

    override fun getAppVersionInfo(context: Context): AppVersionInfo {
        return OtaUpdateManager.getAppVersionInfo(context)
    }

    override fun getCurrentAppVersion(context: Context): String {
        return OtaUpdateManager.getCurrentAppVersion(context)
    }

    override fun checkForUpdates(
        context: Context,
        isManualTrigger: Boolean,
        onComplete: ((UpdateStatus) -> Unit)?
    ) {
        otaScope.launch {
            val status = OtaUpdateManager.checkForUpdates(
                context = context,
                notifyIfAvailable = isManualTrigger
            )
            onComplete?.invoke(status)
        }
    }

    override fun downloadAndInstallUpdate(context: Context, downloadUrl: String, expectedVersion: String) {
        otaScope.launch {
            val result = OtaUpdateManager.downloadAndPrepareInstall(context, downloadUrl, expectedVersion)
            result.onSuccess { apkFile ->
                OtaUpdateManager.promptInstallApk(context, apkFile)
            }
        }
    }

    override fun triggerGitHubWorkflow(
        context: Context,
        token: String,
        branch: String,
        onResult: (Boolean, String) -> Unit
    ) {
        otaScope.launch {
            val res = GitHubApiAutomation.triggerWorkflowDispatch(context, ref = branch)
            onResult(res.success, res.message)
        }
    }
}
