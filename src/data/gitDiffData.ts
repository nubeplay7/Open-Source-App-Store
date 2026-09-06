import { GitPatchItem } from '../types';

export const SAMPLE_GIT_PATCHES: GitPatchItem[] = [
  {
    id: 'patch-001',
    title: 'fix(shizuku): Agregar soporte para auto-reconexión de Binder IPC tras reboot',
    author: 'CiberDev Core Team',
    createdAt: '2026-08-31 03:15:00',
    targetRepo: 'nubeplay/ciber-store-app',
    status: 'APPLIED',
    description: 'Implementa escucha de eventos Shizuku.OnBinderReceivedListener con backoff exponencial.',
    files: [
      {
        filePath: 'app/src/main/java/org/ciberstore/shizuku/BinderClient.kt',
        status: 'MODIFIED',
        additions: 18,
        deletions: 4,
        diffHunks: [
          `@@ -42,7 +42,21 @@ class BinderClient : Shizuku.OnBinderReceivedListener {
-    fun connect() {
-        Shizuku.pingBinder()
-    }
+    fun connectWithRetry(maxRetries: Int = 5) {
+        var attempts = 0
+        while (attempts < maxRetries) {
+            if (Shizuku.pingBinder()) {
+                isReady.set(true)
+                notifyListeners()
+                return
+            }
+            Thread.sleep((1000L * Math.pow(1.5, attempts.toDouble())).toLong())
+            attempts++
+        }
+        Log.w(TAG, "Shizuku service not responding after $maxRetries attempts")
+    }`
        ]
      },
      {
        filePath: 'app/build.gradle.kts',
        status: 'MODIFIED',
        additions: 1,
        deletions: 1,
        diffHunks: [
          `@@ -15,1 +15,1 @@
-    implementation("dev.rikka.shizuku:api:13.1.0")
+    implementation("dev.rikka.shizuku:api:13.1.5")`
        ]
      }
    ]
  },
  {
    id: 'patch-002',
    title: 'feat(p2p): Implementar WebRTC DataChannels para transferencias directas sin WiFi Router',
    author: 'Security Mesh SIG',
    createdAt: '2026-08-30 22:40:00',
    targetRepo: 'nubeplay/ciber-store-app',
    status: 'DRAFT',
    description: 'Añade canal de datos P2P con chunking de 64KB y verificación SHA-256 en vuelo.',
    files: [
      {
        filePath: 'app/src/main/java/org/ciberstore/p2p/DataChannelTransfer.kt',
        status: 'ADDED',
        additions: 84,
        deletions: 0,
        diffHunks: [
          `@@ -0,0 +1,84 @@
+package org.ciberstore.p2p
+
+import org.webrtc.DataChannel
+import java.nio.ByteBuffer
+import java.security.MessageDigest
+
+class DataChannelTransfer(private val channel: DataChannel) {
+    private val digest = MessageDigest.getInstance("SHA-256")
+    
+    fun sendChunk(bytes: ByteArray) {
+        val buffer = DataChannel.Buffer(ByteBuffer.wrap(bytes), true)
+        channel.send(buffer)
+        digest.update(bytes)
+    }
+}`
        ]
      }
    ]
  }
];
