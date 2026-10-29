package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cloned_apps")
data class ClonedAppEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val packageName: String,
    val appName: String,
    val originalName: String,
    val category: String, // "Social", "Gaming", "Work", "Tools"
    val badgeText: String = "2nd",
    val badgeColorHex: String = "#00F0FF",
    val isLocked: Boolean = false,
    val isPrivateSpace: Boolean = false,
    val webUrl: String? = null,
    val launchCount: Int = 0,
    val lastOpenedTime: Long = 0L,
    val cacheSizeMb: Double = 32.5,
    val dataSizeMb: Double = 114.2,
    val notificationsEnabled: Boolean = true,
    val isSystemInstalled: Boolean = false,
    // Security & Biometric Locks
    val customPin: String? = null,
    val isBiometricEnabled: Boolean = false,
    val lockTimeoutMinutes: Int = 0, // 0 = immediate
    // Virtual Container Fingerprint Spoofer
    val virtualAndroidId: String = "v_${(10000000..99999999).random()}",
    val virtualDeviceModel: String = "Galaxy S24 (Sandbox)",
    val virtualMacAddress: String = "02:00:00:%02X:%02X:%02X".format((0..255).random(), (0..255).random(), (0..255).random()),
    val instanceIndex: Int = 1,
    val keepAlive: Boolean = true,
    // Fintech & Banking Shield (Anti-Close / Anti-Detection / Play Integrity Bypass)
    val isFintechProtected: Boolean = false,
    val flagSecureEnabled: Boolean = true,
    val antiDetectionCloak: Boolean = true,
    val playIntegrityBypass: Boolean = true
)
