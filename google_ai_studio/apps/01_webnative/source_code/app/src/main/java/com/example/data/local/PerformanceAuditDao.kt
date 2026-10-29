package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.model.PerformanceAuditEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PerformanceAuditDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(audit: PerformanceAuditEntity): Long

    @Query("SELECT * FROM performance_audit_logs ORDER BY timestamp DESC")
    fun getAllAudits(): Flow<List<PerformanceAuditEntity>>

    @Query("SELECT * FROM performance_audit_logs ORDER BY timestamp DESC")
    suspend fun getAllAuditsSync(): List<PerformanceAuditEntity>

    @Query("SELECT * FROM performance_audit_logs ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentAudits(limit: Int = 30): Flow<List<PerformanceAuditEntity>>

    @Query("SELECT * FROM performance_audit_logs WHERE eventType = :eventType ORDER BY timestamp DESC")
    fun getAuditsByType(eventType: String): Flow<List<PerformanceAuditEntity>>

    @Query("SELECT AVG(durationMs) FROM performance_audit_logs WHERE eventType LIKE '%STARTUP%' OR eventType LIKE '%START%'")
    suspend fun getAverageStartupDuration(): Double?

    @Query("SELECT AVG(durationMs) FROM performance_audit_logs WHERE eventType LIKE '%RENDER%' OR eventType LIKE '%DOM%'")
    suspend fun getAverageRenderDuration(): Double?

    @Query("SELECT COUNT(*) FROM performance_audit_logs")
    suspend fun getAuditCount(): Int

    @Query("DELETE FROM performance_audit_logs WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM performance_audit_logs")
    suspend fun deleteAll()

    @Query("DELETE FROM performance_audit_logs WHERE timestamp < :cutoffTimestamp")
    suspend fun deleteOlderThan(cutoffTimestamp: Long): Int
}
