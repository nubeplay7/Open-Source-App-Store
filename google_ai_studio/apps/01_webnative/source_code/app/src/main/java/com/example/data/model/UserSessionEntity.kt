package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_sessions")
data class UserSessionEntity(
    @PrimaryKey val id: Long = 1L,
    val email: String,
    val displayName: String,
    val photoUrl: String? = null,
    val givenName: String = "",
    val familyName: String = "",
    val idToken: String = "",
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val tokenExpiryTimestamp: Long = 0L,
    val lastRefreshedTimestamp: Long = System.currentTimeMillis(),
    val createdAtTimestamp: Long = System.currentTimeMillis(),
    val isSyncEnabled: Boolean = true,
    val isPersonalizationEnabled: Boolean = true,
    val accountStatus: String = "ACTIVE", // ACTIVE, EXPIRED, REFRESHING, GUEST
    val customThemePreference: String = "TURBO_DARK",
    val syncedAppsCount: Int = 0
)
