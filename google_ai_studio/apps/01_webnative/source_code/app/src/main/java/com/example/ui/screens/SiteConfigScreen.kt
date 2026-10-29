package com.example.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.Box
import androidx.compose.ui.Modifier
import com.example.data.model.WebAppEntity

data class SiteConfigResult(
    val entity: WebAppEntity,
    val autoRefreshOnOpen: Boolean = false
)

@Composable
fun SiteConfigScreen(
    currentUrl: String,
    currentTitle: String,
    existingApp: WebAppEntity?,
    onBack: () -> Unit,
    onApplySettings: (SiteConfigResult) -> Unit
) {
    Box(modifier = Modifier)
}
