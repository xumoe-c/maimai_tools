<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getSongById, getCoverUrl, fetchMusicData, fetchSongAliases, fetchChartStats } from '@/services/diving-fish'
import { Loader2, ArrowLeft, Music, User, Activity, BarChart2, Info, List, Copy, Search } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const songId = route.params.id
const song = ref(null)
const aliases = ref([])
const chartStats = ref(null)
const isLoading = ref(true)
const showAliasModal = ref(false)
const selectedDiffIndex = ref(0)

// Context Menu State
const showMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
let longPressTimer = null

// Difficulty colors and labels
const diffColors = ['bg-maimai-green', 'bg-maimai-yellow', 'bg-maimai-red', 'bg-maimai-purple', 'bg-pink-300']
const diffTextColors = ['text-maimai-green', 'text-maimai-yellow', 'text-maimai-red', 'text-maimai-purple', 'text-pink-400']
const diffLabels = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']

// User records for this song
const userRecords = computed(() => {
    if (!userStore.records.length) return []
    // Filter records for this song
    // Note: userStore.records might contain multiple records for same song if different difficulties
    // But usually it's a flat list.
    // We want to map them to difficulties 0-4
    const records = new Array(5).fill(null)
    userStore.records.forEach(r => {
        if (r.song_id == songId) {
            records[r.level_index] = r
        }
    })
    return records
})

const handleLongPressStart = (e) => {
    longPressTimer = setTimeout(() => {
        const touch = e.touches ? e.touches[0] : e
        // Adjust position to not be off-screen
        const x = Math.min(touch.clientX, window.innerWidth - 180)
        const y = Math.min(touch.clientY, window.innerHeight - 150)
        
        menuPosition.value = { x, y }
        showMenu.value = true
        
        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate(50)
        }
    }, 500)
}

const handleLongPressEnd = () => {
    if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
    }
}

const copyTitle = async () => {
    try {
        await navigator.clipboard.writeText(song.value.title)
        showMenu.value = false
    } catch (err) {
        console.error('Failed to copy:', err)
    }
}

const searchBilibili = () => {
    const keyword = encodeURIComponent(song.value.title)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
        // 尝试唤起 Bilibili App
        const start = Date.now()
        window.location.href = `bilibili://search?keyword=${keyword}`
        
        // 唤起失败时的 Fallback (2秒后如果还在当前页面则跳转网页版)
        setTimeout(() => {
            if (Date.now() - start < 2500 && !document.hidden) {
                window.open(`https://m.bilibili.com/search?keyword=${keyword}`, '_blank')
            }
        }, 2000)
    } else {
        window.open(`https://search.bilibili.com/all?keyword=${keyword}`, '_blank')
    }
    showMenu.value = false
}

const searchNetease = () => {
    const keyword = encodeURIComponent(song.value.title)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (isMobile) {
        // 尝试唤起网易云音乐 App
        const start = Date.now()
        window.location.href = `orpheus://search?keyword=${keyword}`
        
        setTimeout(() => {
            if (Date.now() - start < 2500 && !document.hidden) {
                window.open(`https://music.163.com/#/search/m/?s=${keyword}&type=1`, '_blank')
            }
        }, 2000)
    } else {
        window.open(`https://music.163.com/#/search/m/?s=${keyword}&type=1`, '_blank')
    }
    showMenu.value = false
}

