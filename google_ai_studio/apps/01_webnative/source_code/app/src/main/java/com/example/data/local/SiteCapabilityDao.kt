package com.example.data.local

import androidx.room.*
import com.example.data.model.SiteCapabilityEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SiteCapabilityDao {

    @Query("SELECT * FROM site_capabilities ORDER BY createdAt DESC")
    fun getAllCapabilities(): Flow<List<SiteCapabilityEntity>>

    @Query("SELECT * FROM site_capabilities WHERE domain = :domain ORDER BY createdAt DESC")
    fun getCapabilitiesByDomain(domain: String): Flow<List<SiteCapabilityEntity>>

    @Query("SELECT * FROM site_capabilities WHERE id = :id LIMIT 1")
    suspend fun getCapabilityById(id: String): SiteCapabilityEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCapability(capability: SiteCapabilityEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(capabilities: List<SiteCapabilityEntity>)

    @Update
    suspend fun updateCapability(capability: SiteCapabilityEntity)

    @Query("UPDATE site_capabilities SET status = :status, lastTestedTimestamp = :timestamp, testResultSummary = :summary WHERE id = :id")
    suspend fun updateVerification(id: String, status: String, timestamp: Long, summary: String)

    @Query("DELETE FROM site_capabilities WHERE id = :id")
    suspend fun deleteCapability(id: String)

    @Query("DELETE FROM site_capabilities WHERE domain = :domain")
    suspend fun deleteCapabilitiesForDomain(domain: String)

    @Query("SELECT COUNT(*) FROM site_capabilities WHERE domain = :domain")
    suspend fun countCapabilitiesForDomain(domain: String): Int
}
