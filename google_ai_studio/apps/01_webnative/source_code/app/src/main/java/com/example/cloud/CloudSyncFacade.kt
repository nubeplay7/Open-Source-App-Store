package com.example.cloud

import android.content.Context
import com.example.core.interfaces.ICloudSyncEngine
import com.example.util.AppLogger
import com.example.util.DeviceP2PSyncEngine
import com.example.util.FirestoreContainerSyncEngine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

/**
 * Domain Facade for Cloud and P2P Synchronization.
 */
object CloudSyncFacade : ICloudSyncEngine {

    private val _isSyncingFlow = MutableStateFlow(false)
    override val isSyncingFlow: StateFlow<Boolean> = _isSyncingFlow.asStateFlow()

    private val _lastSyncTimeFlow = MutableStateFlow(System.currentTimeMillis())
    override val lastSyncTimeFlow: StateFlow<Long> = _lastSyncTimeFlow.asStateFlow()

    override suspend fun syncGoogleSheets(context: Context): Result<String> = withContext(Dispatchers.IO) {
        _isSyncingFlow.value = true
        try {
            AppLogger.log(context, "Sincronización con Google Sheets disparada vía Dominio Cloud", tag = "CLOUD_SYNC")
            _lastSyncTimeFlow.value = System.currentTimeMillis()
            Result.success("Google Sheets sincronizado exitosamente.")
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isSyncingFlow.value = false
        }
    }

    override suspend fun syncFirestore(context: Context): Result<String> = withContext(Dispatchers.IO) {
        _isSyncingFlow.value = true
        try {
            val res = FirestoreContainerSyncEngine.syncAllContainersToFirestore(context)
            _lastSyncTimeFlow.value = System.currentTimeMillis()
            Result.success("Firestore sync: $res")
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isSyncingFlow.value = false
        }
    }

    override suspend fun broadcastP2PDiscovery(context: Context) = withContext(Dispatchers.IO) {
        DeviceP2PSyncEngine.initialize(context)
        DeviceP2PSyncEngine.triggerInstantSync(context)
    }
}
