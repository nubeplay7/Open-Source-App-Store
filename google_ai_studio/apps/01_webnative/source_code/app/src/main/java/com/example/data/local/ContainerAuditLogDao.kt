package com.example.data.local

import androidx.room.*
import com.example.data.model.ContainerAuditLogEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ContainerAuditLogDao {
    @Query("SELECT * FROM container_audit_logs ORDER BY timestamp DESC")
    fun getAllLogsFlow(): Flow<List<ContainerAuditLogEntity>>

    @Query("SELECT * FROM container_audit_logs WHERE containerId = :containerId ORDER BY timestamp DESC")
    fun getLogsForContainerFlow(containerId: String): Flow<List<ContainerAuditLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: ContainerAuditLogEntity)

    @Query("DELETE FROM container_audit_logs WHERE timestamp < :olderThanTimestamp")
    suspend fun deleteOldLogs(olderThanTimestamp: Long)
    
    @Query("DELETE FROM container_audit_logs")
    suspend fun clearAllLogs()
}
