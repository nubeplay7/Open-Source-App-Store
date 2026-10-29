package com.example.data.local

import androidx.room.*
import com.example.data.model.BrowserHistoryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BrowserHistoryDao {

    @Query("SELECT * FROM browser_history WHERE containerId = :containerId ORDER BY visitTimestamp DESC LIMIT :limit")
    fun getHistoryForContainerFlow(containerId: String, limit: Int = 100): Flow<List<BrowserHistoryEntity>>

    @Query("SELECT * FROM browser_history WHERE containerId = :containerId ORDER BY visitTimestamp DESC")
    suspend fun getAllHistoryForContainer(containerId: String): List<BrowserHistoryEntity>

    @Query("SELECT * FROM browser_history WHERE containerId = :containerId AND url = :url LIMIT 1")
    suspend fun getHistoryItemByUrl(containerId: String, url: String): BrowserHistoryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHistoryItem(item: BrowserHistoryEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(items: List<BrowserHistoryEntity>)

    @Update
    suspend fun updateHistoryItem(item: BrowserHistoryEntity)

    @Query("DELETE FROM browser_history WHERE containerId = :containerId")
    suspend fun clearHistoryForContainer(containerId: String)

    @Delete
    suspend fun deleteHistoryItem(item: BrowserHistoryEntity)
}
