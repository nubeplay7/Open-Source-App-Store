package com.example.ui.components

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.util.ADBManager
import com.example.util.AdbScript
import com.example.util.AdbScriptCategory
import com.example.util.AdbScriptRepository
import com.example.util.AdbScriptSuite
import com.example.util.AppLogger
import com.example.util.HardwareAccelerationInfo
import com.example.util.ScriptRiskLevel
import kotlinx.coroutines.launch

@Composable
fun CommandTerminalCard(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val clipboardManager = LocalClipboardManager.current

    var currentCommand by remember { mutableStateOf("getprop sys.usb.config") }
    var terminalOutput by remember {
        mutableStateOf(
            "=== WebNative Pro ADB / Shell Terminal ===\n" +
            "Directorio activo: ${context.filesDir.absolutePath}\n" +
            "Escribe un comando o selecciona un script de optimización.\n"
        )
    }
    var isExecuting by remember { mutableStateOf(false) }
    var hwInfo by remember { mutableStateOf<HardwareAccelerationInfo?>(null) }
    var showQuickProperties by remember { mutableStateOf(false) }
    var showScriptRepository by remember { mutableStateOf(true) }
    var showSuites by remember { mutableStateOf(true) }
    var selectedCategory by remember { mutableStateOf(AdbScriptCategory.PERFORMANCE) }
    var systemProperties by remember { mutableStateOf<Map<String, String>>(emptyMap()) }

    val scrollState = rememberScrollState()
    val chipScrollState = rememberScrollState()

    // Fetch initial hardware acceleration status
    LaunchedEffect(Unit) {
        hwInfo = ADBManager.getHardwareAccelerationInfo()
    }

    val quickCommands = listOf(
        "getprop sys.usb.config",
        "getprop persist.sys.adb.config",
        "getprop debug.hwui.renderer",
        "dumpsys battery",
        "pm list features | grep opengl",
        "getprop ro.product.model",
        "cat /proc/meminfo | head -n 8",
        "uname -a"
    )

    fun runCommand(cmd: String) {
        if (cmd.isBlank() || isExecuting) return
        isExecuting = true
        AppLogger.log(context, "Ejecutando comando terminal: $cmd", tag = "TERMINAL")

        coroutineScope.launch {
            terminalOutput += "\n$ $cmd\n"
            val result = ADBManager.execShellCommand(cmd)
            
            if (result.stdout.isNotBlank()) {
                terminalOutput += result.stdout + "\n"
            }
            if (result.stderr.isNotBlank()) {
                terminalOutput += "[STDERR] ${result.stderr}\n"
            }
            terminalOutput += "[Retorno: ${result.exitCode} en ${result.executionTimeMs}ms]\n"

            // refresh HW status if relevant
            if (cmd.contains("debug.hwui") || cmd.contains("setprop")) {
                hwInfo = ADBManager.getHardwareAccelerationInfo()
            }
            isExecuting = false
        }
    }

    fun runSuite(suite: AdbScriptSuite) {
        if (isExecuting) return
        isExecuting = true
        AppLogger.log(context, "Ejecutando suite de optimización: ${suite.title}", tag = "TERMINAL")

        coroutineScope.launch {
            terminalOutput += "\n=== INICIANDO SUITE: ${suite.title.uppercase()} ===\n"
            suite.scripts.forEach { script ->
                terminalOutput += "$ ${script.command}\n"
                val result = ADBManager.execShellCommand(script.command)
                if (result.stdout.isNotBlank()) {
                    terminalOutput += result.stdout + "\n"
                }
                if (result.stderr.isNotBlank()) {
                    terminalOutput += "[STDERR] ${result.stderr}\n"
                }
            }
            terminalOutput += "=== SUITE ${suite.title} FINALIZADA CON ÉXITO ===\n"
            hwInfo = ADBManager.getHardwareAccelerationInfo()
            isExecuting = false
            Toast.makeText(context, "Suite '${suite.title}' aplicada al sistema", Toast.LENGTH_SHORT).show()
        }
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ElegantCard),
        shape = RoundedCornerShape(24.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, ElegantCardBorder)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .background(LavenderPrimary.copy(alpha = 0.2f), RoundedCornerShape(14.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Terminal, contentDescription = null, tint = LavenderPrimary, modifier = Modifier.size(24.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("Terminal Shell & Motor ADB", fontWeight = FontWeight.Bold, color = TextWhite, fontSize = 15.sp)
                        Text("Aceleración por Hardware y Diagnóstico", fontSize = 11.sp, color = TextGrayMuted)
                    }
                }

                Row {
                    IconButton(onClick = {
                        clipboardManager.setText(AnnotatedString(terminalOutput))
                        AppLogger.log(context, "Copiado volcado del terminal al portapapeles", tag = "TERMINAL")
                    }) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Copiar salida", tint = TextGrayMuted, modifier = Modifier.size(18.dp))
                    }
                    IconButton(onClick = {
                        terminalOutput = "=== Terminal Limpio ===\n"
                    }) {
                        Icon(Icons.Default.Delete, contentDescription = "Limpiar consola", tint = TextGrayMuted, modifier = Modifier.size(18.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Hardware Acceleration Toggle Section
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color.Black.copy(alpha = 0.25f))
                    .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(14.dp))
                    .padding(12.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Speed,
                                contentDescription = null,
                                tint = if (hwInfo?.isHardwareAccelerated == true) MintSpeed else AmberEnergy,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = "Aceleración Gráfica (RenderThread)",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextWhite
                                )
                                Text(
                                    text = "Motor: ${hwInfo?.renderer ?: "OpenGL ES / Vulkan"} • Estado: ${hwInfo?.statusLabel ?: "Activo"}",
                                    fontSize = 10.sp,
                                    color = TextGrayMuted
                                )
                            }
                        }

                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    val enable = !(hwInfo?.isHardwareAccelerated ?: true)
                                    val res = ADBManager.toggleHardwareAcceleration(enable)
                                    terminalOutput += "\n[HardwareBoost] ${res.output}\n"
                                    hwInfo = ADBManager.getHardwareAccelerationInfo()
                                    AppLogger.log(context, "Toggle Aceleración Hardware: $enable -> ${res.success}", tag = "TERMINAL")
                                }
                            },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (hwInfo?.isHardwareAccelerated == true) DeepPurpleContainer else MintSpeed
                            ),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text(
                                text = if (hwInfo?.isHardwareAccelerated == true) "Optimizado" else "Activar Boost",
                                fontSize = 10.sp,
                                color = if (hwInfo?.isHardwareAccelerated == true) LavenderOnContainer else DeepPurpleOnPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Quick Preset Commands Bar
            Text("Comandos Rápidos de Diagnóstico:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextWhite)
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(chipScrollState),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                quickCommands.forEach { cmd ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.White.copy(alpha = 0.05f))
                            .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(8.dp))
                            .clickable {
                                currentCommand = cmd
                                runCommand(cmd)
                            }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = cmd,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            color = LavenderPrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Terminal Black Box Output
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color.Black.copy(alpha = 0.85f))
                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(14.dp))
                    .padding(10.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(scrollState)
                ) {
                    Text(
                        text = terminalOutput,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        color = Color(0xFF00FF66), // Retro Matrix Terminal Green
                        lineHeight = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Command Input Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = currentCommand,
                    onValueChange = { currentCommand = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Ej: getprop sys.usb.config", fontSize = 12.sp, color = TextGrayMuted) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = LavenderPrimary,
                        unfocusedBorderColor = ElegantCardBorder,
                        focusedTextColor = TextWhite,
                        unfocusedTextColor = TextWhite
                    ),
                    shape = RoundedCornerShape(12.dp),
                    textStyle = LocalTextStyle.current.copy(
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp
                    )
                )

                Button(
                    onClick = { runCommand(currentCommand) },
                    enabled = !isExecuting && currentCommand.isNotBlank(),
                    modifier = Modifier.height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = LavenderPrimary)
                ) {
                    if (isExecuting) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), color = DeepPurpleOnPrimary, strokeWidth = 2.dp)
                    } else {
                        Icon(Icons.Default.PlayArrow, contentDescription = "Ejecutar", tint = DeepPurpleOnPrimary, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("RUN", fontWeight = FontWeight.Bold, color = DeepPurpleOnPrimary, fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Script Repo & Suites Section
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .clickable { showScriptRepository = !showScriptRepository }
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Bolt, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "ScriptRepo: Biblioteca de Scripts & Suites ADB",
                        fontSize = 12.sp,
                        color = MintSpeed,
                        fontWeight = FontWeight.Bold
                    )
                }
                Icon(
                    imageVector = if (showScriptRepository) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = MintSpeed,
                    modifier = Modifier.size(18.dp)
                )
            }

            AnimatedVisibility(visible = showScriptRepository) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.Black.copy(alpha = 0.3f))
                        .border(1.dp, MintSpeed.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    // One-Tap Suites Banner
                    Text("Packs de Optimización 1-Tap (Suites Verificadas):", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextWhite)
                    Spacer(modifier = Modifier.height(6.dp))

                    val allSuites = remember { AdbScriptRepository.getAllSuites() }
                    allSuites.forEach { suite ->
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(DeepPurpleContainer.copy(alpha = 0.4f))
                                .border(1.dp, LavenderPrimary.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                                .padding(10.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = MintSpeed, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(suite.title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextWhite)
                                    }
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(suite.description, fontSize = 10.sp, color = TextGrayLight)
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text("Impacto: ${suite.expectedBenefit} • ${suite.scripts.size} comandos", fontSize = 9.sp, color = MintSpeed, fontWeight = FontWeight.SemiBold)
                                }

                                Spacer(modifier = Modifier.width(8.dp))

                                Button(
                                    onClick = { runSuite(suite) },
                                    enabled = !isExecuting,
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = MintSpeed),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                    modifier = Modifier.height(32.dp)
                                ) {
                                    Icon(Icons.Default.FlashOn, contentDescription = null, tint = DeepPurpleOnPrimary, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("1-Tap Apply", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = DeepPurpleOnPrimary)
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Divider(color = ElegantCardBorder)
                    Spacer(modifier = Modifier.height(8.dp))

                    // Individual Category selector
                    Text("Scripts Individuales Verificados:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextWhite)
                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        AdbScriptCategory.entries.forEach { cat ->
                            val isSelected = selectedCategory == cat
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isSelected) MintSpeed else Color.White.copy(alpha = 0.06f))
                                    .clickable { selectedCategory = cat }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = cat.label,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) DeepPurpleOnPrimary else TextGrayLight
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Scripts list
                    val currentScripts = remember(selectedCategory) {
                        AdbScriptRepository.getScriptsByCategory(selectedCategory)
                    }

                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        currentScripts.forEach { script ->
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color.Black.copy(alpha = 0.4f))
                                    .border(1.dp, ElegantCardBorder, RoundedCornerShape(10.dp))
                                    .padding(10.dp)
                            ) {
                                Column {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Text(
                                                    text = script.title,
                                                    fontSize = 12.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = TextWhite
                                                )
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Box(
                                                    modifier = Modifier
                                                        .clip(RoundedCornerShape(4.dp))
                                                        .background(
                                                            when (script.riskLevel) {
                                                                ScriptRiskLevel.RECOMMENDED -> MintSpeed.copy(alpha = 0.2f)
                                                                ScriptRiskLevel.SAFE -> LavenderPrimary.copy(alpha = 0.2f)
                                                                ScriptRiskLevel.ADVANCED -> AmberEnergy.copy(alpha = 0.2f)
                                                            }
                                                        )
                                                        .padding(horizontal = 4.dp, vertical = 1.dp)
                                                ) {
                                                    Text(
                                                        text = script.riskLevel.label,
                                                        fontSize = 8.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        color = when (script.riskLevel) {
                                                            ScriptRiskLevel.RECOMMENDED -> MintSpeed
                                                            ScriptRiskLevel.SAFE -> LavenderPrimary
                                                            ScriptRiskLevel.ADVANCED -> AmberEnergy
                                                        }
                                                    )
                                                }
                                            }
                                            Spacer(modifier = Modifier.height(2.dp))
                                            Text(
                                                text = script.description,
                                                fontSize = 10.sp,
                                                color = TextGrayMuted,
                                                lineHeight = 13.sp
                                            )
                                        }

                                        Spacer(modifier = Modifier.width(8.dp))

                                        Button(
                                            onClick = {
                                                currentCommand = script.command
                                                runCommand(script.command)
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = MintSpeed),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                            modifier = Modifier.height(32.dp),
                                            enabled = !isExecuting
                                        ) {
                                            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(14.dp), tint = DeepPurpleOnPrimary)
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("RUN", fontSize = 10.sp, fontWeight = FontWeight.Black, color = DeepPurpleOnPrimary)
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(6.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = script.command,
                                            fontSize = 9.sp,
                                            color = TextGrayLight.copy(alpha = 0.7f),
                                            fontFamily = FontFamily.Monospace,
                                            maxLines = 1,
                                            modifier = Modifier.weight(1f)
                                        )
                                        Text(
                                            text = script.performanceImpact,
                                            fontSize = 9.sp,
                                            color = MintSpeed,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Quick Diagnostic Properties accordion toggle
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .clickable {
                        showQuickProperties = !showQuickProperties
                        if (showQuickProperties && systemProperties.isEmpty()) {
                            systemProperties = ADBManager.getQuickSystemDiagnostics()
                        }
                    }
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Ver Diagnóstico de Propiedades del Sistema",
                    fontSize = 11.sp,
                    color = LavenderPrimary,
                    fontWeight = FontWeight.SemiBold
                )
                Icon(
                    imageVector = if (showQuickProperties) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = LavenderPrimary,
                    modifier = Modifier.size(18.dp)
                )
            }

            AnimatedVisibility(visible = showQuickProperties) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color.Black.copy(alpha = 0.2f))
                        .padding(10.dp)
                ) {
                    systemProperties.forEach { (label, value) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 2.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = label, color = TextGrayMuted, fontSize = 10.sp)
                            Text(
                                text = value,
                                color = if (value.contains("adb", ignoreCase = true) || value == "1") MintSpeed else TextWhite,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
        }
    }
}
