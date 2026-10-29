package com.example.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.material3.*
import androidx.compose.foundation.layout.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun CommandTerminalCard(currentWebView: Any? = null) {
    Card(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Terminal de Comandos y Scripts", style = MaterialTheme.typography.titleMedium)
            Text("Motor de automatización y ejecución listo.", style = MaterialTheme.typography.bodySmall)
        }
    }
}
