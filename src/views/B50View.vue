<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ArrowLeft, Trophy, Share2, Download, Loader2, Sparkles } from 'lucide-vue-next'
import B50SongCard from '@/components/records/B50SongCard.vue'
import RatingTable from '@/components/records/RatingTable.vue'
import { toPng } from 'html-to-image'
import { getCoverUrl, getSongById } from '@/services/diving-fish'
import { fetchMusicData } from '@/services/diving-fish'
import { getRating } from '@/utils/rating'

const router = useRouter()
const userStore = useUserStore()
const exportRef = ref(null)
const isExporting = ref(false)
const isRefreshing = ref(false)
const isMusicDataLoaded = ref(false)
const coverMap = reactive({})

const refreshData = async () => {
    if (confirm('确定要重新获取最新成绩吗？')) {
        isRefreshing.value = true
        try {
            await userStore.fetchProfile()
        } catch (e) {
            alert('更新失败: ' + e.message)
        } finally {
            isRefreshing.value = false
        }
    }
}

// Processed Records
const processedRecords = computed(() => {
    // Dependency on isMusicDataLoaded to trigger re-calc after fetch
    const loaded = isMusicDataLoaded.value
    return userStore.records.map(getRating)
})

// B50 Data Calculation
const b15Records = computed(() => {
    // Best 15 (Current Version)
    return processedRecords.value
        .filter(r => r.isNew)
        .sort((a, b) => b.ra - a.ra)
        .slice(0, 15)
})

const b35Records = computed(() => {
    // Best 35 (Past Versions)
    return processedRecords.value
        .filter(r => !r.isNew)
        .sort((a, b) => b.ra - a.ra)
        .slice(0, 35)
})

const b50Records = computed(() => {
    return [...b15Records.value, ...b35Records.value].sort((a, b) => b.ra - a.ra)
})

const dsList = computed(() => {
    if (b50Records.value.length === 0) return [10.0, 11.0, 12.0, 13.0, 14.0]
    const totalDs = b50Records.value.reduce((acc, r) => acc + r.ds, 0)
    const avgDs = totalDs / b50Records.value.length
    
    // Round to nearest 0.1
    const center = Math.round(avgDs * 10) / 10
    
    return [
        (center - 0.6).toFixed(1),
        (center - 0.3).toFixed(1),
        center.toFixed(1),
        (center + 0.3).toFixed(1),
        (center + 0.6).toFixed(1)
    ].map(Number)
})

const b15Total = computed(() => b15Records.value.reduce((acc, r) => acc + r.ra, 0))
const b35Total = computed(() => b35Records.value.reduce((acc, r) => acc + r.ra, 0))
const totalRating = computed(() => b15Total.value + b35Total.value)

const openDetail = (record) => {
  router.push(`/song/${record.song_id}`)
}

const preloadImages = async () => {
    const promises = [...b15Records.value, ...b35Records.value].map(async (record) => {
        if (coverMap[record.song_id]) return
        
        const loadBlob = async (url) => {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`Failed to load ${url}`)
            return await response.blob()
        }

        try {
            let blob
            try {
                blob = await loadBlob(getCoverUrl(record.song_id))
            } catch (e) {
                // Fallback to default cover
                blob = await loadBlob('/default_cover.jpg')
            }

            return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    coverMap[record.song_id] = reader.result
                    resolve()
                }
                reader.readAsDataURL(blob)
            })
        } catch (e) {
            console.error('Failed to preload image for', record.song_id, e)
        }
    })
    
    await Promise.all(promises)
}

