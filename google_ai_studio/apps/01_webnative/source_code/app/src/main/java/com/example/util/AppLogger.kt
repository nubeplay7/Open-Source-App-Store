package com.example.util

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import androidx.core.content.FileProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.RandomAccessFile
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.atomic.AtomicLong

/**
 * Log severity levels.
 */
enum class LogLevel(val label: String, val emoji: String) {
    DEBUG("DEBUG", "🔍"),
    INFO("INFO", "ℹ️"),
    SUCCESS("SUCCESS", "✅"),
    WARN("WARN", "⚠️"),
    ERROR("ERROR", "❌")
}

/**
 * Structured log entry representation.
 */
data class LogEntry(
    val timestamp: String,
    val tag: String,
    val message: String,
    val level: LogLevel = LogLevel.INFO,
    val threadName: String = "main",
    val id: Long = 0L
) {
    fun toFormattedLine(): String {
        return "[$timestamp] [${level.label}] [$tag] [T:$threadName] $message"
    }
}

/**
 * Enterprise High-Capacity AppLogger:
 * Supports up to 10MB+ circular persistent file logging, in-memory live streaming StateFlow,
 * multi-threaded asynchronous writes, structured categorization, and fast AI diagnostic exports.
 */
object AppLogger {
    private const val LOG_FILE_NAME = "agent_system_logs.txt"
    private const val MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L // 10 MB max log retention
    private const val TRUNCATE_TARGET_BYTES = 6L * 1024L * 1024L // Keep ~6 MB when rotating

    private val entrySequence = AtomicLong(0L)
    private val memoryLogBuffer = ConcurrentLinkedQueue<LogEntry>()
    private const val MAX_MEMORY_ENTRIES = 2000

    private val _logsFlow = MutableStateFlow<List<LogEntry>>(emptyList())
    val logsFlow: StateFlow<List<LogEntry>> = _logsFlow.asStateFlow()

    private val ioScope = CoroutineScope(Dispatchers.IO)
    private val writeLock = Any()

    /**
     * Records a system log entry asynchronously with tag, level and thread awareness.
     */
    fun log(
        context: Context?,
        message: String,
        tag: String = "CI/CD",
        level: LogLevel = LogLevel.INFO,
        throwable: Throwable? = null
    ) {
        val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS", Locale.getDefault()).format(Date())
        val threadName = Thread.currentThread().name
        val fullMessage = if (throwable != null) {
            "$message\n${throwable.stackTraceToString()}"
        } else {
            message
        }

        val entry = LogEntry(
            timestamp = timestamp,
            tag = tag,
            message = fullMessage,
            level = level,
            threadName = threadName,
            id = entrySequence.incrementAndGet()
        )

        // Update in-memory buffer
        memoryLogBuffer.add(entry)
        while (memoryLogBuffer.size > MAX_MEMORY_ENTRIES) {
            memoryLogBuffer.poll()
        }
        _logsFlow.value = memoryLogBuffer.toList()

        // Asynchronous non-blocking file persistence
        if (context != null) {
            val appContext = context.applicationContext
            ioScope.launch {
                persistEntryToFile(appContext, entry)
            }
        }
    }

    private fun persistEntryToFile(context: Context, entry: LogEntry) {
        synchronized(writeLock) {
            try {
                val file = File(context.filesDir, LOG_FILE_NAME)
                val line = entry.toFormattedLine() + "\n"
                file.appendText(line)

                // Check file size threshold (10 MB) and rotate cleanly
                if (file.length() > MAX_FILE_SIZE_BYTES) {
                    rotateLogFile(file)
                }
            } catch (e: Exception) {
                // Ignore silent disk write error to avoid recursive crash
            }
        }
    }

