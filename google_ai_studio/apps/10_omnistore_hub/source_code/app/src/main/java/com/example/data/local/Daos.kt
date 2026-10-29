package com.example.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.ApkEntity
import com.example.data.model.AppEntity
import com.example.data.model.ChatMessageEntity
import com.example.data.model.FeedEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object (DAO) para la entidad [ApkEntity].
 * Gestiona el almacenamiento persistente de los paquetes APK descargados y registrados,
 * incluyendo su estado de instalación, progreso de descarga y categorización personalizada.
 */
@Dao
interface ApkDao {
    @Query("SELECT * FROM apks ORDER BY id DESC")
    fun getAllApks(): Flow<List<ApkEntity>>

    @Query("SELECT * FROM apks WHERE localFilePath IS NOT NULL AND localFilePath != '' ORDER BY id DESC")
    fun getLocalApks(): Flow<List<ApkEntity>>

    @Query("SELECT * FROM apks WHERE name LIKE '%' || :query || '%' OR packageName LIKE '%' || :query || '%'")
    fun searchLocalApks(query: String): Flow<List<ApkEntity>>

    @Query("SELECT * FROM apks WHERE id = :id LIMIT 1")
    suspend fun getApkById(id: Long): ApkEntity?

    @Query("SELECT * FROM apks WHERE sourceUrl = :url LIMIT 1")
    suspend fun getApkByUrl(url: String): ApkEntity?

    @Query("SELECT * FROM apks WHERE packageName = :packageName LIMIT 1")
    suspend fun getApkByPackageName(packageName: String): ApkEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertApk(apk: ApkEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertApks(apks: List<ApkEntity>): List<Long>

    @Update
    suspend fun updateApk(apk: ApkEntity)

    @Query("UPDATE apks SET installStatus = :status, downloadProgress = :progress WHERE id = :id")
    suspend fun updateProgress(id: Long, status: String, progress: Float)

    @Query("UPDATE apks SET installStatus = :status, localFilePath = :filePath, downloadProgress = 1.0 WHERE id = :id")
    suspend fun markDownloaded(id: Long, filePath: String, status: String = "DOWNLOADED")

    @Query("UPDATE apks SET installStatus = :status WHERE id = :id")
    suspend fun updateInstallStatus(id: Long, status: String)

    @Query("UPDATE apks SET category = :category WHERE id = :id")
    suspend fun updateCategory(id: Long, category: String)

    @Query("SELECT * FROM apks WHERE category = :category ORDER BY id DESC")
    fun getApksByCategory(category: String): Flow<List<ApkEntity>>

    @Delete
    suspend fun deleteApk(apk: ApkEntity)

    @Query("DELETE FROM apks WHERE id = :id")
    suspend fun deleteApkById(id: Long)

    @Query("SELECT COUNT(*) FROM apks")
    suspend fun getApkCount(): Int

    @Query("SELECT * FROM apks ORDER BY id DESC")
    suspend fun getAllApksList(): List<ApkEntity>
}

@Dao
interface AppDao {
    @Query("SELECT * FROM apps ORDER BY addedTimestamp DESC")
    fun getAllApps(): Flow<List<AppEntity>>

    @Query("SELECT * FROM apps WHERE id = :id LIMIT 1")
    suspend fun getAppById(id: Long): AppEntity?

    @Query("SELECT * FROM apps WHERE packageName = :packageName LIMIT 1")
    suspend fun getAppByPackageName(packageName: String): AppEntity?

    @Query("SELECT * FROM apps WHERE downloadStatus IN ('DOWNLOADING', 'DOWNLOADED', 'INSTALLING') ORDER BY addedTimestamp DESC")
    fun getActiveAndDownloadedApps(): Flow<List<AppEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertApp(app: AppEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertApps(apps: List<AppEntity>): List<Long>

    @Update
    suspend fun updateApp(app: AppEntity)

    @Query("UPDATE apps SET downloadStatus = :status, downloadProgress = :progress, downloadErrorMessage = :error WHERE id = :id")
    suspend fun updateDownloadProgress(id: Long, status: String, progress: Float, error: String? = null)

    @Query("UPDATE apps SET localApkPath = :path, downloadStatus = :status, downloadProgress = 1.0 WHERE id = :id")
    suspend fun markDownloadComplete(id: Long, path: String, status: String = "DOWNLOADED")

    @Delete
    suspend fun deleteApp(app: AppEntity)

    @Query("DELETE FROM apps WHERE id = :id")
    suspend fun deleteAppById(id: Long)

    @Query("SELECT COUNT(*) FROM apps")
    suspend fun getAppCount(): Int

    @Query("SELECT * FROM apps ORDER BY addedTimestamp DESC")
    suspend fun getAllAppsList(): List<AppEntity>
}

@Dao
interface ChatMessageDao {
    @Query("SELECT * FROM chat_messages ORDER BY timestamp ASC")
    fun getAllMessages(): Flow<List<ChatMessageEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: ChatMessageEntity): Long

    @Query("DELETE FROM chat_messages")
    suspend fun clearChat()
}

@Dao
interface FeedDao {
    @Query("SELECT * FROM feeds ORDER BY id DESC")
    fun getAllFeeds(): Flow<List<FeedEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFeed(feed: FeedEntity): Long

    @Delete
    suspend fun deleteFeed(feed: FeedEntity)
}
