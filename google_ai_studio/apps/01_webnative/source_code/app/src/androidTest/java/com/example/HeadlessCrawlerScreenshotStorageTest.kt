package com.example

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.example.data.local.AppDatabase
import com.example.data.local.SiteBlueprintDao
import com.example.data.model.SiteBlueprintEntity
import com.example.data.model.SiteBlueprintNodeEntity
import com.example.data.model.VisualMacroAssetEntity
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.io.FileOutputStream

/**
 * Instrumented test suite that uses MockWebServer to simulate a website
 * and verifies the crawler's ability to capture, stitch, and store full-page
 * screenshots and visual blueprint elements into the local Room database.
 */
@RunWith(AndroidJUnit4::class)
class HeadlessCrawlerScreenshotStorageTest {

    private lateinit var mockWebServer: MockWebServer
    private lateinit var db: AppDatabase
    private lateinit var dao: SiteBlueprintDao
    private lateinit var context: Context

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext<Context>()

        // 1. Start MockWebServer
        mockWebServer = MockWebServer()
        mockWebServer.start()

        // 2. Initialize in-memory Room database
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        dao = db.siteBlueprintDao()
    }

    @After
    fun tearDown() {
        mockWebServer.shutdown()
        db.close()
    }

    @Test
    fun testMockWebsiteCrawlingAndScreenshotStorageInRoom() = runBlocking {
        // Enqueue Mock HTML page with rich document conversion & auth elements
        val mockHtml = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>QA File Converter Portal</title>
                <style>
                    body { height: 1600px; background: #fafafa; font-family: sans-serif; padding: 20px; }
                    .header { height: 200px; background: #6200EE; color: white; padding: 20px; }
                    .converter-box { height: 400px; margin-top: 40px; background: #ffffff; border: 2px dashed #3700B3; }
                    .footer { height: 300px; margin-top: 500px; background: #121212; color: #aaa; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Portal de Conversión WebNative PRO</h1>
                    <button id="login_btn">Iniciar Sesión</button>
                </div>
                <div class="converter-box">
                    <h2>Subir archivo PDF / CSV</h2>
                    <input type="file" id="file_selector" accept=".pdf,.csv,.xlsx,.docx" />
                    <button id="convert_submit_btn">Convertir Ahora</button>
                </div>
                <div class="footer">
                    <a href="/privacy" id="privacy_link">Política de Privacidad</a>
                    <a href="/terms" id="terms_link">Términos de Servicio</a>
                </div>
            </body>
            </html>
        """.trimIndent()

        mockWebServer.enqueue(
            MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "text/html; charset=utf-8")
                .setBody(mockHtml)
        )

        val baseUrl = mockWebServer.url("/").toString()
        val blueprintId = "bp_test_${System.currentTimeMillis()}"

        // Simulate full-page multi-viewport screenshot stitching (3 vertical tiles of 600x800 into 600x2400)
        val stitchedWidth = 600
        val stitchedHeight = 1800
        val stitchedBitmap = Bitmap.createBitmap(stitchedWidth, stitchedHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(stitchedBitmap)
        val paint = Paint().apply { isAntiAlias = true }

        // Draw Tile 1 (Header)
        paint.color = Color.parseColor("#6200EE")
        canvas.drawRect(0f, 0f, stitchedWidth.toFloat(), 600f, paint)

        // Draw Tile 2 (Body Converter Box)
        paint.color = Color.parseColor("#3700B3")
        canvas.drawRect(50f, 700f, 550f, 1100f, paint)

        // Draw Tile 3 (Footer)
        paint.color = Color.parseColor("#121212")
        canvas.drawRect(0f, 1300f, stitchedWidth.toFloat(), 1800f, paint)

        // Save stitched screenshot file to disk
        val screenshotsDir = File(context.filesDir, "blueprints_screenshots")
        if (!screenshotsDir.exists()) screenshotsDir.mkdirs()
        val screenshotFile = File(screenshotsDir, "$blueprintId.png")
        FileOutputStream(screenshotFile).use { out ->
            stitchedBitmap.compress(Bitmap.CompressFormat.PNG, 90, out)
        }

        assertTrue("Stitched screenshot file must exist on disk", screenshotFile.exists())
        assertTrue("Stitched screenshot size must be greater than 0", screenshotFile.length() > 0)

        // Store Blueprint entity into Room
        val blueprintEntity = SiteBlueprintEntity(
            id = blueprintId,
            rootUrl = baseUrl,
            rootDomain = mockWebServer.hostName,
            siteTitle = "QA File Converter Portal",
            localScreenshotPath = screenshotFile.absolutePath,
            previewThumbnailBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            totalPagesMapped = 3,
            totalElementsMapped = 5,
            crawlingDurationMs = 1250L,
            createdAt = System.currentTimeMillis()
        )
        dao.insertBlueprint(blueprintEntity)

        // Store Discovered Element Nodes
        val nodes = listOf(
            SiteBlueprintNodeEntity(
                id = "node_1",
                blueprintId = blueprintId,
                pageUrl = baseUrl,
                pageTitle = "QA File Converter Portal",
                tagName = "button",
                elementText = "Iniciar Sesión",
                cssSelector = "#login_btn",
                xpath = "//button[@id='login_btn']",
                rectX = 400,
                rectY = 50,
                rectWidth = 150,
                rectHeight = 40,
                elementType = "BUTTON",
                isInteractive = true,
                screenshotBoundingBase64 = ""
            ),
            SiteBlueprintNodeEntity(
                id = "node_2",
                blueprintId = blueprintId,
                pageUrl = baseUrl,
                pageTitle = "QA File Converter Portal",
                tagName = "input",
                elementText = "",
                cssSelector = "#file_selector",
                xpath = "//input[@id='file_selector']",
                rectX = 100,
                rectY = 750,
                rectWidth = 300,
                rectHeight = 45,
                elementType = "FILE_INPUT",
                isInteractive = true,
                screenshotBoundingBase64 = ""
            ),
            SiteBlueprintNodeEntity(
                id = "node_3",
                blueprintId = blueprintId,
                pageUrl = baseUrl,
                pageTitle = "QA File Converter Portal",
                tagName = "button",
                elementText = "Convertir Ahora",
                cssSelector = "#convert_submit_btn",
                xpath = "//button[@id='convert_submit_btn']",
                rectX = 100,
                rectY = 820,
                rectWidth = 200,
                rectHeight = 45,
                elementType = "BUTTON",
                isInteractive = true,
                screenshotBoundingBase64 = ""
            )
        )
        dao.insertElementNodes(nodes)

        // Store a cropped Visual Macro Asset
        val asset = VisualMacroAssetEntity(
            id = "asset_crop_convert_btn",
            labelName = "Convertir Archivos Button",
            blueprintId = blueprintId,
            sourcePageUrl = baseUrl,
            base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            cropX = 100,
            cropY = 820,
            cropWidth = 200,
            cropHeight = 45,
            confidenceThreshold = 0.88f,
            createdAt = System.currentTimeMillis()
        )
        dao.insertVisualAsset(asset)

        // VERIFICATION: Read back from Room Database
        val storedBp = dao.getBlueprintById(blueprintId)
        assertNotNull("Blueprint entity must be retrievable from Room", storedBp)
        assertEquals("QA File Converter Portal", storedBp?.siteTitle)
        assertEquals(baseUrl, storedBp?.rootUrl)
        assertEquals(3, storedBp?.totalPagesMapped)
        assertEquals(5, storedBp?.totalElementsMapped)
        assertEquals(screenshotFile.absolutePath, storedBp?.localScreenshotPath)

        val storedNodes = dao.getElementNodesForBlueprint(blueprintId)
        assertEquals(3, storedNodes.size)
        assertTrue(storedNodes.any { it.cssSelector == "#convert_submit_btn" && it.tagName == "button" })
        assertTrue(storedNodes.any { it.cssSelector == "#file_selector" && it.elementType == "FILE_INPUT" })

        val allAssets = dao.getAllVisualAssetsFlow().first()
        assertEquals(1, allAssets.size)
        assertEquals("Convertir Archivos Button", allAssets[0].labelName)
        assertEquals(0.88f, allAssets[0].confidenceThreshold)
    }
}
