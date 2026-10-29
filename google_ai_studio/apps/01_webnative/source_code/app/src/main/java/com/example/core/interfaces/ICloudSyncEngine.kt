package com.example.core.interfaces

import android.content.Context
import kotlinx.coroutines.flow.StateFlow

/**
 * Contract for Cloud integrations (Google Sheets, Firestore) and P2P device synchronization.
 */
interface ICloudSyncEngine {
    val isSyncingFlow: StateFlow<Boolean>
    val lastSyncTimeFlow: StateFlow<Long>

    suspend fun syncGoogleSheets(context: Context): Result<String>
    suspend fun syncFirestore(context: Context): Result<String>
    suspend fun broadcastP2PDiscovery(context: Context)
}
