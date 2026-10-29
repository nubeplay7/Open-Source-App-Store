package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entity representing the verified lifecycle and progress of Horizontal and Vertical growth phases.
 */
@Entity(tableName = "growth_plans")
data class GrowthPlanEntity(
    @PrimaryKey
    val phaseId: String,
    val dimension: String, // "VERTICAL_SANDBOX", "HORIZONTAL_SANDBOX", "VERTICAL_VPN_GPS", "HORIZONTAL_VPN_GPS"
    val phaseCode: String,
    val phaseNumber: Int,
    val title: String,
    val subtitle: String,
    val fullDescription: String,
    val iconEmoji: String,
    val status: String, // "VERIFICADO_ACTIVO", "EN_IMPLEMENTACION", "PLANEADO", "MEJORAS_DISENO"
    val progressPercent: Int = 100,
    val highlightsJson: String = "[]",
    val checklistItemsJson: String = "[]",
    val lastVerifiedTimestamp: Long = System.currentTimeMillis()
)
