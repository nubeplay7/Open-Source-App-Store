package com.example.data.remote

import android.util.Log
import com.example.data.model.AppEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.regex.Pattern

object CloudUrlResolver {
    private const val TAG = "CloudUrlResolver"

    data class ResolvedUrl(
        val directDownloadUrl: String,
        val sourceType: String,
        val suggestedName: String? = null
    )

    /**
     * Identifies the storage provider and transforms the link into a direct download URL.
     */
    fun resolveDirectApkUrl(inputUrl: String): ResolvedUrl {
        val trimmed = inputUrl.trim()

        // 1. Google Drive
        // Formats:
        // https://drive.google.com/file/d/1A2B3C4D5E.../view?usp=sharing
        // https://drive.google.com/open?id=1A2B3C4D5E...
        // https://drive.google.com/uc?id=1A2B3C4D5E...
        if (trimmed.contains("drive.google.com")) {
            val fileId = extractGoogleDriveFileId(trimmed)
            if (fileId != null) {
                // Direct download format for Google Drive
                val direct = "https://drive.usercontent.google.com/download?id=$fileId&export=download&authuser=0"
                return ResolvedUrl(
                    directDownloadUrl = direct,
                    sourceType = "Google Drive",
                    suggestedName = "App-Drive-$fileId"
                )
            }
        }

        // 2. Google Sheets
        // Formats: https://docs.google.com/spreadsheets/d/1X2Y3Z.../edit...
        if (trimmed.contains("docs.google.com/spreadsheets")) {
            val sheetId = extractGoogleSheetId(trimmed)
            if (sheetId != null) {
                val csvExport = "https://docs.google.com/spreadsheets/d/$sheetId/export?format=csv"
                return ResolvedUrl(
                    directDownloadUrl = csvExport,
                    sourceType = "Google Sheets",
                    suggestedName = "Catalogo-Google-Sheets"
                )
            }
        }

        // 3. Dropbox
        if (trimmed.contains("dropbox.com")) {
            var direct = trimmed
            if (direct.contains("dl=0")) {
                direct = direct.replace("dl=0", "dl=1")
            } else if (!direct.contains("dl=1")) {
                direct = if (direct.contains("?")) "$direct&dl=1" else "$direct?dl=1"
            }
            return ResolvedUrl(
                directDownloadUrl = direct,
                sourceType = "Dropbox",
                suggestedName = extractFilenameFromUrl(trimmed)
            )
        }

        // 4. S3 / DS3 / MinIO / Cloud Object Storage
        if (trimmed.contains(".s3.") || trimmed.contains("s3.amazonaws.com") ||
            trimmed.contains("ds3") || trimmed.contains("storage.googleapis.com") ||
            trimmed.contains("digitaloceanspaces.com") || trimmed.contains("wasabisys.com")
        ) {
            return ResolvedUrl(
                directDownloadUrl = trimmed,
                sourceType = if (trimmed.contains("ds3", ignoreCase = true)) "Servidor DS3" else "Cloud S3",
                suggestedName = extractFilenameFromUrl(trimmed)
            )
        }

        // 5. GitHub Releases
        if (trimmed.contains("github.com") && trimmed.contains("/releases/download/")) {
            return ResolvedUrl(
                directDownloadUrl = trimmed,
                sourceType = "GitHub Releases",
                suggestedName = extractFilenameFromUrl(trimmed)
            )
        }

        // Default Direct HTTP/HTTPS
        return ResolvedUrl(
            directDownloadUrl = trimmed,
            sourceType = if (trimmed.startsWith("http://")) "Servidor HTTP" else "Enlace Directo",
            suggestedName = extractFilenameFromUrl(trimmed)
        )
    }

    private fun extractGoogleDriveFileId(url: String): String? {
        val filePattern = Pattern.compile("/file/d/([a-zA-Z0-9_-]+)")
        val fileMatcher = filePattern.matcher(url)
        if (fileMatcher.find()) {
            return fileMatcher.group(1)
        }

        val idPattern = Pattern.compile("[?&]id=([a-zA-Z0-9_-]+)")
        val idMatcher = idPattern.matcher(url)
        if (idMatcher.find()) {
            return idMatcher.group(1)
        }

        val dPattern = Pattern.compile("/d/([a-zA-Z0-9_-]+)")
        val dMatcher = dPattern.matcher(url)
        if (dMatcher.find()) {
            return dMatcher.group(1)
        }

        return null
    }

    private fun extractGoogleSheetId(url: String): String? {
        val sheetPattern = Pattern.compile("/spreadsheets/d/([a-zA-Z0-9_-]+)")
        val matcher = sheetPattern.matcher(url)
        return if (matcher.find()) matcher.group(1) else null
    }

    fun extractFilenameFromUrl(url: String): String {
        return try {
            val clean = url.substringBefore("?").substringBefore("#")
            val name = clean.substringAfterLast("/")
            if (name.isNotBlank()) name else "aplicacion.apk"
        } catch (_: Exception) {
            "aplicacion.apk"
        }
    }

