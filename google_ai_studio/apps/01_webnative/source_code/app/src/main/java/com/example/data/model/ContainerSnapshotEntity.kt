package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "container_snapshots")
data class ContainerSnapshotEntity(
    @PrimaryKey val snapshotId: String, // e.g., "snap_timestamp_containerId"
    val containerId: String,
    val containerName: String,
    val timestamp: Long = System.currentTimeMillis(),
    val snapshotName: String,
    val description: String,
    val filePath: String, // Path to the zipped snapshot file
    val sizeBytes: Long,
    val cookiesDump: String? = null, // Backup of cookies at that moment
    val isP2pSynced: Boolean = false,
    val p2pOriginDeviceName: String? = null
)
