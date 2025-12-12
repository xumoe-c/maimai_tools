import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import { useRecommendationStore } from './recommendation'
import { calculateRating } from '@/utils/rating'

export const useFittingStore = defineStore('fitting', () => {
    const userStore = useUserStore()
    const recommendationStore = useRecommendationStore()

    const fittingRecords = ref([])
    const fittingB50 = ref({ sd: [], dx: [] })
    const fittingRating = ref(0)
    const isCalculated = ref(false)

    const calculate = async () => {
        // Ensure dependencies are loaded
        if (userStore.records.length === 0) {
            const success = await userStore.fetchProfile()
            if (!success && userStore.records.length === 0) return // Failed to load records
        }

        // Ensure chart stats are loaded
        if (Object.keys(recommendationStore.chartStats).length === 0) {
            await recommendationStore.fetchChartStats()
        }

        const records = userStore.records
        const stats = recommendationStore.chartStats

        const calculated = records.map(record => {
            const songId = record.song_id
            const diffIndex = record.level_index

            let fitDiff = record.ds // Default to DS
            let isFit = false

            // Try to find fit_diff in stats
            // stats keys are song_ids. 
            if (stats[songId] && stats[songId][diffIndex]) {
                const stat = stats[songId][diffIndex]
                if (stat.fit_diff !== undefined && stat.fit_diff !== null) {
                    fitDiff = stat.fit_diff
                    isFit = true
                }
            }

            const ra = calculateRating(fitDiff, record.achievements)

            return {
                ...record,
                fit_diff: fitDiff,
                is_fit: isFit,
                ra: ra
            }
        })

        // Sort by RA desc
        calculated.sort((a, b) => b.ra - a.ra)

        // Split SD/DX
        const sd = calculated.filter(r => r.type === 'SD')
        const dx = calculated.filter(r => r.type === 'DX')

        // Take top 35 SD and 15 DX
        const topSd = sd.slice(0, 35)
        const topDx = dx.slice(0, 15)

        fittingB50.value = {
            sd: topSd,
            dx: topDx
        }

        const total = [...topSd, ...topDx].reduce((sum, r) => sum + r.ra, 0)
        fittingRating.value = total
        fittingRecords.value = calculated
        isCalculated.value = true
    }

    return {
        fittingRecords,
        fittingB50,
        fittingRating,
        isCalculated,
        calculate
    }
})
