import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import { getSongById } from '@/services/diving-fish'
import { calculateRating } from '@/utils/rating'

export const useRecommendationStore = defineStore('recommendation', () => {
    const userStore = useUserStore()
    const chartStats = ref({})
    const isLoading = ref(false)
    const error = ref(null)

    const fetchChartStats = async () => {
        if (Object.keys(chartStats.value).length > 0) return

        isLoading.value = true
        error.value = null
        try {
            // Use import.meta.env.BASE_URL to handle base path correctly
            const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/'
            const response = await fetch(`${baseUrl}data/chart_stats.json`)
            if (!response.ok) throw new Error(`Failed to load chart stats: ${response.statusText}`)
            const data = await response.json()
            chartStats.value = data.charts || data
        } catch (e) {
            error.value = e.message
            console.error(e)
        } finally {
            isLoading.value = false
        }
    }

    // Helper to get fit_diff for a song
    const getFitDiff = (songId, diffIndex) => {
        const stats = chartStats.value[songId]
        if (!stats || !stats[diffIndex]) return null
        return stats[diffIndex].fit_diff
    }

    // Helper to get average achievement
    const getAvgAchievement = (songId, diffIndex) => {
        const stats = chartStats.value[songId]
        if (!stats || !stats[diffIndex]) return null
        return stats[diffIndex].avg
    }

    return {
        chartStats,
        isLoading,
        error,
        fetchChartStats,
        getFitDiff,
        getAvgAchievement
    }
})
