<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ArrowLeft, Trophy, Share2, Download, Loader2 } from 'lucide-vue-next'
import B50SongCard from '@/components/records/B50SongCard.vue'
import { toPng } from 'html-to-image'
import { getCoverUrl, getSongById } from '@/services/diving-fish'

const router = useRouter()
const userStore = useUserStore()
const exportRef = ref(null)
const isExporting = ref(false)
const coverMap = reactive({})

// Rating Calculation Helper
const getRating = (record) => {
    // 1. Get DS
    let ds = record.ds
    let type = record.type
    
    if (!ds || !type) {
        const song = getSongById(record.song_id)
        if (song) {
            if (!ds) ds = song.ds[record.level_index]
            if (!type) type = song.basic_info.from === '舞萌DX' || parseInt(song.id) > 10000 ? 'DX' : 'SD' // Simple heuristic or use song.type if available
            // Actually song.type is usually "DX" or "SD" in music_data
            if (!type && song.type) type = song.type
        }
    }
    
    // Fallback if still missing
    if (!ds) ds = 0
    if (!type) type = 'DX'

    // 2. Calculate Rating
    const ach = Math.min(100.5, record.achievements)
    let coeff = 0

    if (ach >= 100.5) coeff = 22.4
    else if (ach >= 100.0) coeff = 21.6
    else if (ach >= 99.5) coeff = 21.1
    else if (ach >= 99.0) coeff = 20.8
    else if (ach >= 98.0) coeff = 20.3
    else if (ach >= 97.0) coeff = 20.0
    else if (ach >= 94.0) coeff = 16.8
    else if (ach >= 90.0) coeff = 15.2
    else if (ach >= 80.0) coeff = 13.6
    else coeff = 0 // Below A?

    const ra = Math.floor(ds * (ach / 100) * coeff)
    
    return { ...record, ds, type, ra }
}

// Processed Records
const processedRecords = computed(() => {
    return userStore.records.map(getRating)
})

// B50 Data Calculation
const dxRecords = computed(() => {
    return processedRecords.value
        .filter(r => r.type === 'DX')
        .sort((a, b) => b.ra - a.ra)
        .slice(0, 15)
})

const sdRecords = computed(() => {
    return processedRecords.value
        .filter(r => r.type === 'SD')
        .sort((a, b) => b.ra - a.ra)
        .slice(0, 35)
})

const b50Records = computed(() => {
    return [...dxRecords.value, ...sdRecords.value].sort((a, b) => b.ra - a.ra)
})

const b15Total = computed(() => dxRecords.value.reduce((acc, r) => acc + r.ra, 0))
const b35Total = computed(() => sdRecords.value.reduce((acc, r) => acc + r.ra, 0))
const totalRating = computed(() => b15Total.value + b35Total.value)

const openDetail = (record) => {
  router.push(`/song/${record.song_id}`)
}

const preloadImages = async () => {
    const promises = [...dxRecords.value, ...sdRecords.value].map(async (record) => {
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
  if (!userStore.isAuthenticated) {
    // Handle auth
  } else if (userStore.records.length === 0) {
    await userStore.fetchProfile()
  }
})
</script>

<template>
    <div class="max-w-6xl mx-auto pb-12 space-y-6">
        <!-- Header Controls -->
        <div class="flex items-center justify-between px-4 md:px-0">
            <button @click="router.back()" class="flex items-center gap-1 text-gray-500 font-bold hover:text-black transition-colors">
                <ArrowLeft :size="20" />
                返回
            </button>
            
            <button 
                @click="handleExport" 
                :disabled="isExporting"
                class="btn-base bg-maimai-blue text-white flex items-center gap-2 px-4 py-2 text-sm"
            >
                <Loader2 v-if="isExporting" class="animate-spin" :size="18" />
                <Download v-else :size="18" />
                {{ isExporting ? '生成中...' : '保存图片' }}
            </button>
        </div>

        <!-- Export Area -->
        <div ref="exportRef" class="bg-gray-100 p-4 md:p-8 rounded-xl overflow-hidden">
            <!-- B50 Header Info -->
            <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-white p-6 rounded-xl shadow-sm border-2 border-black/5">
                <div class="flex items-center gap-4">
                    <div class="w-20 h-20 bg-gradient-to-br from-maimai-yellow to-orange-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <Trophy :size="40" class="text-white drop-shadow-md" />
                    </div>
                    <div>
                        <h1 class="text-2xl font-black text-gray-800">{{ userStore.profile.nickname || 'PLAYER' }}</h1>
                        <div class="text-4xl font-black text-maimai-blue tracking-tighter mt-1">
                            {{ totalRating }}
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-4 md:gap-8 text-center">
                    <div class="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                        <div class="text-xs font-bold text-blue-400 uppercase tracking-wider">Best 35 (SD)</div>
                        <div class="text-xl font-black text-blue-600">{{ b35Total }}</div>
                    </div>
                    <div class="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100">
                        <div class="text-xs font-bold text-yellow-500 uppercase tracking-wider">Best 15 (DX)</div>
                        <div class="text-xl font-black text-yellow-600">{{ b15Total }}</div>
                    </div>
                </div>
            </div>

            <!-- Records Grid -->
            <div class="space-y-8">
                <!-- Best 35 (Standard) -->
                <div v-if="sdRecords.length > 0">
                    <div class="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-100">
                        <h2 class="text-xl font-black text-blue-600 uppercase tracking-wider">Standard (Best 35)</h2>
                        <span class="text-sm font-bold text-blue-400 bg-blue-50 px-2 py-0.5 rounded-full">Total: {{ b35Total }}</span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                        <B50SongCard 
                            v-for="(record, index) in sdRecords" 
                            :key="record.song_id + '_' + record.level_index" 
                            :record="record"
                            :rank="index + 1"
                            :custom-cover-url="coverMap[record.song_id]"
                            class="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            @click="openDetail(record)"
                        />
                    </div>
                </div>

                <!-- Best 15 (DX) -->
                <div v-if="dxRecords.length > 0">
                    <div class="flex items-center gap-2 mb-4 pb-2 border-b-2 border-yellow-100">
                        <h2 class="text-xl font-black text-yellow-600 uppercase tracking-wider">DX (Best 15)</h2>
                        <span class="text-sm font-bold text-yellow-400 bg-yellow-50 px-2 py-0.5 rounded-full">Total: {{ b15Total }}</span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                        <B50SongCard 
                            v-for="(record, index) in dxRecords" 
                            :key="record.song_id + '_' + record.level_index" 
                            :record="record"
                            :rank="index + 1"
                            :custom-cover-url="coverMap[record.song_id]"
                            class="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            @click="openDetail(record)"
                        />
                    </div>
                </div>
            </div>
            
            <!-- Footer / Watermark -->
            <div class="mt-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest opacity-50">
                Generated by Maimai Tools
            </div>
        </div>
        
        <div v-if="b50Records.length === 0" class="text-center py-20 text-gray-500 font-bold">
            暂无数据
        </div>
    </div>
</template>
