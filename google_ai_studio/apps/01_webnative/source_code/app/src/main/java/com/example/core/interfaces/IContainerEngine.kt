package com.example.core.interfaces

import android.content.Context
import com.example.data.model.ContainerProfileEntity
import kotlinx.coroutines.flow.StateFlow

/**
 * Contract for Sandbox Containers, Isolation Vaults, and Hardware Virtualization.
 */
interface IContainerEngine {
    val activeContainer: StateFlow<ContainerProfileEntity?>
    val allContainers: StateFlow<List<ContainerProfileEntity>>
    val isIndependentBoxesMode: StateFlow<Boolean>

    fun initialize(context: Context)
    fun createContainer(context: Context, name: String, colorHex: Long, iconEmoji: String, onComplete: ((String) -> Unit)? = null)
    fun switchContainer(context: Context, containerId: String)
    fun deleteContainer(context: Context, containerId: String)
    fun wipeContainerData(context: Context, containerId: String)
}
