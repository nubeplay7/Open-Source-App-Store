package com.example.data.model

import android.util.Base64
import org.json.JSONObject
import java.nio.charset.StandardCharsets

enum class D2DSyncStatus {
    IDLE,
    DISCOVERING,
    SYNCING,
    SUCCESS,
    ERROR
}

enum class P2PSyncDirection(val label: String, val description: String) {
    BIDIRECTIONAL("Bidireccional (Enviar y Recibir)", "Sincroniza en ambos sentidos: envía cambios locales y recibe novedades remotas."),
    TRANSMIT_ONLY("Solo Transmitir (Emisor)", "Envía deltas locales a la terminal remota, sin absorber cambios de ella."),
    RECEIVE_ONLY("Solo Recibir (Receptor)", "Absorbe cambios y sesiones de la terminal remota, sin sobreescribir sus datos."),
    PAUSED("Pausada / Desactivada", "Detiene la transferencia de datos con este nodo.")
}

/**
 * Representation of a discovered or paired peer device within the encrypted swarm.
 */
data class DevicePeerNode(
    val deviceId: String,
    val deviceName: String,
    val clusterId: String,
    val clusterSecretKey: String,
    val lanIp: String? = null,
    val port: Int = 8765,
    val isOnline: Boolean = true,
    val lastSeenTimestamp: Long = System.currentTimeMillis(),
    val lastSyncedSandbox: String? = null,
    val role: String = "PEER",
    val syncDirection: P2PSyncDirection = P2PSyncDirection.BIDIRECTIONAL
) {
    fun toJsonObject(): JSONObject {
        val obj = JSONObject()
        obj.put("deviceId", deviceId)
        obj.put("deviceName", deviceName)
        obj.put("clusterId", clusterId)
        obj.put("clusterSecretKey", clusterSecretKey)
        obj.put("lanIp", lanIp ?: "")
        obj.put("port", port)
        obj.put("isOnline", isOnline)
        obj.put("lastSeenTimestamp", lastSeenTimestamp)
        obj.put("lastSyncedSandbox", lastSyncedSandbox ?: "")
        obj.put("role", role)
        obj.put("syncDirection", syncDirection.name)
        return obj
    }

    companion object {
        fun fromJsonObject(obj: JSONObject): DevicePeerNode {
            val dir = try {
                P2PSyncDirection.valueOf(obj.optString("syncDirection", P2PSyncDirection.BIDIRECTIONAL.name))
            } catch (_: Exception) {
                P2PSyncDirection.BIDIRECTIONAL
            }
            return DevicePeerNode(
                deviceId = obj.getString("deviceId"),
                deviceName = obj.optString("deviceName", "Terminal Remota"),
                clusterId = obj.getString("clusterId"),
                clusterSecretKey = obj.getString("clusterSecretKey"),
                lanIp = obj.optString("lanIp").takeIf { it.isNotBlank() },
                port = obj.optInt("port", 8765),
                isOnline = obj.optBoolean("isOnline", true),
                lastSeenTimestamp = obj.optLong("lastSeenTimestamp", System.currentTimeMillis()),
                lastSyncedSandbox = obj.optString("lastSyncedSandbox").takeIf { it.isNotBlank() },
                role = obj.optString("role", "PEER"),
                syncDirection = dir
            )
        }
    }
}

/**
 * Metadata for a snapshot that can be viewed and administered across P2P swarm devices.
 */
data class RemoteSnapshotInfo(
    val id: String,
    val name: String,
    val containerId: String,
    val containerName: String,
    val sizeBytes: Long,
    val timestamp: Long,
    val isP2pSynced: Boolean = false,
    val originDeviceName: String = "",
    val description: String = ""
) {
    fun toJsonObject(): JSONObject = JSONObject().apply {
        put("id", id)
        put("name", name)
        put("containerId", containerId)
        put("containerName", containerName)
        put("sizeBytes", sizeBytes)
        put("timestamp", timestamp)
        put("isP2pSynced", isP2pSynced)
        put("originDeviceName", originDeviceName)
        put("description", description)
    }

    companion object {
        fun fromJsonObject(obj: JSONObject): RemoteSnapshotInfo = RemoteSnapshotInfo(
            id = obj.getString("id"),
            name = obj.optString("name", "Snapshot"),
            containerId = obj.optString("containerId", ""),
            containerName = obj.optString("containerName", "Sandbox"),
            sizeBytes = obj.optLong("sizeBytes", 0L),
            timestamp = obj.optLong("timestamp", System.currentTimeMillis()),
            isP2pSynced = obj.optBoolean("isP2pSynced", false),
            originDeviceName = obj.optString("originDeviceName", ""),
            description = obj.optString("description", "")
        )
    }
}

/**
 * Handshake payload exchanged via QR code scanning or direct network handshake.
 * Establishes bidirectional permanent trust between devices.
 */
