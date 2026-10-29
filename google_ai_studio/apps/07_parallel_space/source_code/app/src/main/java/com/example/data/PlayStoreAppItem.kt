package com.example.data

/**
 * Model representing an application available in the integrated DualStore / Virtual Play Store.
 * Contains official metadata, Google Play package link, sandbox compatibility and direct install configurations.
 */
data class PlayStoreAppItem(
    val packageName: String,
    val appName: String,
    val developer: String,
    val category: String, // "Fintech", "Social", "Gaming", "Tools", "Work"
    val rating: Double,
    val reviewsCount: String,
    val downloadsCount: String,
    val sizeMb: String,
    val version: String,
    val description: String,
    val defaultWebUrl: String?,
    val isFintechVerified: Boolean = false,
    val officialPlayStoreUrl: String = "https://play.google.com/store/apps/details?id=$packageName",
    val sha256Signature: String = "SHA256:7B:4E:9F:8A:2C:1D:60:3B:55:AA:EF:01:43:89:BC:22",
    val tags: List<String> = emptyList()
)
