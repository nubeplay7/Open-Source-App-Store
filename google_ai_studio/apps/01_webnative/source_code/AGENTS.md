# 🤖 WEB NATIVE PRO - AI AGENT PROTOCOL & SYSTEM INSTRUCTIONS

This file is automatically injected into the context of any AI Agent working on this repository. 
**ALL AGENTS MUST ADHERE STRICTLY TO THESE PROTOCOLS.**

---

## 🎯 1. CORE DIRECTIVE: FUNCTIONALITY AND AUTOMATION FIRST
By explicit mandate of the project owner: **The absolute priority for this project is FUNCTIONALITY, specifically maintaining and improving the CI/CD pipeline, the OTA (Over-The-Air) update loop, and the Model Context Protocol (MCP) Agent Bridge.**
- Do NOT implement restrictive security measures if they risk breaking the automation, GitHub connections, or auto-update features.
- Ensure that the application always works smoothly and seamlessly updates itself without requiring a PC or Termux.

---

## 🏗️ 2. ARCHITECTURE PATTERNS & MODULES
This application is a self-updating, autonomous WebNative runtime and remote AI agent server built with Kotlin and Jetpack Compose.
- **UI Framework**: Strictly Jetpack Compose (Material Design 3). Avoid XML layouts.
- **Agent Bridge Server (`AgentBridgeServer.kt`)**: Micro-server on port `8765` handling HTTP 1.1 REST, MCP JSON-RPC 2.0 (`/mcp`), Server-Sent Events (`/api/v1/events`), WebSockets (`/ws`), and the pairing portal (`/handshake`).
- **MCP Skills Registry (`McpAgentSkillsRegistry.kt`)**: Catalog of 90+ native tools across 14 categories.
- **Handshake & Security (`AgentHandshakeManager.kt`)**: Manages pairing PINs (`WN-XXXX`), 32-char cryptographic secrets, rate-limiting guards, and 24-hour session tokens.
- **Multi-Format Sharing Engine (`AgentShareFormatsEngine.kt` & `AgentZipExportHelper.kt`)**: Generates 18 connection formats and packaged ZIP archives (`/pack.zip`).
- **Acoustic Modem (`AgentAcousticModemHelper.kt`)**: Synthesizes harmonic chimes and FSK audio pulses for acoustic microphone handshakes.
- **UDP Discovery Beacon (`AgentUdpDiscoveryBeacon.kt`)**: Dual-mode engine on port `8766` for LAN broadcast and instant response.
- **CI/CD Control Center (`GitHubControlPanelCard.kt`)**: Acts as the frontend trigger for manual OTA updates and GitHub Actions dispatches.
- **Backend OTA Engine (`OtaUpdateManager.kt` & `GitHubApiAutomation.kt`)**: Handles REST API calls to GitHub to trigger workflows, poll for completion, download the compiled APK, and prompt installation via `FileProvider`.
- **Web Interface (`TurboWebView.kt`)**: Renders web apps with advanced native permissions enabled (Camera, Mic, Storage) and JavaScript injection capabilities.
- **Concurrency**: Always use Kotlin Coroutines (`Dispatchers.IO` for network/disk/audio operations) to prevent blocking the Main (UI) thread.

---

## 📚 3. KEY SPECIFICATIONS & DOCUMENTATION INDEX
- 📋 [**PRD.md**](./PRD.md): Product Requirements Document (Vision, Pillars, User Stories).
- 🏗️ [**SDD.md**](./SDD.md): Software Design Document (Architecture, Protocols, Security Model).
- 🧰 [**SKILLS_CATALOG.md**](./docs/SKILLS_CATALOG.md): Full documentation of all 90+ MCP skills with parameter schemas.
- 📡 [**AGENT_API_REFERENCE.md**](./docs/AGENT_API_REFERENCE.md): Exhaustive REST, SSE, WebSocket, and JSON-RPC API reference.

---

## 🚨 4. COMMON PITFALLS & ANTI-BREAKAGE RULES (CRITICAL)
- **The Invisible Kotlin/Compose Bug**: In previous iterations, mismatched JVM targets (e.g., Java 11 vs Kotlin 2.0.21) and missing Compose compiler configurations caused the app to compile successfully but package an *empty* APK without the Compose UI components. 
  - **RULE**: NEVER alter `build.gradle.kts` compiler versions, JVM targets, or Kotlin plugins unless explicitly required, fully understood, and carefully verified.
- **WebUSB Limitations**: Android devices cannot connect to themselves via WebUSB. Do not attempt to route local Chrome WebUSB to the local ADB port. Rely on the OTA Update Engine via GitHub Actions instead.
- **Do Not Guess Structure**: Future agents must fully read (`view_file`) the files they are going to modify to understand the context. No blind edits.

---

## 🔄 5. MANDATORY CI/CD PROTOCOLS
When making updates or adding features, agents must respect the OTA loop:
1. **GitHub Actions**: The workflow (`build-and-release.yml`) compiles the APK and creates a GitHub Release.
2. **Polling Engine**: The app polls the GitHub API every 15 seconds to monitor the GitHub Actions run status. Do not decrease this interval to avoid rate-limiting.
3. **Seamless Hand-off**: Once the workflow succeeds, the app automatically downloads the APK and uses Android's Package Installer API. Do NOT introduce manual steps in this process.

---

## 🧪 6. AGENT WORKFLOW & VERIFICATION
1. **Analyze First**: Review the CI/CD, Agent Bridge, and OTA classes before modifying them.
2. **Log and Document**: Leave clear inline comments in the code explaining complex logic so future agents understand the "why".
3. **Compile & Verify**: You MUST use the `compile_applet` tool after making edits. Never end a turn with broken code. Wait for `BUILD SUCCESSFUL`.

---

## 📝 7. INTERNAL LOGGING SYSTEM (OBSERVABILITY)
To ensure full observability for both the user and future agents, a local on-device logging system exists: `com.example.util.AppLogger`.
- **RULE**: Whenever you implement complex logic, network calls, or CI/CD modifications, you MUST inject `AppLogger.log(context, "Your action/status")`.
- This allows the user to see exactly what the app is doing in real-time via the "Registros del Sistema (Logs)" UI. 
- If an agent-written feature fails, the user can read these logs and share them with the agent, completely eliminating the need for ADB logcat or guessing.
