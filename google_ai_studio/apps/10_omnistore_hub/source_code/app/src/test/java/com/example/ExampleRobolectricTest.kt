package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
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
    assertEquals("OmniStore", appName)
  }

  @Test
  fun `resolve Google Drive direct url test`() {
    val driveUrl = "https://drive.google.com/file/d/1BxyZ987654321/view?usp=sharing"
    val resolved = com.example.data.remote.CloudUrlResolver.resolveDirectApkUrl(driveUrl)
    assertEquals("Google Drive", resolved.sourceType)
    assertEquals(true, resolved.directDownloadUrl.contains("1BxyZ987654321"))
    assertEquals(true, resolved.directDownloadUrl.contains("export=download"))
  }

  @Test
  fun `resolve Dropbox direct url test`() {
    val dropboxUrl = "https://www.dropbox.com/s/abcdef12345/app-release.apk?dl=0"
    val resolved = com.example.data.remote.CloudUrlResolver.resolveDirectApkUrl(dropboxUrl)
    assertEquals("Dropbox", resolved.sourceType)
    assertEquals(true, resolved.directDownloadUrl.contains("dl=1"))
  }

  @Test
  fun `resolve S3 direct url test`() {
    val s3Url = "https://my-bucket.s3.amazonaws.com/builds/app.apk"
    val resolved = com.example.data.remote.CloudUrlResolver.resolveDirectApkUrl(s3Url)
    assertEquals("Cloud S3", resolved.sourceType)
    assertEquals(s3Url, resolved.directDownloadUrl)

    val ds3Url = "https://ds3-storage.cloud/builds/app.apk"
    val ds3Resolved = com.example.data.remote.CloudUrlResolver.resolveDirectApkUrl(ds3Url)
    assertEquals("Servidor DS3", ds3Resolved.sourceType)
    assertEquals(ds3Url, ds3Resolved.directDownloadUrl)
  }

  @Test
  fun `apk entity metadata and local search filter test`() {
    val apks = listOf(
      com.example.data.model.ApkEntity(
        id = 1,
        name = "F-Droid Client",
        version = "1.21.0",
        icon = "",
        sourceUrl = "https://f-droid.org/F-Droid.apk",
        installStatus = "DOWNLOADED",
        packageName = "org.fdroid.fdroid",
        localFilePath = "/data/user/0/apks/fdroid.apk"
      ),
      com.example.data.model.ApkEntity(
        id = 2,
        name = "VLC Media Player",
        version = "3.5.4",
        icon = "",
        sourceUrl = "https://get.videolan.org/vlc.apk",
        installStatus = "INSTALLED",
        packageName = "org.videolan.vlc",
        localFilePath = "/data/user/0/apks/vlc.apk"
      )
    )

    // Test real-time search filter matching
    val query = "fdroid"
    val filtered = apks.filter {
      it.name.contains(query, ignoreCase = true) ||
      it.packageName.contains(query, ignoreCase = true)
    }

    assertEquals(1, filtered.size)
    assertEquals("F-Droid Client", filtered[0].name)
    assertEquals("DOWNLOADED", filtered[0].installStatus)
  }

  @Test
  fun `apk entity category tagging and filtering test`() {
    val apks = listOf(
      com.example.data.model.ApkEntity(
        id = 1,
        name = "Pixel Dungeon",
        version = "1.9.2a",
        category = "Games",
        sourceUrl = "https://example.com/pd.apk",
        installStatus = "DOWNLOADED",
        packageName = "com.watabou.pixeldungeon"
      ),
      com.example.data.model.ApkEntity(
        id = 2,
        name = "F-Droid",
        version = "1.21.0",
        category = "Tools",
        sourceUrl = "https://example.com/fdroid.apk",
        installStatus = "DOWNLOADED",
        packageName = "org.fdroid.fdroid"
      ),
      com.example.data.model.ApkEntity(
        id = 3,
        name = "Tusky Mastodon",
        version = "24.0",
        category = "Social",
        sourceUrl = "https://example.com/tusky.apk",
        installStatus = "DOWNLOADED",
        packageName = "com.keylesspalace.tusky"
      )
    )

    val games = apks.filter { it.category.equals("Games", ignoreCase = true) }
    val tools = apks.filter { it.category.equals("Tools", ignoreCase = true) }
    val social = apks.filter { it.category.equals("Social", ignoreCase = true) }

    assertEquals(1, games.size)
    assertEquals("Pixel Dungeon", games[0].name)
    assertEquals(1, tools.size)
    assertEquals("F-Droid", tools[0].name)
    assertEquals(1, social.size)
    assertEquals("Tusky Mastodon", social[0].name)

    val updated = tools[0].copy(category = "Productivity")
    assertEquals("Productivity", updated.category)
  }
}