const handleExport = async () => {
    if (!exportRef.value) return
    isExporting.value = true
    
    try {
        // Preload images to Base64 to avoid CORS/404 issues in html-to-image
        await preloadImages()

        // Wait for a moment to ensure rendering
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const dataUrl = await toPng(exportRef.value, {
            cacheBust: false, // Disable cache bust to avoid potential 404s with proxies
            pixelRatio: 2,
            backgroundColor: '#f3f4f6', // Match bg-gray-100
            skipAutoScale: true,
            // Attempt to fix font loading issues
            fontEmbedCSS: '' 
        })
        
        const link = document.createElement('a')
        link.download = `maimai_b50_${userStore.profile.username || 'user'}.png`
        link.href = dataUrl
        link.click()
    } catch (error) {
        console.error('Export failed:', error)
        alert('图片生成失败，请重试')
    } finally {
        isExporting.value = false
    }
}

onMounted(async () => {
  try {
    await fetchMusicData()
    isMusicDataLoaded.value = true
  } catch (e) {
    console.error('Failed to load music data', e)
  }

  if (!userStore.isAuthenticated) {
    // Handle auth
  } else if (userStore.records.length === 0) {
    await userStore.fetchProfile()
  }
})

const getPlateImage = (rating) => {
    if (rating >= 15000) return '/maiRATING/11.png'
    if (rating >= 14500) return '/maiRATING/10.png'
    if (rating >= 14000) return '/maiRATING/9.png'
    if (rating >= 13000) return '/maiRATING/8.png'
    if (rating >= 12000) return '/maiRATING/7.png'
    if (rating >= 10000) return '/maiRATING/6.png'
    if (rating >= 7000) return '/maiRATING/5.png'
    if (rating >= 4000) return '/maiRATING/4.png'
    if (rating >= 2000) return '/maiRATING/3.png'
    if (rating >= 1000) return '/maiRATING/2.png'
    return '/maiRATING/1.png'
}
</script>

