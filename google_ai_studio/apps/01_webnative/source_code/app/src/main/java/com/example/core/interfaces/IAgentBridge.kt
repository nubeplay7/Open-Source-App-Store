package com.example.core.interfaces

import android.content.Context
import kotlinx.coroutines.flow.StateFlow
import org.json.JSONObject

/**
 * Contract for the Embedded Agent Bridge Server and MCP Tools Runtime.
 * Manages port 8765, JSON-RPC 2.0 communication, and pairing tokens.
 */
interface IAgentBridge {
    val serverRunningFlow: StateFlow<Boolean>
    val totalRequestsCountFlow: StateFlow<Long>
    val activeChannelsCountFlow: StateFlow<Int>

    fun startServer(context: Context, port: Int = 8765)
    fun stopServer(context: Context)
    fun getDeviceLocalIpAddress(): String
    fun getUniversalConnectionUrl(context: Context): String
    suspend fun executeSkill(context: Context, name: String, args: JSONObject): JSONObject
    fun broadcastSystemEvent(eventType: String, payload: JSONObject)
}
