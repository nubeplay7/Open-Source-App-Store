package com.example

import android.app.Application
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

class TestOmniApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        if (FirebaseApp.getApps(this).isEmpty()) {
            try {
                val options = FirebaseOptions.Builder()
                    .setApplicationId("1:1234567890:android:testapp123")
                    .setApiKey("REDACTED_USE_ENV_OR_SECRET")
                    .setProjectId("omnicomm-test-project")
                    .setDatabaseUrl("https://omnicomm-test-project-default-rtdb.firebaseio.com")
                    .build()
                FirebaseApp.initializeApp(this, options)
            } catch (ignored: Throwable) {}
        }
    }
}
