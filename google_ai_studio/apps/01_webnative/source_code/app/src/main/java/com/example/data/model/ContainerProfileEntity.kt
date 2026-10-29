package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class ContainerType(val label: String, val iconEmoji: String, val defaultColor: Long) {
    PERSONAL("Personal", "🛡️", 0xFF60A5FA),
    WORK("Empresa / Workspace", "💼", 0xFF34D399),
    DEVELOPER("Desarrollador & Cloud", "⚡", 0xFFA78BFA),
    FINANCE_VAULT("Bóveda Financiera", "🔒", 0xFFFBBF24),
    EPHEMERAL_INCOGNITO("Sandbox Efímero (Incógnito)", "🕶️", 0xFFF87171),
    CUSTOM("Contenedor Personalizado", "📦", 0xFFE879F9)
}

@Entity(tableName = "container_profiles")
data class ContainerProfileEntity(
    @PrimaryKey val id: String, // e.g. "container_personal", "container_work", "container_dev"
    val name: String,
    val description: String,
    val iconEmoji: String = "🛡️",
    val colorHex: Long = 0xFF60A5FA,
    val containerType: String = ContainerType.PERSONAL.name,
    val storageDirName: String, // relative folder e.g. "containers/sandbox_personal"
    val associatedGoogleEmail: String? = null,
    val associatedGoogleName: String? = null,
    val isolatedUserAgent: String? = null,
    val isHardwareDirectJunctionEnabled: Boolean = true,
    val isCameraJunctionAllowed: Boolean = true,
    val isMicJunctionAllowed: Boolean = true,
    val isGpsJunctionAllowed: Boolean = true,
    val isGpuHardwareBoostAllowed: Boolean = true,
    val isSensorsAllowed: Boolean = true,
    val isAdBlockIsolated: Boolean = true,
    val isOledIsolated: Boolean = false,
    val isNetworkThrottlingIsolated: Boolean = false,
    val isolatedNetworkProfile: String = "ONLINE",
    val isActive: Boolean = false,
    val isEphemeral: Boolean = false,
    val cookieCount: Int = 0,
    val storageSizeBytes: Long = 0L,
    val createdAtTimestamp: Long = System.currentTimeMillis(),
    val lastUsedTimestamp: Long = System.currentTimeMillis(),
    
    // Custom GPS Mocking & Trans-device Cluster Sync
    val customGpsLatitude: Double? = null,
    val customGpsLongitude: Double? = null,
    val customGpsAltitude: Double? = null,
    val isGpsMockingEnabled: Boolean = false,
    val isGpsClusterSyncEnabled: Boolean = true,

    // Per-Container VPN Tunneling & Assigned IP Persistence
    val vpnProtocol: String = "NONE", // "WIREGUARD", "OPENVPN", "SOCKS5", "NONE"
    val vpnConfigRaw: String? = null,
    val assignedIpAddress: String? = null,
    val vpnExitNodeCity: String? = null,
    val vpnExitNodeCountry: String? = null,
    val isVpnKillSwitchActive: Boolean = false,
    val vpnStatus: String = "DISCONNECTED", // "DISCONNECTED", "CONNECTING", "CONNECTED", "ERROR"

    // Hardware & Fingerprint E2EE Sync Attributes
    val spoofedMacAddress: String? = null,
    val spoofedHardwareSerial: String? = null,
    val fingerprintSeed: Long = 0L,
    val isE2eeSyncEnabled: Boolean = true
)
