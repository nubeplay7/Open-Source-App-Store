package com.example.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.WebMacroEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WebMacroDao {

    @Query("SELECT * FROM web_macros ORDER BY isFavorite DESC, updatedAt DESC")
    fun getAllMacrosFlow(): Flow<List<WebMacroEntity>>

    @Query("SELECT * FROM web_macros ORDER BY isFavorite DESC, updatedAt DESC")
    suspend fun getAllMacros(): List<WebMacroEntity>

    @Query("SELECT * FROM web_macros WHERE targetDomain = :domain OR targetDomain = '*' ORDER BY isFavorite DESC, updatedAt DESC")
    fun getMacrosForDomainFlow(domain: String): Flow<List<WebMacroEntity>>

    @Query("SELECT * FROM web_macros WHERE targetDomain = :domain OR targetDomain = '*' ORDER BY isFavorite DESC, updatedAt DESC")
    suspend fun getMacrosForDomain(domain: String): List<WebMacroEntity>

    @Query("SELECT * FROM web_macros WHERE id = :id LIMIT 1")
    suspend fun getMacroById(id: Long): WebMacroEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMacro(macro: WebMacroEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMacros(macros: List<WebMacroEntity>): List<Long>

    @Update
    suspend fun updateMacro(macro: WebMacroEntity)

    @Delete
    suspend fun deleteMacro(macro: WebMacroEntity)

    @Query("DELETE FROM web_macros WHERE id = :id")
    suspend fun deleteMacroById(id: Long)

    @Query("UPDATE web_macros SET executionCount = executionCount + 1, lastExecutedAt = :time WHERE id = :id")
    suspend fun recordMacroExecution(id: Long, time: Long = System.currentTimeMillis())

    @Query("UPDATE web_macros SET isFavorite = NOT isFavorite WHERE id = :id")
    suspend fun toggleFavorite(id: Long)
}
