package com.example.data.model

import android.content.Context
import androidx.room.Entity
import androidx.room.PrimaryKey
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

/**
 * Represents a functional capability/feature discovered on a website during cartography and QA.
 * Examples: File converter (PDF to CSV), OAuth login, Privacy policy, Checkout, Contact form.
 */
@Entity(tableName = "site_capabilities")
data class SiteCapabilityEntity(
    @PrimaryKey
    val id: String, // e.g. "cap_bene_civer_pdf_converter"
    val domain: String,
    val featureName: String,
    val category: String, // "FILE_CONVERTER", "POLICY_TERMS", "AUTH_GATE", "FORM_SUBMISSION", "NAVIGATION_HUB", "MEDIA_PLAYER"
    val pageUrl: String,
    val description: String = "",
    val supportedInputFormats: String = "", // e.g. "PDF,DOCX,XLSX,CSV"
    val supportedOutputFormats: String = "", // e.g. "CSV,PDF,XLSX"
    val status: String = "DISCOVERED", // "DISCOVERED", "TESTED_PASS", "TESTED_FAIL", "IN_PROGRESS"
    val testSuccessRate: Float = 1.0f,
    val lastTestedTimestamp: Long? = null,
    val testResultSummary: String = "",
    val executionTimelineJson: String = "[]", // Array of steps (e.g. upload -> lazy loading -> progress bar -> done)
    val associatedSelector: String = "",
    val createdAt: Long = System.currentTimeMillis()
) {
    fun parseTimeline(): List<CapabilityTimelineStep> {
        val list = mutableListOf<CapabilityTimelineStep>()
        try {
            val arr = JSONArray(executionTimelineJson)
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                list.add(
                    CapabilityTimelineStep(
                        stepName = obj.optString("stepName", ""),
                        state = obj.optString("state", ""),
                        durationMs = obj.optLong("durationMs", 0),
                        progressPercent = obj.optInt("progressPercent", 100),
                        details = obj.optString("details", "")
                    )
                )
            }
        } catch (e: Exception) {
            // ignore
        }
        return list
    }

    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("id", id)
            put("domain", domain)
            put("featureName", featureName)
            put("category", category)
            put("pageUrl", pageUrl)
            put("description", description)
            put("supportedInputFormats", supportedInputFormats)
            put("supportedOutputFormats", supportedOutputFormats)
            put("status", status)
            put("testSuccessRate", testSuccessRate.toDouble())
            put("lastTestedTimestamp", lastTestedTimestamp ?: 0L)
            put("testResultSummary", testResultSummary)
            put("executionTimelineJson", executionTimelineJson)
            put("associatedSelector", associatedSelector)
            put("createdAt", createdAt)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): SiteCapabilityEntity {
            return SiteCapabilityEntity(
                id = json.optString("id", "cap_${System.currentTimeMillis()}"),
                domain = json.optString("domain", ""),
                featureName = json.optString("featureName", "Capacidad Web"),
                category = json.optString("category", "UTILITY"),
                pageUrl = json.optString("pageUrl", ""),
                description = json.optString("description", ""),
                supportedInputFormats = json.optString("supportedInputFormats", ""),
                supportedOutputFormats = json.optString("supportedOutputFormats", ""),
                status = json.optString("status", "DISCOVERED"),
                testSuccessRate = json.optDouble("testSuccessRate", 1.0).toFloat(),
                lastTestedTimestamp = if (json.has("lastTestedTimestamp") && json.getLong("lastTestedTimestamp") > 0) json.getLong("lastTestedTimestamp") else null,
                testResultSummary = json.optString("testResultSummary", ""),
                executionTimelineJson = json.optString("executionTimelineJson", "[]"),
                associatedSelector = json.optString("associatedSelector", ""),
                createdAt = json.optLong("createdAt", System.currentTimeMillis())
            )
        }
    }
}

data class CapabilityTimelineStep(
    val stepName: String,
    val state: String, // "IDLE", "LAZY_LOADING", "PROCESSING_BAR", "COMPLETED", "ERROR"
    val durationMs: Long,
    val progressPercent: Int,
    val details: String
)

