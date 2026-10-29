package com.example.ui.dialogs

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.Box
import androidx.compose.ui.Modifier

@Composable
fun AdminModularizationDialog(onDismissRequest: () -> Unit) {
    Box(modifier = Modifier)
}

@Composable
fun VisualBlockBuilderDialog(onDismissRequest: () -> Unit) {
    Box(modifier = Modifier)
}

@Composable
fun SnaptubeMediaDialog(media: Any?, onDismissRequest: () -> Unit) {
    Box(modifier = Modifier)
}

@Composable
fun WebMacroAutomationDialog(onDismiss: () -> Unit) {
    Box(modifier = Modifier)
}

@Composable
fun VisualBlueprintStudioDialog(onDismiss: () -> Unit) {
    Box(modifier = Modifier)
}

@Composable
fun FeatureRegistryHubDialog(onDismiss: () -> Unit) {
    Box(modifier = Modifier)
}

@Composable
fun AdBlockSettingsDialog(onDismissRequest: () -> Unit) {
    Box(modifier = Modifier)
}

@Composable
fun ExtensionStoreDialog(onDismissRequest: () -> Unit, onOpenUrlInBrowser: (String) -> Unit) {
    Box(modifier = Modifier)
}

enum class WebMacroDialogTab { DEFAULT }
