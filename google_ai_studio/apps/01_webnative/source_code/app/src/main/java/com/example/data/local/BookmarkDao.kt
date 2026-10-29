package com.example.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.BookmarkEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BookmarkDao {

    @Query("SELECT * FROM user_bookmarks ORDER BY isPinned DESC, createdTimestamp DESC")
    fun getAllBookmarksFlow(): Flow<List<BookmarkEntity>>

    @Query("SELECT * FROM user_bookmarks WHERE containerId = :containerId OR containerId = 'global' ORDER BY isPinned DESC, createdTimestamp DESC")
    fun getBookmarksForContainerFlow(containerId: String): Flow<List<BookmarkEntity>>

    @Query("SELECT * FROM user_bookmarks WHERE containerId = :containerId OR containerId = 'global' ORDER BY isPinned DESC, createdTimestamp DESC")
    suspend fun getBookmarksForContainer(containerId: String): List<BookmarkEntity>

    @Query("SELECT * FROM user_bookmarks WHERE category = :category ORDER BY isPinned DESC, createdTimestamp DESC")
    fun getBookmarksByCategoryFlow(category: String): Flow<List<BookmarkEntity>>

    @Query("SELECT * FROM user_bookmarks WHERE isPinned = 1 ORDER BY createdTimestamp DESC")
    fun getPinnedBookmarksFlow(): Flow<List<BookmarkEntity>>

    @Query("SELECT * FROM user_bookmarks WHERE id = :id LIMIT 1")
    suspend fun getBookmarkById(id: Long): BookmarkEntity?

    @Query("SELECT * FROM user_bookmarks WHERE url = :url LIMIT 1")
    suspend fun getBookmarkByUrl(url: String): BookmarkEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBookmark(bookmark: BookmarkEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(bookmarks: List<BookmarkEntity>)

    @Update
    suspend fun updateBookmark(bookmark: BookmarkEntity)

    @Delete
    suspend fun deleteBookmark(bookmark: BookmarkEntity)

    @Query("DELETE FROM user_bookmarks WHERE id = :id")
    suspend fun deleteBookmarkById(id: Long)

    @Query("DELETE FROM user_bookmarks WHERE url = :url")
    suspend fun deleteBookmarkByUrl(url: String)

    @Query("UPDATE user_bookmarks SET isPinned = :isPinned WHERE id = :id")
    suspend fun togglePin(id: Long, isPinned: Boolean)

    @Query("SELECT COUNT(*) FROM user_bookmarks")
    suspend fun getBookmarkCount(): Int
}
