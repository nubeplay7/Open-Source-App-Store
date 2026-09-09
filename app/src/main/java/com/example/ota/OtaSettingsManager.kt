package com.example.ota

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Estado observable de las preferencias de actualización del usuario
 */
data class OtaSettings(
    val autoUpdateEnabled: Boolean = true,
    val useShizukuEnabled: Boolean = true,
    val lastCheckTimestamp: Long = 0L,
    val preferredEndpoint: String = "https://appstore.civer.cloud"
)

/**
 * Administrador de configuración y preferencias de actualización OTA
 * Persiste las decisiones del usuario en SharedPreferences con reactividad StateFlow.
 */
class OtaSettingsManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private val _settings = MutableStateFlow(
        OtaSettings(
            autoUpdateEnabled = prefs.getBoolean(KEY_AUTO_UPDATE, true),
            useShizukuEnabled = prefs.getBoolean(KEY_USE_SHIZUKU, true),
            lastCheckTimestamp = prefs.getLong(KEY_LAST_CHECK, 0L),
            preferredEndpoint = prefs.getString(KEY_ENDPOINT, "https://appstore.civer.cloud") ?: "https://appstore.civer.cloud"
        )
    )
    val settings: StateFlow<OtaSettings> = _settings.asStateFlow()

    companion object {
        private const val PREFS_NAME = "civer_ota_settings"
        private const val KEY_AUTO_UPDATE = "auto_update_enabled"
        private const val KEY_USE_SHIZUKU = "use_shizuku_enabled"
        private const val KEY_LAST_CHECK = "last_check_timestamp"
        private const val KEY_ENDPOINT = "preferred_endpoint"

        @Volatile
        private var INSTANCE: OtaSettingsManager? = null

        fun getInstance(context: Context): OtaSettingsManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: OtaSettingsManager(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    /**
     * Alterna la actualización automática en segundo plano
     */
    fun setAutoUpdateEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_AUTO_UPDATE, enabled).apply()
        _settings.value = _settings.value.copy(autoUpdateEnabled = enabled)
    }

    /**
     * Alterna el uso preferente de Shizuku para instalaciones desatendidas
     */
    fun setUseShizukuEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_USE_SHIZUKU, enabled).apply()
        _settings.value = _settings.value.copy(useShizukuEnabled = enabled)
    }

    /**
     * Registra la marca de tiempo de la última consulta de actualización
     */
    fun recordCheckTimestamp(timestamp: Long = System.currentTimeMillis()) {
        prefs.edit().putLong(KEY_LAST_CHECK, timestamp).apply()
        _settings.value = _settings.value.copy(lastCheckTimestamp = timestamp)
    }

    /**
     * Obtiene el valor actual síncrono de actualización automática
     */
    val isAutoUpdateEnabled: Boolean
        get() = _settings.value.autoUpdateEnabled

    /**
     * Obtiene el valor actual síncrono del uso de Shizuku
     */
    val isShizukuEnabled: Boolean
        get() = _settings.value.useShizukuEnabled
}
