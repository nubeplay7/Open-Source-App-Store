package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entity representing an OpenVPN or WireGuard profile configured per container.
 */
@Entity(tableName = "vpn_profiles")
data class VpnProfileEntity(
    @PrimaryKey
    val id: String = "vpn_${System.currentTimeMillis()}",
    val containerId: String,
    val name: String,
    val protocol: String = "WIREGUARD", // "WIREGUARD", "OPENVPN", "SOCKS5_PROXY", "HTTP_PROXY"
    val configRawText: String = "", // Raw .ovpn or .conf configuration
    val serverHost: String = "",
    val serverPort: Int = 51820,
    val exitNodeCountry: String = "US",
    val exitNodeCity: String = "San Francisco",
    val exitNodeIp: String = "",
    val isAutoConnectOnLaunch: Boolean = false,
    val isKillSwitchEnabled: Boolean = true,
    val isDnsLeakProtectionEnabled: Boolean = true,
    val status: String = "DISCONNECTED", // "CONNECTED", "CONNECTING", "DISCONNECTED", "ERROR"
    val lastConnectedTimestamp: Long = 0L,
    val bytesTransferred: Long = 0L
)
