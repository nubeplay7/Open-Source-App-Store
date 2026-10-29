package com.example.data.local

import androidx.room.*
import com.example.data.model.VpnProfileEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface VpnProfileDao {
    @Query("SELECT * FROM vpn_profiles ORDER BY lastConnectedTimestamp DESC")
    fun getAllVpnProfilesFlow(): Flow<List<VpnProfileEntity>>

    @Query("SELECT * FROM vpn_profiles WHERE containerId = :containerId ORDER BY lastConnectedTimestamp DESC")
    fun getVpnProfilesForContainerFlow(containerId: String): Flow<List<VpnProfileEntity>>

    @Query("SELECT * FROM vpn_profiles WHERE containerId = :containerId")
    suspend fun getVpnProfilesForContainer(containerId: String): List<VpnProfileEntity>

    @Query("SELECT * FROM vpn_profiles WHERE id = :id")
    suspend fun getVpnProfileById(id: String): VpnProfileEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(profile: VpnProfileEntity)

    @Delete
    suspend fun delete(profile: VpnProfileEntity)

    @Query("UPDATE vpn_profiles SET status = :status, lastConnectedTimestamp = :timestamp WHERE id = :id")
    suspend fun updateStatus(id: String, status: String, timestamp: Long)

    @Query("UPDATE vpn_profiles SET status = 'DISCONNECTED' WHERE containerId = :containerId")
    suspend fun disconnectAllForContainer(containerId: String)
}
