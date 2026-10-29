package com.example.util

import android.content.Context
import android.graphics.Bitmap
import com.example.data.model.WebAppEntity

/**
 * Backward-compatible helper delegating to ShortcutManagerService.
 */
object WebShortcutHelper {

    const val ACTION_LAUNCH_WEB_APP = ShortcutManagerService.ACTION_LAUNCH_WEB_APP
    const val EXTRA_WEB_APP_ID = ShortcutManagerService.EXTRA_WEB_APP_ID
    const val EXTRA_WEB_URL = ShortcutManagerService.EXTRA_WEB_URL
    const val EXTRA_WEB_NAME = ShortcutManagerService.EXTRA_WEB_NAME

    fun pinWebAppShortcut(context: Context, app: WebAppEntity, onComplete: ((Boolean) -> Unit)? = null): Boolean {
        return ShortcutManagerService.pinWebAppShortcut(
            context = context,
            app = app,
            customIconBitmap = null,
            containerId = null,
            onComplete = onComplete
        )
    }

    fun generateShortcutIconBitmap(context: Context, app: WebAppEntity): Bitmap {
        return ShortcutManagerService.generateCustomIconBitmap(
            name = app.name,
            iconValue = app.iconValue,
            iconType = app.iconType,
            accentColor = app.accentColor
        )
    }
}
