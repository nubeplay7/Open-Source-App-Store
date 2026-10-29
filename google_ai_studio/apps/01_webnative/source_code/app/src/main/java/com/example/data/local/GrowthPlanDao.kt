package com.example.data.local

import androidx.room.*
import com.example.data.model.GrowthPlanEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface GrowthPlanDao {
    @Query("SELECT * FROM growth_plans ORDER BY phaseNumber ASC")
    fun getAllGrowthPlansFlow(): Flow<List<GrowthPlanEntity>>

    @Query("SELECT * FROM growth_plans ORDER BY phaseNumber ASC")
    suspend fun getAllGrowthPlans(): List<GrowthPlanEntity>

    @Query("SELECT * FROM growth_plans WHERE dimension = :dimension ORDER BY phaseNumber ASC")
    fun getPlansByDimensionFlow(dimension: String): Flow<List<GrowthPlanEntity>>

    @Query("SELECT * FROM growth_plans WHERE phaseId = :phaseId")
    suspend fun getPlanById(phaseId: String): GrowthPlanEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(plan: GrowthPlanEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(plans: List<GrowthPlanEntity>)

    @Query("UPDATE growth_plans SET status = :status, progressPercent = :progress, lastVerifiedTimestamp = :timestamp WHERE phaseId = :phaseId")
    suspend fun updateStatus(phaseId: String, status: String, progress: Int, timestamp: Long)

    @Query("DELETE FROM growth_plans")
    suspend fun deleteAll()
}
