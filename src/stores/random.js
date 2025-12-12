import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRandomStore = defineStore('random', () => {
    // --- State ---
    const filters = ref({
        levelMin: 1,
        levelMax: 15,
        versions: [], // Empty means all
        genres: [],   // Empty means all
        excludeUtage: true,
        type: 'ALL' // 'ALL', 'DX', 'SD'
    })

    const currentResult = ref(null)
    const isRolling = ref(false)
    const history = ref([])

    // --- Actions ---
    const updateFilters = (newFilters) => {
        filters.value = { ...filters.value, ...newFilters }
    }

    const roll = async (musicData) => {
        if (!musicData || musicData.length === 0) return

        isRolling.value = true
        currentResult.value = null

        // 1. Filter candidates
        const candidates = musicData.filter(song => {
            // Genre Filter
            if (filters.value.genres.length > 0 && !filters.value.genres.includes(song.basic_info.genre)) {
                return false
            }

            // Version Filter
            if (filters.value.versions.length > 0 && !filters.value.versions.includes(song.basic_info.from)) {
                return false
            }

            // Type Filter (DX/SD)
            if (filters.value.type !== 'ALL' && song.type !== filters.value.type) {
                return false
            }

            // Utage Filter (Note: Standard music_data usually doesn't have Utage, but we keep logic)
            // Assuming Utage might be identified by id > 100000 or specific type if present
            if (filters.value.excludeUtage) {
                // Placeholder logic: if song.basic_info.is_utage or similar exists
                // For now, standard API doesn't return Utage, so this is safe.
            }

            // Level Filter
            // Check if ANY chart in the song matches the level range
            // song.ds is array of numbers [bas, adv, exp, mas, rem]
            const hasMatchingLevel = song.ds.some(ds => ds >= filters.value.levelMin && ds <= filters.value.levelMax)
            return hasMatchingLevel
        })

        if (candidates.length === 0) {
            isRolling.value = false
            alert('没有符合条件的歌曲')
            return
        }

        // 2. Simulate Rolling Delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // 3. Pick Random
        const randomSong = candidates[Math.floor(Math.random() * candidates.length)]

        // 4. Pick Random Chart within Level Range
        // We need to find which difficulties match the range
        const validDiffs = []
        randomSong.ds.forEach((ds, index) => {
            if (ds >= filters.value.levelMin && ds <= filters.value.levelMax) {
                validDiffs.push(index)
            }
        })

        const randomDiffIndex = validDiffs[Math.floor(Math.random() * validDiffs.length)]

        const result = {
            song: randomSong,
            diffIndex: randomDiffIndex,
            ds: randomSong.ds[randomDiffIndex],
            level: randomSong.level[randomDiffIndex],
            timestamp: Date.now()
        }

        currentResult.value = result
        history.value.unshift(result)
        if (history.value.length > 10) history.value.pop()

        isRolling.value = false
    }

    return {
        filters,
        currentResult,
        isRolling,
        history,
        updateFilters,
        roll
    }
})
