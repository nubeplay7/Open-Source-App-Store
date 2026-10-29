package com.example.core

import android.content.Context
import com.example.core.interfaces.IAppLogger
import com.example.util.AppLogger
import com.example.util.LogEntry
import com.example.util.LogLevel
import kotlinx.coroutines.flow.StateFlow
import java.io.File

/**
 * Domain Facade for Universal On-Device Observability & Circular Logging.
 */
object AppLoggerFacade : IAppLogger {

    override val logsFlow: StateFlow<List<LogEntry>>
        get() = AppLogger.logsFlow

    override fun log(context: Context?, message: String, level: LogLevel, tag: String) {
        AppLogger.log(context, message, tag = tag, level = level)
    }

    override fun clearLogs(context: Context) {
        AppLogger.clearLogs(context)
    }

    override suspend fun exportLogsFile(context: Context): File? {
        return AppLogger.exportLogsToShareableFile(context)
    }
}
