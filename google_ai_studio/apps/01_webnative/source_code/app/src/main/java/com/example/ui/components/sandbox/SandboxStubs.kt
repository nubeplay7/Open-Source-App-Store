package com.example.ui.components.sandbox

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.Box
import androidx.compose.ui.Modifier

@Composable
fun SandboxHardwareAuditSection() {
    Box(modifier = Modifier)
}

@Composable
fun SandboxSnapshotsSection() {
    Box(modifier = Modifier)
}

@Composable
fun SandboxPasswordManagerDialog(
    onDismiss: () -> Unit,
    onLaunchAutoLogin: (Any?, String, String) -> Unit
) {
    Box(modifier = Modifier)
}
