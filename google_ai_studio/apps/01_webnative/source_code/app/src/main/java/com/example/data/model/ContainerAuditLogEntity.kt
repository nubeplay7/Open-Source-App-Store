package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "container_audit_logs")
data class ContainerAuditLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val containerId: String,
    val containerName: String,
    val timestamp: Long = System.currentTimeMillis(),
    val actionType: String, // e.g., "CAMERA_ACCESS", "MIC_ACCESS", "LOCATION_ACCESS", "STORAGE_WIPE", "LOGIN"
    val resource: String,   // e.g., "URL of the site", or "Google Auth"
    val isGranted: Boolean,
    val details: String
)
