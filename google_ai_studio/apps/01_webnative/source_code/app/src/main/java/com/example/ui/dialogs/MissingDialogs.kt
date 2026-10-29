package com.example.ui.dialogs

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.Box
import androidx.compose.ui.Modifier
import com.example.data.model.WebAppEntity

@Composable
fun AdminModularizationDialog(onDismissRequest: () -> Unit = {}) {
    Box(modifier = Modifier)
}

@Composable
fun VisualBlockBuilderDialog(onDismissRequest: () -> Unit = {}) {
    Box(modifier = Modifier)
}

@Composable
fun SnaptubeMediaDialog(media: Any? = null, onDismissRequest: () -> Unit = {}) {
    Box(modifier = Modifier)
}

@Composable
fun WebMacroAutomationDialog(
    targetUrl: String = "",
    webView: Any? = null,
    onDismiss: () -> Unit = {},
    onStartRecordingFromDialog: () -> Unit = {}
) {
    Box(modifier = Modifier)
}

@Composable
fun VisualBlueprintStudioDialog(
    webView: Any? = null,
    onDismiss: () -> Unit = {},
    onInjectVisualStepToMacro: (String, String, Float) -> Unit = { _, _, _ -> }
) {
    Box(modifier = Modifier)
}

@Composable
fun FeatureRegistryHubDialog(
    onDismiss: () -> Unit = {},
    onOpenCartographerStudio: () -> Unit = {}
) {
    Box(modifier = Modifier)
}

@Composable
fun AdBlockSettingsDialog(onDismissRequest: () -> Unit = {}) {
    Box(modifier = Modifier)
}

@Composable
fun ExtensionStoreDialog(
    onDismissRequest: () -> Unit = {},
    onOpenUrlInBrowser: (String) -> Unit = {}
) {
    Box(modifier = Modifier)
}

@Composable
fun SiteUiCustomizationDialog(
    currentUrl: String = "",
    appName: String = "",
    onDismiss: () -> Unit = {},
    onPreferencesSaved: (com.example.util.SiteUiPreferences) -> Unit = {}
) {
    Box(modifier = Modifier)
}

@Composable
fun AdvancedAppPinningDialog(
    initialUrl: String = "",
    initialTitle: String = "",
    onDismiss: () -> Unit = {},
    onLaunchNow: (WebAppEntity) -> Unit = {}
) {
    Box(modifier = Modifier)
}

@Composable
fun TurboCacheManagementDialog(
    onDismiss: () -> Unit = {},
    webView: Any? = null
) {
    Box(modifier = Modifier)
}

enum class WebMacroDialogTab { DEFAULT }
