package com.example.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(entities = [ClonedAppEntity::class], version = 3, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun clonedAppDao(): ClonedAppDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "parallel_space_db"
                )
                    .fallbackToDestructiveMigration()
                    .addCallback(AppDatabaseCallback(scope))
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class AppDatabaseCallback(
            private val scope: CoroutineScope
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateInitialClones(database.clonedAppDao())
                    }
                }
            }

            suspend fun populateInitialClones(dao: ClonedAppDao) {
                val initialClones = listOf(
                    ClonedAppEntity(
                        packageName = "com.whatsapp",
                        appName = "WhatsApp (Dual)",
                        originalName = "WhatsApp",
                        category = "Social",
                        badgeText = "2nd",
                        badgeColorHex = "#00F0FF",
                        isLocked = false,
                        webUrl = "https://web.whatsapp.com",
                        launchCount = 14,
                        lastOpenedTime = System.currentTimeMillis() - 1000 * 60 * 15,
                        cacheSizeMb = 48.2,
                        dataSizeMb = 186.0
                    ),
                    ClonedAppEntity(
                        packageName = "com.instagram.android",
                        appName = "Instagram #2",
                        originalName = "Instagram",
                        category = "Social",
                        badgeText = "Dual",
                        badgeColorHex = "#A855F7",
                        isLocked = false,
                        webUrl = "https://www.instagram.com",
                        launchCount = 9,
                        lastOpenedTime = System.currentTimeMillis() - 1000 * 60 * 60,
                        cacheSizeMb = 64.5,
                        dataSizeMb = 230.1
                    ),
                    ClonedAppEntity(
                        packageName = "com.facebook.katana",
                        appName = "Facebook (Work)",
                        originalName = "Facebook",
                        category = "Social",
                        badgeText = "Work",
                        badgeColorHex = "#3B82F6",
                        isLocked = false,
                        webUrl = "https://m.facebook.com",
                        launchCount = 5,
                        lastOpenedTime = System.currentTimeMillis() - 1000 * 60 * 180,
                        cacheSizeMb = 38.0,
                        dataSizeMb = 142.4
                    ),
                    ClonedAppEntity(
                        packageName = "org.telegram.messenger",
                        appName = "Telegram (Private)",
                        originalName = "Telegram",
                        category = "Social",
                        badgeText = "Private",
                        badgeColorHex = "#EC4899",
                        isLocked = true,
                        isPrivateSpace = true,
                        webUrl = "https://web.telegram.org",
                        launchCount = 22,
                        lastOpenedTime = System.currentTimeMillis() - 1000 * 60 * 30,
                        cacheSizeMb = 72.3,
                        dataSizeMb = 310.8
                    ),
                    ClonedAppEntity(
                        packageName = "com.supercell.clashofclans",
                        appName = "Clash of Clans #2",
                        originalName = "Clash of Clans",
                        category = "Gaming",
                        badgeText = "Alt",
                        badgeColorHex = "#F59E0B",
                        isLocked = false,
                        webUrl = null,
                        launchCount = 8,
                        lastOpenedTime = System.currentTimeMillis() - 1000 * 60 * 360,
                        cacheSizeMb = 115.0,
                        dataSizeMb = 450.0
                    ),
                    ClonedAppEntity(
                        packageName = "mx.openbank.modelbank",
                        appName = "Openbank (Dual Account)",
                        originalName = "Openbank México",
                        category = "Fintech",
                        badgeText = "Fintech",
                        badgeColorHex = "#10B981",
                        isLocked = true,
                        isBiometricEnabled = true,
                        isFintechProtected = true,
                        flagSecureEnabled = true,
                        antiDetectionCloak = true,
                        playIntegrityBypass = true,
                        webUrl = "https://www.openbank.mx",
                        launchCount = 18,
                        lastOpenedTime = System.currentTimeMillis() - 1000 * 60 * 10,
                        cacheSizeMb = 14.8,
                        dataSizeMb = 86.4,
                        virtualDeviceModel = "Pixel 9 Pro (Fintech Shield)"
                    )
                )
                dao.insertApps(initialClones)
            }
        }
    }
}
