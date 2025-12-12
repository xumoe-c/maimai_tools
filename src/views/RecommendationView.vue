<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useRecommendationStore } from '@/stores/recommendation'
import { ArrowLeft, Loader2, Sparkles, Target, Zap, Coffee } from 'lucide-vue-next'
import { getRating, calculateRating } from '@/utils/rating'
import { fetchMusicData, getSongById, getCoverUrl } from '@/services/diving-fish'
import RecommendationCard from '@/components/recommendation/RecommendationCard.vue'

const router = useRouter()
const userStore = useUserStore()
const recStore = useRecommendationStore()

const activeTab = ref('score-attack')
const isProcessing = ref(true)
const musicData = ref([])

// Data Lists
const scoreAttackList = ref([])
const newGemList = ref([])
const oldGemList = ref([])
const easyList = ref([])

onMounted(async () => {
    isProcessing.value = true
    try {
        // 1. Ensure Auth & Profile
        if (!userStore.isAuthenticated) {
            // Handle auth if needed, or just show empty
        } else if (userStore.records.length === 0) {
            await userStore.fetchProfile()
        }

        // 2. Load Music Data & Stats
        musicData.value = await fetchMusicData()
        await recStore.fetchChartStats()

        // 3. Process Recommendations
        processRecommendations()
    } catch (e) {
        console.error(e)
    } finally {
        isProcessing.value = false
    }
})

const processRecommendations = () => {
    if (!userStore.records.length || !musicData.value.length) return

    // 1. Calculate User Stats (B15/B35)
    const processedRecords = userStore.records.map(getRating)
    
    const b15 = processedRecords.filter(r => r.isNew).sort((a, b) => b.ra - a.ra).slice(0, 15)
    const b35 = processedRecords.filter(r => !r.isNew).sort((a, b) => b.ra - a.ra).slice(0, 35)

    const b15Min = b15.length === 15 ? b15[14].ra : 0
    const b35Min = b35.length === 35 ? b35[34].ra : 0
    
    const b15AvgDS = b15.length ? b15.reduce((acc, r) => acc + r.ds, 0) / b15.length : 10.0
    const b35AvgDS = b35.length ? b35.reduce((acc, r) => acc + r.ds, 0) / b35.length : 10.0

    // Max DS played (to filter out too hard songs for Easy strategy)
    const maxDS = Math.max(...processedRecords.map(r => r.ds), 10.0)

    // 2. Strategy A: Score Attack
    const attackCandidates = []
    processedRecords.forEach(record => {
        const ach = record.achievements
        let targetAch = 0
        
        // Thresholds: 96.5->97, 98.5->99, 99.0->99.5, 99.5->100, 100.0->100.5
        if (ach >= 96.5 && ach < 97.0) targetAch = 97.0
        else if (ach >= 98.5 && ach < 99.0) targetAch = 99.0
        else if (ach >= 99.0 && ach < 99.5) targetAch = 99.5
        else if (ach >= 99.5 && ach < 100.0) targetAch = 100.0
        else if (ach >= 100.0 && ach < 100.5) targetAch = 100.5

        if (targetAch > 0) {
            // Use fit_diff if available, else ds
            const fitDiff = recStore.getFitDiff(record.song_id, record.level_index) || record.ds
            const targetRating = calculateRating(fitDiff, targetAch)
            const gain = targetRating - record.ra
            
            if (gain > 0) {
                const song = getSongById(record.song_id)
                if (song) {
                    attackCandidates.push({
                        song,
                        stats: { 
                            ds: record.ds, 
                            fit_diff: fitDiff, 
                            level_index: record.level_index,
                            avg: recStore.getAvgAchievement(record.song_id, record.level_index)
                        },
                        userRecord: record,
                        targetRating,
                        targetAch,
                        gain,
                        strategy: 'attack'
                    })
                }
            }
        }
    })
    scoreAttackList.value = attackCandidates.sort((a, b) => b.gain - a.gain).slice(0, 50)

    // 3. Strategy B: Gems (New & Old)
    const newGemCandidates = []
    const oldGemCandidates = []
    const easyCandidates = []

    // Create a set of played chart keys "songId_levelIndex"
    const playedCharts = new Set(processedRecords.map(r => `${r.song_id}_${r.level_index}`))

    musicData.value.forEach(song => {
        const isNew = song.basic_info.is_new
        const targetMin = isNew ? b15Min : b35Min
        const targetAvgDS = isNew ? b15AvgDS : b35AvgDS

        song.ds.forEach((ds, levelIndex) => {
            // Skip if played (for Gems)
            const chartKey = `${song.id}_${levelIndex}`
            const isPlayed = playedCharts.has(chartKey)

            const fitDiff = recStore.getFitDiff(song.id, levelIndex) || ds
            const avgAch = recStore.getAvgAchievement(song.id, levelIndex)

            // Stats object
            const stats = {
                ds,
                fit_diff: fitDiff,
                level_index: levelIndex,
                avg: avgAch
            }

            // --- Strategy B: Gems ---
            if (!isPlayed && avgAch) {
                // Filter by DS range (e.g., AvgDS - 1.5 to AvgDS + 2.0)
                if (fitDiff >= targetAvgDS - 1.5 && fitDiff <= targetAvgDS + 2.5) {
                    // Predict rating based on global avg (conservative estimate: avg - 1%?)
                    // Let's just use avg for now, or maybe avg of people around this rating?
                    // Simple approach: Use global avg achievement to calculate predicted rating
                    const predictedRating = calculateRating(fitDiff, avgAch)
                    const gain = predictedRating - targetMin

                    if (gain > 0) {
                        const candidate = {
                            song,
                            stats,
                            predictedRating,
                            gain,
                            strategy: 'gem'
                        }
                        if (isNew) newGemCandidates.push(candidate)
                        else oldGemCandidates.push(candidate)
                    }
                }
            }

            // --- Strategy C: Easy ---
            // High avg achievement, regardless of played or not (but usually unplayed is more interesting)
            // Filter: Avg >= 99.0 and DS is reasonable (not too easy, not too hard)
            if (avgAch && avgAch >= 98.5 && fitDiff >= 10.0 && fitDiff <= maxDS + 1.0) {
                 // If played, check if we can still improve? 
                 // For simplicity, let's list high avg songs that we haven't SSS+ yet
                 let currentAch = 0
                 if (isPlayed) {
                     const r = processedRecords.find(r => r.song_id === song.id && r.level_index === levelIndex)
                     currentAch = r ? r.achievements : 0
                 }

                 if (currentAch < 100.5) {
                     const predictedRating = calculateRating(fitDiff, 100.5) // Potential max
                     easyCandidates.push({
                         song,
                         stats,
                         userRecord: isPlayed ? { achievements: currentAch, ra: calculateRating(fitDiff, currentAch) } : null,
                         predictedRating,
                         gain: avgAch, // Sort by avg achievement
                         strategy: 'easy'
                     })
                 }
            }
        })
    })

    newGemList.value = newGemCandidates.sort((a, b) => b.gain - a.gain).slice(0, 50)
    oldGemList.value = oldGemCandidates.sort((a, b) => b.gain - a.gain).slice(0, 50)
    easyList.value = easyCandidates.sort((a, b) => b.stats.avg - a.stats.avg).slice(0, 50)
}

