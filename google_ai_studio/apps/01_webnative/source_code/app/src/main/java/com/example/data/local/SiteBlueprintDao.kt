package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.SiteBlueprintEntity
import com.example.data.model.SiteElementNodeEntity
import com.example.data.model.VisualMacroAssetEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SiteBlueprintDao {

    // Site Blueprints
    @Query("SELECT * FROM site_blueprints ORDER BY createdAt DESC")
    fun getAllBlueprintsFlow(): Flow<List<SiteBlueprintEntity>>

    @Query("SELECT * FROM site_blueprints WHERE id = :id LIMIT 1")
    suspend fun getBlueprintById(id: String): SiteBlueprintEntity?

    @Query("SELECT * FROM site_blueprints WHERE rootDomain = :domain ORDER BY createdAt DESC")
    suspend fun getBlueprintsByDomain(domain: String): List<SiteBlueprintEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBlueprint(blueprint: SiteBlueprintEntity)

    @Update
    suspend fun updateBlueprint(blueprint: SiteBlueprintEntity)

    @Query("DELETE FROM site_blueprints WHERE id = :id")
    suspend fun deleteBlueprint(id: String)

    // Site Element Nodes
    @Query("SELECT * FROM site_element_nodes WHERE blueprintId = :blueprintId ORDER BY createdAt ASC")
    fun getElementNodesFlow(blueprintId: String): Flow<List<SiteElementNodeEntity>>

    @Query("SELECT * FROM site_element_nodes WHERE blueprintId = :blueprintId")
    suspend fun getElementNodesByBlueprintId(blueprintId: String): List<SiteElementNodeEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertElementNodes(nodes: List<SiteElementNodeEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSingleElementNode(node: SiteElementNodeEntity)

    @Query("DELETE FROM site_element_nodes WHERE blueprintId = :blueprintId")
    suspend fun deleteElementNodesForBlueprint(blueprintId: String)

    // Visual Macro Assets (User-defined cropped templates)
    @Query("SELECT * FROM visual_macro_assets ORDER BY createdAt DESC")
    fun getAllVisualAssetsFlow(): Flow<List<VisualMacroAssetEntity>>

    @Query("SELECT * FROM visual_macro_assets WHERE blueprintId = :blueprintId ORDER BY createdAt DESC")
    fun getVisualAssetsForBlueprintFlow(blueprintId: String): Flow<List<VisualMacroAssetEntity>>

    @Query("SELECT * FROM visual_macro_assets WHERE labelName = :label LIMIT 1")
    suspend fun getVisualAssetByLabel(label: String): VisualMacroAssetEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVisualAsset(asset: VisualMacroAssetEntity)

    @Query("DELETE FROM visual_macro_assets WHERE id = :id")
    suspend fun deleteVisualAsset(id: String)
}
