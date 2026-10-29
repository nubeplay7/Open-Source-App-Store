package com.example.data.repository

import com.example.data.local.BookmarkDao
import com.example.data.model.BookmarkEntity
import kotlinx.coroutines.flow.Flow

class BookmarkRepository(private val bookmarkDao: BookmarkDao) {

    val allBookmarks: Flow<List<BookmarkEntity>> = bookmarkDao.getAllBookmarksFlow()

    fun getBookmarksForContainer(containerId: String): Flow<List<BookmarkEntity>> {
        return bookmarkDao.getBookmarksForContainerFlow(containerId)
    }

    fun getBookmarksByCategory(category: String): Flow<List<BookmarkEntity>> {
        return bookmarkDao.getBookmarksByCategoryFlow(category)
    }

    val pinnedBookmarks: Flow<List<BookmarkEntity>> = bookmarkDao.getPinnedBookmarksFlow()

    suspend fun getBookmarkByUrl(url: String): BookmarkEntity? {
        return bookmarkDao.getBookmarkByUrl(url)
    }

    suspend fun addBookmark(bookmark: BookmarkEntity): Long {
        return bookmarkDao.insertBookmark(bookmark)
    }

    suspend fun updateBookmark(bookmark: BookmarkEntity) {
        bookmarkDao.updateBookmark(bookmark)
    }

    suspend fun deleteBookmark(bookmark: BookmarkEntity) {
        bookmarkDao.deleteBookmark(bookmark)
    }

    suspend fun deleteBookmarkById(id: Long) {
        bookmarkDao.deleteBookmarkById(id)
    }

    suspend fun deleteBookmarkByUrl(url: String) {
        bookmarkDao.deleteBookmarkByUrl(url)
    }

    suspend fun togglePin(id: Long, isPinned: Boolean) {
        bookmarkDao.togglePin(id, isPinned)
    }
}
