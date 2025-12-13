<script setup>
import { computed } from 'vue'
import { Trophy, ArrowRight, TrendingUp } from 'lucide-vue-next'

const props = defineProps({
    song: { type: Object, required: true },
    stats: { type: Object, required: true }, // { fit_diff, avg, ... }
    userRecord: { type: Object, default: null }, // User's current record if any
    strategy: { type: String, required: true }, // 'attack', 'gem', 'easy'
    targetRating: { type: Number, default: 0 },
    targetAch: { type: Number, default: 0 },
    predictedRating: { type: Number, default: 0 },
    gain: { type: Number, default: 0 },
    coverUrl: { type: String, default: '' }
})

const difficultyColor = computed(() => {
    const level = props.stats.level_index
    switch (level) {
        case 0: return 'bg-green-500'
        case 1: return 'bg-yellow-500'
        case 2: return 'bg-red-500'
        case 3: return 'bg-purple-500'
        case 4: return 'bg-violet-300' // Re:Master
        default: return 'bg-gray-500'
    }
})

const difficultyLabel = computed(() => {
    const labels = ['BSC', 'ADV', 'EXP', 'MST', 'Re:M']
    return labels[props.stats.level_index] || 'UNK'
})

const achievementClass = (ach) => {
    if (ach >= 100.5) return 'text-red-500' // SSS+
    if (ach >= 100.0) return 'text-red-500' // SSS
    if (ach >= 99.5) return 'text-yellow-600' // SS+
    if (ach >= 99.0) return 'text-yellow-600' // SS
    if (ach >= 98.0) return 'text-orange-500' // S+
    if (ach >= 97.0) return 'text-orange-500' // S
    return 'text-gray-600'
}

const getRateLabel = (ach) => {
    if (ach >= 100.5) return 'SSS+'
    if (ach >= 100.0) return 'SSS'
    if (ach >= 99.5) return 'SS+'
    if (ach >= 99.0) return 'SS'
    if (ach >= 98.0) return 'S+'
    if (ach >= 97.0) return 'S'
    return ach.toFixed(1) + '%'
}

const formatAch = (ach) => ach.toFixed(4) + '%'
</script>

<template>
    <div 
        class="group relative bg-white border-2 border-black p-2 md:p-3 flex items-center gap-2 md:gap-4 transition-all duration-100 active:translate-x-1 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000000] hover:bg-yellow-50"
    >
        <!-- Cover -->
        <div class="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0 border-2 border-black overflow-hidden bg-gray-200">
            <img :src="coverUrl" class="w-full h-full object-cover" loading="lazy" />
            <div class="absolute bottom-0 left-0 right-0 h-1.5 border-t-2 border-black" :class="difficultyColor"></div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
                <span class="text-[10px] md:text-xs font-black px-1.5 py-0.5 border border-black text-white shadow-[1px_1px_0px_0px_#000000] md:shadow-[2px_2px_0px_0px_#000000]" :class="difficultyColor">
                    {{ difficultyLabel }} {{ stats.ds.toFixed(1) }}
                </span>
                <h3 class="font-bold text-black truncate text-sm md:text-base">{{ song.title }}</h3>
            </div>
            
            <div class="mt-1 md:mt-2 flex items-center gap-2 md:gap-4 text-xs md:text-sm">
                <!-- Current Score (if any) -->
                <div v-if="userRecord" class="flex flex-col">
                    <span class="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase">Current</span>
                    <span class="font-black font-mono leading-none" :class="achievementClass(userRecord.achievements)">
                        {{ userRecord.achievements.toFixed(4) }}%
                    </span>
                </div>
                <div v-else class="flex flex-col">
                    <span class="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase">Avg</span>
                    <span class="font-black font-mono text-gray-800 leading-none">
                        {{ stats.avg ? stats.avg.toFixed(2) : '---' }}%
                    </span>
                </div>

                <ArrowRight :size="14" class="text-black flex-shrink-0" stroke-width="3" />

                <!-- Target/Predicted -->
                <div class="flex flex-col">
                    <span class="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase">
                        {{ strategy === 'attack' ? 'Target' : 'Predict' }}
                    </span>
                    <span class="font-black font-mono text-maimai-blue leading-none">
                        {{ strategy === 'attack' ? getRateLabel(targetAch) : (stats.avg ? stats.avg.toFixed(2) + '%' : '---') }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Rating Gain -->
        <div class="flex flex-col items-end justify-center min-w-[60px] md:min-w-[80px] pl-2 border-l-2 border-gray-100">
            <template v-if="strategy !== 'easy'">
                <div class="flex items-center gap-1 text-maimai-blue font-black text-lg md:text-xl leading-none">
                    <TrendingUp :size="16" stroke-width="3" />
                    <span>+{{ gain.toFixed(0) }}</span>
                </div>
                <div class="text-[8px] md:text-[10px] text-gray-400 font-bold mt-1 text-right leading-tight">
                    RATING UP
                </div>
            </template>
            <div v-if="stats.fit_diff" class="text-[8px] md:text-[10px] text-gray-400 font-bold text-right leading-tight">
                Fit: {{ stats.fit_diff.toFixed(2) }}
            </div>
        </div>
    </div>
</template>
