package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "browser_history")
data class BrowserHistoryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val containerId: String = "container_main",
    val url: String,
    val title: String,
    val visitTimestamp: Long = System.currentTimeMillis(),
    val visitCount: Int = 1,
    val faviconUrl: String? = null,
    val isSynced: Boolean = false
)
