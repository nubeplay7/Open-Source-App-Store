package com.example.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.Box
import androidx.compose.ui.Modifier

@Composable
fun SidebarNavigation(
    activeTab: Any?,
    onTabSelected: (com.example.ui.viewmodel.MainNavTab) -> Unit,
    selectedCustomMenuId: String?,
    onSelectCustomMenu: (String?) -> Unit,
    appearanceSettings: Any?,
    isExpanded: Boolean,
    onToggleExpanded: () -> Unit,
    onCreateAppClick: () -> Unit,
    onSheetsSyncClick: () -> Unit,
    onOtaUpdateClick: () -> Unit,
    onAppearanceClick: () -> Unit,
    onClearCacheClick: () -> Unit,
    onOpenBlockCustomizer: () -> Unit
) {
    Box(modifier = Modifier)
}

@Composable
fun PersistentTopHeader(
    onOpenSearch: () -> Unit = {},
    onOpenLayoutCustomizer: () -> Unit = {},
    onOpenOtaDialog: () -> Unit = {},
    onOpenAppearanceDialog: () -> Unit = {},
    onOpenCreateAppDialog: () -> Unit = {},
    onRefreshState: () -> Unit = {},
    onClearCache: () -> Unit = {},
    isSidebarMode: Boolean = false,
    onToggleSidebarMode: () -> Unit = {}
) {
    Box(modifier = Modifier)
}

@Composable
fun ThermalProtectionOverlay() {}

@Composable
fun CpuHeatmapDiagnosticOverlay() {}

@Composable
fun WidgetLayoutEditorDialog(onDismissRequest: () -> Unit) {}
