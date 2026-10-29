package com.example.core.interfaces

import android.content.Context
import com.example.util.SystemDiagnosticSummary
import org.json.JSONObject
import java.io.File

/**
 * Contract for 360-Degree Diagnostics, Hardware Telemetry, and Forensic Bundles.
 */
interface IDiagnosticsEngine {
    suspend fun generateCompleteDiagnostics(context: Context): SystemDiagnosticSummary
    suspend fun generateDiagnosticsJson(context: Context): JSONObject
    suspend fun generateForensicZipBundle(context: Context): File?
    fun getBatteryLevel(context: Context): Int
    fun getAvailableRamMb(context: Context): Long
}
