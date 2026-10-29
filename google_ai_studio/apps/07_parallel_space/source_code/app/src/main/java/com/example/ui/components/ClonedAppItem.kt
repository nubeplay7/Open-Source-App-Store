package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.outlined.Chat
import androidx.compose.material.icons.outlined.Gamepad
import androidx.compose.material.icons.outlined.Work
import androidx.compose.material.icons.outlined.Apps
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.ClonedAppEntity
import com.example.ui.theme.DeepSpaceBorder
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.DeepSpaceSurfaceVariant
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun ClonedAppGridItem(
    app: ClonedAppEntity,
    onClick: () -> Unit,
    onMoreClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .testTag("cloned_app_${app.id}")
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = DeepSpaceSurface
        ),
        border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top row with Lock / Status and More button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (app.isLocked) {
                        Box(
                            modifier = Modifier
                                .size(20.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFE11D48).copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Locked",
                                tint = Color(0xFFFB7185),
                                modifier = Modifier.size(12.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                    }
                    if (app.isFintechProtected || app.category == "Fintech" || app.packageName == "mx.openbank.modelbank") {
                        Box(
                            modifier = Modifier
                                .size(20.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF10B981).copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Security,
                                contentDescription = "Fintech Shield Active",
                                tint = Color(0xFF10B981),
                                modifier = Modifier.size(12.dp)
                            )
                        }
                    } else if (!app.isLocked) {
                        Spacer(modifier = Modifier.size(20.dp))
                    }
                }

                IconButton(
                    onClick = onMoreClick,
                    modifier = Modifier
                        .size(28.dp)
                        .testTag("app_more_btn_${app.id}")
                ) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = "Options",
                        tint = TextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // App Icon Box with Clone Badge
            Box(
                modifier = Modifier.size(64.dp),
                contentAlignment = Alignment.BottomEnd
            ) {
                // Main icon container
                val iconBgColor = getAppIconColor(app.packageName, app.category)
                Surface(
                    modifier = Modifier
                        .size(58.dp)
                        .align(Alignment.Center),
                    shape = RoundedCornerShape(16.dp),
                    color = iconBgColor,
                    shadowElevation = 4.dp
                ) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier.background(
                            Brush.linearGradient(
                                listOf(
                                    iconBgColor,
                                    iconBgColor.copy(alpha = 0.75f)
                                )
                            )
                        )
                    ) {
                        Icon(
                            imageVector = getCategoryIcon(app.category),
                            contentDescription = app.appName,
                            tint = Color.White,
                            modifier = Modifier.size(30.dp)
                        )
                    }
                }

                // Parallel Clone Badge (e.g. "2nd", "Dual", "Work")
                val parsedColor = try {
                    Color(android.graphics.Color.parseColor(app.badgeColorHex))
                } catch (_: Exception) {
                    NeonCyan
                }

                Surface(
                    modifier = Modifier
                        .padding(bottom = 0.dp, end = 0.dp)
                        .clip(RoundedCornerShape(6.dp)),
                    color = parsedColor,
                    shadowElevation = 2.dp
                ) {
                    Text(
                        text = app.badgeText,
                        color = Color.Black,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Title
            Text(
                text = app.appName,
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimary
                ),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            // Memory / Category info
            Text(
                text = "${app.cacheSizeMb} MB • ${app.category}",
                style = MaterialTheme.typography.labelSmall.copy(
                    color = TextMuted
                ),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
fun AddCloneGridButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .testTag("add_clone_button")
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = DeepSpaceSurfaceVariant.copy(alpha = 0.4f)
        ),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            Brush.linearGradient(listOf(NeonCyan.copy(alpha = 0.5f), Color.Transparent))
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(CircleShape)
                    .background(NeonCyan.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "+",
                    color = NeonCyan,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Light
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Clone App",
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = NeonCyan
                )
            )

            Text(
                text = "Add to Space",
                style = MaterialTheme.typography.labelSmall.copy(
                    color = TextSecondary
                )
            )
        }
    }
}

fun getAppIconColor(packageName: String, category: String): Color {
    return when {
        packageName.contains("openbank") -> Color(0xFFE20613) // Openbank / Santander Red
        packageName.contains("santander") -> Color(0xFFEC0000)
        packageName.contains("bbva") -> Color(0xFF004481)
        packageName.contains("nu.") -> Color(0xFF820AD1)
        packageName.contains("whatsapp") -> Color(0xFF25D366)
        packageName.contains("instagram") -> Color(0xFFE1306C)
        packageName.contains("facebook") -> Color(0xFF1877F2)
        packageName.contains("telegram") -> Color(0xFF229ED9)
        packageName.contains("tiktok") -> Color(0xFF000000)
        packageName.contains("twitter") || packageName.contains(".x.") -> Color(0xFF1DA1F2)
        packageName.contains("discord") -> Color(0xFF5865F2)
        packageName.contains("reddit") -> Color(0xFFFF4500)
        packageName.contains("youtube") -> Color(0xFFFF0000)
        packageName.contains("clash") -> Color(0xFFF59E0B)
        packageName.contains("freefire") -> Color(0xFFEA580C)
        packageName.contains("slack") -> Color(0xFF4A154B)
        category == "Fintech" -> Color(0xFF059669)
        category == "Gaming" -> Color(0xFF8B5CF6)
        category == "Work" -> Color(0xFF0D9488)
        else -> Color(0xFF6366F1)
    }
}

fun getCategoryIcon(category: String): ImageVector {
    return when (category) {
        "Fintech" -> Icons.Default.AccountBalance
        "Social" -> Icons.Outlined.Chat
        "Gaming" -> Icons.Outlined.Gamepad
        "Work" -> Icons.Outlined.Work
        else -> Icons.Outlined.Apps
    }
}
