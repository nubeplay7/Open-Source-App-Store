package com.example.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ControlPointDuplicate
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Gamepad
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shop
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Work
import androidx.compose.material.icons.outlined.Chat
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.ClonedAppEntity
import com.example.data.PlayStoreAppItem
import com.example.data.VirtualPlayStoreRepository
import com.example.ui.theme.DeepSpaceBackground
import com.example.ui.theme.DeepSpaceBorder
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.DeepSpaceSurfaceVariant
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun DualPlayStoreScreen(
    existingClones: List<ClonedAppEntity>,
    onInstallDirectly: (PlayStoreAppItem) -> Unit,
    onOpenBatchClone: (PlayStoreAppItem) -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Todos") }

    // Installing simulation dialog
    var installingApp by remember { mutableStateOf<PlayStoreAppItem?>(null) }
    var installProgress by remember { mutableFloatStateOf(0f) }
    var installStatusText by remember { mutableStateOf("") }

    val categories = listOf("Todos", "Fintech", "Social", "Gaming", "Work")

    val allCatalog = VirtualPlayStoreRepository.storeCatalog

    val filteredApps = remember(searchQuery, selectedCategory) {
        allCatalog.filter { app ->
            val matchesCategory = (selectedCategory == "Todos") || app.category.equals(selectedCategory, ignoreCase = true)
            val matchesSearch = searchQuery.isBlank() ||
                    app.appName.contains(searchQuery, ignoreCase = true) ||
                    app.packageName.contains(searchQuery, ignoreCase = true) ||
                    app.developer.contains(searchQuery, ignoreCase = true) ||
                    app.tags.any { it.contains(searchQuery, ignoreCase = true) }
            matchesCategory && matchesSearch
        }
    }

    // Direct Virtual Installation Progress Flow
    if (installingApp != null) {
        val targetApp = installingApp!!
        LaunchedEffect(targetApp) {
            installProgress = 0.15f
            installStatusText = "Conectando con repositorio oficial..."
            delay(400)
            installProgress = 0.45f
            installStatusText = "Descargando paquete ${targetApp.sizeMb}..."
            delay(500)
            installProgress = 0.75f
            installStatusText = "Verificando firma SHA-256 e integridad RASP..."
            delay(450)
            installProgress = 0.95f
            installStatusText = "Inicializando sandbox virtual y asignando hardware id..."
            delay(350)
            installProgress = 1.0f
            installStatusText = "¡Instalación en Sandbox completada!"
            delay(300)
            onInstallDirectly(targetApp)
            installingApp = null
        }

        Dialog(onDismissRequest = {}) {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = DeepSpaceSurface),
                border = androidx.compose.foundation.BorderStroke(1.dp, NeonCyan.copy(alpha = 0.5f)),
                modifier = Modifier.fillMaxWidth().padding(16.dp).testTag("install_progress_dialog")
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(NeonCyan.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Download, contentDescription = null, tint = NeonCyan, modifier = Modifier.size(28.dp))
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Instalando en Sandbox",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )

                    Text(
                        text = targetApp.appName,
                        style = MaterialTheme.typography.bodyMedium.copy(color = NeonCyan)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    LinearProgressIndicator(
                        progress = { installProgress },
                        modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                        color = NeonCyan,
                        trackColor = DeepSpaceSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = installStatusText,
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = TextSecondary,
                            fontFamily = FontFamily.Monospace
                        )
                    )
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepSpaceBackground)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Top Bar
            Surface(
                color = DeepSpaceSurface,
                border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.testTag("back_from_store_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Volver",
                            tint = TextPrimary
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "DualStore™ Play Hub",
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = NeonCyan.copy(alpha = 0.2f),
                                border = androidx.compose.foundation.BorderStroke(1.dp, NeonCyan.copy(alpha = 0.5f))
                            ) {
                                Text(
                                    text = "OFFICIAL",
                                    color = NeonCyan,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Black,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = "Descarga directa a Sandbox & Pruebas de Estrés Multi-Clon",
                            style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                        )
                    }
                }
            }

            // Search Bar & Filter Chips
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Buscar en DualStore (Openbank, BBVA, WhatsApp...)", color = TextMuted) },
                    leadingIcon = {
                        Icon(Icons.Default.Search, contentDescription = null, tint = NeonCyan)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("store_search_input"),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = NeonCyan,
                        unfocusedBorderColor = DeepSpaceBorder,
                        focusedContainerColor = DeepSpaceSurface,
                        unfocusedContainerColor = DeepSpaceSurface,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Category Chips
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(categories) { cat ->
                        val isSelected = selectedCategory == cat
                        val chipColor = if (isSelected) NeonCyan else DeepSpaceSurfaceVariant
                        val textColor = if (isSelected) Color.Black else TextPrimary
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .clickable { selectedCategory = cat }
                                .border(
                                    width = if (isSelected) 1.5.dp else 1.dp,
                                    color = if (isSelected) NeonCyan else DeepSpaceBorder,
                                    shape = RoundedCornerShape(20.dp)
                                ),
                            color = chipColor
                        ) {
                            Text(
                                text = when (cat) {
                                    "Fintech" -> "💳 Banca & Fintech"
                                    "Social" -> "💬 Redes & Chat"
                                    "Gaming" -> "🎮 Juegos"
                                    "Work" -> "💼 Trabajo"
                                    else -> "✨ Todas"
                                },
                                color = textColor,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            }

            // App Store Catalog List
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // FEATURED APP HERO CARD (Openbank México)
                if (searchQuery.isBlank() && (selectedCategory == "Todos" || selectedCategory == "Fintech")) {
                    item {
                        FeaturedAppHeroCard(
                            app = VirtualPlayStoreRepository.featuredApp,
                            existingClonesCount = existingClones.count { it.packageName == VirtualPlayStoreRepository.featuredApp.packageName },
                            onInstall = { installingApp = VirtualPlayStoreRepository.featuredApp },
                            onBatchClone = { onOpenBatchClone(VirtualPlayStoreRepository.featuredApp) },
                            onOpenPlayStore = {
                                openGooglePlayIntent(context, VirtualPlayStoreRepository.featuredApp.packageName)
                            }
                        )
                    }
                }

                // Regular Catalog Items
                items(filteredApps) { app ->
                    val clonesCount = existingClones.count { it.packageName == app.packageName }
                    PlayStoreAppCard(
                        app = app,
                        clonesCount = clonesCount,
                        onInstall = { installingApp = app },
                        onBatchClone = { onOpenBatchClone(app) },
                        onOpenPlayStore = { openGooglePlayIntent(context, app.packageName) }
                    )
                }

                item {
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }
}

@Composable
fun FeaturedAppHeroCard(
    app: PlayStoreAppItem,
    existingClonesCount: Int,
    onInstall: () -> Unit,
    onBatchClone: () -> Unit,
    onOpenPlayStore: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("featured_openbank_card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = DeepSpaceSurface),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, EmeraldSuccess.copy(alpha = 0.6f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp)
        ) {
            // Header Tag
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = EmeraldSuccess.copy(alpha = 0.2f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldSuccess.copy(alpha = 0.5f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(13.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "APP DESTACADA • FINTECH SHIELD™ VERIFICADA",
                            color = EmeraldSuccess,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                if (existingClonesCount > 0) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = NeonCyan.copy(alpha = 0.2f)
                    ) {
                        Text(
                            text = "$existingClonesCount Clones en Sandbox",
                            color = NeonCyan,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // App Info Row
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    modifier = Modifier.size(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFFE63946)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.AccountBalance, contentDescription = null, tint = Color.White, modifier = Modifier.size(32.dp))
                    }
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column {
                    Text(
                        text = app.appName,
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                    Text(
                        text = "${app.developer} • ${app.sizeMb}",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFFBBF24), modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            text = "${app.rating} (${app.reviewsCount}) • v${app.version}",
                            style = MaterialTheme.typography.labelSmall.copy(color = TextMuted)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = app.description,
                style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Action Buttons Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onInstall,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = EmeraldSuccess,
                        contentColor = Color.Black
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1.3f).testTag("install_featured_btn")
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Instalar Sandbox", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                OutlinedButton(
                    onClick = onBatchClone,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFF59E0B)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.6f)),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1.2f).testTag("batch_clone_featured_btn")
                ) {
                    Icon(Icons.Default.ControlPointDuplicate, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Multi-Clonar", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                IconButton(
                    onClick = onOpenPlayStore,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(DeepSpaceSurfaceVariant)
                ) {
                    Icon(Icons.Default.OpenInNew, contentDescription = "Ver en Google Play", tint = TextSecondary, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

@Composable
fun PlayStoreAppCard(
    app: PlayStoreAppItem,
    clonesCount: Int,
    onInstall: () -> Unit,
    onBatchClone: () -> Unit,
    onOpenPlayStore: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("store_card_${app.packageName}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = DeepSpaceSurface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // App Icon
                Surface(
                    modifier = Modifier.size(48.dp),
                    shape = RoundedCornerShape(14.dp),
                    color = getAppStoreColor(app.packageName, app.category)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = when (app.category) {
                                "Fintech" -> Icons.Default.AccountBalance
                                "Social" -> Icons.Outlined.Chat
                                "Gaming" -> Icons.Default.Gamepad
                                else -> Icons.Default.Work
                            },
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = app.appName,
                            style = MaterialTheme.typography.bodyLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            ),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        if (app.isFintechVerified) {
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(Icons.Default.CheckCircle, contentDescription = "Verificada", tint = EmeraldSuccess, modifier = Modifier.size(14.dp))
                        }
                    }

                    Text(
                        text = "${app.developer} • ${app.sizeMb}",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFFBBF24), modifier = Modifier.size(12.dp))
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            text = "${app.rating} ★ (${app.downloadsCount})",
                            style = MaterialTheme.typography.labelSmall.copy(color = TextMuted)
                        )
                        if (clonesCount > 0) {
                            Text(
                                text = " • $clonesCount clones activos",
                                style = MaterialTheme.typography.labelSmall.copy(color = NeonCyan, fontWeight = FontWeight.Bold)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = app.description,
                style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onInstall,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = NeonCyan,
                        contentColor = Color.Black
                    ),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1.2f).testTag("install_app_${app.packageName}")
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(15.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Instalar Sandbox", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                }

                OutlinedButton(
                    onClick = onBatchClone,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFF59E0B)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.5f)),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1.1f).testTag("batch_clone_${app.packageName}")
                ) {
                    Icon(Icons.Default.ControlPointDuplicate, contentDescription = null, modifier = Modifier.size(15.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Multi-Clonar", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                IconButton(
                    onClick = onOpenPlayStore,
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(DeepSpaceSurfaceVariant)
                ) {
                    Icon(Icons.Default.OpenInNew, contentDescription = "Play Store Oficial", tint = TextSecondary, modifier = Modifier.size(16.dp))
                }
            }
        }
    }
}

fun getAppStoreColor(packageName: String, category: String): Color {
    return when {
        packageName.contains("openbank") -> Color(0xFFE63946)
        packageName.contains("santander") -> Color(0xFFEC0000)
        packageName.contains("bbva") -> Color(0xFF004481)
        packageName.contains("nu.") -> Color(0xFF820AD1)
        packageName.contains("mercadopago") -> Color(0xFF009EE3)
        packageName.contains("whatsapp") -> Color(0xFF25D366)
        packageName.contains("telegram") -> Color(0xFF229ED9)
        packageName.contains("instagram") -> Color(0xFFE1306C)
        packageName.contains("tiktok") -> Color(0xFF000000)
        packageName.contains("twitter") || packageName.contains("x.com") -> Color(0xFF1DA1F2)
        packageName.contains("brawlstars") -> Color(0xFFF59E0B)
        packageName.contains("freefire") -> Color(0xFFDC2626)
        category == "Fintech" -> EmeraldSuccess
        category == "Gaming" -> Color(0xFF8B5CF6)
        else -> NeonCyan
    }
}

fun openGooglePlayIntent(context: Context, packageName: String) {
    try {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName")).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    } catch (_: Exception) {
        val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=$packageName")).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(webIntent)
    }
}
