plugins {
  alias(libs.plugins.android.application)
  alias(libs.plugins.kotlin.android)
  alias(libs.plugins.kotlin.compose)
  alias(libs.plugins.google.devtools.ksp)
  alias(libs.plugins.roborazzi)
  alias(libs.plugins.secrets)
}

android {
  namespace = "com.example"
  compileSdk = 35

  defaultConfig {
    applicationId = "com.aistudio.webnative.turbovx"
    minSdk = 24
    targetSdk = 35
    val runNumber = System.getenv("GITHUB_RUN_NUMBER")?.toIntOrNull()
    versionCode = runNumber ?: 500
    versionName = if (runNumber != null) "5.0.$runNumber" else "5.0.0"

    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
  }

  signingConfigs {
    create("release") {
      val keystoreEnv = System.getenv("KEYSTORE_PATH")
      val kFile = when {
        !keystoreEnv.isNullOrBlank() && file(keystoreEnv).exists() -> file(keystoreEnv)
        !keystoreEnv.isNullOrBlank() && rootProject.file(keystoreEnv).exists() -> rootProject.file(keystoreEnv)
        rootProject.file("my-upload-key.jks").exists() -> rootProject.file("my-upload-key.jks")
        file("my-upload-key.jks").exists() -> file("my-upload-key.jks")
        else -> rootProject.file("debug.keystore")
      }
      if (kFile.exists()) {
        storeFile = kFile
        storePassword = System.getenv("STORE_PASSWORD") ?: System.getenv("KEYSTORE_PASSWORD") ?: "android"
        keyAlias = System.getenv("KEY_ALIAS") ?: System.getenv("KEY_KEY_ALIAS") ?: "upload"
        keyPassword = System.getenv("KEY_PASSWORD") ?: System.getenv("KEY_KEY_PASSWORD") ?: System.getenv("STORE_PASSWORD") ?: "android"
      }
    }
    create("debugConfig") {
      val customDebug = if (rootProject.file("debug.keystore").exists()) {
        rootProject.file("debug.keystore")
      } else {
        file("debug.keystore")
      }
      if (customDebug.exists()) {
        storeFile = customDebug
        storePassword = "android"
        keyAlias = "androiddebugkey"
        keyPassword = "android"
      }
    }
  }

  buildTypes {
    release {
      isCrunchPngs = false
      isMinifyEnabled = false
      proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
      val relConfig = signingConfigs.getByName("release")
      if (relConfig.storeFile != null && relConfig.storeFile!!.exists()) {
        signingConfig = relConfig
      } else {
        val dbgConfig = signingConfigs.getByName("debugConfig")
        if (dbgConfig.storeFile != null && dbgConfig.storeFile!!.exists()) {
          signingConfig = dbgConfig
        }
      }
    }
    debug {
      val dbgConfig = signingConfigs.getByName("debugConfig")
      if (dbgConfig.storeFile != null && dbgConfig.storeFile!!.exists()) {
        signingConfig = dbgConfig
      }
    }
  }
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
  }
  kotlinOptions {
    jvmTarget = "11"
  }
  buildFeatures {
    compose = true
    buildConfig = true
  }
  testOptions { unitTests { isIncludeAndroidResources = true } }
  dependenciesInfo {
    includeInApk = false
    includeInBundle = true
  }
}

// Configure the Secrets Gradle Plugin to use .env and .env.example files
secrets {
  propertiesFileName = ".env"
  defaultPropertiesFileName = ".env.example"
  ignoreList.add("FIREBASE_APPCHECK_DEBUG_TOKEN")
}

dependencies {
  implementation(platform(libs.androidx.compose.bom))
  implementation(libs.androidx.activity.compose)
  implementation(libs.androidx.compose.material.icons.core)
  implementation(libs.androidx.compose.material.icons.extended)
  implementation(libs.androidx.compose.material3)
  implementation(libs.androidx.compose.ui)
  implementation(libs.androidx.compose.ui.graphics)
  implementation(libs.androidx.compose.ui.tooling.preview)
  implementation(libs.androidx.window)
  implementation(libs.androidx.documentfile)
  implementation(libs.androidx.webkit)
  implementation(libs.androidx.work.runtime.ktx)
  implementation(libs.androidx.core.ktx)
  implementation(libs.androidx.lifecycle.runtime.compose)
  implementation(libs.androidx.lifecycle.runtime.ktx)
  implementation(libs.androidx.lifecycle.viewmodel.compose)
  implementation(libs.androidx.room.ktx)
  implementation(libs.androidx.room.runtime)
  implementation(libs.androidx.datastore.preferences)
  implementation(libs.androidx.credentials)
  implementation(libs.androidx.credentials.play.services)
  implementation(libs.googleid)
  implementation(libs.coil.compose)
  implementation(libs.converter.moshi)
  implementation(libs.androidx.camera.core)
  implementation(libs.androidx.camera.camera2)
  implementation(libs.androidx.camera.lifecycle)
  implementation(libs.androidx.camera.view)
  implementation(libs.kotlinx.coroutines.android)
  implementation(libs.kotlinx.coroutines.core)
  implementation(libs.logging.interceptor)
  implementation(libs.moshi.kotlin)
  implementation(libs.okhttp)
  implementation(libs.retrofit)
  implementation("com.google.zxing:core:3.5.3")
  implementation("com.google.mlkit:barcode-scanning:17.3.0")
  testImplementation(libs.androidx.compose.ui.test.junit4)
  testImplementation(libs.androidx.core)
  testImplementation(libs.androidx.junit)
  testImplementation(libs.junit)
  testImplementation(libs.kotlinx.coroutines.test)
  testImplementation(libs.mockwebserver)
  testImplementation(libs.robolectric)
  testImplementation(libs.roborazzi)
  testImplementation(libs.roborazzi.compose)
  testImplementation(libs.roborazzi.junit.rule)
  androidTestImplementation(platform(libs.androidx.compose.bom))
  androidTestImplementation(libs.androidx.compose.ui.test.junit4)
  androidTestImplementation(libs.androidx.espresso.core)
  androidTestImplementation(libs.androidx.junit)
  androidTestImplementation(libs.androidx.runner)
  androidTestImplementation(libs.mockwebserver)
  debugImplementation(libs.androidx.compose.ui.test.manifest)
  debugImplementation(libs.androidx.compose.ui.tooling)
  "ksp"(libs.androidx.room.compiler)
  "ksp"(libs.moshi.kotlin.codegen)
}

tasks.register("incrementVersion") {
  description = "Automatically increments versionCode and versionName before CI/CD runs"
  group = "versioning"
  doLast {
    val buildFile = project.buildFile
    val content = buildFile.readText()
    val codeRegex = Regex("""versionCode\s*=\s*runNumber\s*\?:\s*(\d+)""")
    val matchCode = codeRegex.find(content)
    val currentCode = matchCode?.groupValues?.get(1)?.toIntOrNull() ?: 451
    val newCode = currentCode + 1
    val newVersionName = "5.0.$newCode"

    val updatedContent = content
      .replace(Regex("""versionCode\s*=\s*runNumber\s*\?:\s*\d+"""), "versionCode = runNumber ?: $newCode")
      .replace(Regex("""versionName\s*=\s*if\s*\(runNumber\s*!=\s*null\)\s*"5\.0\.\$\{'$'\}runNumber"\s*else\s*"[^"]+""""), "versionName = if (runNumber != null) \"5.0.\${'$'}runNumber\" else \"$newVersionName\"")

    buildFile.writeText(updatedContent)
    println("AUTOMATED VERSION BUMP: versionCode=$newCode, versionName=$newVersionName")
  }
}

