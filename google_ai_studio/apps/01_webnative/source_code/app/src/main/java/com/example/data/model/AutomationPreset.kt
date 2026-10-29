package com.example.data.model

import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

/**
 * AutomationPreset:
 * Represents a saved group of ActionPoints anchored to specific page elements and URL patterns.
 * Enables instant switching and sharing of complex automation workflows.
 */
data class AutomationPreset(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val description: String = "",
    val targetUrlPattern: String = "*",
    val actionPoints: List<ActionPoint> = emptyList(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val tags: List<String> = emptyList(),
    val author: String = "User"
) {
    fun toJson(): JSONObject {
        val obj = JSONObject()
        obj.put("id", id)
        obj.put("name", name)
        obj.put("description", description)
        obj.put("targetUrlPattern", targetUrlPattern)
        obj.put("createdAt", createdAt)
        obj.put("updatedAt", updatedAt)
        obj.put("author", author)

        val tagsArray = JSONArray()
        tags.forEach { tagsArray.put(it) }
        obj.put("tags", tagsArray)

        val pointsArray = JSONArray()
        actionPoints.forEach { point ->
            val pObj = JSONObject()
            pObj.put("id", point.id)
            pObj.put("label", point.label)
            pObj.put("gestureType", point.gestureType.name)
            pObj.put("xPercent", point.xPercent.toDouble())
            pObj.put("yPercent", point.yPercent.toDouble())
            pObj.put("endXPercent", point.endXPercent?.toDouble())
            pObj.put("endYPercent", point.endYPercent?.toDouble())
            pObj.put("delayBeforeMs", point.delayBeforeMs)
            pObj.put("holdDurationMs", point.holdDurationMs)
            pObj.put("swipeDurationMs", point.swipeDurationMs)
            pObj.put("loopRepeat", point.loopRepeat)
            pObj.put("speedPxPerSec", point.speedPxPerSec)
            pObj.put("radiusPx", point.radiusPx)
            pObj.put("radiusDp", point.radiusDp)
            pObj.put("isEnabled", point.isEnabled)
            pObj.put("swipeCurve", point.swipeCurve)

            val anchorObj = JSONObject()
            anchorObj.put("conditionType", point.visualAnchor.conditionType)
            anchorObj.put("conditionValue", point.visualAnchor.conditionValue)
            anchorObj.put("anchorLabel", point.visualAnchor.anchorLabel)
            anchorObj.put("minSimilarity", point.visualAnchor.minSimilarity.toDouble())
            anchorObj.put("onConditionFail", point.visualAnchor.onConditionFail)
            anchorObj.put("conditionTimeoutMs", point.visualAnchor.conditionTimeoutMs)
            point.visualAnchor.referenceImageBase64?.let {
                anchorObj.put("referenceImageBase64", it)
            }
            pObj.put("visualAnchor", anchorObj)

            pointsArray.put(pObj)
        }
        obj.put("actionPoints", pointsArray)
        return obj
    }

    companion object {
        fun fromJson(obj: JSONObject): AutomationPreset {
            val id = obj.optString("id", UUID.randomUUID().toString())
            val name = obj.optString("name", "Preset")
            val description = obj.optString("description", "")
            val targetUrlPattern = obj.optString("targetUrlPattern", "*")
            val createdAt = obj.optLong("createdAt", System.currentTimeMillis())
            val updatedAt = obj.optLong("updatedAt", System.currentTimeMillis())
            val author = obj.optString("author", "User")

            val tagsList = mutableListOf<String>()
            val tagsArr = obj.optJSONArray("tags")
            if (tagsArr != null) {
                for (i in 0 until tagsArr.length()) {
                    tagsList.add(tagsArr.getString(i))
                }
            }

            val pointsList = mutableListOf<ActionPoint>()
            val pointsArr = obj.optJSONArray("actionPoints")
            if (pointsArr != null) {
                for (i in 0 until pointsArr.length()) {
                    val p = pointsArr.getJSONObject(i)
                    val gTypeStr = p.optString("gestureType", "CLICK")
                    val gType = try {
                        GestureType.valueOf(gTypeStr)
                    } catch (_: Exception) {
                        GestureType.CLICK
                    }

                    val anchorObj = p.optJSONObject("visualAnchor")
                    val visualAnchor = if (anchorObj != null) {
                        VisualAnchorConfig(
                            conditionType = anchorObj.optString("conditionType", "NONE"),
                            conditionValue = anchorObj.optString("conditionValue", ""),
                            referenceImageBase64 = if (anchorObj.has("referenceImageBase64")) anchorObj.getString("referenceImageBase64") else null,
                            minSimilarity = anchorObj.optDouble("minSimilarity", 0.85).toFloat(),
                            onConditionFail = anchorObj.optString("onConditionFail", "SKIP"),
                            conditionTimeoutMs = anchorObj.optLong("conditionTimeoutMs", 3000L),
                            anchorLabel = anchorObj.optString("anchorLabel", "Ancla Visual")
                        )
                    } else {
                        VisualAnchorConfig()
                    }

                    pointsList.add(
                        ActionPoint(
                            id = p.optLong("id", i + 1L),
                            label = p.optString("label", "Punto #${i + 1}"),
                            gestureType = gType,
                            xPercent = p.optDouble("xPercent", 0.5).toFloat(),
                            yPercent = p.optDouble("yPercent", 0.5).toFloat(),
                            endXPercent = if (p.has("endXPercent") && !p.isNull("endXPercent")) p.optDouble("endXPercent", 0.5).toFloat() else 0.5f,
                            endYPercent = if (p.has("endYPercent") && !p.isNull("endYPercent")) p.optDouble("endYPercent", 0.7).toFloat() else 0.7f,
                            delayBeforeMs = p.optLong("delayBeforeMs", 150L),
                            holdDurationMs = p.optLong("holdDurationMs", 50L),
                            swipeDurationMs = p.optLong("swipeDurationMs", 400L),
                            loopRepeat = p.optInt("loopRepeat", 1),
                            speedPxPerSec = p.optInt("speedPxPerSec", 800),
                            radiusPx = p.optInt("radiusPx", 28),
                            radiusDp = p.optInt("radiusDp", 28),
                            visualAnchor = visualAnchor,
                            isEnabled = p.optBoolean("isEnabled", true),
                            swipeCurve = p.optString("swipeCurve", "LINEAR")
                        )
                    )
                }
            }

            return AutomationPreset(
                id = id,
                name = name,
                description = description,
                targetUrlPattern = targetUrlPattern,
                actionPoints = pointsList,
                createdAt = createdAt,
                updatedAt = updatedAt,
                tags = tagsList,
                author = author
            )
        }
    }
}
