package com.example.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import com.example.data.local.AppDatabase
import com.example.service.BackgroundAutomationService
import com.example.util.AppLogger
import com.example.util.WebMacroAutomationEngine
import com.example.util.WebMacroScheduler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * MacroScheduleReceiver:
 * BroadcastReceiver triggered by AlarmManager at scheduled intervals or specific times
 * (e.g., 'start at 8 AM' or 'trigger after X minutes').
 * Handles WakeLock acquisition, launches BackgroundAutomationService,
 * executes the macro in background, and computes the next recurrence.
 */
class MacroScheduleReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        
        if (action == Intent.ACTION_BOOT_COMPLETED || action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            AppLogger.log(context, "[MacroScheduler] Sistema reiniciado/actualizado. Reprogramando macros activas...")
            WebMacroScheduler.rescheduleAllActiveMacros(context)
            return
        }

        if (action == WebMacroScheduler.ACTION_TRIGGER_MACRO) {
            val macroId = intent.getLongExtra(WebMacroScheduler.EXTRA_MACRO_ID, -1L)
            if (macroId <= 0) return

            AppLogger.log(context, "[MacroScheduler] ⏰ Alarma de ejecución activada para Macro ID: $macroId")

            val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
            val wakeLock = powerManager?.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "WebNative:MacroScheduleExecution"
            )?.apply {
                setReferenceCounted(false)
                acquire(10 * 60 * 1000L) // 10 minutes max execution lock
            }

            val pendingResult = goAsync()

            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val db = AppDatabase.getDatabase(context)
                    val macro = db.webMacroDao().getMacroById(macroId)

                    if (macro != null && macro.isScheduled) {
                        AppLogger.log(context, "[MacroScheduler] Ejecutando macro programada: '${macro.title}'")

                        // Start Foreground Keep-Alive notification
                        BackgroundAutomationService.start(
                            context = context,
                            title = "⏰ Macro Programada Activa",
                            subtitle = "Ejecutando: ${macro.title}"
                        )

                        // Execute macro headless/in background
                        WebMacroAutomationEngine.executeMacroHeadless(context, macro)

                        // Update execution count & last executed timestamp
                        val now = System.currentTimeMillis()
                        db.webMacroDao().recordMacroExecution(macro.id, now)

                        // Calculate and reschedule if recurring, or disable if one-shot countdown
                        if (macro.scheduleType == WebMacroScheduler.TYPE_DELAY_COUNTDOWN) {
                            // One-shot completed: disable schedule
                            val updated = macro.copy(
                                isScheduled = false,
                                nextExecutionTime = null,
                                lastExecutedAt = now,
                                updatedAt = now
                            )
                            db.webMacroDao().updateMacro(updated)
                            AppLogger.log(context, "[MacroScheduler] Macro de un solo disparo finalizada y desprogramada.")
                        } else {
                            // Recurring (DAILY_TIME or INTERVAL): compute next execution time
                            val nextTime = WebMacroScheduler.calculateNextTriggerTime(macro)
                            val updated = macro.copy(
                                nextExecutionTime = nextTime,
                                lastExecutedAt = now,
                                updatedAt = now
                            )
                            db.webMacroDao().updateMacro(updated)
                            WebMacroScheduler.scheduleAlarm(context, updated)
                            AppLogger.log(context, "[MacroScheduler] Próxima ejecución programada para: ${WebMacroScheduler.formatDateTime(nextTime)}")
                        }
                    } else {
                        AppLogger.log(context, "[MacroScheduler] Macro no encontrada o ya desprogramada.")
                    }
                } catch (e: Exception) {
                    AppLogger.log(context, "[MacroScheduler] Error ejecutando macro programada: ${e.message}")
                } finally {
                    try {
                        if (wakeLock?.isHeld == true) {
                            wakeLock.release()
                        }
                    } catch (_: Exception) {}
                    pendingResult.finish()
                }
            }
        }
    }
}
