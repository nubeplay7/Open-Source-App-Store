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
fun SandboxPasswordManagerDialog(onDismiss: () -> Unit, onLaunchAutoLogin: (Any?, String, String) -> Unit) {
    Box(modifier = Modifier)
}
