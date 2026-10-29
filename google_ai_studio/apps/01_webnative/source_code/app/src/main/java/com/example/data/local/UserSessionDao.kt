package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.UserSessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface UserSessionDao {

    @Query("SELECT * FROM user_sessions WHERE id = 1 LIMIT 1")
    fun getActiveSessionFlow(): Flow<UserSessionEntity?>

    @Query("SELECT * FROM user_sessions WHERE id = 1 LIMIT 1")
    suspend fun getActiveSession(): UserSessionEntity?

    @Query("SELECT * FROM user_sessions")
    suspend fun getAllSessions(): List<UserSessionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: UserSessionEntity)

    @Update
    suspend fun updateSession(session: UserSessionEntity)

    @Query("UPDATE user_sessions SET isSyncEnabled = :enabled WHERE id = 1")
    suspend fun updateSyncEnabled(enabled: Boolean)

    @Query("UPDATE user_sessions SET isPersonalizationEnabled = :enabled WHERE id = 1")
    suspend fun updatePersonalizationEnabled(enabled: Boolean)

    @Query("UPDATE user_sessions SET accountStatus = :status WHERE id = 1")
    suspend fun updateAccountStatus(status: String)

    @Query("UPDATE user_sessions SET accessToken = :accessToken, idToken = :idToken, tokenExpiryTimestamp = :expiryTimestamp, lastRefreshedTimestamp = :refreshedTimestamp WHERE id = 1")
    suspend fun updateTokens(
        accessToken: String?,
        idToken: String,
        expiryTimestamp: Long,
        refreshedTimestamp: Long
    )

    @Query("DELETE FROM user_sessions")
    suspend fun clearSession()
}
