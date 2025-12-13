import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import { useRecommendationStore } from './recommendation'
import { calculateRating } from '@/utils/rating'
import { fetchMusicData } from '@/services/diving-fish'

export const useFittingStore = defineStore('fitting', () => {
    const userStore = useUserStore()
    const recommendationStore = useRecommendationStore()

    const fittingRecords = ref([])
    const fittingB50 = ref({ sd: [], dx: [] }) // sd maps to Past (B35), dx maps to Current (B15)
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

        // Ensure music data is loaded for is_new check
        const musicData = await fetchMusicData()
        const musicMap = new Map(musicData.map(m => [m.id, m]))

        const records = userStore.records
        const stats = recommendationStore.chartStats

        const calculated = records.map(record => {
            const songId = record.song_id
            const diffIndex = record.level_index
            const songInfo = musicMap.get(String(songId))

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
                ra: ra,
                is_new: songInfo?.basic_info?.is_new || false
            }
        })

        // Sort by RA desc
        calculated.sort((a, b) => b.ra - a.ra)

        // Split based on is_new (Current vs Past)
        // is_new = true -> Current Version (B15)
        // is_new = false -> Past Versions (B35)
        const currentVersionRecords = calculated.filter(r => r.is_new)
        const pastVersionRecords = calculated.filter(r => !r.is_new)

        // Take top 35 Past and 15 Current
        const topPast = pastVersionRecords.slice(0, 35)
        const topCurrent = currentVersionRecords.slice(0, 15)

        // Map to sd/dx keys to maintain compatibility with view
        fittingB50.value = {
            sd: topPast,
            dx: topCurrent
        }

        const total = [...topPast, ...topCurrent].reduce((sum, r) => sum + r.ra, 0)
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
