package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.model.ApkEntity
import com.example.data.model.AppEntity
import com.example.data.model.ChatMessageEntity
import com.example.data.model.FeedEntity
import com.example.data.repository.AppStoreRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class StoreUiState(
    val apps: List<AppEntity> = emptyList(),
    val filteredApps: List<AppEntity> = emptyList(),
    val selectedCategory: String = "Todos",
    val searchQuery: String = "",
    val activeDownloads: List<AppEntity> = emptyList(),
    val selectedAppForDetail: AppEntity? = null,
    val installedPackages: Set<String> = emptySet(),
    val canInstallUnknownApps: Boolean = false,
    val cacheSizeBytes: Long = 0L,
    val feeds: List<FeedEntity> = emptyList(),
    val isImportingFeed: Boolean = false,
    val lastBackupFileName: String? = null,
    val lastBackupSizeBytes: Long = 0L,
    val isExportingBackup: Boolean = false,
    val isRestoringBackup: Boolean = false
)

data class ChatUiState(
    val messages: List<ChatMessageEntity> = emptyList(),
    val isSending: Boolean = false,
    val apiKey: String = "",
    val baseUrl: String = "",
    val model: String = "",
    val statusMessage: String? = null
)

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val database = AppDatabase.getInstance(application)
    val repository = AppStoreRepository(
        context = application,
        appDao = database.appDao(),
        apkDao = database.apkDao(),
        chatMessageDao = database.chatMessageDao(),
        feedDao = database.feedDao()
    )

    private val _storeUiState = MutableStateFlow(StoreUiState())
    val storeUiState: StateFlow<StoreUiState> = _storeUiState.asStateFlow()

    private val _chatUiState = MutableStateFlow(ChatUiState())
    val chatUiState: StateFlow<ChatUiState> = _chatUiState.asStateFlow()

    private val _toastEvent = MutableSharedFlow<String>()
    val toastEvent: SharedFlow<String> = _toastEvent.asSharedFlow()

    // Real-time StateFlow search and category filter for local APKs
    val localSearchQuery = MutableStateFlow("")
    val selectedLocalCategory = MutableStateFlow("Todos")

    val filteredLocalApks: StateFlow<List<ApkEntity>> = combine(
        repository.localApks,
        localSearchQuery,
        selectedLocalCategory
    ) { apks, query, category ->
        val categoryFiltered = if (category.equals("Todos", ignoreCase = true)) {
            apks
        } else {
            apks.filter { it.category.equals(category, ignoreCase = true) }
        }

        if (query.isBlank()) {
            categoryFiltered
        } else {
            val q = query.trim().lowercase()
            categoryFiltered.filter { apk ->
                apk.name.lowercase().contains(q) ||
                apk.version.lowercase().contains(q) ||
                apk.packageName.lowercase().contains(q) ||
                apk.category.lowercase().contains(q) ||
                (apk.localFilePath != null && apk.localFilePath.lowercase().contains(q))
            }
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    fun onLocalSearchQueryChanged(query: String) {
        localSearchQuery.value = query
    }

    fun onLocalCategorySelected(category: String) {
        selectedLocalCategory.value = category
    }

    fun updateApkCategory(apkId: Long, newCategory: String) {
        viewModelScope.launch {
            repository.updateApkCategory(apkId, newCategory)
            _toastEvent.emit("Etiqueta actualizada a \"$newCategory\"")
        }
    }

    fun installLocalApk(apk: ApkEntity) {
        val result = repository.installApkEntity(apk)
        result.onSuccess {
            viewModelScope.launch { _toastEvent.emit("Iniciando instalación nativa de ${apk.name}...") }
        }.onFailure { err ->
            viewModelScope.launch { _toastEvent.emit("Error: ${err.message}") }
        }
    }

    fun deleteLocalApk(apk: ApkEntity) {
        viewModelScope.launch {
            repository.deleteApkEntity(apk)
            _toastEvent.emit("Archivo APK de ${apk.name} eliminado")
            refreshPermissionsAndStatus()
        }
    }

    init {
        viewModelScope.launch {
            repository.initializeDefaultAppsIfEmpty()
            refreshPermissionsAndStatus()
            val latest = repository.getLatestBackupFile()
            if (latest != null && latest.exists()) {
                _storeUiState.value = _storeUiState.value.copy(
                    lastBackupFileName = latest.name,
                    lastBackupSizeBytes = latest.length()
                )
            }
        }

        // Combine apps with search and category filters
        viewModelScope.launch {
            combine(
                repository.allApps,
                _storeUiState
            ) { appsList, state ->
                val installed = appsList.filter { repository.isAppInstalled(it.packageName) }
                    .map { it.packageName }.toSet()

                val filtered = appsList.filter { app ->
                    val matchesCategory = state.selectedCategory == "Todos" ||
                            app.category.equals(state.selectedCategory, ignoreCase = true) ||
                            (state.selectedCategory == "Instaladas" && installed.contains(app.packageName)) ||
                            (state.selectedCategory == "Nube / Drive" && (app.sourceType.contains("Drive", true) || app.sourceType.contains("Nube", true))) ||
                            (state.selectedCategory == "Servidores DS3" && app.sourceType.contains("DS3", true))

                    val matchesSearch = state.searchQuery.isBlank() ||
                            app.name.contains(state.searchQuery, ignoreCase = true) ||
                            app.packageName.contains(state.searchQuery, ignoreCase = true) ||
                            app.description.contains(state.searchQuery, ignoreCase = true) ||
                            app.category.contains(state.searchQuery, ignoreCase = true)

                    matchesCategory && matchesSearch
                }

                state.copy(
                    apps = appsList,
                    filteredApps = filtered,
                    installedPackages = installed,
                    activeDownloads = appsList.filter { it.downloadStatus in listOf("DOWNLOADING", "DOWNLOADED") }
                )
            }.collect { newState ->
                _storeUiState.value = newState
            }
        }

        // Collect chat messages
        viewModelScope.launch {
            repository.chatMessages.collect { list ->
                _chatUiState.value = _chatUiState.value.copy(messages = list)
            }
        }

        // Collect feeds
        viewModelScope.launch {
            repository.feeds.collect { list ->
                _storeUiState.value = _storeUiState.value.copy(feeds = list)
            }
        }

        loadChatSettings()
    }

    fun refreshPermissionsAndStatus() {
        val canInstall = repository.canInstallUnknownApps()
        val cacheSize = repository.getCacheSize()
        _storeUiState.value = _storeUiState.value.copy(
            canInstallUnknownApps = canInstall,
            cacheSizeBytes = cacheSize
        )
    }

    fun onSearchQueryChanged(query: String) {
        _storeUiState.value = _storeUiState.value.copy(searchQuery = query)
    }

    fun onCategorySelected(category: String) {
        _storeUiState.value = _storeUiState.value.copy(selectedCategory = category)
    }

    fun selectAppForDetail(app: AppEntity?) {
        _storeUiState.value = _storeUiState.value.copy(selectedAppForDetail = app)
    }

    fun downloadAndInstall(app: AppEntity) {
        viewModelScope.launch {
            _toastEvent.emit("Iniciando descarga e instalación de ${app.name}...")
            repository.startDownload(app, autoInstallAfterDownload = true)
        }
    }

    fun downloadOnly(app: AppEntity) {
        viewModelScope.launch {
            _toastEvent.emit("Descargando archivo APK de ${app.name}...")
            repository.startDownload(app, autoInstallAfterDownload = false)
        }
    }

    fun installDownloaded(app: AppEntity) {
        val result = repository.installDownloadedApk(app)
        result.onSuccess {
            viewModelScope.launch { _toastEvent.emit("Abriendo instalador del sistema...") }
        }.onFailure { err ->
            viewModelScope.launch { _toastEvent.emit("Error: ${err.message}") }
        }
    }

    fun launchApp(app: AppEntity) {
        val success = repository.launchApp(app.packageName)
        if (!success) {
            viewModelScope.launch { _toastEvent.emit("No se pudo iniciar ${app.name}") }
        }
    }

    fun openInstallPermissionSettings() {
        repository.openInstallPermissionSettings()
    }

    fun addNewApp(
        name: String,
        packageName: String,
        version: String,
        url: String,
        category: String,
        description: String,
        iconUrl: String,
        size: String
    ) {
        viewModelScope.launch {
            if (url.isBlank()) {
                _toastEvent.emit("La URL de la APK o enlace en la nube es obligatoria")
                return@launch
            }
            repository.addCustomApp(name, packageName, version, url, category, description, iconUrl, size)
            _toastEvent.emit("¡Aplicación agregada al catálogo!")
        }
    }

    fun importFeed(feedUrl: String, feedName: String) {
        viewModelScope.launch {
            if (feedUrl.isBlank()) {
                _toastEvent.emit("Introduce una URL de Google Sheets o CSV")
                return@launch
            }
            _storeUiState.value = _storeUiState.value.copy(isImportingFeed = true)
            _toastEvent.emit("Sincronizando catálogo con base de datos externa...")
            try {
                val importedCount = repository.importFromFeed(feedUrl, feedName)
                _toastEvent.emit("¡Se importaron $importedCount aplicaciones exitosamente!")
            } catch (e: Exception) {
                _toastEvent.emit("Error al importar feed: ${e.message}")
            } finally {
                _storeUiState.value = _storeUiState.value.copy(isImportingFeed = false)
            }
        }
    }

    fun deleteApp(app: AppEntity) {
        viewModelScope.launch {
            repository.deleteApp(app)
            _toastEvent.emit("Aplicación eliminada del catálogo")
        }
    }

    fun clearCache() {
        val freed = repository.clearCache()
        val mb = freed / (1024 * 1024)
        refreshPermissionsAndStatus()
        viewModelScope.launch {
            _toastEvent.emit("Se liberaron $mb MB de archivos APK temporales")
        }
    }

    // AI Chat actions
    private fun loadChatSettings() {
        _chatUiState.value = _chatUiState.value.copy(
            apiKey = repository.getOmniRouterApiKey(),
            baseUrl = repository.getOmniRouterBaseUrl(),
            model = repository.getOmniRouterModel()
        )
    }

    fun updateChatSettings(apiKey: String, baseUrl: String, model: String) {
        repository.saveOmniRouterApiKey(apiKey)
        repository.saveOmniRouterBaseUrl(baseUrl)
        repository.saveOmniRouterModel(model)
        loadChatSettings()
        viewModelScope.launch {
            _toastEvent.emit("Ajustes de OmniRouter guardados")
        }
    }

    fun sendChatMessage(text: String) {
        if (text.isBlank()) return
        viewModelScope.launch {
            _chatUiState.value = _chatUiState.value.copy(isSending = true)
            repository.sendChatMessage(text)
            _chatUiState.value = _chatUiState.value.copy(isSending = false)
        }
    }

    fun clearChatHistory() {
        viewModelScope.launch {
            repository.clearChat()
            _toastEvent.emit("Historial de chat borrado")
        }
    }

    fun exportApkMetadataBackup(autoShare: Boolean = false) {
        viewModelScope.launch {
            _storeUiState.value = _storeUiState.value.copy(isExportingBackup = true)
            _toastEvent.emit("Exportando metadatos de APKs a archivo JSON...")
            val result = repository.exportApkMetadataToJson()
            result.onSuccess { file ->
                val sizeKb = (file.length() + 1023) / 1024
                _storeUiState.value = _storeUiState.value.copy(
                    isExportingBackup = false,
                    lastBackupFileName = file.name,
                    lastBackupSizeBytes = file.length()
                )
                _toastEvent.emit("¡Backup completado!: ${file.name} ($sizeKb KB)")
                if (autoShare) {
                    repository.shareBackupFile(file)
                }
            }.onFailure { error ->
                _storeUiState.value = _storeUiState.value.copy(isExportingBackup = false)
                _toastEvent.emit("Error al exportar backup: ${error.message}")
            }
        }
    }

    fun shareLatestBackup() {
        val file = repository.getLatestBackupFile()
        if (file != null && file.exists()) {
            val result = repository.shareBackupFile(file)
            result.onFailure {
                viewModelScope.launch { _toastEvent.emit("Error al compartir: ${it.message}") }
            }
        } else {
            // Generate immediately and share!
            exportApkMetadataBackup(autoShare = true)
        }
    }

    /**
     * Restaura los metadatos de las aplicaciones y APKs desde la última copia de seguridad local.
     */
    fun restoreLatestBackup() {
        viewModelScope.launch {
            _storeUiState.value = _storeUiState.value.copy(isRestoringBackup = true)
            _toastEvent.emit("Restaurando metadatos desde la última copia de seguridad...")
            val result = repository.restoreFromLatestBackup()
            result.onSuccess { count ->
                _storeUiState.value = _storeUiState.value.copy(isRestoringBackup = false)
                _toastEvent.emit("¡Restauración exitosa! Se restauraron $count elementos.")
                refreshPermissionsAndStatus()
            }.onFailure { error ->
                _storeUiState.value = _storeUiState.value.copy(isRestoringBackup = false)
                _toastEvent.emit("Error al restaurar copia: ${error.message}")
            }
        }
    }

    /**
     * Restaura los metadatos de las aplicaciones y APKs desde una cadena JSON provista por el usuario.
     */
    fun restoreBackupFromJson(jsonContent: String) {
        viewModelScope.launch {
            _storeUiState.value = _storeUiState.value.copy(isRestoringBackup = true)
            _toastEvent.emit("Procesando copia de seguridad JSON...")
            val result = repository.restoreApkMetadataFromJson(jsonContent)
            result.onSuccess { count ->
                _storeUiState.value = _storeUiState.value.copy(isRestoringBackup = false)
                _toastEvent.emit("¡Restauración exitosa! Se restauraron $count elementos.")
                refreshPermissionsAndStatus()
            }.onFailure { error ->
                _storeUiState.value = _storeUiState.value.copy(isRestoringBackup = false)
                _toastEvent.emit("Error al importar JSON: ${error.message}")
            }
        }
    }
}
