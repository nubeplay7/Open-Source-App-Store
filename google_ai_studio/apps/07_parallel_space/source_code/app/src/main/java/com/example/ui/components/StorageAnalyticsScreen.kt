package com.example.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
import kotlin.math.atan2

// Color palette for chart segments
val chartColors = listOf(
    Color(0xFF00F0FF), // Neon Cyan
    Color(0xFFA855F7), // Electric Violet
    Color(0xFF10B981), // Emerald
    Color(0xFFF59E0B), // Amber
    Color(0xFFEC4899), // Pink
    Color(0xFF3B82F6), // Blue
    Color(0xFF8B5CF6), // Purple
    Color(0xFF14B8A6)  // Teal
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StorageAnalyticsScreen(
    clonedApps: List<ClonedAppEntity>,
    onCleanCache: (ClonedAppEntity) -> Unit,
    onCleanAllCache: () -> Unit,
    onBack: () -> Unit
) {
    var selectedCategoryFilter by remember { mutableStateOf("All") }
    var selectedSliceIndex by remember { mutableStateOf<Int?>(null) }
    var isCleaningAll by remember { mutableStateOf(false) }

    val categories = listOf("All", "Social", "Gaming", "Work", "Tools")

    val filteredApps = remember(clonedApps, selectedCategoryFilter) {
        if (selectedCategoryFilter == "All") clonedApps
        else clonedApps.filter { it.category.equals(selectedCategoryFilter, ignoreCase = true) }
    }

    val totalCache = remember(filteredApps) { filteredApps.sumOf { it.cacheSizeMb } }
    val totalData = remember(filteredApps) { filteredApps.sumOf { it.dataSizeMb } }
    val totalStorage = totalCache + totalData
    val heaviestApp = remember(filteredApps) {
        filteredApps.maxByOrNull { it.cacheSizeMb + it.dataSizeMb }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Storage Analytics",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        )
                        Text(
                            text = "Recharts Visualization & Sandbox Footprint",
                            style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack, modifier = Modifier.testTag("storage_back_btn")) {
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
                            isCleaningAll = true
                            onCleanAllCache()
                            isCleaningAll = false
                        },
                        modifier = Modifier.testTag("clean_all_quick_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.CleaningServices,
                            contentDescription = "Clean All Cache",
                            tint = EmeraldSuccess
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DeepSpaceBackground)
            )
        },
        containerColor = DeepSpaceBackground
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(bottom = 32.dp)
        ) {
            // Category filter chips
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(categories) { cat ->
                        val isSelected = selectedCategoryFilter == cat
                        FilterChip(
                            selected = isSelected,
                            onClick = {
                                selectedCategoryFilter = cat
                                selectedSliceIndex = null
                            },
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
            }

            // Interactive Donut Chart Visualizer (Recharts style)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = DeepSpaceSurface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "SANDBOX SPACE DISTRIBUTION",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = NeonCyan
                            )
                            Text(
                                text = "${filteredApps.size} Instances",
                                fontSize = 12.sp,
                                color = TextMuted
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        if (filteredApps.isEmpty()) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(180.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("No cloned apps in this category", color = TextMuted, fontSize = 14.sp)
                            }
                        } else {
                            // Donut Chart Canvas
                            Box(
                                modifier = Modifier
                                    .size(220.dp)
                                    .padding(8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                DonutChartCanvas(
                                    apps = filteredApps,
                                    totalStorage = totalStorage,
                                    selectedSliceIndex = selectedSliceIndex,
                                    onSliceSelected = { selectedSliceIndex = it }
                                )

                                // Center Storage Summary Readout
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    val highlightedApp = selectedSliceIndex?.let { filteredApps.getOrNull(it) }
                                    if (highlightedApp != null) {
                                        val appTotal = highlightedApp.cacheSizeMb + highlightedApp.dataSizeMb
                                        Text(
                                            text = "%.1f".format(appTotal),
                                            fontSize = 24.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = TextPrimary
                                        )
                                        Text(
                                            text = "MB",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = NeonCyan
                                        )
                                        Text(
                                            text = highlightedApp.appName,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = TextSecondary,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    } else {
                                        Text(
                                            text = "%.1f".format(totalStorage),
                                            fontSize = 26.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = TextPrimary
                                        )
                                        Text(
                                            text = "TOTAL MB",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = NeonCyan
                                        )
                                        Text(
                                            text = "Sandboxed",
                                            fontSize = 11.sp,
                                            color = TextMuted
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Chart Legend Chips
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "Tap any segment to inspect instance footprint",
                                fontSize = 11.sp,
                                color = TextMuted,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }

            // Quick Stats Metric Cards (Grid of 3)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Total App Data
                    Surface(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        color = DeepSpaceSurfaceVariant
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "%.1f MB".format(totalData),
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text("Active Data", fontSize = 11.sp, color = TextMuted)
                        }
                    }

                    // Junk Cache
                    Surface(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        color = DeepSpaceSurfaceVariant
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "%.1f MB".format(totalCache),
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFFB7185)
                            )
                            Text("Cleanable Cache", fontSize = 11.sp, color = TextMuted)
                        }
                    }

                    // Largest Consumer
                    Surface(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        color = DeepSpaceSurfaceVariant
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = heaviestApp?.appName?.take(8) ?: "-",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = NeonCyan,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text("Top Consumer", fontSize = 11.sp, color = TextMuted)
                        }
                    }
                }
            }

            // Stacked Bar Chart & App Breakdown Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Instance Breakdown (Cache vs Data)",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )

                    Button(
                        onClick = onCleanAllCache,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = EmeraldSuccess,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier.testTag("clean_all_cache_action_btn")
                    ) {
                        Icon(
                            Icons.Default.CleaningServices,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Clean All", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // List of Cloned Apps with Stacked Bar Graph for Each
            items(filteredApps, key = { it.id }) { app ->
                val appTotal = app.cacheSizeMb + app.dataSizeMb
                val progressRatio = if (totalStorage > 0) (appTotal / totalStorage).toFloat() else 0f
                val cacheRatio = if (appTotal > 0) (app.cacheSizeMb / appTotal).toFloat() else 0f
                val appColor = chartColors[filteredApps.indexOf(app) % chartColors.size]

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("storage_item_${app.id}"),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = DeepSpaceSurface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(10.dp)
                                        .clip(CircleShape)
                                        .background(appColor)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = app.appName,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = TextPrimary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = DeepSpaceSurfaceVariant
                                ) {
                                    Text(
                                        text = app.category,
                                        fontSize = 9.sp,
                                        color = TextMuted,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }

                            Text(
                                text = "%.1f MB".format(appTotal),
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 15.sp,
                                color = TextPrimary
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Stacked Progress Bar (Data in App Color, Cache in Pink/Red)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(DeepSpaceSurfaceVariant)
                        ) {
                            if (app.dataSizeMb > 0) {
                                Box(
                                    modifier = Modifier
                                        .weight((1f - cacheRatio).coerceAtLeast(0.05f))
                                        .fillMaxSize()
                                        .background(appColor)
                                )
                            }
                            if (app.cacheSizeMb > 0) {
                                Box(
                                    modifier = Modifier
                                        .weight(cacheRatio.coerceAtLeast(0.05f))
                                        .fillMaxSize()
                                        .background(Color(0xFFFB7185))
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Detail labels and quick clean button
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                                Text(
                                    text = "Data: %.1f MB".format(app.dataSizeMb),
                                    fontSize = 11.sp,
                                    color = TextSecondary
                                )
                                Text(
                                    text = "Cache: %.1f MB".format(app.cacheSizeMb),
                                    fontSize = 11.sp,
                                    color = if (app.cacheSizeMb > 0) Color(0xFFFB7185) else EmeraldSuccess,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }

                            if (app.cacheSizeMb > 0) {
                                Surface(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .clickable { onCleanCache(app) }
                                        .testTag("clean_cache_${app.id}"),
                                    color = Color(0xFFFB7185).copy(alpha = 0.15f)
                                ) {
                                    Text(
                                        text = "Clear Cache",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFFB7185),
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            } else {
                                Text(
                                    text = "Optimized",
                                    fontSize = 11.sp,
                                    color = EmeraldSuccess,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * DonutChartCanvas
 * Draws animated Recharts-style circular slices with interactive touch detection.
 */
@Composable
fun DonutChartCanvas(
    apps: List<ClonedAppEntity>,
    totalStorage: Double,
    selectedSliceIndex: Int?,
    onSliceSelected: (Int?) -> Unit
) {
    val animatedSweep by animateFloatAsState(
        targetValue = 1f,
        animationSpec = tween(durationMillis = 800, easing = FastOutSlowInEasing),
        label = "donutSweep"
    )

    Canvas(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(apps) {
                detectTapGestures { offset ->
                    val center = Offset(size.width / 2f, size.height / 2f)
                    val dx = offset.x - center.x
                    val dy = offset.y - center.y
                    var touchAngle = Math.toDegrees(atan2(dy.toDouble(), dx.toDouble())).toFloat()
                    if (touchAngle < 0) touchAngle += 360f

                    // Find which slice was tapped
                    var currentAngle = 0f
                    var clickedIndex: Int? = null
                    for ((index, app) in apps.withIndex()) {
                        val appSize = app.cacheSizeMb + app.dataSizeMb
                        val sliceSweep = if (totalStorage > 0) (appSize / totalStorage * 360f).toFloat() else 0f
                        if (touchAngle >= currentAngle && touchAngle <= currentAngle + sliceSweep) {
                            clickedIndex = index
                            break
                        }
                        currentAngle += sliceSweep
                    }
                    onSliceSelected(if (clickedIndex == selectedSliceIndex) null else clickedIndex)
                }
            }
    ) {
        val strokeWidth = 28.dp.toPx()
        val selectedStrokeWidth = 36.dp.toPx()
        val radius = (size.minDimension - selectedStrokeWidth) / 2f
        val center = Offset(size.width / 2f, size.height / 2f)

        var startAngle = -90f

        for ((index, app) in apps.withIndex()) {
            val appSize = app.cacheSizeMb + app.dataSizeMb
            val sliceSweep = if (totalStorage > 0) {
                ((appSize / totalStorage) * 360f).toFloat() * animatedSweep
            } else 0f

            val isSelected = selectedSliceIndex == index
            val color = chartColors[index % chartColors.size]
            val effectiveStroke = if (isSelected) selectedStrokeWidth else strokeWidth

            drawArc(
                color = if (selectedSliceIndex != null && !isSelected) color.copy(alpha = 0.35f) else color,
                startAngle = startAngle,
                sweepAngle = sliceSweep.coerceAtLeast(1.5f),
                useCenter = false,
                topLeft = Offset(center.x - radius, center.y - radius),
                size = Size(radius * 2, radius * 2),
                style = Stroke(width = effectiveStroke, cap = StrokeCap.Butt)
            )

            startAngle += sliceSweep
        }
    }
}
