package com.example.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AppAppearanceSettings
import com.example.ui.viewmodel.MainNavTab
import com.example.ui.theme.*

@Composable
fun AppSidebarNavigation(
    activeTab: MainNavTab,
    onTabSelected: (MainNavTab) -> Unit,
    appearanceSettings: AppAppearanceSettings,
    isExpanded: Boolean,
    onToggleExpanded: () -> Unit,
    onCreateAppClick: () -> Unit,
    onSheetsSyncClick: () -> Unit,
    onOtaUpdateClick: () -> Unit,
    onAppearanceClick: () -> Unit,
    onClearCacheClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val accent = appearanceSettings.accentColor
    val sidebarBg = appearanceSettings.themePreset.surfaceColor
    val borderColor = appearanceSettings.themePreset.borderColor

    val sidebarWidth = if (isExpanded) 190.dp else 72.dp

    Surface(
        modifier = modifier
            .width(sidebarWidth)
            .fillMaxHeight(),
        color = sidebarBg,
        tonalElevation = 4.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .border(
                    width = 1.dp,
                    color = borderColor.copy(alpha = 0.6f),
                    shape = RoundedCornerShape(topEnd = 16.dp, bottomEnd = 16.dp)
                )
                .padding(vertical = 12.dp, horizontal = if (isExpanded) 10.dp else 6.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Top App Brand & Toggle Button
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { onToggleExpanded() }
                        .padding(vertical = 6.dp, horizontal = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = if (isExpanded) Arrangement.SpaceBetween else Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                Brush.linearGradient(
                                    listOf(accent.primaryColor, accent.containerColor)
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Language,
                            contentDescription = "Logo",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    if (isExpanded) {
                        Column(modifier = Modifier.weight(1f).padding(horizontal = 8.dp)) {
                            Text(
                                text = "WebNative",
                                fontWeight = FontWeight.Black,
                                fontSize = 13.sp,
                                color = TextWhite,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = "PRO MAX",
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp,
                                color = accent.primaryColor,
                                maxLines = 1
                            )
                        }

                        Icon(
                            imageVector = Icons.Default.ChevronLeft,
                            contentDescription = "Colapsar",
                            tint = TextGrayLight,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))
                HorizontalDivider(color = borderColor.copy(alpha = 0.5f))
                Spacer(modifier = Modifier.height(10.dp))

                // Navigation Tabs
                SidebarTabItem(
                    tab = MainNavTab.MY_APPS,
                    label = "Mis Apps",
                    icon = Icons.Filled.GridView,
                    isSelected = activeTab == MainNavTab.MY_APPS,
                    isExpanded = isExpanded,
                    accentColor = accent.primaryColor,
                    onClick = { onTabSelected(MainNavTab.MY_APPS) }
                )

                SidebarTabItem(
                    tab = MainNavTab.EXPLORE_CATALOG,
                    label = "Explorar",
                    icon = Icons.Filled.Language,
                    isSelected = activeTab == MainNavTab.EXPLORE_CATALOG,
                    isExpanded = isExpanded,
                    accentColor = accent.primaryColor,
                    onClick = { onTabSelected(MainNavTab.EXPLORE_CATALOG) }
                )

                SidebarTabItem(
                    tab = MainNavTab.TURBO_STUDIO,
                    label = "Turbo Studio",
                    icon = Icons.Filled.Tune,
                    isSelected = activeTab == MainNavTab.TURBO_STUDIO,
                    isExpanded = isExpanded,
                    accentColor = accent.primaryColor,
                    onClick = { onTabSelected(MainNavTab.TURBO_STUDIO) }
                )

                SidebarTabItem(
                    tab = MainNavTab.CONTAINER_SANDBOX,
                    label = "Sandbox",
                    icon = Icons.Filled.Layers,
                    isSelected = activeTab == MainNavTab.CONTAINER_SANDBOX,
                    isExpanded = isExpanded,
                    accentColor = accent.primaryColor,
                    onClick = { onTabSelected(MainNavTab.CONTAINER_SANDBOX) }
                )

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = borderColor.copy(alpha = 0.5f))
                Spacer(modifier = Modifier.height(10.dp))

                // Section-Specific Direct Quick Actions
                if (isExpanded) {
                    Text(
                        text = "ACCIONES DE SECCIÓN",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextGrayLight,
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }

                when (activeTab) {
                    MainNavTab.MY_APPS -> {
                        SidebarActionButton(
                            icon = Icons.Default.Add,
                            label = "Nueva App",
                            isExpanded = isExpanded,
                            containerColor = accent.primaryColor,
                            contentColor = accent.onPrimaryColor,
                            onClick = onCreateAppClick
                        )
                        SidebarActionButton(
                            icon = Icons.Default.CloudSync,
                            label = "Sheets Sync",
                            isExpanded = isExpanded,
                            containerColor = DeepPurpleContainer,
                            contentColor = accent.primaryColor,
                            onClick = onSheetsSyncClick
                        )
                    }
                    MainNavTab.EXPLORE_CATALOG -> {
                        SidebarActionButton(
                            icon = Icons.Default.Search,
                            label = "Explorar Todo",
                            isExpanded = isExpanded,
                            containerColor = DeepPurpleContainer,
                            contentColor = accent.primaryColor,
                            onClick = {}
                        )
                    }
                    MainNavTab.TURBO_STUDIO -> {
                        SidebarActionButton(
                            icon = Icons.Default.CleaningServices,
                            label = "Limpiar Caché",
                            isExpanded = isExpanded,
                            containerColor = DeepPurpleContainer,
                            contentColor = MintSpeed,
                            onClick = onClearCacheClick
                        )
                    }
                    MainNavTab.CONTAINER_SANDBOX -> {
                        SidebarActionButton(
                            icon = Icons.Default.Shield,
                            label = "Aislamiento",
                            isExpanded = isExpanded,
                            containerColor = DeepPurpleContainer,
                            contentColor = MintSpeed,
                            onClick = {}
                        )
                    }
                }
            }

            // Bottom Global Action Buttons
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                HorizontalDivider(color = borderColor.copy(alpha = 0.5f))
                Spacer(modifier = Modifier.height(4.dp))

                // OTA Updates
                SidebarIconButton(
                    icon = Icons.Default.RocketLaunch,
                    label = "Actualizaciones",
                    isExpanded = isExpanded,
                    tint = accent.primaryColor,
                    onClick = onOtaUpdateClick
                )

                // Appearance Hub
                SidebarIconButton(
                    icon = Icons.Filled.Palette,
                    label = "Apariencia",
                    isExpanded = isExpanded,
                    tint = accent.primaryColor,
                    onClick = onAppearanceClick
                )
            }
        }
    }
}

