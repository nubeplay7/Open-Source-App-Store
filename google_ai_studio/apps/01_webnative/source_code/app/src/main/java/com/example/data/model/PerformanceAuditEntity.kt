package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "performance_audit_logs")
data class PerformanceAuditEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val timestamp: Long = System.currentTimeMillis(),
    val dateString: String,
    val eventType: String, // "APP_STARTUP", "COLD_START", "WARM_START", "WEBVIEW_RENDER", "DOM_LOAD", "CACHE_PURGE"
    val targetUrlOrName: String,
    val durationMs: Long,
    val memoryUsageMb: Double,
    val hardwareAccelerated: Boolean = true,
    val details: String = "",
    val rating: String = "OPTIMAL" // "OPTIMAL", "GOOD", "AVERAGE", "NEEDS_OPTIMIZATION"
)