const loadData = async () => {
    isLoading.value = true
    try {
        // Ensure music data is loaded
        await fetchMusicData()
        song.value = getSongById(songId)
        
        if (!song.value) {
            // Handle not found
            return
        }

        // Fetch aliases
        aliases.value = await fetchSongAliases(songId)

        // Fetch stats (this might be heavy, maybe optimize later)
        // We only need stats for this song.
        // The API returns { charts: { id: [...] }, diff_data: ... }
        const allStats = await fetchChartStats()
        if (allStats && allStats.charts && allStats.charts[songId]) {
            chartStats.value = allStats.charts[songId]
        }

        // Set default selected difficulty (Master or last available)
        if (song.value.charts.length > 3) {
            selectedDiffIndex.value = 3
        } else {
            selectedDiffIndex.value = song.value.charts.length - 1
        }

    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

const getAchievementColor = (ach) => {
    if (ach >= 100.5) return 'text-maimai-yellow' // SSS+
    if (ach >= 100) return 'text-maimai-yellow' // SSS
    if (ach >= 99.5) return 'text-maimai-red' // SS+
    if (ach >= 99) return 'text-maimai-red' // SS
    if (ach >= 98) return 'text-maimai-blue' // S+
    if (ach >= 97) return 'text-maimai-blue' // S
    return 'text-gray-700'
}

const getRankImage = (record) => {
    if (!record) return null
    const rate = record.rate.toLowerCase().replace('+', 'p')
    return `/maiFCFS/${rate}.png`
}

const getFcImage = (record) => {
    if (!record || !record.fc) return null
    const fc = record.fc.toLowerCase()
    return `/maiFCFS/${fc}.png`
}

const getFsImage = (record) => {
    if (!record || !record.fs) return null
    const fs = record.fs.toLowerCase()
    return `/maiFCFS/${fs}.png`
}

const handleImageError = (e) => {
  e.target.src = '/default_cover.jpg'
}

onMounted(() => {
    loadData()
})
</script>

<template>
    <div class="max-w-5xl mx-auto pb-12 space-y-6">
        <!-- Back Button -->
        <button @click="router.back()" class="flex items-center gap-1 text-gray-500 font-bold hover:text-black transition-colors">
            <ArrowLeft :size="20" />
            返回
        </button>

        <div v-if="isLoading" class="flex justify-center py-20">
            <Loader2 class="animate-spin text-maimai-blue" :size="48" />
        </div>

        <div v-else-if="song" class="space-y-8">
            <!-- Header Section -->
            <div class="bg-white border-2 border-black shadow-hard rounded-xl overflow-hidden">
                <div class="flex flex-col md:flex-row">
                    <!-- Cover -->
                    <div class="w-full md:w-64 shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-black relative group flex justify-center items-center md:block bg-gray-50 md:bg-transparent py-6 md:py-0">
                        <div class="w-48 md:w-full aspect-square relative shadow-hard md:shadow-none border-2 md:border-0 border-black">
                            <img :src="getCoverUrl(songId)" @error="handleImageError" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        </div>
                    </div>
                    
                    <!-- Info -->
                    <div class="p-6 flex-1 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50">
                        <div>
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <span class="inline-block px-2 py-0.5 text-xs font-black border border-black rounded bg-gray-100 mb-2">
                                        {{ song.basic_info.genre }}
                                    </span>
                                    <h1 
                                        class="text-2xl md:text-4xl font-black leading-tight mb-1 select-none cursor-pointer active:opacity-70 transition-opacity"
                                        @touchstart="handleLongPressStart"
                                        @touchend="handleLongPressEnd"
                                        @touchmove="handleLongPressEnd"
                                        @mousedown="handleLongPressStart"
                                        @mouseup="handleLongPressEnd"
                                        @mouseleave="handleLongPressEnd"
                                        @contextmenu.prevent
                                    >
                                        {{ song.title }}
                                    </h1>
                                    <p class="text-gray-600 font-bold flex items-center gap-2">
                                        <User :size="16" />
                                        {{ song.basic_info.artist }}
                                    </p>
                                </div>
                                <div class="text-right shrink-0">
                                    <div class="text-xs font-bold text-gray-400">ID</div>
                                    <div class="text-xl font-black">{{ songId }}</div>
                                </div>
                            </div>
                            
                            <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div class="bg-white p-3 rounded border-2 border-black/10">
                                    <div class="text-xs text-gray-500 font-bold mb-1">BPM</div>
                                    <div class="text-lg font-black">{{ song.basic_info.bpm }}</div>
                                </div>
                                <div class="bg-white p-3 rounded border-2 border-black/10">
                                    <div class="text-xs text-gray-500 font-bold mb-1">版本</div>
                                    <div class="text-lg font-black truncate">{{ song.basic_info.from }}</div>
                                </div>
                                <div class="bg-white p-3 rounded border-2 border-black/10 col-span-2 md:col-span-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" @click="showAliasModal = true">
                                    <div>
                                        <div class="text-xs text-gray-500 font-bold mb-1">别名</div>
                                        <div class="text-sm font-bold truncate max-w-[200px]">
                                            {{ aliases.length > 0 ? aliases[0] : '暂无别名' }}
                                            <span v-if="aliases.length > 1" class="text-gray-400 ml-1">+{{ aliases.length - 1 }}</span>
                                        </div>
                                    </div>
                                    <List :size="16" class="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts & Records Section -->
            <div class="space-y-6">
                <h2 class="text-2xl font-black flex items-center gap-2">
                    <Activity class="text-maimai-blue" />
                    谱面与成绩
                </h2>

                <!-- Difficulty Tabs -->
                <div class="flex flex-wrap gap-2">
                    <button 
                        v-for="(chart, index) in song.charts" 
                        :key="index"
                        @click="selectedDiffIndex = index"
                        class="px-4 py-2 rounded-lg font-black text-sm transition-all border-2 border-black shadow-sm flex items-center gap-2 relative overflow-hidden"
                        :class="selectedDiffIndex === index 
                            ? [diffColors[index], 'text-white scale-105 shadow-md'] 
                            : ['bg-white text-gray-500 hover:bg-gray-50']"
                    >
                        <span class="relative z-10">{{ diffLabels[index] }}</span>
                        
                        <!-- Rank Icon -->
                        <div v-if="userRecords[index]" class="relative z-10 bg-white rounded px-1 flex items-center shadow-sm">
                            <img :src="getRankImage(userRecords[index])" class="h-4 w-auto object-contain" />
                        </div>

                        <span class="text-xs opacity-80 bg-black/20 px-1.5 py-0.5 rounded relative z-10">{{ song.ds[index] }}</span>
                    </button>
                </div>

                <!-- Selected Chart Card -->
                <div v-if="song.charts[selectedDiffIndex]" class="bg-white border-2 border-black shadow-hard rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <!-- Difficulty Header -->
                    <div :class="[diffColors[selectedDiffIndex], 'px-4 py-2 border-b-2 border-black flex items-center justify-between']">
                        <span class="font-black text-white uppercase tracking-wider drop-shadow-md">{{ diffLabels[selectedDiffIndex] }}</span>
                        <span class="font-black text-white text-xl drop-shadow-md">{{ song.ds[selectedDiffIndex] }}</span>
                    </div>

                    <div class="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Chart Info -->
                        <div class="space-y-4">
                            <h3 class="font-bold text-gray-900 flex items-center gap-2 border-b-2 border-black/5 pb-2">
                                <Info :size="18" />
                                谱面信息
                            </h3>
                            
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-500 font-bold block">谱师</span>
                                    <span class="font-bold truncate block" :title="song.charts[selectedDiffIndex].charter">{{ song.charts[selectedDiffIndex].charter }}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 font-bold block">拟合难度</span>
                                    <span class="font-bold block">
                                        {{ (chartStats && chartStats[selectedDiffIndex] && chartStats[selectedDiffIndex].fit_diff) ? chartStats[selectedDiffIndex].fit_diff.toFixed(2) : '-' }}
                                    </span>
                                </div>
                                <div>
                                    <span class="text-gray-500 font-bold block">平均达成率</span>
                                    <span class="font-bold block">
                                        {{ (chartStats && chartStats[selectedDiffIndex] && chartStats[selectedDiffIndex].avg) ? chartStats[selectedDiffIndex].avg.toFixed(2) + '%' : '-' }}
                                    </span>
                                </div>
                                <div>
                                    <span class="text-gray-500 font-bold block">总物量</span>
                                    <span class="font-bold block">
                                        {{ song.charts[selectedDiffIndex].notes ? song.charts[selectedDiffIndex].notes.reduce((a, b) => a + b, 0) : '-' }}
                                    </span>
                                </div>
                            </div>

                            <!-- Note Counts -->
                            <div v-if="song.charts[selectedDiffIndex].notes" class="bg-gray-50 rounded border border-gray-200 p-3">
                                <div class="grid grid-cols-5 gap-1 text-center">
                                    <div><div class="text-[10px] font-bold text-gray-400">TAP</div><div class="font-black text-sm">{{ song.charts[selectedDiffIndex].notes[0] }}</div></div>
                                    <div><div class="text-[10px] font-bold text-gray-400">HOLD</div><div class="font-black text-sm">{{ song.charts[selectedDiffIndex].notes[1] }}</div></div>
                                    <div><div class="text-[10px] font-bold text-gray-400">SLIDE</div><div class="font-black text-sm">{{ song.charts[selectedDiffIndex].notes[2] }}</div></div>
                                    <div><div class="text-[10px] font-bold text-gray-400">TOUCH</div><div class="font-black text-sm">{{ song.charts[selectedDiffIndex].notes[3] || '-' }}</div></div>
                                    <div><div class="text-[10px] font-bold text-gray-400">BREAK</div><div class="font-black text-sm">{{ song.charts[selectedDiffIndex].notes[4] }}</div></div>
                                </div>
                            </div>
                        </div>

                        <!-- User Record -->
                        <div class="space-y-4 relative">
                            <h3 class="font-bold text-gray-900 flex items-center gap-2 border-b-2 border-black/5 pb-2">
                                <BarChart2 :size="18" />
                                我的成绩
                            </h3>

                            <div v-if="userRecords[selectedDiffIndex]" class="bg-gray-50 border-2 border-black/10 rounded-lg p-4 relative overflow-hidden">
                                <div class="flex items-center justify-between relative z-10">
                                    <!-- Left: Score & Status -->
                                    <div>
                                        <div 
                                            class="text-3xl font-black leading-none drop-shadow-md" 
                                            :class="getAchievementColor(userRecords[selectedDiffIndex].achievements)"
                                            style="text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;"
                                        >
                                            {{ userRecords[selectedDiffIndex].achievements.toFixed(4) }}%
                                        </div>
                                        <div class="text-xs font-bold text-gray-400 mt-1">
                                            DX Score: {{ userRecords[selectedDiffIndex].dxScore }}
                                        </div>
                                        
                                        <!-- Status Icons -->
                                        <div class="flex gap-2 mt-3">
                                            <img v-if="getFcImage(userRecords[selectedDiffIndex])" :src="getFcImage(userRecords[selectedDiffIndex])" class="h-6 object-contain" />
                                            <img v-if="getFsImage(userRecords[selectedDiffIndex])" :src="getFsImage(userRecords[selectedDiffIndex])" class="h-6 object-contain" />
                                        </div>
                                    </div>

                                    <!-- Right: Rank Image & Rating -->
                                    <div class="flex flex-col items-end">
                                        <img 
                                            v-if="getRankImage(userRecords[selectedDiffIndex])"
                                            :src="getRankImage(userRecords[selectedDiffIndex])"
                                            class="h-12 object-contain drop-shadow-sm mb-1"
                                        />
                                        <div class="text-xs font-bold text-maimai-purple bg-white px-2 py-0.5 rounded border border-maimai-purple/20">
                                            Rating: {{ userRecords[selectedDiffIndex].ra }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="h-32 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 font-bold text-sm">
                                暂无成绩记录
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-20 font-bold text-gray-500">
            未找到乐曲信息
        </div>

        <!-- Alias Modal -->
        <div v-if="showAliasModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showAliasModal = false">
            <div class="bg-white border-2 border-black shadow-hard rounded-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                <h3 class="text-xl font-black mb-4">乐曲别名</h3>
                <div class="flex flex-wrap gap-2">
                    <span v-for="alias in aliases" :key="alias" class="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm font-bold">
                        {{ alias }}
                    </span>
                    <span v-if="aliases.length === 0" class="text-gray-500 text-sm">暂无别名数据</span>
                </div>
                <button @click="showAliasModal = false" class="mt-6 w-full btn-base bg-black text-white py-2">关闭</button>
            </div>
        </div>

        <!-- Context Menu -->
        <div 
            v-if="showMenu" 
            class="fixed z-50 bg-white border-2 border-black shadow-hard rounded-lg overflow-hidden min-w-[160px] animate-in fade-in zoom-in duration-200 origin-top-left"
            :style="{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }"
        >
            <div class="flex flex-col">
                <button @click="copyTitle" class="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-sm font-bold text-left border-b border-gray-100 transition-colors">
                    <Copy :size="16" />
                    复制标题
                </button>
                <button @click="searchBilibili" class="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-sm font-bold text-left border-b border-gray-100 transition-colors">
                    <Search :size="16" />
                    B站搜索
                </button>
                <button @click="searchNetease" class="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-sm font-bold text-left transition-colors">
                    <Music :size="16" />
                    网易云搜索
                </button>
            </div>
        </div>

        <!-- Backdrop to close menu -->
        <div v-if="showMenu" class="fixed inset-0 z-40" @click="showMenu = false" @touchstart="showMenu = false"></div>
    </div>
</template>