    private fun rotateLogFile(file: File) {
        try {
            val length = file.length()
            val bytesToSkip = length - TRUNCATE_TARGET_BYTES
            if (bytesToSkip > 0) {
                val tempFile = File(file.parentFile, "${LOG_FILE_NAME}.tmp")
                RandomAccessFile(file, "r").use { raf ->
                    raf.seek(bytesToSkip)
                    // Skip to next newline to ensure clean line start
                    var b = raf.read()
                    while (b != -1 && b != '\n'.code) {
                        b = raf.read()
                    }
                    tempFile.outputStream().use { fos ->
                        val buffer = ByteArray(64 * 1024)
                        var read: Int
                        while (raf.read(buffer).also { read = it } != -1) {
                            fos.write(buffer, 0, read)
                        }
                    }
                }
                if (tempFile.exists() && tempFile.length() > 0) {
                    tempFile.copyTo(file, overwrite = true)
                    tempFile.delete()
                }
            }
        } catch (_: Exception) {}
    }

    /**
     * Reads all stored logs from file with optional filters.
     */
    fun getLogs(
        context: Context,
        maxLines: Int = 10000,
        tagFilter: String? = null,
        levelFilter: LogLevel? = null,
        query: String? = null
    ): String {
        return try {
            val file = File(context.filesDir, LOG_FILE_NAME)
            if (file.exists() && file.length() > 0) {
                var lines = file.readLines()
                if (!tagFilter.isNullOrBlank() && tagFilter != "ALL") {
                    lines = lines.filter { it.contains("[$tagFilter]", ignoreCase = true) }
                }
                if (levelFilter != null) {
                    lines = lines.filter { it.contains("[${levelFilter.label}]", ignoreCase = true) }
                }
                if (!query.isNullOrBlank()) {
                    lines = lines.filter { it.contains(query, ignoreCase = true) }
                }
                if (lines.isEmpty()) {
                    "No se encontraron registros con los filtros seleccionados."
                } else {
                    lines.takeLast(maxLines).joinToString("\n")
                }
            } else {
                "No hay registros. El sistema está limpio."
            }
        } catch (e: Exception) {
            "Error al leer registros del sistema: ${e.message}"
        }
    }

    /**
     * Returns the formatted size of the log file (e.g. "3.42 MB").
     */
    fun getLogSizeFormatted(context: Context): String {
        val bytes = getLogSizeBytes(context)
        return when {
            bytes >= 1024 * 1024 -> String.format(Locale.getDefault(), "%.2f MB", bytes.toDouble() / (1024 * 1024))
            bytes >= 1024 -> String.format(Locale.getDefault(), "%.1f KB", bytes.toDouble() / 1024)
            else -> "$bytes B"
        }
    }

    fun getLogSizeBytes(context: Context): Long {
        val file = File(context.filesDir, LOG_FILE_NAME)
        return if (file.exists()) file.length() else 0L
    }

    fun getLogLineCount(context: Context): Int {
        val file = File(context.filesDir, LOG_FILE_NAME)
        return if (file.exists()) {
            try {
                file.readLines().size
            } catch (_: Exception) {
                0
            }
        } else 0
    }

    fun getRawLogFile(context: Context): File {
        return File(context.filesDir, LOG_FILE_NAME)
    }

    /**
     * Exports full logs into a public cache file ready for sharing.
     */
    fun exportLogsToShareableFile(context: Context): File {
        val exportDir = File(context.cacheDir, "exported_logs")
        exportDir.mkdirs()
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val exportFile = File(exportDir, "webnative_system_logs_$timestamp.log")
        val src = getRawLogFile(context)
        if (src.exists()) {
            src.copyTo(exportFile, overwrite = true)
        } else {
            exportFile.writeText("Sin logs previos generados.")
        }
        return exportFile
    }

    /**
     * Clears all persisted and in-memory logs.
     */
    fun clearLogs(context: Context) {
        synchronized(writeLock) {
            try {
                File(context.filesDir, LOG_FILE_NAME).writeText("")
                memoryLogBuffer.clear()
                _logsFlow.value = emptyList()
            } catch (_: Exception) {}
        }
    }
}
