package com.example.data

import android.content.Context
import android.content.SharedPreferences

class SecurityPreferences(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("parallel_space_security", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_PIN = "security_pin"
        private const val KEY_LOCK_ENABLED = "app_lock_enabled"
        private const val KEY_DISGUISE_CALCULATOR = "calculator_disguise_active"
        private const val KEY_SPEED_BOOST_COUNT = "speed_boost_count"
        private const val KEY_LAST_BOOST_TIME = "last_boost_time"
        private const val KEY_DEFAULT_PIN = "1234"
    }

    var pin: String
        get() = prefs.getString(KEY_PIN, KEY_DEFAULT_PIN) ?: KEY_DEFAULT_PIN
        set(value) = prefs.edit().putString(KEY_PIN, value).apply()

    var isLockEnabled: Boolean
        get() = prefs.getBoolean(KEY_LOCK_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_LOCK_ENABLED, value).apply()

    var isCalculatorDisguiseActive: Boolean
        get() = prefs.getBoolean(KEY_DISGUISE_CALCULATOR, false)
        set(value) = prefs.edit().putBoolean(KEY_DISGUISE_CALCULATOR, value).apply()

    var boostCount: Int
        get() = prefs.getInt(KEY_SPEED_BOOST_COUNT, 12)
        set(value) = prefs.edit().putInt(KEY_SPEED_BOOST_COUNT, value).apply()

    var lastBoostTime: Long
        get() = prefs.getLong(KEY_LAST_BOOST_TIME, System.currentTimeMillis() - 1000 * 60 * 45)
        set(value) = prefs.edit().putLong(KEY_LAST_BOOST_TIME, value).apply()

    fun verifyPin(input: String): Boolean {
        return input == pin
    }
}