<template>
    <div class="max-w-6xl mx-auto pb-12 space-y-6">
        <!-- Header Controls -->
        <div class="flex items-center justify-between px-4 md:px-0">
            <button @click="router.back()" class="flex items-center gap-1 text-gray-500 font-bold hover:text-black transition-colors">
                <ArrowLeft :size="20" />
                返回
            </button>
            
            <div class="flex gap-4">
                <button 
                    @click="router.push('/recommendation')" 
                    class="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-maimai-purple text-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                >
                    <Sparkles :size="18" />
                    推分建议
                </button>
                <button 
                    @click="handleExport" 
                    :disabled="isExporting"
                    class="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-maimai-blue text-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Loader2 v-if="isExporting" class="animate-spin" :size="18" />
                    <Download v-else :size="18" />
                    {{ isExporting ? '生成中...' : '保存图片' }}
                </button>
            </div>
        </div>
        
        <div class="text-right px-4 md:px-0">
             <button @click="refreshData" class="text-xs font-bold text-gray-400 underline hover:text-maimai-blue">
                数据不准确？点击更新成绩
            </button>
        </div>

        <!-- Export Area -->
        <div ref="exportRef" class="bg-white p-4 md:p-8 border-2 border-black shadow-[8px_8px_0px_0px_#000000]">
            <!-- B50 Header Info -->
            <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-[#FFFBEB] p-4 md:p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000000] rounded-3xl">
                <div class="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
                    <div class="w-20 h-20 md:w-24 md:h-24 bg-maimai-yellow border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000000] flex-shrink-0">
                        <Trophy :size="40" class="text-black md:w-12 md:h-12" stroke-width="2.5" />
                    </div>
                    <div class="flex flex-col items-center md:items-start w-full">
                        <h1 class="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-2 text-center md:text-left truncate max-w-[240px] md:max-w-xs">
                            {{ userStore.profile.nickname || 'PLAYER' }}
                        </h1>
                        
                        <!-- DX Rating Plate (Image Based) -->
                        <div class="relative w-full max-w-[260px] md:max-w-[320px] select-none filter drop-shadow-md" style="aspect-ratio: 1430/308;">
                            <img :src="getPlateImage(totalRating)" class="w-full h-full object-contain block" alt="DX Rating Plate" />
                            
                            <!-- Number Container -->
                            <div class="absolute top-0 bottom-0 flex" style="left: 46.8%; width: 40.5%;">
                                <div v-for="(digit, index) in totalRating.toString().padStart(5, ' ').split('')" 
                                     :key="index" 
                                     class="w-full h-full flex items-center justify-center">
                                    <span v-if="digit !== ' '" 
                                          class="font-black text-white font-mono leading-none text-center" 
                                          :class="totalRating >= 10000 ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'"
                                          style="text-shadow: 1.5px 1.5px 0 #000;">
                                        {{ digit }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-3 md:gap-4 text-center w-full md:w-auto justify-center">
                    <div class="bg-white px-4 md:px-5 py-2 md:py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000000] rounded-xl flex-1 md:flex-none min-w-[100px]">
                        <div class="text-[10px] md:text-xs font-black text-blue-500 uppercase tracking-wider mb-1">Best 35</div>
                        <div class="text-xl md:text-2xl font-black text-black leading-none">{{ b35Total }}</div>
                    </div>
                    <div class="bg-white px-4 md:px-5 py-2 md:py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000000] rounded-xl flex-1 md:flex-none min-w-[100px]">
                        <div class="text-[10px] md:text-xs font-black text-yellow-500 uppercase tracking-wider mb-1">Best 15</div>
                        <div class="text-xl md:text-2xl font-black text-black leading-none">{{ b15Total }}</div>
                    </div>
                </div>
            </div>

            <!-- Records Grid -->
            <div class="space-y-10">
                <!-- Best 35 (Standard) -->
                <div v-if="b35Records.length > 0">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="bg-maimai-blue text-white px-4 py-1 font-black text-xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] uppercase italic transform -skew-x-12">
                            Past Versions
                        </div>
                        <div class="h-1 flex-1 bg-black"></div>
                        <span class="font-black text-black border-2 border-black px-2 py-0.5 bg-white shadow-[2px_2px_0px_0px_#000000]">Total: {{ b35Total }}</span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                        <B50SongCard 
                            v-for="(record, index) in b35Records" 
                            :key="record.song_id + '_' + record.level_index" 
                            :record="record"
                            :rank="index + 1"
                            :custom-cover-url="coverMap[record.song_id]"
                            class="cursor-pointer"
                            @click="openDetail(record)"
                        />
                    </div>
                </div>

                <!-- Best 15 (DX) -->
                <div v-if="b15Records.length > 0">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="bg-maimai-yellow text-black px-4 py-1 font-black text-xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] uppercase italic transform -skew-x-12">
                            Current Version
                        </div>
                        <div class="h-1 flex-1 bg-black"></div>
                        <span class="font-black text-black border-2 border-black px-2 py-0.5 bg-white shadow-[2px_2px_0px_0px_#000000]">Total: {{ b15Total }}</span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                        <B50SongCard 
                            v-for="(record, index) in b15Records" 
                            :key="record.song_id + '_' + record.level_index" 
                            :record="record"
                            :rank="index + 1"
                            :custom-cover-url="coverMap[record.song_id]"
                            class="cursor-pointer"
                            @click="openDetail(record)"
                        />
                    </div>
                </div>
            </div>

            <!-- Rating Table -->
            <div class="mt-12">
                <div class="flex items-center gap-3 mb-6">
                    <div class="bg-black text-white px-4 py-1 font-black text-xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] uppercase italic transform -skew-x-12">
                        Score Recommendation
                    </div>
                    <div class="h-1 flex-1 bg-black"></div>
                </div>
                <RatingTable :ds-list="dsList" />
            </div>
            
            <!-- Footer / Watermark -->
            <div class="mt-12 flex justify-center">
                <div class="bg-black text-white px-4 py-1 text-xs font-bold uppercase tracking-widest border-2 border-black">
                    Generated by Maimai Tools
                </div>
            </div>
        </div>
        
        <div v-if="b50Records.length === 0" class="text-center py-20 text-gray-500 font-bold">
            暂无数据
        </div>
    </div>
</template>
