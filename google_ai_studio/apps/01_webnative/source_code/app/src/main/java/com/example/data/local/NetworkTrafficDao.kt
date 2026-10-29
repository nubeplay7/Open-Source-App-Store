package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.model.NetworkTrafficEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface NetworkTrafficDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(traffic: NetworkTrafficEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(trafficList: List<NetworkTrafficEntity>)

    @Query("SELECT * FROM network_traffic_logs ORDER BY timestamp DESC")
    fun getAllTrafficFlow(): Flow<List<NetworkTrafficEntity>>

    @Query("SELECT * FROM network_traffic_logs ORDER BY timestamp DESC")
    suspend fun getAllTrafficSync(): List<NetworkTrafficEntity>

    @Query("SELECT * FROM network_traffic_logs ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentTraffic(limit: Int = 100): Flow<List<NetworkTrafficEntity>>

    @Query("SELECT * FROM network_traffic_logs WHERE method = :method ORDER BY timestamp DESC")
    fun getTrafficByMethod(method: String): Flow<List<NetworkTrafficEntity>>

    @Query("SELECT COUNT(*) FROM network_traffic_logs")
    suspend fun getTrafficCount(): Int

    @Query("SELECT COUNT(*) FROM network_traffic_logs")
    fun getTrafficCountFlow(): Flow<Int>

    @Query("SELECT AVG(durationMs) FROM network_traffic_logs WHERE durationMs > 0")
    suspend fun getAverageLatency(): Double?

    @Query("DELETE FROM network_traffic_logs WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM network_traffic_logs")
    suspend fun deleteAll()

    @Query("DELETE FROM network_traffic_logs WHERE timestamp < :cutoffTimestamp")
    suspend fun deleteOlderThan(cutoffTimestamp: Long): Int
}
