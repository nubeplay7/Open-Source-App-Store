package com.example.data.local

import androidx.room.*
import com.example.data.model.ContainerProfileEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ContainerProfileDao {

    @Query("SELECT * FROM container_profiles ORDER BY lastUsedTimestamp DESC")
    fun getAllContainersFlow(): Flow<List<ContainerProfileEntity>>

    @Query("SELECT * FROM container_profiles ORDER BY lastUsedTimestamp DESC")
    suspend fun getAllContainers(): List<ContainerProfileEntity>

    @Query("SELECT * FROM container_profiles WHERE id = :id LIMIT 1")
    suspend fun getContainerById(id: String): ContainerProfileEntity?

    @Query("SELECT * FROM container_profiles WHERE isActive = 1 LIMIT 1")
    suspend fun getActiveContainer(): ContainerProfileEntity?

    @Query("SELECT * FROM container_profiles WHERE isActive = 1 LIMIT 1")
    fun getActiveContainerFlow(): Flow<ContainerProfileEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertContainer(container: ContainerProfileEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(containers: List<ContainerProfileEntity>)

    @Update
    suspend fun updateContainer(container: ContainerProfileEntity)

    @Query("UPDATE container_profiles SET isActive = CASE WHEN id = :activeId THEN 1 ELSE 0 END, lastUsedTimestamp = CASE WHEN id = :activeId THEN :timestamp ELSE lastUsedTimestamp END")
    suspend fun setActiveContainer(activeId: String, timestamp: Long = System.currentTimeMillis())

    @Query("UPDATE container_profiles SET cookieCount = :count, storageSizeBytes = :sizeBytes WHERE id = :id")
    suspend fun updateContainerStats(id: String, count: Int, sizeBytes: Long)

    @Query("UPDATE container_profiles SET associatedGoogleEmail = :email, associatedGoogleName = :name WHERE id = :id")
    suspend fun updateAssociatedGoogleAccount(id: String, email: String?, name: String?)

    @Delete
    suspend fun deleteContainer(container: ContainerProfileEntity)

    @Query("DELETE FROM container_profiles WHERE id = :id")
    suspend fun deleteContainerById(id: String)

    @Query("SELECT * FROM container_profiles WHERE LOWER(associatedGoogleEmail) = LOWER(:email) LIMIT 1")
    suspend fun getContainerByGoogleEmail(email: String): ContainerProfileEntity?

    @Query("SELECT * FROM container_profiles WHERE associatedGoogleEmail IS NOT NULL AND associatedGoogleEmail != '' ORDER BY name ASC")
    suspend fun getGoogleLinkedContainers(): List<ContainerProfileEntity>

    @Query("SELECT COUNT(*) FROM container_profiles")
    suspend fun getContainerCount(): Int
}
