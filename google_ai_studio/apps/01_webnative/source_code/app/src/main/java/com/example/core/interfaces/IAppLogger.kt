package com.example.core.interfaces

import android.content.Context
import com.example.util.LogEntry
import com.example.util.LogLevel
import kotlinx.coroutines.flow.StateFlow
import java.io.File

/**
 * Contract for Universal On-Device Logging & Observability.
 */
interface IAppLogger {
    val logsFlow: StateFlow<List<LogEntry>>

    fun log(context: Context?, message: String, level: LogLevel = LogLevel.INFO, tag: String = "APP")
    fun clearLogs(context: Context)
    suspend fun exportLogsFile(context: Context): File?
}
