package com.example.ui.dialogs

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.Box
import androidx.compose.material3.Text
import com.example.data.model.WebAppEntity

@Composable
fun AutoClickerSettingsDialog(
    onDismissRequest: () -> Unit = {}
) {
    Box(modifier = Modifier)
}

@Composable
fun InstalledAppsManagementDialog(
    webApps: List<WebAppEntity> = emptyList(),
    onDismiss: () -> Unit = {},
    onLaunchApp: (WebAppEntity) -> Unit = {},
    onEditApp: (WebAppEntity) -> Unit = {},
    onDeleteApp: (WebAppEntity) -> Unit = {},
    onPinShortcut: (WebAppEntity) -> Unit = {}
) {
    Box(modifier = Modifier)
}
