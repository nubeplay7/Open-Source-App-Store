package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "network_traffic_logs")
data class NetworkTrafficEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val timestamp: Long = System.currentTimeMillis(),
    val timeString: String,
    val method: String,
    val url: String,
    val statusCode: Int = 200,
    val durationMs: Long = 0L,
    val resourceType: String = "XHR/Fetch",
    val isSuccess: Boolean = true,
    val requestHeaders: String = "",
    val responseHeaders: String = "",
    val hostDomain: String = "",
    val dataSizeEstimate: String = ""
)
