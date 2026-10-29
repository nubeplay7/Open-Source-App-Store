package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "apks")
data class ApkEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val version: String,
    val icon: String = "",
    val sourceUrl: String,
    val category: String = "Tools", // Categories: "Games", "Tools", "Social", "Media", "Productivity"
    val installStatus: String = "NOT_INSTALLED", // "NOT_INSTALLED", "DOWNLOADING", "DOWNLOADED", "INSTALLING", "INSTALLED", "FAILED"
    val packageName: String = "",
    val localFilePath: String? = null,
    val fileSize: String = "Desconocido",
    val downloadProgress: Float = 0f,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "apps")
data class AppEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val packageName: String,
    val versionName: String,
    val versionCode: Long = 1L,
    val description: String = "",
    val category: String = "General",
    val iconUrl: String = "",
    val downloadUrl: String,
    val rawCloudUrl: String = "",
    val fileSize: String = "Desconocido",
    val sourceType: String = "Directo", // "Google Drive", "Google Sheets", "S3 / Cloud", "Enlace Directo"
    val feedId: Long? = null,
    val addedTimestamp: Long = System.currentTimeMillis(),
    val isFavorite: Boolean = false,
    val localApkPath: String? = null,
    val downloadStatus: String = "IDLE", // "IDLE", "DOWNLOADING", "DOWNLOADED", "INSTALLING", "INSTALLED", "ERROR"
    val downloadProgress: Float = 0f,
    val downloadErrorMessage: String? = null
)

@Entity(tableName = "chat_messages")
data class ChatMessageEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val role: String, // "user", "assistant", "system"
    val content: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "feeds")
data class FeedEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val url: String,
    val feedType: String = "GOOGLE_SHEETS", // "GOOGLE_SHEETS", "JSON", "CSV"
    val lastSyncTimestamp: Long = 0L,
    val itemCount: Int = 0
)
