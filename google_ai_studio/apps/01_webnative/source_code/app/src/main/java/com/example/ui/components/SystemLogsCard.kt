package com.example.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.material3.*
import androidx.compose.foundation.layout.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SystemLogsCard(currentWebView: Any? = null, onClearLogs: () -> Unit = {}) {
    Card(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Registro de Eventos y Diagnóstico", style = MaterialTheme.typography.titleMedium)
            Text("Telemetría en tiempo real del sistema activa.", style = MaterialTheme.typography.bodySmall)
        }
    }
}
