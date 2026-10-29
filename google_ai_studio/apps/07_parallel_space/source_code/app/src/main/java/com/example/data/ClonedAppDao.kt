package com.example.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ClonedAppDao {
    @Query("SELECT * FROM cloned_apps ORDER BY isLocked ASC, lastOpenedTime DESC, id ASC")
    fun getAllClonedApps(): Flow<List<ClonedAppEntity>>

    @Query("SELECT * FROM cloned_apps WHERE category = :category ORDER BY id ASC")
    fun getAppsByCategory(category: String): Flow<List<ClonedAppEntity>>

    @Query("SELECT * FROM cloned_apps WHERE isPrivateSpace = 1 ORDER BY id ASC")
    fun getPrivateApps(): Flow<List<ClonedAppEntity>>

    @Query("SELECT * FROM cloned_apps WHERE id = :id")
    suspend fun getAppById(id: Long): ClonedAppEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertApp(app: ClonedAppEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertApps(apps: List<ClonedAppEntity>)

    @Update
    suspend fun updateApp(app: ClonedAppEntity)

    @Delete
    suspend fun deleteApp(app: ClonedAppEntity)

    @Query("DELETE FROM cloned_apps WHERE id = :id")
    suspend fun deleteAppById(id: Long)

    @Query("UPDATE cloned_apps SET launchCount = launchCount + 1, lastOpenedTime = :timestamp WHERE id = :id")
    suspend fun recordLaunch(id: Long, timestamp: Long)

    @Query("UPDATE cloned_apps SET cacheSizeMb = 0.0 WHERE id = :id")
    suspend fun clearCache(id: Long)

    @Query("UPDATE cloned_apps SET cacheSizeMb = 0.0")
    suspend fun clearAllCache()

    @Query("UPDATE cloned_apps SET isLocked = :locked WHERE id = :id")
    suspend fun setLock(id: Long, locked: Boolean)
}
