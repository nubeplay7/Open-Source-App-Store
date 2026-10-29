package com.example.data.repository

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import androidx.core.content.FileProvider
import com.example.data.installer.ApkInstaller
import com.example.data.installer.DownloadManager
import com.example.data.installer.PackageInstallerService
import com.example.data.local.ApkDao
import com.example.data.local.AppDao
import com.example.data.local.ChatMessageDao
import com.example.data.local.FeedDao
import com.example.data.model.ApkEntity
import com.example.data.model.AppEntity
import com.example.data.model.ChatMessageEntity
import com.example.data.model.FeedEntity
import com.example.data.remote.CloudUrlResolver
import com.example.data.remote.OmniRouterClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AppStoreRepository(
    private val context: Context,
    private val appDao: AppDao,
    private val apkDao: ApkDao,
    private val chatMessageDao: ChatMessageDao,
    private val feedDao: FeedDao,
    private val downloadManager: DownloadManager = DownloadManager(context),
    private val omniRouterClient: OmniRouterClient = OmniRouterClient(),
    private val okHttpClient: OkHttpClient = OkHttpClient()
) {
    val allApps: Flow<List<AppEntity>> = appDao.getAllApps()
    val activeAndDownloadedApps: Flow<List<AppEntity>> = appDao.getActiveAndDownloadedApps()
    val allApks: Flow<List<ApkEntity>> = apkDao.getAllApks()
    val localApks: Flow<List<ApkEntity>> = apkDao.getLocalApks()
    val chatMessages: Flow<List<ChatMessageEntity>> = chatMessageDao.getAllMessages()
    val feeds: Flow<List<FeedEntity>> = feedDao.getAllFeeds()

    private val prefs: SharedPreferences =
        context.getSharedPreferences("omnistore_prefs", Context.MODE_PRIVATE)

    companion object {
        const val PREF_OMNIROUTER_API_KEY = "omnirouter_api_key"
        const val PREF_OMNIROUTER_BASE_URL = "omnirouter_base_url"
        const val PREF_OMNIROUTER_MODEL = "omnirouter_model"
        const val PREF_INSTALL_MODE = "install_mode" // "AUTO" or "MANUAL"
    }

    suspend fun initializeDefaultAppsIfEmpty() = withContext(Dispatchers.IO) {
        val count = appDao.getAppCount()
        if (count == 0) {
            val defaultApps = listOf(
                AppEntity(
                    name = "F-Droid",
                    packageName = "org.fdroid.fdroid",
                    versionName = "1.21.0",
                    versionCode = 1021050,
                    description = "Catálogo independiente y libre de aplicaciones FOSS para Android. Repositorio comunitario.",
                    category = "Herramientas",
                    iconUrl = "https://f-droid.org/assets/fdroid-logo-text.png",
                    downloadUrl = "https://f-droid.org/F-Droid.apk",
                    rawCloudUrl = "https://f-droid.org/F-Droid.apk",
                    fileSize = "11.2 MB",
                    sourceType = "Enlace Directo"
                ),
                AppEntity(
                    name = "NewPipe",
                    packageName = "org.schabi.newpipe",
                    versionName = "0.27.2",
                    versionCode = 998,
                    description = "Cliente ligero y privado para reproducción multimedia y YouTube sin anuncios ni servicios de Google.",
                    category = "Multimedia",
                    iconUrl = "https://raw.githubusercontent.com/TeamNewPipe/NewPipe/dev/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png",
                    downloadUrl = "https://github.com/TeamNewPipe/NewPipe/releases/download/v0.27.2/NewPipe_v0.27.2.apk",
                    rawCloudUrl = "https://github.com/TeamNewPipe/NewPipe/releases/download/v0.27.2/NewPipe_v0.27.2.apk",
                    fileSize = "11.8 MB",
                    sourceType = "GitHub Releases"
                ),
                AppEntity(
                    name = "VLC Media Player",
                    packageName = "org.videolan.vlc",
                    versionName = "3.5.4",
                    versionCode = 3050400,
                    description = "Reproductor multimedia de código abierto y universal. Soporta todos los formatos de vídeo y audio.",
                    category = "Multimedia",
                    iconUrl = "https://images.videolan.org/images/icons-VLC/vlc.mini.png",
                    downloadUrl = "https://get.videolan.org/vlc-android/3.5.4/VLC-Android-3.5.4-arm64-v8a.apk",
                    rawCloudUrl = "https://get.videolan.org/vlc-android/3.5.4/VLC-Android-3.5.4-arm64-v8a.apk",
                    fileSize = "35.2 MB",
                    sourceType = "Servidor Directo"
                ),
                AppEntity(
                    name = "K-9 Mail / Thunderbird",
                    packageName = "com.fsck.k9",
                    versionName = "6.804",
                    versionCode = 37004,
                    description = "Cliente de correo electrónico potente y seguro con soporte IMAP, POP3 y cifrado OpenPGP.",
                    category = "Productividad",
                    iconUrl = "https://raw.githubusercontent.com/thunderbird/thunderbird-android/main/app/ui/legacy/src/main/res/mipmap-xxxhdpi/ic_launcher.png",
                    downloadUrl = "https://github.com/thunderbird/thunderbird-android/releases/download/K9Mail-6.804/k9-6.804.apk",
                    rawCloudUrl = "https://github.com/thunderbird/thunderbird-android/releases/download/K9Mail-6.804/k9-6.804.apk",
                    fileSize = "14.6 MB",
                    sourceType = "GitHub Releases"
                ),
                AppEntity(
                    name = "Joplin Notes",
                    packageName = "net.cozic.joplin",
                    versionName = "2.14.9",
                    versionCode = 2149,
                    description = "Aplicación de toma de notas seguras y sincronización en la nube (Nextcloud, Dropbox, S3, WebDAV).",
                    category = "Productividad",
                    iconUrl = "https://joplinapp.org/images/Icon512.png",
                    downloadUrl = "https://github.com/laurent22/joplin-android/releases/download/v2.14.9/joplin-v2.14.9.apk",
                    rawCloudUrl = "https://github.com/laurent22/joplin-android/releases/download/v2.14.9/joplin-v2.14.9.apk",
                    fileSize = "42.1 MB",
                    sourceType = "GitHub Releases"
                ),
                AppEntity(
                    name = "App Nube (Google Drive Demo)",
                    packageName = "com.cloud.googledrive.sample",
                    versionName = "1.0.0",
                    versionCode = 1,
                    description = "Ejemplo enlazado a Google Drive en la nube. Convierte automáticamente el ID a descarga directa de APK.",
                    category = "Nube / Drive",
                    iconUrl = "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png",
                    downloadUrl = "https://drive.usercontent.google.com/download?id=1demoGoogleDriveApkId&export=download",
                    rawCloudUrl = "https://drive.google.com/file/d/1demoGoogleDriveApkId/view?usp=sharing",
                    fileSize = "15.0 MB",
                    sourceType = "Google Drive"
                ),
                AppEntity(
                    name = "Servidor DS3 Almacenamiento",
                    packageName = "com.cloud.ds3.sample",
                    versionName = "2.1.0",
                    versionCode = 21,
                    description = "Ejemplo enlazado a un bucket S3 / servidor DS3 para descarga directa e instalación nativa.",
                    category = "Tools",
                    iconUrl = "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png",
                    downloadUrl = "https://ds3-storage.cloud/apks/release-build.apk",
                    rawCloudUrl = "https://ds3-storage.cloud/apks/release-build.apk",
                    fileSize = "22.5 MB",
                    sourceType = "Servidor DS3"
                ),
                AppEntity(
                    name = "Pixel Dungeon",
                    packageName = "com.watabou.pixeldungeon",
                    versionName = "1.9.2a",
                    versionCode = 35,
                    description = "Juego roguelike tradicional de exploración de mazmorras de código abierto.",
                    category = "Games",
                    iconUrl = "https://raw.githubusercontent.com/watabou/pixel-dungeon/master/src/main/assets/icons/icon.png",
                    downloadUrl = "https://github.com/watabou/pixel-dungeon/releases/download/v1.9.2a/PixelDungeon.apk",
                    rawCloudUrl = "https://github.com/watabou/pixel-dungeon/releases/download/v1.9.2a/PixelDungeon.apk",
                    fileSize = "8.4 MB",
                    sourceType = "GitHub Releases"
                ),
                AppEntity(
                    name = "Tusky para Mastodon",
                    packageName = "com.keylesspalace.tusky",
                    versionName = "24.0",
                    versionCode = 300,
                    description = "Cliente ligero y libre para la red social descentralizada Mastodon y Fediverse.",
                    category = "Social",
                    iconUrl = "https://raw.githubusercontent.com/tuskyapp/Tusky/develop/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png",
                    downloadUrl = "https://github.com/tuskyapp/Tusky/releases/download/v24.0/Tusky-v24.0.apk",
                    rawCloudUrl = "https://github.com/tuskyapp/Tusky/releases/download/v24.0/Tusky-v24.0.apk",
                    fileSize = "18.1 MB",
                    sourceType = "GitHub Releases"
                )
            )
            appDao.insertApps(defaultApps)

            val apkStorageDir = File(context.getExternalFilesDir(null), "apks")
            if (!apkStorageDir.exists()) apkStorageDir.mkdirs()

            val defaultApks = defaultApps.mapIndexed { index, it ->
                val category = normalizeApkCategory(it.category)
                // Seed the first 3 with a local path so they appear immediately in the local APKs tab
                val isLocalSample = index in 0..2
                val sampleFileName = "${it.name.replace(" ", "_")}_${it.versionName}.apk"
                val sampleFile = File(apkStorageDir, sampleFileName)
                if (isLocalSample && !sampleFile.exists()) {
                    try { sampleFile.writeBytes("Demo APK Content".toByteArray()) } catch (ignored: Exception) {}
                }

                ApkEntity(
                    name = it.name,
                    version = it.versionName,
                    icon = it.iconUrl,
                    sourceUrl = it.downloadUrl,
                    category = category,
                    installStatus = if (isLocalSample) "DOWNLOADED" else "NOT_INSTALLED",
                    packageName = it.packageName,
                    localFilePath = if (isLocalSample) sampleFile.absolutePath else null,
                    fileSize = it.fileSize
                )
            }
            apkDao.insertApks(defaultApks)

            // Initial welcome message in AI Chat
            chatMessageDao.insertMessage(
                ChatMessageEntity(
                    role = "assistant",
                    content = "¡Hola! Soy tu asistente de OmniStore. Puedo ayudarte a:\n\n" +
                            "• Obtener enlaces directos de APKs almacenados en **Google Drive**, **Google Sheets** o **servidores DS3/S3**.\n" +
                            "• Gestionar tu biblioteca de APKs con etiquetas como **Games**, **Tools**, **Social**, **Media** y **Productivity**.\n" +
                            "• Solucionar dudas sobre la instalación de aplicaciones y permisos en Android.\n\n" +
                            "¿En qué aplicación o categoría te puedo colaborar hoy?"
                )
            )
        }
    }

    fun normalizeApkCategory(raw: String): String {
        return when (raw.trim().lowercase()) {
            "juegos", "games", "game" -> "Games"
            "herramientas", "tools", "utilidades", "servidores ds3", "nube / drive" -> "Tools"
            "social", "comunicación", "comunicacion", "redes" -> "Social"
            "multimedia", "media", "video", "audio", "música" -> "Media"
            "productividad", "productivity", "oficina" -> "Productivity"
            else -> if (raw.isNotBlank()) raw.replaceFirstChar { it.uppercase() } else "Tools"
        }
    }

    suspend fun updateApkCategory(apkId: Long, newCategory: String) = withContext(Dispatchers.IO) {
        apkDao.updateCategory(apkId, normalizeApkCategory(newCategory))
    }

    suspend fun addCustomApp(
        name: String,
        packageName: String,
        version: String,
        url: String,
        category: String,
        description: String,
        iconUrl: String,
        size: String
    ): Long = withContext(Dispatchers.IO) {
        val resolved = CloudUrlResolver.resolveDirectApkUrl(url)
        val normalizedCategory = normalizeApkCategory(category)
        val app = AppEntity(
            name = name.ifBlank { resolved.suggestedName?.substringBeforeLast(".apk") ?: "Nueva App" },
            packageName = packageName.ifBlank { "com.custom.${System.currentTimeMillis()}" },
            versionName = version.ifBlank { "1.0.0" },
            description = description.ifBlank { "Aplicación agregada desde ${resolved.sourceType}" },
            category = normalizedCategory,
            iconUrl = iconUrl,
            downloadUrl = resolved.directDownloadUrl,
            rawCloudUrl = url,
            fileSize = size.ifBlank { "Desconocido" },
            sourceType = resolved.sourceType
        )
        val id = appDao.insertApp(app)
        apkDao.insertApk(
            ApkEntity(
                name = app.name,
                version = app.versionName,
                icon = app.iconUrl,
                sourceUrl = app.downloadUrl,
                category = normalizedCategory,
                installStatus = "NOT_INSTALLED",
                packageName = app.packageName,
                fileSize = app.fileSize
            )
        )
        id
    }

    suspend fun importFromFeed(feedUrl: String, feedName: String): Int = withContext(Dispatchers.IO) {
        val feedEntity = FeedEntity(
            name = feedName.ifBlank { "Feed Nube" },
            url = feedUrl,
            feedType = if (feedUrl.contains("spreadsheets")) "GOOGLE_SHEETS" else "CSV",
            lastSyncTimestamp = System.currentTimeMillis()
        )
        val feedId = feedDao.insertFeed(feedEntity)

        val parsedApps = CloudUrlResolver.fetchAndParseCsvFeed(okHttpClient, feedUrl, feedId)
        if (parsedApps.isNotEmpty()) {
            appDao.insertApps(parsedApps)
            val apks = parsedApps.map {
                ApkEntity(
                    name = it.name,
                    version = it.versionName,
                    icon = it.iconUrl,
                    sourceUrl = it.downloadUrl,
                    category = normalizeApkCategory(it.category),
                    installStatus = "NOT_INSTALLED",
                    packageName = it.packageName,
                    fileSize = it.fileSize
                )
            }
            apkDao.insertApks(apks)
        }
        parsedApps.size
    }

    suspend fun deleteApp(app: AppEntity) = withContext(Dispatchers.IO) {
        // Delete local apk if exists
        app.localApkPath?.let { path ->
            val file = File(path)
            if (file.exists()) file.delete()
        }
        appDao.deleteApp(app)
        apkDao.getApkByPackageName(app.packageName)?.let {
            apkDao.deleteApk(it)
        }
    }

    suspend fun deleteApkEntity(apk: ApkEntity) = withContext(Dispatchers.IO) {
        apk.localFilePath?.let { path ->
            val file = File(path)
            if (file.exists()) file.delete()
        }
        apkDao.deleteApk(apk)
        appDao.getAppByPackageName(apk.packageName)?.let {
            appDao.deleteApp(it)
        }
    }

    suspend fun startDownload(app: AppEntity, autoInstallAfterDownload: Boolean = true) = withContext(Dispatchers.IO) {
        appDao.updateDownloadProgress(app.id, "DOWNLOADING", 0f, null)
        apkDao.getApkByPackageName(app.packageName)?.let {
            apkDao.updateProgress(it.id, "DOWNLOADING", 0f)
        }

        val sanitizedName = app.name.replace(Regex("[^a-zA-Z0-9_.-]"), "_")
        val fileName = "${sanitizedName}_${app.versionName}.apk"

        downloadManager.downloadApk(
            downloadUrl = app.downloadUrl,
            fileName = fileName,
            notificationId = (app.id % 10000).toInt() + 100,
            appName = app.name
        ).collect { state ->
            when (state) {
                is DownloadManager.DownloadState.Progress -> {
                    appDao.updateDownloadProgress(app.id, "DOWNLOADING", state.percentage, null)
                    apkDao.getApkByPackageName(app.packageName)?.let {
                        apkDao.updateProgress(it.id, "DOWNLOADING", state.percentage)
                    }
                }
                is DownloadManager.DownloadState.Completed -> {
                    val apkFile = state.file
                    appDao.markDownloadComplete(app.id, apkFile.absolutePath, "DOWNLOADED")
                    val existingApk = apkDao.getApkByPackageName(app.packageName)
                    if (existingApk != null) {
                        apkDao.markDownloaded(existingApk.id, apkFile.absolutePath, "DOWNLOADED")
                    } else {
                        apkDao.insertApk(
                            ApkEntity(
                                name = app.name,
                                version = app.versionName,
                                icon = app.iconUrl,
                                sourceUrl = app.downloadUrl,
                                installStatus = "DOWNLOADED",
                                localFilePath = apkFile.absolutePath,
                                packageName = app.packageName,
                                fileSize = app.fileSize
                            )
                        )
                    }

                    if (autoInstallAfterDownload) {
                        installDownloadedApk(app.copy(localApkPath = apkFile.absolutePath))
                    }
                }
                is DownloadManager.DownloadState.Failed -> {
                    appDao.updateDownloadProgress(app.id, "ERROR", 0f, state.error)
                    apkDao.getApkByPackageName(app.packageName)?.let {
                        apkDao.updateProgress(it.id, "FAILED", 0f)
                    }
                }
                is DownloadManager.DownloadState.Cancelled -> {
                    appDao.updateDownloadProgress(app.id, "IDLE", 0f, "Cancelado")
                }
            }
        }
    }

    fun installDownloadedApk(app: AppEntity): Result<Unit> {
        val path = app.localApkPath ?: return Result.failure(IllegalStateException("No hay APK descargado"))
        val file = File(path)
        if (!file.exists()) {
            return Result.failure(IllegalStateException("El archivo APK no se encuentra en el almacenamiento"))
        }

        // Check install permission
        if (!ApkInstaller.canInstallPackages(context)) {
            val settingsIntent = ApkInstaller.getInstallPermissionIntent(context)
            context.startActivity(settingsIntent)
            return Result.failure(SecurityException("Permiso de instalación de fuentes requerido. Se abrió Ajustes para concederlo."))
        }

        // Launch native installation via PackageInstallerService
        PackageInstallerService.startInstall(context, file, app.name)
        return Result.success(Unit)
    }

    fun installApkEntity(apk: ApkEntity): Result<Unit> {
        val path = apk.localFilePath ?: return Result.failure(IllegalStateException("No hay archivo local disponible"))
        val file = File(path)
        if (!file.exists()) {
            return Result.failure(IllegalStateException("El archivo APK no se encuentra en el almacenamiento"))
        }
        if (!ApkInstaller.canInstallPackages(context)) {
            val settingsIntent = ApkInstaller.getInstallPermissionIntent(context)
            context.startActivity(settingsIntent)
            return Result.failure(SecurityException("Permiso de instalación de fuentes requerido"))
        }
        PackageInstallerService.startInstall(context, file, apk.name)
        return Result.success(Unit)
    }

    fun isAppInstalled(packageName: String): Boolean {
        return ApkInstaller.getInstalledPackageInfo(context, packageName) != null
    }

    fun launchApp(packageName: String): Boolean {
        return ApkInstaller.launchInstalledApp(context, packageName)
    }

    fun canInstallUnknownApps(): Boolean {
        return ApkInstaller.canInstallPackages(context)
    }

    fun openInstallPermissionSettings() {
        context.startActivity(ApkInstaller.getInstallPermissionIntent(context))
    }

    fun clearCache(): Long {
        return downloadManager.clearDownloadedApks()
    }

    fun getCacheSize(): Long {
        return downloadManager.getDownloadedApksSize()
    }

    // AI Chat & OmniRouter configuration
    fun getOmniRouterApiKey(): String {
        return prefs.getString(PREF_OMNIROUTER_API_KEY, "") ?: ""
    }

    fun saveOmniRouterApiKey(key: String) {
        prefs.edit().putString(PREF_OMNIROUTER_API_KEY, key.trim()).apply()
    }

    fun getOmniRouterBaseUrl(): String {
        return prefs.getString(PREF_OMNIROUTER_BASE_URL, OmniRouterClient.DEFAULT_BASE_URL) ?: OmniRouterClient.DEFAULT_BASE_URL
    }

    fun saveOmniRouterBaseUrl(url: String) {
        prefs.edit().putString(PREF_OMNIROUTER_BASE_URL, url.trim()).apply()
    }

    fun getOmniRouterModel(): String {
        return prefs.getString(PREF_OMNIROUTER_MODEL, OmniRouterClient.DEFAULT_MODEL) ?: OmniRouterClient.DEFAULT_MODEL
    }

    fun saveOmniRouterModel(model: String) {
        prefs.edit().putString(PREF_OMNIROUTER_MODEL, model.trim()).apply()
    }

    suspend fun sendChatMessage(userText: String): Result<String> = withContext(Dispatchers.IO) {
        // Save user message
        chatMessageDao.insertMessage(
            ChatMessageEntity(role = "user", content = userText)
        )

        val apiKey = getOmniRouterApiKey()
        val baseUrl = getOmniRouterBaseUrl()
        val model = getOmniRouterModel()

        // If no API key configured, respond with helpful built-in assistant knowledge
        if (apiKey.isBlank()) {
            val offlineResponse = generateLocalAssistantResponse(userText)
            chatMessageDao.insertMessage(
                ChatMessageEntity(role = "assistant", content = offlineResponse)
            )
            return@withContext Result.success(offlineResponse)
        }

        // Fetch recent messages for context
        val historyEntities = chatMessages.first().takeLast(8)
        val conversationPairs = historyEntities.map { it.role to it.content }

        val apiResult = omniRouterClient.sendMessage(
            apiKey = apiKey,
            baseUrl = baseUrl,
            model = model,
            conversation = conversationPairs,
            userMessage = userText
        )

        apiResult.onSuccess { reply ->
            chatMessageDao.insertMessage(
                ChatMessageEntity(role = "assistant", content = reply)
            )
        }.onFailure { err ->
            chatMessageDao.insertMessage(
                ChatMessageEntity(
                    role = "assistant",
                    content = "⚠️ Error al conectar con OmniRouter: ${err.message}\n\nPuedes verificar tu API Key y URL en Ajustes o chatear en modo local."
                )
            )
        }

        apiResult
    }

    suspend fun clearChat() = withContext(Dispatchers.IO) {
        chatMessageDao.clearChat()
    }

    private fun generateLocalAssistantResponse(query: String): String {
        val q = query.lowercase()
        return when {
            q.contains("drive") || q.contains("google drive") -> {
                "📁 **Cómo usar APKs en Google Drive con OmniStore:**\n\n" +
                "1. Sube tu archivo `.apk` a tu Google Drive.\n" +
                "2. Haz clic derecho en el archivo -> **Compartir** -> Acceso general: **Cualquier persona con el enlace** (Lector).\n" +
                "3. Copia el enlace (formato `https://drive.google.com/file/d/ID/view`).\n" +
                "4. En OmniStore, ve a la pestaña **Añadir Fuentes** y pega el enlace.\n" +
                "¡OmniStore convertirá automáticamente el enlace a descarga directa e instalará el APK en tu dispositivo sin pasos intermedios!"
            }
            q.contains("sheet") || q.contains("hoja") || q.contains("chips") || q.contains("base de datos") -> {
                "📊 **Catálogo de APKs con Google Sheets:**\n\n" +
                "Puedes enlazar una hoja de cálculo como base de datos de APKs:\n" +
                "1. Crea una hoja en Google Sheets con las columnas: `Nombre, Paquete, Versión, Enlace, Icono, Categoria, Descripcion`.\n" +
                "2. Coloca en 'Enlace' las URLs de tus APKs (Google Drive, S3, o enlace directo).\n" +
                "3. Comparte la hoja como pública ('Cualquier persona con el enlace').\n" +
                "4. Pega la URL en la pestaña **Añadir Fuentes** -> **Importar desde Google Sheets**.\n" +
                "OmniStore descargará todas las apps a tu catálogo local instantáneamente."
            }
            q.contains("s3") || q.contains("ds3") || q.contains("servidor") || q.contains("nube") -> {
                "☁️ **Servidores S3 / DS3 y Almacenamiento en la Nube:**\n\n" +
                "OmniStore soporta cualquier bucket S3, servidor DS3, Wasabi, MinIO o servidor HTTP/HTTPS propio:\n" +
                "• Solo necesitas que el objeto APK tenga permiso de lectura pública o una URL prefirmada.\n" +
                "• Pega la URL directa en **Añadir Fuentes** y la app gestionará la descarga por streaming e instalación nativa."
            }
            q.contains("permiso") || q.contains("instalar") || q.contains("fuentes") -> {
                "⚙️ **Instalación fluida en Android:**\n\n" +
                "Para que OmniStore instale aplicaciones de forma totalmente fluida como una tienda:\n" +
                "1. Android requiere conceder una sola vez el permiso: **'Instalar aplicaciones desconocidas'** a OmniStore.\n" +
                "2. Puedes activarlo directamente desde la sección **Ajustes** o en el botón de la pestaña **Descargas**.\n" +
                "3. Una vez activado, cualquier APK se instalará de inmediato con un solo toque."
            }
            q.contains("api") || q.contains("omnirouter") || q.contains("clave") || q.contains("key") -> {
                "🔑 **Configuración de OmniRouter / OpenRouter:**\n\n" +
                "1. Obtén tu API Key en [OpenRouter.ai](https://openrouter.ai) o tu proveedor compatible con OmniRouter.\n" +
                "2. Ve a la pestaña **Ajustes** en OmniStore.\n" +
                "3. Ingresa tu API Key, la URL base (por defecto `https://openrouter.ai/api/v1/`) y el modelo que prefieras (ej. `google/gemini-2.0-flash-001` o `meta-llama/llama-3.3-70b-instruct`).\n" +
                "¡Podrás hacerme cualquier pregunta técnica y consultar enlaces en tiempo real!"
            }
            else -> {
                "🤖 Estoy aquí para ayudarte a gestionar tus APKs desde Google Drive, Google Sheets, servidores S3/DS3 y cualquier almacenamiento en la nube.\n\n" +
                "💡 **Preguntas frecuentes:**\n" +
                "• *'¿Cómo compartir APKs desde Google Drive?'*\n" +
                "• *'¿Cómo armar una base de datos en Google Sheets?'*\n" +
                "• *'¿Cómo funciona la instalación de APKs sin Play Store?'*\n" +
                "• *'¿Cómo exportar una copia de seguridad JSON de mis APKs?'*\n" +
                "• *'¿Cómo configurar mi API Key de OmniRouter?'*\n\n" +
                "*(Nota: Puedes configurar tu API Key de OmniRouter/OpenRouter en Ajustes para respuestas ilimitadas con modelos de IA en la nube)*."
            }
        }
    }

    /**
     * Exports the list of APK metadata and applications from the Room database
     * to a formatted JSON backup file stored in the app's external backups directory.
     */
    suspend fun exportApkMetadataToJson(): Result<File> = withContext(Dispatchers.IO) {
        try {
            val apks = apkDao.getAllApksList()
            val apps = appDao.getAllAppsList()

            val rootJson = JSONObject()
            rootJson.put("app", "OmniStore")
            rootJson.put("version", "1.0.0")
            val nowIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
            rootJson.put("exportedAt", nowIso)
            rootJson.put("totalApks", apks.size)
            rootJson.put("totalAppsCatalog", apps.size)

            val apksArray = JSONArray()
            for (apk in apks) {
                val item = JSONObject()
                item.put("id", apk.id)
                item.put("name", apk.name)
                item.put("version", apk.version)
                item.put("category", apk.category)
                item.put("packageName", apk.packageName)
                item.put("sourceUrl", apk.sourceUrl)
                item.put("installStatus", apk.installStatus)
                item.put("localFilePath", apk.localFilePath ?: "")
                item.put("fileSize", apk.fileSize)
                item.put("downloadProgress", apk.downloadProgress.toDouble())
                item.put("timestamp", apk.timestamp)
                apksArray.put(item)
            }
            rootJson.put("apks", apksArray)

            val appsArray = JSONArray()
            for (app in apps) {
                val item = JSONObject()
                item.put("id", app.id)
                item.put("name", app.name)
                item.put("packageName", app.packageName)
                item.put("versionName", app.versionName)
                item.put("versionCode", app.versionCode)
                item.put("description", app.description)
                item.put("category", app.category)
                item.put("iconUrl", app.iconUrl)
                item.put("downloadUrl", app.downloadUrl)
                item.put("rawCloudUrl", app.rawCloudUrl)
                item.put("fileSize", app.fileSize)
                item.put("sourceType", app.sourceType)
                appsArray.put(item)
            }
            rootJson.put("appsCatalog", appsArray)

            val backupsDir = File(context.getExternalFilesDir(null), "backups")
            if (!backupsDir.exists()) {
                backupsDir.mkdirs()
            }
            val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
            val backupFile = File(backupsDir, "omnistore_apks_backup_$timestamp.json")
            backupFile.writeText(rootJson.toString(2), Charsets.UTF_8)

            Result.success(backupFile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Shares a backup JSON file using Android FileProvider and the system share sheet.
     */
    fun shareBackupFile(file: File): Result<Unit> {
        return try {
            val uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "application/json"
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, "Copia de Seguridad OmniStore - ${file.name}")
                putExtra(Intent.EXTRA_TEXT, "Copia de seguridad en formato JSON de la lista de metadatos de APKs (${file.name}).")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            val chooser = Intent.createChooser(shareIntent, "Compartir o Guardar Copia de Seguridad").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(chooser)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Restaura los metadatos de APKs y el catálogo de aplicaciones desde una cadena de texto en formato JSON.
     * Este método parsea el archivo de copia de seguridad, valida la estructura y fusiona
     * los registros en la base de datos Room evitando colisiones y actualizando estados.
     *
     * @param jsonContent Contenido del archivo JSON de copia de seguridad.
     * @return Result con el número de elementos (APKs y Apps) restaurados exitosamente.
     */
    suspend fun restoreApkMetadataFromJson(jsonContent: String): Result<Int> = withContext(Dispatchers.IO) {
        try {
            val root = JSONObject(jsonContent)
            var restoredCount = 0

            // 1. Restaurar lista de APKs
            val apksArray = root.optJSONArray("apks")
            if (apksArray != null) {
                for (i in 0 until apksArray.length()) {
                    val item = apksArray.optJSONObject(i) ?: continue
                    val pkgName = item.optString("packageName", "").trim()
                    val sourceUrl = item.optString("sourceUrl", "").trim()
                    if (pkgName.isEmpty() && sourceUrl.isEmpty()) continue

                    val existing = if (pkgName.isNotEmpty()) apkDao.getApkByPackageName(pkgName) else null
                    val existingByUrl = if (existing == null && sourceUrl.isNotEmpty()) apkDao.getApkByUrl(sourceUrl) else null
                    val target = existing ?: existingByUrl

                    val localPath = item.optString("localFilePath", "").takeIf { it.isNotBlank() }
                    // Validar si el archivo local existe en disco
                    val finalLocalPath = if (localPath != null && File(localPath).exists()) localPath else null

                    val apkEntity = ApkEntity(
                        id = target?.id ?: 0,
                        name = item.optString("name", "App Restaurada"),
                        version = item.optString("version", "1.0.0"),
                        icon = item.optString("icon", ""),
                        sourceUrl = sourceUrl,
                        category = normalizeApkCategory(item.optString("category", "Tools")),
                        installStatus = if (finalLocalPath != null) "DOWNLOADED" else item.optString("installStatus", "NOT_INSTALLED"),
                        packageName = pkgName.ifEmpty { "com.restored.${System.currentTimeMillis()}_$i" },
                        localFilePath = finalLocalPath,
                        fileSize = item.optString("fileSize", "Variable"),
                        downloadProgress = if (finalLocalPath != null) 1f else item.optDouble("downloadProgress", 0.0).toFloat(),
                        timestamp = item.optLong("timestamp", System.currentTimeMillis())
                    )

                    apkDao.insertApk(apkEntity)
                    restoredCount++
                }
            }

            // 2. Restaurar catálogo de aplicaciones
            val appsArray = root.optJSONArray("appsCatalog")
            if (appsArray != null) {
                for (i in 0 until appsArray.length()) {
                    val item = appsArray.optJSONObject(i) ?: continue
                    val pkgName = item.optString("packageName", "").trim()
                    if (pkgName.isEmpty()) continue

                    val existing = appDao.getAppByPackageName(pkgName)
                    val appEntity = AppEntity(
                        id = existing?.id ?: 0,
                        name = item.optString("name", "App"),
                        packageName = pkgName,
                        versionName = item.optString("versionName", "1.0.0"),
                        versionCode = item.optLong("versionCode", 1L),
                        description = item.optString("description", "Aplicación restaurada desde copia de seguridad"),
                        category = normalizeApkCategory(item.optString("category", "Herramientas")),
                        iconUrl = item.optString("iconUrl", ""),
                        downloadUrl = item.optString("downloadUrl", ""),
                        rawCloudUrl = item.optString("rawCloudUrl", ""),
                        fileSize = item.optString("fileSize", "Desconocido"),
                        sourceType = item.optString("sourceType", "Copia de Seguridad")
                    )
                    appDao.insertApp(appEntity)
                    restoredCount++
                }
            }

            Result.success(restoredCount)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Restaura los metadatos desde el archivo de copia de seguridad más reciente disponible en disco.
     */
    suspend fun restoreFromLatestBackup(): Result<Int> = withContext(Dispatchers.IO) {
        val latestFile = getLatestBackupFile()
            ?: return@withContext Result.failure(IllegalStateException("No se encontraron archivos de copia de seguridad previos."))
        try {
            val jsonText = latestFile.readText(Charsets.UTF_8)
            restoreApkMetadataFromJson(jsonText)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getLatestBackupFile(): File? {
        val backupsDir = File(context.getExternalFilesDir(null), "backups")
        if (!backupsDir.exists()) return null
        return backupsDir.listFiles { file -> file.extension.lowercase() == "json" }
            ?.maxByOrNull { it.lastModified() }
    }

    fun getBackupFiles(): List<File> {
        val backupsDir = File(context.getExternalFilesDir(null), "backups")
        if (!backupsDir.exists()) return emptyList()
        return backupsDir.listFiles { file -> file.extension.lowercase() == "json" }
            ?.sortedByDescending { it.lastModified() } ?: emptyList()
    }
}
