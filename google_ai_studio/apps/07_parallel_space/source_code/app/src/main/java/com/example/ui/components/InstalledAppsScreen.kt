package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.AvailableAppItem
import com.example.data.ClonedAppEntity
import com.example.ui.theme.DeepSpaceBackground
import com.example.ui.theme.DeepSpaceBorder
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.DeepSpaceSurfaceVariant
import com.example.ui.theme.ElectricViolet
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InstalledAppsScreen(
    installedApps: List<AvailableAppItem>,
    existingClones: List<ClonedAppEntity>,
    onCloneSingleApp: (AvailableAppItem) -> Unit,
    onCloneMultipleApps: (List<AvailableAppItem>) -> Unit,
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }
    var isBatchMode by remember { mutableStateOf(false) }
    val selectedPackages = remember { mutableStateListOf<String>() }

    val categories = listOf("All", "Social", "Gaming", "Work", "Tools")

    // Filter by search query and category
    val filteredApps = remember(installedApps, searchQuery, selectedCategory) {
        installedApps.filter { app ->
            val matchesCategory = selectedCategory == "All" || app.category.equals(selectedCategory, ignoreCase = true)
            val matchesSearch = searchQuery.isBlank() ||
                    app.appName.contains(searchQuery, ignoreCase = true) ||
                    app.packageName.contains(searchQuery, ignoreCase = true)
            matchesCategory && matchesSearch
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Device Installed Apps",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        )
                        Text(
                            text = "${installedApps.size} applications detected by PackageManager",
                            style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack, modifier = Modifier.testTag("installed_apps_back_btn")) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = TextPrimary
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = {
                            isBatchMode = !isBatchMode
                            if (!isBatchMode) selectedPackages.clear()
                        },
                        modifier = Modifier.testTag("batch_mode_toggle_btn")
                    ) {
                        Icon(
                            imageVector = if (isBatchMode) Icons.Default.Close else Icons.Default.FilterList,
                            contentDescription = "Toggle Batch Select",
                            tint = if (isBatchMode) NeonCyan else TextSecondary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DeepSpaceBackground)
            )
        },
        bottomBar = {
            AnimatedVisibility(visible = isBatchMode && selectedPackages.isNotEmpty()) {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = DeepSpaceSurface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${selectedPackages.size} apps selected",
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )

                        Button(
                            onClick = {
                                val appsToClone = installedApps.filter { it.packageName in selectedPackages }
                                onCloneMultipleApps(appsToClone)
                                selectedPackages.clear()
                                isBatchMode = false
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = NeonCyan,
                                contentColor = Color.Black
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.testTag("clone_selected_batch_btn")
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Clone Selected", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        },
        containerColor = DeepSpaceBackground
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            // Search Input Field
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search installed applications...", color = TextMuted, fontSize = 14.sp) },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = "Search", tint = TextMuted)
                },
                trailingIcon = {
                    if (searchQuery.isNotBlank()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Close, contentDescription = "Clear", tint = TextMuted)
                        }
                    }
                },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("installed_apps_search_input"),
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = NeonCyan,
                    unfocusedBorderColor = DeepSpaceBorder,
                    focusedContainerColor = DeepSpaceSurface,
                    unfocusedContainerColor = DeepSpaceSurface
                )
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Category Filter Row
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(categories) { cat ->
                    val isSelected = selectedCategory == cat
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategory = cat },
                        label = { Text(cat, fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = NeonCyan,
                            selectedLabelColor = Color.Black,
                            containerColor = DeepSpaceSurface,
                            labelColor = TextSecondary
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Results count
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${filteredApps.size} apps available",
                    fontSize = 12.sp,
                    color = TextMuted
                )
                if (isBatchMode) {
                    Text(
                        text = "Batch Select Mode Active",
                        fontSize = 11.sp,
                        color = NeonCyan,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Installed apps list
            if (filteredApps.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No installed applications match your search",
                        color = TextMuted,
                        fontSize = 14.sp
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(bottom = 24.dp)
                ) {
                    items(filteredApps, key = { it.packageName }) { app ->
                        val existingCloneCount = existingClones.count { it.packageName == app.packageName }
                        val isSelectedInBatch = app.packageName in selectedPackages

                        InstalledAppCardItem(
                            app = app,
                            existingCloneCount = existingCloneCount,
                            isBatchMode = isBatchMode,
                            isSelectedInBatch = isSelectedInBatch,
                            onToggleSelection = {
                                if (isSelectedInBatch) selectedPackages.remove(app.packageName)
                                else selectedPackages.add(app.packageName)
                            },
                            onCloneClick = { onCloneSingleApp(app) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun InstalledAppCardItem(
    app: AvailableAppItem,
    existingCloneCount: Int,
    isBatchMode: Boolean,
    isSelectedInBatch: Boolean,
    onToggleSelection: () -> Unit,
    onCloneClick: () -> Unit
) {
    var isJustCloned by remember { mutableStateOf(false) }

    val categoryColor = when (app.category) {
        "Social" -> NeonCyan
        "Gaming" -> Color(0xFFF59E0B)
        "Work" -> EmeraldSuccess
        else -> ElectricViolet
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = isBatchMode) { onToggleSelection() }
            .testTag("app_item_${app.packageName}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelectedInBatch) DeepSpaceSurfaceVariant else DeepSpaceSurface
        ),
        border = androidx.compose.foundation.BorderStroke(
            width = 1.dp,
            color = if (isSelectedInBatch) NeonCyan else DeepSpaceBorder
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (isBatchMode) {
                Checkbox(
                    checked = isSelectedInBatch,
                    onCheckedChange = { onToggleSelection() },
                    colors = CheckboxDefaults.colors(
                        checkedColor = NeonCyan,
                        checkmarkColor = Color.Black,
                        uncheckedColor = TextMuted
                    ),
                    modifier = Modifier.testTag("batch_checkbox_${app.packageName}")
                )
                Spacer(modifier = Modifier.width(4.dp))
            }

            // App Icon or Avatar fallback
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(categoryColor.copy(alpha = 0.15f))
                    .border(1.dp, categoryColor.copy(alpha = 0.4f), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = app.appName.take(1).uppercase(),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = categoryColor
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // App info
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = app.appName,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = categoryColor.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = app.category,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = categoryColor,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = app.packageName,
                    fontSize = 11.sp,
                    color = TextMuted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                if (existingCloneCount > 0) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "● $existingCloneCount active clone${if (existingCloneCount > 1) "s" else ""}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = EmeraldSuccess
                    )
                }
            }

            Spacer(modifier = Modifier.width(10.dp))

            // Action Button: Clone
            if (!isBatchMode) {
                Button(
                    onClick = {
                        isJustCloned = true
                        onCloneClick()
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isJustCloned) EmeraldSuccess else NeonCyan,
                        contentColor = Color.Black
                    ),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("clone_btn_${app.packageName}")
                ) {
                    Icon(
                        imageVector = if (isJustCloned) Icons.Default.Check else Icons.Default.Add,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (isJustCloned) "Cloned!" else "Clone",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
