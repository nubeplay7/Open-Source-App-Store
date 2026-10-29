package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_bookmarks")
data class BookmarkEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val url: String,
    val faviconUrl: String? = null,
    val category: String = "General",
    val containerId: String = "global",
    val isPinned: Boolean = false,
    val customNotes: String = "",
    val createdTimestamp: Long = System.currentTimeMillis()
)
