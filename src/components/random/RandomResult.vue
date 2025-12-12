<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRandomStore } from '@/stores/random'
import { getCoverUrl } from '@/services/diving-fish'
import { Sparkles, Clock } from 'lucide-vue-next'

const props = defineProps({
  musicData: {
    type: Array,
    required: true
  }
})

const store = useRandomStore()

// --- Rolling Animation ---
const displayCover = ref('')
const displayTitle = ref('Ready?')
let animationInterval = null

const startAnimation = () => {
    if (props.musicData.length === 0) return
    animationInterval = setInterval(() => {
        const randomSong = props.musicData[Math.floor(Math.random() * props.musicData.length)]
        displayCover.value = getCoverUrl(randomSong.id)
        displayTitle.value = randomSong.title
    }, 80)
}

const stopAnimation = () => {
    if (animationInterval) {
        clearInterval(animationInterval)
        animationInterval = null
    }
}

watch(() => store.isRolling, (newVal) => {
    if (newVal) {
        startAnimation()
    } else {
        stopAnimation()
    }
})

onUnmounted(() => {
    stopAnimation()
})

// --- Result Display ---
const result = computed(() => store.currentResult)

const diffColors = ['bg-maimai-green', 'bg-maimai-yellow', 'bg-maimai-red', 'bg-maimai-purple', 'bg-pink-300']
const diffLabels = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']
const diffTextColors = ['text-maimai-green', 'text-maimai-yellow', 'text-maimai-red', 'text-maimai-purple', 'text-pink-500']

const getDiffColor = (index) => diffColors[index] || 'bg-gray-400'
const getDiffLabel = (index) => diffLabels[index] || 'Unknown'
const getDiffTextColor = (index) => diffTextColors[index] || 'text-gray-600'

</script>

<template>
  <div class="flex flex-col gap-6 h-full">
    <!-- Main Result Area -->
    <div class="flex-1 bg-white border-2 border-black shadow-hard rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
        
        <!-- Rolling State -->
        <div v-if="store.isRolling" class="flex flex-col items-center gap-4 animate-pulse">
            <div class="w-48 h-48 md:w-64 md:h-64 border-4 border-black rounded-xl overflow-hidden shadow-hard">
                <img :src="displayCover" class="w-full h-full object-cover" />
            </div>
            <div class="text-2xl font-black text-center px-4 truncate max-w-full">{{ displayTitle }}</div>
            <div class="text-maimai-blue font-bold text-lg">抽选中...</div>
        </div>

        <!-- Result State -->
        <div v-else-if="result" class="flex flex-col md:flex-row items-center md:items-start gap-6 w-full animate-in fade-in zoom-in duration-300">
            <!-- Left: Cover -->
            <div class="relative flex-shrink-0">
                <div class="absolute -top-6 -right-6 z-10">
                    <Sparkles class="text-maimai-yellow w-12 h-12 drop-shadow-md animate-bounce" />
                </div>
                <div class="w-48 h-48 md:w-64 md:h-64 border-4 border-black rounded-xl overflow-hidden shadow-hard relative group">
                    <img :src="getCoverUrl(result.song.id)" class="w-full h-full object-cover" />
                    <!-- Type Badge -->
                    <div class="absolute top-0 left-0 px-3 py-1 bg-black text-white font-black text-sm rounded-br-lg">
                        {{ result.song.type }}
                    </div>
                </div>
            </div>

            <!-- Right: Info -->
            <div class="flex flex-col items-center md:items-start w-full gap-4">
                <div class="text-center md:text-left w-full">
                    <h2 class="text-2xl md:text-3xl font-black mb-2 leading-tight break-words">{{ result.song.title }}</h2>
                    <p class="text-gray-500 font-bold break-words">{{ result.song.basic_info.artist }}</p>
                </div>

                <!-- Difficulty Info -->
                <div class="flex flex-wrap justify-center md:justify-start items-center gap-4">
                    <div :class="['px-6 py-2 rounded-full border-2 border-black font-black text-xl text-white shadow-hard-sm whitespace-nowrap', getDiffColor(result.diffIndex)]">
                        {{ getDiffLabel(result.diffIndex) }}
                    </div>
                    <div class="text-4xl font-black italic">
                        {{ result.level }}
                    </div>
                </div>

                <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-sm font-bold text-gray-600 bg-gray-50 p-4 rounded-lg border-2 border-black">
                    <div class="flex justify-between items-center">
                        <span class="whitespace-nowrap mr-2">定数:</span>
                        <span class="text-black text-right truncate">{{ result.ds }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="whitespace-nowrap mr-2">BPM:</span>
                        <span class="text-black text-right truncate">{{ result.song.basic_info.bpm }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="whitespace-nowrap mr-2">版本:</span>
                        <span class="text-black text-right truncate">{{ result.song.basic_info.from }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="whitespace-nowrap mr-2">流派:</span>
                        <span class="text-black text-right truncate">{{ result.song.basic_info.genre }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center text-gray-400 flex flex-col items-center gap-4">
            <div class="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-200 border-dashed">
                <span class="text-4xl">?</span>
            </div>
            <p class="font-bold text-xl">点击左侧按钮开始随机</p>
        </div>
    </div>

    <!-- History -->
    <div v-if="store.history.length > 0" class="bg-white border-2 border-black shadow-hard rounded-xl p-4">
        <div class="flex items-center gap-2 mb-3 border-b-2 border-black pb-2">
            <Clock :size="18" />
            <h3 class="font-black">历史记录</h3>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-2">
            <div 
                v-for="(item, idx) in store.history" 
                :key="item.timestamp" 
                class="flex-shrink-0 w-32 flex flex-col gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                @click="store.currentResult = item"
            >
                <div class="w-32 h-32 border-2 border-black rounded-lg overflow-hidden relative">
                    <img :src="getCoverUrl(item.song.id)" class="w-full h-full object-cover" />
                    <div :class="['absolute bottom-0 left-0 right-0 h-1.5', getDiffColor(item.diffIndex)]"></div>
                </div>
                <div class="text-xs font-bold truncate">{{ item.song.title }}</div>
                <div :class="['text-xs font-black', getDiffTextColor(item.diffIndex)]">
                    {{ getDiffLabel(item.diffIndex) }} {{ item.level }}
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
