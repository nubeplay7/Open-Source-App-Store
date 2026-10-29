package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import org.json.JSONArray
import org.json.JSONObject

enum class WebMacroActionType {
    CLICK,
    INPUT_TEXT,
    WAIT_DELAY,
    SCROLL_TO,
    SUBMIT_FORM,
    NAVIGATE_URL,
    RELOAD_PAGE,
    CLIPBOARD_COPY,
    CLIPBOARD_PASTE,
    CLIPBOARD_CUT,
    COLLECT_PROMPT_SUGGESTIONS,
    WAIT_FOR_ELEMENT,
    EVALUATE_JS,
    // Enterprise & Smart Automation Enhancements
    VISUAL_ANCHOR_CLICK,
    SELF_HEALING_CLICK,
    EXTRACT_VARIABLE,
    SET_VARIABLE,
    CONDITIONAL_BRANCH,
    LOOP_UNTIL,
    DETECT_CAPTCHA_ALERT,
    DISPATCH_WEBHOOK,
    CAPTURE_SCREENSHOT,
    // Visual & Relative Screen Zone Automation
    VISUAL_TARGET_FIND_AND_CLICK,
    ZONE_ANCHOR_CLICK
}

enum class WebMacroScheduleType {
    NONE,
    INTERVAL,
    DAILY_TIME,
    DELAY_COUNTDOWN
}

data class WebMacroStep(
    val stepNumber: Int = 1,
    val actionType: WebMacroActionType = WebMacroActionType.CLICK,
    val targetSelector: String = "",
    val elementDescription: String = "",
    val textValue: String = "",
    val delayMs: Long = 800L,
    val scrollTarget: String = "BOTTOM", // "TOP", "BOTTOM", "ELEMENT"
    val isEnabled: Boolean = true,
    val extraOptions: String = "", // Optional metadata/parameters (e.g. separator " Y ", timeout Ms)
    // Advanced Self-Healing, Visual Anchoring & Variable Flow
    val fallbackSelector: String = "",
    val visualAnchorText: String = "",
    val variableName: String = "",
    val conditionType: String = "EXISTS", // "EXISTS", "CONTAINS_TEXT", "VAR_EQUALS", "NOT_EXISTS"
    val jumpToStep: Int = 0,
    val webhookUrl: String = "",
    // Dynamic Screen Anchor Zone & Visual Target Triggers
    val relativeScreenZone: String = "NONE", // "NONE", "TOP_25", "BOTTOM_25", "CENTER_50", "LEFT_35", "RIGHT_35", "DYNAMIC_VIEWPORT"
    val visualTargetBase64: String = "",
    val visualTargetConfidence: Float = 0.80f
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("stepNumber", stepNumber)
            put("actionType", actionType.name)
            put("targetSelector", targetSelector)
            put("elementDescription", elementDescription)
            put("textValue", textValue)
            put("delayMs", delayMs)
            put("scrollTarget", scrollTarget)
            put("isEnabled", isEnabled)
            put("extraOptions", extraOptions)
            put("fallbackSelector", fallbackSelector)
            put("visualAnchorText", visualAnchorText)
            put("variableName", variableName)
            put("conditionType", conditionType)
            put("jumpToStep", jumpToStep)
            put("webhookUrl", webhookUrl)
            put("relativeScreenZone", relativeScreenZone)
            put("visualTargetBase64", visualTargetBase64)
            put("visualTargetConfidence", visualTargetConfidence.toDouble())
        }
    }

    companion object {
        fun fromJson(json: JSONObject): WebMacroStep {
            val typeStr = json.optString("actionType", "CLICK")
            val action = try {
                WebMacroActionType.valueOf(typeStr)
            } catch (_: Exception) {
                WebMacroActionType.CLICK
            }
            return WebMacroStep(
                stepNumber = json.optInt("stepNumber", 1),
                actionType = action,
                targetSelector = json.optString("targetSelector", ""),
                elementDescription = json.optString("elementDescription", ""),
                textValue = json.optString("textValue", ""),
                delayMs = json.optLong("delayMs", 800L),
                scrollTarget = json.optString("scrollTarget", "BOTTOM"),
                isEnabled = json.optBoolean("isEnabled", true),
                extraOptions = json.optString("extraOptions", ""),
                fallbackSelector = json.optString("fallbackSelector", ""),
                visualAnchorText = json.optString("visualAnchorText", ""),
                variableName = json.optString("variableName", ""),
                conditionType = json.optString("conditionType", "EXISTS"),
                jumpToStep = json.optInt("jumpToStep", 0),
                webhookUrl = json.optString("webhookUrl", ""),
                relativeScreenZone = json.optString("relativeScreenZone", "NONE"),
                visualTargetBase64 = json.optString("visualTargetBase64", ""),
                visualTargetConfidence = json.optDouble("visualTargetConfidence", 0.80).toFloat()
            )
        }
    }
}

@Entity(tableName = "web_macros")
data class WebMacroEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val description: String = "",
    val targetDomain: String = "*", // "*" for global or specific domain (e.g., "bene.civer.cloud")
    val targetUrlPattern: String = "",
    val stepsJson: String = "[]",
    val repeatCount: Int = 1, // 1 to 100 or -1 for infinite loop
    val delayBetweenStepsMs: Long = 800L,
    val isFavorite: Boolean = false,
    val executionCount: Int = 0,
    val lastExecutedAt: Long? = null,
    val isScheduled: Boolean = false,
    val scheduleType: String = "INTERVAL", // "DAILY_TIME", "INTERVAL", "DELAY_COUNTDOWN"
    val scheduleIntervalMinutes: Long = 60L,
    val scheduleTimeOfDay: String = "08:00", // "HH:mm" (e.g. 8:00 AM)
    val scheduleDelayMinutes: Long = 10L,
    val nextExecutionTime: Long? = null,
    val targetUrlToLoad: String = "",
    val isAutoRunOnMatch: Boolean = false,
    val isBatterySaverBypass: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    val stepsSummary: String
        get() {
            val count = parseSteps().size
            return if (count == 1) "1 paso" else "$count pasos"
        }

    fun parseSteps(): List<WebMacroStep> {
        val list = mutableListOf<WebMacroStep>()
        try {
            val array = JSONArray(stepsJson)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(WebMacroStep.fromJson(obj))
            }
        } catch (_: Exception) {}
        return list
    }

    companion object {
        fun encodeSteps(steps: List<WebMacroStep>): String {
            val array = JSONArray()
            steps.forEachIndexed { index, step ->
                array.put(step.copy(stepNumber = index + 1).toJson())
            }
            return array.toString()
        }
    }
}
