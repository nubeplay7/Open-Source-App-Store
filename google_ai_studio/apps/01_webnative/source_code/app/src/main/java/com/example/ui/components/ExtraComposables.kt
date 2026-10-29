package com.example.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp

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

@Composable
fun CollapsablePanel(
    panelId: String,
    title: String,
    subtitle: String? = null,
    icon: ImageVector? = null,
    iconTint: Color = Color.White,
    badgeText: String? = null,
    badgeColor: Color = Color.Transparent,
    badgeTextColor: Color = Color.White,
    isReorderable: Boolean = false,
    onMoveUp: (() -> Unit)? = null,
    onMoveDown: (() -> Unit)? = null,
    onHideBlock: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
        content()
    }
}


@Composable
fun FpsCounterOverlay(
    modifier: Modifier = Modifier,
    isHardwareBoostActive: Boolean = false
) {
    Box(modifier = modifier)
}
