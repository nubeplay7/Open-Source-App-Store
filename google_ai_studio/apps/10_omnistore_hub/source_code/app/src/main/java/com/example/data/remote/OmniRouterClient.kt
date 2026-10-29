package com.example.data.remote

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class OmniRouterClient(
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
) {
    companion object {
        private const val TAG = "OmniRouterClient"
        const val DEFAULT_BASE_URL = "https://openrouter.ai/api/v1/"
        const val DEFAULT_MODEL = "google/gemini-2.0-flash-001"

        val SYSTEM_PROMPT = """
            Eres OmniStore AI, un asistente experto en gestión de aplicaciones Android (APKs), almacenamiento en la nube (Google Drive, Google Sheets, servidores S3/DS3) e instalación en dispositivos Android.
            
            Tus capacidades:
            1. Explicar cómo convertir enlaces de Google Drive en enlaces de descarga directa para APKs (cambiando /file/d/ID/view a descarga directa).
            2. Guiar a los usuarios para estructurar hojas de Google Sheets como catálogos de APKs (Nombre, Paquete, Versión, Enlace, Icono, Categoría).
            3. Ayudar a solucionar problemas de instalación de paquetes, permisos de fuentes desconocidas (REQUEST_INSTALL_PACKAGES) y compatibilidad de arquitecturas (arm64-v8a, universal).
            4. Recomendar aplicaciones seguras y de código abierto (F-Droid, NewPipe, VLC, etc.) con sus enlaces oficiales.
            5. Responder en español de forma clara, técnica pero accesible, amable y directa.
        """.trimIndent()
    }

    suspend fun sendMessage(
        apiKey: String,
        baseUrl: String,
        model: String,
        conversation: List<Pair<String, String>>, // List of Pair(role, content)
        userMessage: String
    ): Result<String> = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            return@withContext Result.failure(
                IllegalStateException("Clave API de OmniRouter no configurada. Por favor introduce tu API Key en la barra superior o en Ajustes.")
            )
        }

        try {
            val endpoint = if (baseUrl.endsWith("/")) "${baseUrl}chat/completions" else "$baseUrl/chat/completions"

            val messagesArray = JSONArray()

            // System prompt
            val sysObj = JSONObject().apply {
                put("role", "system")
                put("content", SYSTEM_PROMPT)
            }
            messagesArray.put(sysObj)

            // Conversation history (limit to last 10 messages for token efficiency)
            val history = conversation.takeLast(10)
            for ((role, content) in history) {
                val msgObj = JSONObject().apply {
                    put("role", role)
                    put("content", content)
                }
                messagesArray.put(msgObj)
            }

            // Current message
            val currentMsg = JSONObject().apply {
                put("role", "user")
                put("content", userMessage)
            }
            messagesArray.put(currentMsg)

            val rootJson = JSONObject().apply {
                put("model", model.ifBlank { DEFAULT_MODEL })
                put("messages", messagesArray)
                put("temperature", 0.7)
            }

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val requestBody = rootJson.toString().toRequestBody(mediaType)

            val request = Request.Builder()
                .url(endpoint)
                .addHeader("Authorization", "Bearer $apiKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("HTTP-Referer", "https://omnistore.aistudio.com")
                .addHeader("X-Title", "OmniStore APK Manager")
                .post(requestBody)
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                Log.e(TAG, "OmniRouter error: ${response.code} -> $responseBody")
                val errorMsg = try {
                    val errJson = JSONObject(responseBody)
                    errJson.optJSONObject("error")?.optString("message")
                        ?: "Error ${response.code}: $responseBody"
                } catch (_: Exception) {
                    "Error ${response.code}: $responseBody"
                }
                return@withContext Result.failure(Exception(errorMsg))
            }

            val jsonRes = JSONObject(responseBody)
            val choices = jsonRes.optJSONArray("choices")
            if (choices != null && choices.length() > 0) {
                val firstChoice = choices.getJSONObject(0)
                val msg = firstChoice.optJSONObject("message")
                val text = msg?.optString("content") ?: ""
                return@withContext Result.success(text.trim())
            }

            return@withContext Result.failure(Exception("Respuesta vacía del servicio OmniRouter"))
        } catch (e: Exception) {
            Log.e(TAG, "Request exception: ${e.message}", e)
            return@withContext Result.failure(e)
        }
    }
}