@Composable
private fun SidebarTabItem(
    tab: MainNavTab,
    label: String,
    icon: ImageVector,
    isSelected: Boolean,
    isExpanded: Boolean,
    accentColor: Color,
    onClick: () -> Unit
) {
    val bgColor = if (isSelected) accentColor.copy(alpha = 0.18f) else Color.Transparent
    val borderCol = if (isSelected) accentColor.copy(alpha = 0.6f) else Color.Transparent

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .border(1.dp, borderCol, RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(vertical = 10.dp, horizontal = if (isExpanded) 12.dp else 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = if (isExpanded) Arrangement.Start else Arrangement.Center,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (isSelected) accentColor else TextGrayLight,
                modifier = Modifier.size(20.dp)
            )

            if (isExpanded) {
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = label,
                    fontSize = 12.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    color = if (isSelected) TextWhite else TextGrayLight,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun SidebarActionButton(
    icon: ImageVector,
    label: String,
    isExpanded: Boolean,
    containerColor: Color,
    contentColor: Color,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(containerColor)
            .clickable { onClick() }
            .padding(vertical = 8.dp, horizontal = if (isExpanded) 10.dp else 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = if (isExpanded) Arrangement.Start else Arrangement.Center,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = contentColor,
                modifier = Modifier.size(16.dp)
            )

            if (isExpanded) {
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = label,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = contentColor,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun SidebarIconButton(
    icon: ImageVector,
    label: String,
    isExpanded: Boolean,
    tint: Color,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(Color(0xFF222228))
            .clickable { onClick() }
            .padding(vertical = 8.dp, horizontal = if (isExpanded) 10.dp else 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = if (isExpanded) Arrangement.Start else Arrangement.Center,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = tint,
                modifier = Modifier.size(16.dp)
            )

            if (isExpanded) {
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = label,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = TextWhite,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}
