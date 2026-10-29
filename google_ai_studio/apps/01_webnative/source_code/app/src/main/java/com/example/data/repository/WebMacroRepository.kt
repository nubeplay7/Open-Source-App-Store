package com.example.data.repository

import com.example.data.local.WebMacroDao
import com.example.data.model.WebMacroEntity
import kotlinx.coroutines.flow.Flow

class WebMacroRepository(private val webMacroDao: WebMacroDao) {

    val allMacros: Flow<List<WebMacroEntity>> = webMacroDao.getAllMacrosFlow()

    fun getMacrosForDomain(domain: String): Flow<List<WebMacroEntity>> =
        webMacroDao.getMacrosForDomainFlow(domain)

    suspend fun getMacroById(id: Long): WebMacroEntity? =
        webMacroDao.getMacroById(id)

    suspend fun insertMacro(macro: WebMacroEntity): Long =
        webMacroDao.insertMacro(macro)

    suspend fun updateMacro(macro: WebMacroEntity) =
        webMacroDao.updateMacro(macro)

    suspend fun deleteMacro(macro: WebMacroEntity) =
        webMacroDao.deleteMacro(macro)

    suspend fun deleteMacroById(id: Long) =
        webMacroDao.deleteMacroById(id)

    suspend fun recordMacroExecution(id: Long) =
        webMacroDao.recordMacroExecution(id)

    suspend fun toggleFavorite(id: Long) =
        webMacroDao.toggleFavorite(id)
}