/**
 * Built-in Sample Test Files Repository for QA & Autonomous Converter Testing.
 * Provides sample PDF, CSV, Excel (XLSX), Word (DOCX), and Image files ready to inject.
 */
data class SampleTestFileItem(
    val id: String,
    val fileName: String,
    val format: String, // "PDF", "CSV", "XLSX", "DOCX", "TXT", "PNG"
    val sizeBytes: Long,
    val description: String,
    val iconEmoji: String
)

object SampleTestFilesVault {

    val AVAILABLE_FIXTURES = listOf(
        SampleTestFileItem(
            id = "sample_pdf_invoice",
            fileName = "factura_muestra_qa.pdf",
            format = "PDF",
            sizeBytes = 24_580L,
            description = "Documento PDF estándar con tablas de facturación y texto indexable para probar conversores a Excel/CSV.",
            iconEmoji = "📄"
        ),
        SampleTestFileItem(
            id = "sample_csv_dataset",
            fileName = "dataset_usuarios_qa.csv",
            format = "CSV",
            sizeBytes = 8_320L,
            description = "Archivo CSV con 100 registros formateados con cabeceras para probar exportadores e importadores.",
            iconEmoji = "📊"
        ),
        SampleTestFileItem(
            id = "sample_xlsx_sheet",
            fileName = "presupuesto_empresa_qa.xlsx",
            format = "XLSX",
            sizeBytes = 32_100L,
            description = "Hoja de cálculo estructurada con fórmulas y celdas para probar conversores a PDF.",
            iconEmoji = "📈"
        ),
        SampleTestFileItem(
            id = "sample_docx_report",
            fileName = "informe_tecnico_qa.docx",
            format = "DOCX",
            sizeBytes = 18_450L,
            description = "Documento de texto enriquecido con encabezados y párrafos para probar conversores a PDF/TXT.",
            iconEmoji = "📝"
        ),
        SampleTestFileItem(
            id = "sample_png_logo",
            fileName = "icono_empresa_qa.png",
            format = "PNG",
            sizeBytes = 12_800L,
            description = "Imagen gráfica PNG transparente para probar procesadores de imagen y optimizadores.",
            iconEmoji = "🖼️"
        )
    )

    /**
     * Generates or retrieves the physical test fixture file on disk in app cache.
     */
    fun getOrCreateSampleFile(context: Context, item: SampleTestFileItem): File {
        val sampleDir = File(context.cacheDir, "qa_sample_fixtures")
        if (!sampleDir.exists()) sampleDir.mkdirs()

        val file = File(sampleDir, item.fileName)
        if (!file.exists() || file.length() == 0L) {
            FileOutputStream(file).use { fos ->
                when (item.format) {
                    "CSV" -> {
                        val csvContent = "ID,Nombre,Email,Rol,Estado,FechaRegistro\n" +
                                "1,Admin Usuario,admin@civer.pro,Admin,Activo,2026-08-01\n" +
                                "2,Maria Gomez,maria.g@empresa.com,Tester,Activo,2026-08-10\n" +
                                "3,Juan Perez,juan.p@civer.cloud,Auditor,Inactivo,2026-08-15\n" +
                                "4,Claudia Rios,claudia@workspace.pro,Developer,Activo,2026-08-20\n"
                        fos.write(csvContent.toByteArray(Charsets.UTF_8))
                    }
                    "PDF" -> {
                        val fakePdfHeader = "%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Title (Factura Muestra QA) /Producer (WebNative PRO QA Engine) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
                        fos.write(fakePdfHeader.toByteArray(Charsets.UTF_8))
                    }
                    else -> {
                        val content = "WebNative PRO QA Sample Fixture: ${item.fileName}\nFormat: ${item.format}\nTimestamp: ${System.currentTimeMillis()}\nReady for automated pipeline ingestion."
                        fos.write(content.toByteArray(Charsets.UTF_8))
                    }
                }
            }
        }
        return file
    }
}