    /**
     * Fetches a Google Sheet or CSV URL and parses rows into AppEntity list.
     * Supported CSV column headers (case-insensitive):
     * Name, Package, Version, DownloadUrl, IconUrl, Category, Description, Size
     */
    suspend fun fetchAndParseCsvFeed(
        client: OkHttpClient,
        feedUrl: String,
        feedId: Long? = null
    ): List<AppEntity> = withContext(Dispatchers.IO) {
        val resolved = resolveDirectApkUrl(feedUrl)
        val targetUrl = resolved.directDownloadUrl
        val request = Request.Builder()
            .url(targetUrl)
            .header("User-Agent", "OmniStore/1.0 (Android)")
            .build()

        try {
            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                Log.e(TAG, "Error fetching feed: ${response.code}")
                return@withContext emptyList()
            }

            val bodyString = response.body?.string() ?: return@withContext emptyList()
            parseCsvContent(bodyString, feedId, resolved.sourceType)
        } catch (e: Exception) {
            Log.e(TAG, "Exception parsing feed: ${e.message}", e)
            emptyList()
        }
    }

    private fun parseCsvContent(
        csv: String,
        feedId: Long?,
        sourceType: String
    ): List<AppEntity> {
        val lines = csv.lines().map { it.trim() }.filter { it.isNotBlank() }
        if (lines.isEmpty()) return emptyList()

        // Header detection
        val headerLine = lines.first()
        val headers = splitCsvRow(headerLine).map { it.trim().lowercase() }

        val nameIdx = headers.indexOfFirst { it.contains("name") || it.contains("nombre") || it.contains("app") }
        val packageIdx = headers.indexOfFirst { it.contains("package") || it.contains("paquete") || it.contains("id") }
        val versionIdx = headers.indexOfFirst { it.contains("version") || it.contains("ver") }
        val urlIdx = headers.indexOfFirst { it.contains("url") || it.contains("link") || it.contains("apk") || it.contains("descarga") }
        val iconIdx = headers.indexOfFirst { it.contains("icon") || it.contains("icono") || it.contains("logo") }
        val categoryIdx = headers.indexOfFirst { it.contains("cat") || it.contains("categoria") }
        val descIdx = headers.indexOfFirst { it.contains("desc") || it.contains("info") }
        val sizeIdx = headers.indexOfFirst { it.contains("size") || it.contains("tamaño") || it.contains("peso") }

        val result = mutableListOf<AppEntity>()
        for (i in 1 until lines.size) {
            val cols = splitCsvRow(lines[i])
            if (cols.isEmpty()) continue

            val rawUrl = if (urlIdx in cols.indices) cols[urlIdx].trim() else ""
            if (rawUrl.isBlank()) continue

            val resolved = resolveDirectApkUrl(rawUrl)
            val name = if (nameIdx in cols.indices && cols[nameIdx].isNotBlank()) cols[nameIdx].trim()
            else resolved.suggestedName?.substringBeforeLast(".apk") ?: "App $i"

            val pkg = if (packageIdx in cols.indices && cols[packageIdx].isNotBlank()) cols[packageIdx].trim()
            else "com.cloud.${name.lowercase().replace(Regex("[^a-z0-9]"), "")}"

            val ver = if (versionIdx in cols.indices && cols[versionIdx].isNotBlank()) cols[versionIdx].trim() else "1.0.0"
            val icon = if (iconIdx in cols.indices) cols[iconIdx].trim() else ""
            val cat = if (categoryIdx in cols.indices && cols[categoryIdx].isNotBlank()) cols[categoryIdx].trim() else "Nube"
            val desc = if (descIdx in cols.indices) cols[descIdx].trim() else "Aplicación importada desde base de datos externa ($sourceType)"
            val size = if (sizeIdx in cols.indices && cols[sizeIdx].isNotBlank()) cols[sizeIdx].trim() else "Variable"

            result.add(
                AppEntity(
                    name = name,
                    packageName = pkg,
                    versionName = ver,
                    description = desc,
                    category = cat,
                    iconUrl = icon,
                    downloadUrl = resolved.directDownloadUrl,
                    rawCloudUrl = rawUrl,
                    fileSize = size,
                    sourceType = resolved.sourceType,
                    feedId = feedId
                )
            )
        }
        return result
    }

    private fun splitCsvRow(row: String): List<String> {
        val result = mutableListOf<String>()
        val sb = java.lang.StringBuilder()
        var inQuotes = false

        for (c in row) {
            when (c) {
                '"' -> inQuotes = !inQuotes
                ',' -> {
                    if (inQuotes) {
                        sb.append(c)
                    } else {
                        result.add(sb.toString())
                        sb.setLength(0)
                    }
                }
                else -> sb.append(c)
            }
        }
        result.add(sb.toString())
        return result
    }
}
