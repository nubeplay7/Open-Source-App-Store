package com.example.container

import android.content.Context
import com.example.core.interfaces.IContainerEngine
import com.example.data.local.AppDatabase
import com.example.data.model.ContainerProfileEntity
import com.example.data.model.ContainerType
import com.example.util.AppLogger
import com.example.util.ContainerManager
import com.example.util.ContainerStorageJunctionHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/**
 * Domain Facade for Sandbox Containers and Isolation Vaults.
 */
object ContainerManagerFacade : IContainerEngine {

    private val containerScope = CoroutineScope(Dispatchers.IO)

    override val activeContainer: StateFlow<ContainerProfileEntity?>
        get() = ContainerManager.activeContainer

    override val allContainers: StateFlow<List<ContainerProfileEntity>>
        get() = ContainerManager.allContainers

    override val isIndependentBoxesMode: StateFlow<Boolean>
        get() = ContainerManager.isIndependentBoxesMode

    override fun initialize(context: Context) {
        ContainerManager.initialize(context)
    }

    override fun createContainer(
        context: Context,
        name: String,
        colorHex: Long,
        iconEmoji: String,
        onComplete: ((String) -> Unit)?
    ) {
        containerScope.launch {
            val id = "container_${System.currentTimeMillis()}"
            val newProfile = ContainerProfileEntity(
                id = id,
                name = name,
                description = "Contenedor independiente creado vía interfaz modular.",
                iconEmoji = iconEmoji,
                colorHex = colorHex,
                containerType = ContainerType.PERSONAL.name,
                storageDirName = "containers/$id",
                associatedGoogleEmail = null,
                associatedGoogleName = null,
                isHardwareDirectJunctionEnabled = true,
                isCameraJunctionAllowed = true,
                isMicJunctionAllowed = true,
                isGpsJunctionAllowed = true,
                isGpuHardwareBoostAllowed = true,
                isSensorsAllowed = true,
                isAdBlockIsolated = true,
                isActive = false,
                isEphemeral = false
            )
            val db = AppDatabase.getDatabase(context)
            db.containerProfileDao().insertContainer(newProfile)
            ContainerManager.refreshContainersState(context)
            AppLogger.log(context, "Nuevo contenedor creado: $name ($id)", tag = "CONTAINER")
            onComplete?.invoke(id)
        }
    }

    override fun switchContainer(context: Context, containerId: String) {
        containerScope.launch {
            ContainerManager.switchContainer(context, containerId)
        }
    }

    override fun deleteContainer(context: Context, containerId: String) {
        containerScope.launch {
            ContainerManager.deleteContainer(context, containerId)
        }
    }

    override fun wipeContainerData(context: Context, containerId: String) {
        containerScope.launch {
            ContainerStorageJunctionHelper.wipeContainerSandbox(context, containerId)
            ContainerManager.refreshContainersState(context)
        }
    }
}
