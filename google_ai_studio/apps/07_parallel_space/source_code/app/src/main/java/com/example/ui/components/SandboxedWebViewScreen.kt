package com.example.ui.components

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.core.DualSpaceSessionVault
import com.example.data.ClonedAppEntity
import com.example.ui.theme.DeepSpaceBackground
import com.example.ui.theme.DeepSpaceBorder
import com.example.ui.theme.DeepSpaceSurface
import com.example.ui.theme.DeepSpaceSurfaceVariant
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun SandboxedWebViewScreen(
    app: ClonedAppEntity,
    onMinimize: () -> Unit,
    onClose: () -> Unit,
    onSwitchToApp: (ClonedAppEntity) -> Unit = {}
) {
    val context = LocalContext.current
    val allRunningSessions by DualSpaceSessionVault.runningSessionsFlow.collectAsState()

    var isDesktopMode by remember { mutableStateOf(app.packageName.contains("whatsapp")) }
    var loadProgress by remember { mutableFloatStateOf(0f) }
    var isLoading by remember { mutableStateOf(false) }

    val defaultDesktopUA =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    // Obtain or restore the cached session from memory pool
    val activeSession = remember(app.id) {
        DualSpaceSessionVault.getOrCreateSession(context, app)
    }
    val webViewInstance = activeSession.webView

    // Handle Android system back: if webview can navigate back, go back; otherwise MINIMIZE to preserve session
    BackHandler {
        if (webViewInstance?.canGoBack() == true) {
            webViewInstance.goBack()
        } else {
            DualSpaceSessionVault.minimizeSession(context, app.id)
            onMinimize()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepSpaceBackground)
    ) {
        // Top Sandbox Navigation Bar
        Surface(
            color = DeepSpaceSurface,
            modifier = Modifier.fillMaxWidth(),
            border = androidx.compose.foundation.BorderStroke(1.dp, DeepSpaceBorder)
        ) {
            Column {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        // Minimize to background (retains session)
                        IconButton(
                            onClick = {
                                DualSpaceSessionVault.minimizeSession(context, app.id)
                                onMinimize()
                            },
                            modifier = Modifier.testTag("minimize_sandbox_btn")
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Minimizar sesión a segundo plano",
                                tint = TextPrimary
                            )
                        }

                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = app.appName,
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    ),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = if (app.isFintechProtected) EmeraldSuccess else NeonCyan
                                ) {
                                    Text(
                                        text = if (app.isFintechProtected) "FINTECH SECURE" else "PERSISTENT",
                                        fontSize = 8.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Color.Black,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                    )
                                }
                            }
                            Text(
                                text = "Sesión activa en segundo plano • Sin pérdida de avance",
                                style = MaterialTheme.typography.labelSmall.copy(color = TextMuted),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    // Action Controls
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        // Desktop Mode Toggle
                        IconButton(
                            onClick = {
                                isDesktopMode = !isDesktopMode
                                webViewInstance?.settings?.apply {
                                    userAgentString = if (isDesktopMode) defaultDesktopUA else null
                                    useWideViewPort = isDesktopMode
                                    loadWithOverviewMode = isDesktopMode
                                }
                                webViewInstance?.reload()
                            }
                        ) {
                            Icon(
                                imageVector = if (isDesktopMode) Icons.Default.Computer else Icons.Default.PhoneAndroid,
                                contentDescription = "Toggle Desktop Mode",
                                tint = if (isDesktopMode) NeonCyan else TextSecondary
                            )
                        }

                        // Reload Button
                        IconButton(onClick = { webViewInstance?.reload() }) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Reload",
                                tint = TextSecondary
                            )
                        }

                        // Close / Terminate session completely
                        IconButton(
                            onClick = {
                                DualSpaceSessionVault.closeSession(context, app.id)
                                onClose()
                            },
                            modifier = Modifier.testTag("close_sandbox_btn")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Cerrar sesión completamente",
                                tint = Color(0xFFFB7185)
                            )
                        }
                    }
                }

                if (isLoading) {
                    LinearProgressIndicator(
                        progress = { loadProgress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(2.dp),
                        color = NeonCyan,
                        trackColor = Color.Transparent
                    )
                }
            }
        }

        // Virtual Fingerprint & Session Preservation Status Bar
        Surface(
            color = DeepSpaceSurfaceVariant,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Security,
                        contentDescription = null,
                        tint = EmeraldSuccess,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Sandbox Persistente: ${app.virtualDeviceModel.take(14)} (ID: ${app.virtualAndroidId.take(8)})",
                        color = TextSecondary,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = EmeraldSuccess.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = "Activo en RAM",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldSuccess,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }
        }

        // The Web Sandbox View with Floating Multitask Switcher
        Box(modifier = Modifier.weight(1f)) {
            AndroidView(
                factory = {
                    webViewInstance?.apply {
                        // Hook clients to update loading indicators
                        webViewClient = object : WebViewClient() {
                            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                isLoading = true
                            }

                            override fun onPageFinished(view: WebView?, url: String?) {
                                isLoading = false
                            }
                        }

                        webChromeClient = object : WebChromeClient() {
                            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                                loadProgress = newProgress / 100f
                                if (newProgress == 100) isLoading = false
                            }
                        }

                        val parent = parent as? ViewGroup
                        parent?.removeView(this)
                    } ?: WebView(context)
                },
                modifier = Modifier.fillMaxSize()
            )

            // Multitasking Bar (shows other running background apps to switch seamlessly)
            val otherSessions = allRunningSessions.filter { it.appId != app.id }
            if (otherSessions.isNotEmpty()) {
                Surface(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 14.dp, start = 12.dp, end = 12.dp),
                    shape = RoundedCornerShape(24.dp),
                    color = DeepSpaceSurface.copy(alpha = 0.95f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NeonCyan.copy(alpha = 0.5f)),
                    shadowElevation = 8.dp
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Layers,
                            contentDescription = "Otras apps abiertas",
                            tint = NeonCyan,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Cambiar a:",
                            color = TextMuted,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            items(otherSessions) { other ->
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = DeepSpaceSurfaceVariant,
                                    modifier = Modifier.clickable {
                                        DualSpaceSessionVault.minimizeSession(context, app.id)
                                        onSwitchToApp(other.app)
                                    }
                                ) {
                                    val otherColor = remember(other.app.badgeColorHex) {
                                        runCatching { Color(android.graphics.Color.parseColor(other.app.badgeColorHex)) }.getOrDefault(NeonCyan)
                                    }
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(8.dp)
                                                .clip(CircleShape)
                                                .background(otherColor)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = other.app.appName,
                                            color = TextPrimary,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