data class DeviceHandshakePayload(
    val protocol: String = "WEBNATIVE_P2P_V1",
    val clusterId: String,
    val clusterSecretKey: String,
    val deviceId: String,
    val deviceName: String,
    val lanIp: String,
    val port: Int = 8765,
    val relayChannel: String,
    val timestamp: Long = System.currentTimeMillis()
) {
    fun toCompactQrString(): String {
        val obj = JSONObject()
        obj.put("proto", protocol)
        obj.put("cid", clusterId)
        obj.put("key", clusterSecretKey)
        obj.put("did", deviceId)
        obj.put("name", deviceName)
        obj.put("ip", lanIp)
        obj.put("port", port)
        obj.put("relay", relayChannel)
        obj.put("ts", timestamp)

        val jsonBytes = obj.toString().toByteArray(StandardCharsets.UTF_8)
        val b64 = Base64.encodeToString(jsonBytes, Base64.NO_WRAP or Base64.URL_SAFE)
        return "WN_P2P:$b64"
    }

    companion object {
        fun fromCompactQrString(raw: String): DeviceHandshakePayload? {
            return try {
                var cleaned = raw.trim()
                if (cleaned.startsWith("\"") && cleaned.endsWith("\"")) {
                    cleaned = cleaned.substring(1, cleaned.length - 1).trim()
                }

                // If direct JSON string was passed or scanned
                if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
                    val obj = JSONObject(cleaned)
                    return DeviceHandshakePayload(
                        protocol = obj.optString("proto", obj.optString("protocol", "WEBNATIVE_P2P_V1")),
                        clusterId = if (obj.has("cid")) obj.getString("cid") else obj.getString("clusterId"),
                        clusterSecretKey = if (obj.has("key")) obj.getString("key") else obj.getString("clusterSecretKey"),
                        deviceId = if (obj.has("did")) obj.getString("did") else obj.getString("deviceId"),
                        deviceName = obj.optString("name", obj.optString("deviceName", "Terminal P2P")),
                        lanIp = obj.optString("ip", obj.optString("lanIp", "")),
                        port = obj.optInt("port", 8765),
                        relayChannel = obj.optString("relay", obj.optString("relayChannel", if (obj.has("cid")) obj.getString("cid") else obj.getString("clusterId"))),
                        timestamp = obj.optLong("ts", obj.optLong("timestamp", System.currentTimeMillis()))
                    )
                }

                val b64 = if (cleaned.startsWith("WN_P2P:")) {
                    cleaned.removePrefix("WN_P2P:").trim()
                } else if (cleaned.startsWith("WEBNATIVE_D2D:")) {
                    cleaned.removePrefix("WEBNATIVE_D2D:").trim()
                } else if (cleaned.startsWith("WEBNATIVE:")) {
                    cleaned.removePrefix("WEBNATIVE:").trim()
                } else {
                    cleaned
                }

                val jsonBytes = try {
                    Base64.decode(b64, Base64.NO_WRAP or Base64.URL_SAFE)
                } catch (_: Exception) {
                    Base64.decode(b64, Base64.DEFAULT)
                }

                val jsonStr = String(jsonBytes, StandardCharsets.UTF_8)
                val obj = JSONObject(jsonStr)

                DeviceHandshakePayload(
                    protocol = obj.optString("proto", obj.optString("protocol", "WEBNATIVE_P2P_V1")),
                    clusterId = if (obj.has("cid")) obj.getString("cid") else obj.getString("clusterId"),
                    clusterSecretKey = if (obj.has("key")) obj.getString("key") else obj.getString("clusterSecretKey"),
                    deviceId = if (obj.has("did")) obj.getString("did") else obj.getString("deviceId"),
                    deviceName = obj.optString("name", obj.optString("deviceName", "Terminal P2P")),
                    lanIp = obj.optString("ip", obj.optString("lanIp", "")),
                    port = obj.optInt("port", 8765),
                    relayChannel = obj.optString("relay", obj.optString("relayChannel", if (obj.has("cid")) obj.getString("cid") else obj.getString("clusterId"))),
                    timestamp = obj.optLong("ts", obj.optLong("timestamp", System.currentTimeMillis()))
                )
            } catch (e: Exception) {
                null
            }
        }
    }
}

/**
 * Encrypted container delta snapshot transmitted over P2P LAN or Cloud Relay.
 * Contains the complete state of a sandbox profile, cookies, accounts, GPS and apps.
 */
data class P2PContainerSyncDelta(
    val version: Int = 1,
    val originDeviceId: String,
    val originDeviceName: String,
    val containerId: String,
    val containerName: String,
    val timestamp: Long,
    val containerProfileJson: String,
    val cookiesJson: String,
    val installedAppsJson: String,
    val fingerprintJson: String,
    val gpsMockJson: String? = null,
    val vpnConfigJson: String? = null,
    val hmacSignature: String = ""
) {
    fun toJsonObject(): JSONObject {
        val obj = JSONObject()
        obj.put("version", version)
        obj.put("originDeviceId", originDeviceId)
        obj.put("originDeviceName", originDeviceName)
        obj.put("containerId", containerId)
        obj.put("containerName", containerName)
        obj.put("timestamp", timestamp)
        obj.put("containerProfileJson", containerProfileJson)
        obj.put("cookiesJson", cookiesJson)
        obj.put("installedAppsJson", installedAppsJson)
        obj.put("fingerprintJson", fingerprintJson)
        gpsMockJson?.let { obj.put("gpsMockJson", it) }
        vpnConfigJson?.let { obj.put("vpnConfigJson", it) }
        obj.put("hmacSignature", hmacSignature)
        return obj
    }

    companion object {
        fun fromJsonObject(obj: JSONObject): P2PContainerSyncDelta {
            return P2PContainerSyncDelta(
                version = obj.optInt("version", 1),
                originDeviceId = obj.getString("originDeviceId"),
                originDeviceName = obj.optString("originDeviceName", "Terminal Remota"),
                containerId = obj.getString("containerId"),
                containerName = obj.getString("containerName"),
                timestamp = obj.getLong("timestamp"),
                containerProfileJson = obj.getString("containerProfileJson"),
                cookiesJson = obj.getString("cookiesJson"),
                installedAppsJson = obj.getString("installedAppsJson"),
                fingerprintJson = obj.getString("fingerprintJson"),
                gpsMockJson = if (obj.has("gpsMockJson")) obj.getString("gpsMockJson") else null,
                vpnConfigJson = if (obj.has("vpnConfigJson")) obj.getString("vpnConfigJson") else null,
                hmacSignature = obj.optString("hmacSignature", "")
            )
        }
    }
}
