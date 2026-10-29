package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import org.json.JSONArray
import org.json.JSONObject

/**
 * Entity representing a cataloged site blueprint mapped by the Autonomous Web Cartographer.
 */
@Entity(tableName = "site_blueprints")
data class SiteBlueprintEntity(
    @PrimaryKey
    val id: String, // e.g. "blueprint_bene_civer_cloud_1725000000"
    val rootDomain: String,
    val rootUrl: String,
    val siteTitle: String,
    val totalPagesMapped: Int = 1,
    val totalElementsMapped: Int = 0,
    val crawlDepth: Int = 2,
    val localScreenshotPath: String = "", // Path to stitched full-page screenshot
    val previewThumbnailBase64: String = "",
    val status: String = "COMPLETED", // "CRAWLING", "COMPLETED", "FAILED"
    val createdAt: Long = System.currentTimeMillis(),
    val isSandboxIsolated: Boolean = true,
    val notes: String = ""
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("id", id)
            put("rootDomain", rootDomain)
            put("rootUrl", rootUrl)
            put("siteTitle", siteTitle)
            put("totalPagesMapped", totalPagesMapped)
            put("totalElementsMapped", totalElementsMapped)
            put("crawlDepth", crawlDepth)
            put("localScreenshotPath", localScreenshotPath)
            put("previewThumbnailBase64", previewThumbnailBase64)
            put("status", status)
            put("createdAt", createdAt)
            put("isSandboxIsolated", isSandboxIsolated)
            put("notes", notes)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): SiteBlueprintEntity {
            return SiteBlueprintEntity(
                id = json.optString("id", "bp_${System.currentTimeMillis()}"),
                rootDomain = json.optString("rootDomain", ""),
                rootUrl = json.optString("rootUrl", ""),
                siteTitle = json.optString("siteTitle", "Sin título"),
                totalPagesMapped = json.optInt("totalPagesMapped", 1),
                totalElementsMapped = json.optInt("totalElementsMapped", 0),
                crawlDepth = json.optInt("crawlDepth", 2),
                localScreenshotPath = json.optString("localScreenshotPath", ""),
                previewThumbnailBase64 = json.optString("previewThumbnailBase64", ""),
                status = json.optString("status", "COMPLETED"),
                createdAt = json.optLong("createdAt", System.currentTimeMillis()),
                isSandboxIsolated = json.optBoolean("isSandboxIsolated", true),
                notes = json.optString("notes", "")
            )
        }
    }
}

/**
 * Entity representing an interactive DOM node or page discovered during cartography.
 */
@Entity(tableName = "site_element_nodes")
data class SiteElementNodeEntity(
    @PrimaryKey
    val id: String, // e.g. "node_12345"
    val blueprintId: String,
    val pageUrl: String,
    val pageTitle: String,
    val selector: String,
    val fallbackSelector: String = "",
    val tagName: String,
    val innerText: String = "",
    val elementType: String = "BUTTON", // "BUTTON", "INPUT", "LINK", "CONTAINER", "IMAGE"
    val boundingBoxJson: String = "", // "{"x": 100, "y": 200, "w": 80, "h": 40}"
    val relativeScreenZone: String = "NONE",
    val isClickable: Boolean = true,
    val isInputField: Boolean = false,
    val visualScreenshotCropBase64: String = "",
    val createdAt: Long = System.currentTimeMillis()
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("id", id)
            put("blueprintId", blueprintId)
            put("pageUrl", pageUrl)
            put("pageTitle", pageTitle)
            put("selector", selector)
            put("fallbackSelector", fallbackSelector)
            put("tagName", tagName)
            put("innerText", innerText)
            put("elementType", elementType)
            put("boundingBoxJson", boundingBoxJson)
            put("relativeScreenZone", relativeScreenZone)
            put("isClickable", isClickable)
            put("isInputField", isInputField)
            put("visualScreenshotCropBase64", visualScreenshotCropBase64)
            put("createdAt", createdAt)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): SiteElementNodeEntity {
            return SiteElementNodeEntity(
                id = json.optString("id", "node_${System.currentTimeMillis()}"),
                blueprintId = json.optString("blueprintId", ""),
                pageUrl = json.optString("pageUrl", ""),
                pageTitle = json.optString("pageTitle", ""),
                selector = json.optString("selector", ""),
                fallbackSelector = json.optString("fallbackSelector", ""),
                tagName = json.optString("tagName", "DIV"),
                innerText = json.optString("innerText", ""),
                elementType = json.optString("elementType", "BUTTON"),
                boundingBoxJson = json.optString("boundingBoxJson", ""),
                relativeScreenZone = json.optString("relativeScreenZone", "NONE"),
                isClickable = json.optBoolean("isClickable", true),
                isInputField = json.optBoolean("isInputField", false),
                visualScreenshotCropBase64 = json.optString("visualScreenshotCropBase64", ""),
                createdAt = json.optLong("createdAt", System.currentTimeMillis())
            )
        }
    }
}

/**
 * Entity representing custom user-defined cropped visual assets with labels for the macro engine.
 */
@Entity(tableName = "visual_macro_assets")
data class VisualMacroAssetEntity(
    @PrimaryKey
    val id: String, // e.g. "asset_btn_login_1725000000"
    val labelName: String, // e.g. "Boton_Login_Principal"
    val blueprintId: String = "",
    val sourcePageUrl: String = "",
    val base64Image: String, // PNG template for Template Matching
    val cropX: Int = 0,
    val cropY: Int = 0,
    val cropWidth: Int = 0,
    val cropHeight: Int = 0,
    val confidenceThreshold: Float = 0.85f,
    val tags: String = "BOTON,ACCION",
    val description: String = "",
    val isGlobalAnchor: Boolean = true,
    val createdAt: Long = System.currentTimeMillis()
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("id", id)
            put("labelName", labelName)
            put("blueprintId", blueprintId)
            put("sourcePageUrl", sourcePageUrl)
            put("base64Image", base64Image)
            put("cropX", cropX)
            put("cropY", cropY)
            put("cropWidth", cropWidth)
            put("cropHeight", cropHeight)
            put("confidenceThreshold", confidenceThreshold.toDouble())
            put("tags", tags)
            put("description", description)
            put("isGlobalAnchor", isGlobalAnchor)
            put("createdAt", createdAt)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): VisualMacroAssetEntity {
            return VisualMacroAssetEntity(
                id = json.optString("id", "asset_${System.currentTimeMillis()}"),
                labelName = json.optString("labelName", "Activo_Visual"),
                blueprintId = json.optString("blueprintId", ""),
                sourcePageUrl = json.optString("sourcePageUrl", ""),
                base64Image = json.optString("base64Image", ""),
                cropX = json.optInt("cropX", 0),
                cropY = json.optInt("cropY", 0),
                cropWidth = json.optInt("cropWidth", 0),
                cropHeight = json.optInt("cropHeight", 0),
                confidenceThreshold = json.optDouble("confidenceThreshold", 0.85).toFloat(),
                tags = json.optString("tags", "BOTON,ACCION"),
                description = json.optString("description", ""),
                isGlobalAnchor = json.optBoolean("isGlobalAnchor", true),
                createdAt = json.optLong("createdAt", System.currentTimeMillis())
            )
        }
    }
}