const currentList = computed(() => {
    switch (activeTab.value) {
        case 'score-attack': return scoreAttackList.value
        case 'new-gem': return newGemList.value
        case 'old-gem': return oldGemList.value
        case 'easy': return easyList.value
        default: return []
    }
})

const tabs = [
    { id: 'score-attack', label: '临门一脚', icon: Target, color: 'text-red-500' },
    { id: 'new-gem', label: '新曲挖掘', icon: Sparkles, color: 'text-yellow-500' },
    { id: 'old-gem', label: '旧曲挖掘', icon: Zap, color: 'text-blue-500' },
    { id: 'easy', label: '甜品推荐', icon: Coffee, color: 'text-green-500' }
]
</script>

<template>
    <div class="max-w-6xl mx-auto pb-12 space-y-6 px-4 md:px-0">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <button @click="router.back()" class="flex items-center gap-1 text-gray-500 font-bold hover:text-black transition-colors">
                <ArrowLeft :size="20" />
                返回
            </button>
            <h1 class="text-2xl font-black text-gray-800">推分建议</h1>
            <div class="w-20"></div> <!-- Spacer -->
        </div>

        <!-- Error State -->
        <div v-if="recStore.error" class="bg-red-50 border-2 border-red-500 p-4 text-red-600 font-bold shadow-[4px_4px_0px_0px_#EF4444]">
            数据加载失败: {{ recStore.error }}
        </div>

        <!-- Loading State -->
        <div v-else-if="isProcessing || recStore.isLoading" class="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 class="animate-spin mb-2" :size="32" />
            <p>正在分析全服数据...</p>
        </div>

        <div v-else class="space-y-6">
            <!-- Tabs -->
            <div class="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
                <button 
                    v-for="tab in tabs" 
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    class="flex items-center gap-2 px-6 py-3 font-black transition-all whitespace-nowrap border-2"
                    :class="activeTab === tab.id 
                        ? 'bg-white border-black shadow-[4px_4px_0px_0px_#000000] -translate-y-1' 
                        : 'bg-gray-100 border-transparent text-gray-400 hover:border-black hover:bg-white hover:text-black'"
                >
                    <component :is="tab.icon" :size="18" :class="activeTab === tab.id ? tab.color : ''" />
                    {{ tab.label }}
                </button>
            </div>

            <!-- Content Area -->
            <div class="bg-white border-2 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_#000000] min-h-[400px]">
                <div v-if="currentList.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <RecommendationCard 
                        v-for="(item, index) in currentList"
                        :key="index"
                        :song="item.song"
                        :stats="item.stats"
                        :user-record="item.userRecord"
                        :strategy="item.strategy"
                        :target-rating="item.targetRating"
                        :target-ach="item.targetAch"
                        :predicted-rating="item.predictedRating"
                        :cover-url="getCoverUrl(item.song.id)"
                        @click="router.push(`/song/${item.song.id}`)"
                        class="cursor-pointer"
                    />
                </div>
                <div v-else class="text-center text-gray-400 py-20">
                    <p class="font-bold text-lg">暂无推荐</p>
                    <p class="text-sm mt-2">可能是数据不足或您太强了！</p>
                    <p v-if="activeTab !== 'score-attack'" class="text-xs mt-1 text-gray-300">
                        (挖掘功能需要加载 chart_stats.json 数据)
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
