package com.example.data.local

import androidx.room.*
import com.example.data.model.ContainerSnapshotEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ContainerSnapshotDao {
    @Query("SELECT * FROM container_snapshots ORDER BY timestamp DESC")
    fun getAllSnapshotsFlow(): Flow<List<ContainerSnapshotEntity>>

    @Query("SELECT * FROM container_snapshots ORDER BY timestamp DESC")
    suspend fun getAllSnapshots(): List<ContainerSnapshotEntity>

    @Query("SELECT * FROM container_snapshots WHERE containerId = :containerId ORDER BY timestamp DESC")
    fun getSnapshotsForContainerFlow(containerId: String): Flow<List<ContainerSnapshotEntity>>

    @Query("SELECT * FROM container_snapshots WHERE containerId = :containerId ORDER BY timestamp DESC")
    suspend fun getSnapshotsForContainer(containerId: String): List<ContainerSnapshotEntity>

    @Query("SELECT * FROM container_snapshots WHERE snapshotId = :snapshotId LIMIT 1")
    suspend fun getSnapshotById(snapshotId: String): ContainerSnapshotEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSnapshot(snapshot: ContainerSnapshotEntity)

    @Delete
    suspend fun deleteSnapshot(snapshot: ContainerSnapshotEntity)
}
