package com.example.agent

import android.content.Context
import com.example.core.interfaces.IAgentBridge
import com.example.util.AgentBridgeServer
import com.example.util.AgentHandshakeManager
import com.example.util.McpAgentSkillsRegistry
import kotlinx.coroutines.flow.StateFlow
import org.json.JSONObject

/**
 * Domain Facade for the Agent Bridge subsystem.
 * Encapsulates embedded server operations, MCP skill execution, and handshake protocols.
 */
object AgentBridgeFacade : IAgentBridge {

    override val serverRunningFlow: StateFlow<Boolean>
        get() = AgentBridgeServer.serverRunningFlow

    override val totalRequestsCountFlow: StateFlow<Long>
        get() = AgentBridgeServer.totalRequestsCountFlow

    override val activeChannelsCountFlow: StateFlow<Int>
        get() = AgentBridgeServer.activeChannelsCountFlow

    override fun startServer(context: Context, port: Int) {
        AgentBridgeServer.startServer(context, port)
    }

    override fun stopServer(context: Context) {
        AgentBridgeServer.stopServer(context)
    }

    override fun getDeviceLocalIpAddress(): String {
        return AgentBridgeServer.getDeviceLocalIpAddress()
    }

    override fun getUniversalConnectionUrl(context: Context): String {
        val ip = getDeviceLocalIpAddress()
        return AgentHandshakeManager.getUniversalConnectionUrl(ip, AgentBridgeServer.DEFAULT_PORT)
    }

    override suspend fun executeSkill(context: Context, name: String, args: JSONObject): JSONObject {
        return McpAgentSkillsRegistry.executeTool(context, name, args)
    }

    override fun broadcastSystemEvent(eventType: String, payload: JSONObject) {
        com.example.util.AppLogger.log(
            context = null,
            message = "Domain Event Dispatched [$eventType]: ${payload.optString("message", payload.toString())}",
            tag = "DOMAIN_EVENT"
        )
    }
}
