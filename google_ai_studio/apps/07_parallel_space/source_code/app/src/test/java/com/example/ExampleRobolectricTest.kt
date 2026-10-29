package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.core.ActiveAppSession
import com.example.core.DualSpaceCheckpointManager
import com.example.core.DualSpaceResourceManager
import com.example.core.DualSpaceSessionVault
import com.example.core.ResourceProfile
import com.example.data.ClonedAppEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

    @Test
    fun `read string from context`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("Parallel Space", appName)
    }

    @Test
    fun `test checkpoint serialization and disk recovery`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val testApp = ClonedAppEntity(
            id = 555L,
            appName = "Openbank Checkpoint Test",
            packageName = "mx.openbank.modelbank",
            originalName = "Openbank",
            category = "Fintech",
            webUrl = "https://www.openbank.mx"
        )

        val session = ActiveAppSession(
            appId = testApp.id,
            app = testApp,
            currentUrl = "https://www.openbank.mx/dashboard",
            currentTitle = "Dashboard Seguro"
        )

        // Save Checkpoint
        val checkpoint = DualSpaceCheckpointManager.saveSessionCheckpoint(context, session, reason = "TEST_REASON")
        assertNotNull(checkpoint)
        assertEquals(555L, checkpoint?.appId)
        assertEquals("https://www.openbank.mx/dashboard", checkpoint?.currentUrl)

        // Load Checkpoint from disk
        val loaded = DualSpaceCheckpointManager.loadSessionCheckpoint(context, 555L)
        assertNotNull(loaded)
        assertEquals(555L, loaded?.appId)
        assertEquals("Dashboard Seguro", loaded?.currentTitle)
    }

    @Test
    fun `test resource management and throttling profiles`() {
        val context = ApplicationProvider.getApplicationContext<Context>()

        // Check system memory calculation
        val memSnapshot = DualSpaceResourceManager.getSystemMemoryInfo(context)
        assertNotNull(memSnapshot)
        assertTrue(memSnapshot.totalMemMb > 0)

        // Set and verify profile
        DualSpaceResourceManager.setResourceProfile(ResourceProfile.ECO_SAVER)
        assertEquals(ResourceProfile.ECO_SAVER, DualSpaceResourceManager.currentProfileFlow.value)

        DualSpaceResourceManager.setResourceProfile(ResourceProfile.BALANCED)
        assertEquals(ResourceProfile.BALANCED, DualSpaceResourceManager.currentProfileFlow.value)
    }
}
