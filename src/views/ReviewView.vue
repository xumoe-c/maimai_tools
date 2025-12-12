<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Plus, Trash2, Download, LayoutList, LayoutGrid, FolderOpen } from 'lucide-vue-next'
import { useReviewStore } from '@/stores/review'
import { fetchMusicData } from '@/services/diving-fish'
import SongSelector from '@/components/generator/SongSelector.vue'
import ReviewForm from '@/components/review/ReviewForm.vue'
import ReviewList from '@/components/review/ReviewList.vue'
import ExportCanvas from '@/components/review/export/ExportCanvas.vue'
import ArchiveManager from '@/components/review/ArchiveManager.vue'

const router = useRouter()
const reviewStore = useReviewStore()
const musicData = ref([])
const showSelector = ref(false)
const showReviewForm = ref(false)
const showArchiveManager = ref(false)
const currentSong = ref(null)
const editingReviewId = ref(null)
const initialFormData = ref({})
const exportCanvasRef = ref(null)

onMounted(async () => {
    try {
        musicData.value = await fetchMusicData()
    } catch (err) {
        console.error('Failed to load music data', err)
    }
})

const handleSongSelect = (song) => {
    currentSong.value = song
    editingReviewId.value = null
    initialFormData.value = {}
    showSelector.value = false
    showReviewForm.value = true
}

const handleEditReview = (review) => {
    // Reconstruct song object from review data
    currentSong.value = {
        id: review.songId,
        title: review.title,
        cover: review.cover,
        type: review.type,
        level: review.level,
        level_index: review.levelIndex
    }
    editingReviewId.value = review.id
    initialFormData.value = {
        starRating: review.starRating,
        qualityRating: review.qualityRating,
        oneLiner: review.oneLiner,
        comment: review.comment
    }
    showReviewForm.value = true
}

const handleSaveReview = (data) => {
    if (editingReviewId.value) {
        reviewStore.updateReview(editingReviewId.value, data)
    } else {
        reviewStore.addReview(data)
    }
    showReviewForm.value = false
    currentSong.value = null
    editingReviewId.value = null
}

const handleDeleteReview = (id) => {
    if (confirm('确定要删除这条评价吗？')) {
        reviewStore.removeReview(id)
    }
}

const clearAll = () => {
    if (confirm('确定要清空所有评价吗？')) {
        reviewStore.clearReviews()
    }
}

const handleExport = () => {
    if (exportCanvasRef.value) {
        exportCanvasRef.value.exportImage()
    }
}
</script>

<template>
    <div class="h-[calc(100vh-80px)] flex flex-col gap-4">
        <!-- Header -->
        <div class="flex items-center justify-between flex-shrink-0 px-4 md:px-0">
            <div class="flex items-center gap-4">
                <button @click="router.back()" class="flex items-center gap-1 text-gray-500 font-bold hover:text-black transition-colors">
                    <ArrowLeft :size="20" />
                    返回
                </button>
                <h1 class="text-xl lg:text-2xl font-black">一句话评价谱面</h1>
                <button 
                    @click="showArchiveManager = true"
                    class="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-bold text-gray-700 transition-colors border border-gray-300"
                >
                    <FolderOpen :size="16" />
                    {{ reviewStore.currentArchive?.name || '默认存档' }}
                </button>
            </div>
            
            <div class="flex gap-2">
                <button 
                    @click="showSelector = true"
                    class="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-maimai-blue text-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                >
                    <Plus :size="18" />
                    添加评价
                </button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            <!-- Left: Review List / Editor -->
            <div class="flex-1 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] flex flex-col overflow-hidden rounded-xl">
                <div class="p-4 border-b-2 border-black bg-gray-50 flex justify-between items-center">
                    <h2 class="font-bold text-lg">评价列表 ({{ reviewStore.reviews.length }})</h2>
                    <button @click="clearAll" class="text-red-500 text-sm font-bold hover:underline flex items-center gap-1">
                        <Trash2 :size="14" /> 清空
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto p-4">
                    <div v-if="reviewStore.reviews.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
                        <p>还没有添加任何评价</p>
                        <button @click="showSelector = true" class="mt-2 text-maimai-blue font-bold hover:underline">点击添加第一首</button>
                    </div>
                    
                    <ReviewList 
                        v-else 
                        :reviews="reviewStore.reviews" 
                        @edit="handleEditReview"
                        @delete="handleDeleteReview"
                    />
                </div>
            </div>

            <!-- Right: Preview / Export -->
            <div class="flex-1 bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_#000000] flex flex-col overflow-hidden rounded-xl">
                <div class="p-4 border-b-2 border-black bg-white flex justify-between items-center">
                    <h2 class="font-bold text-lg">预览 & 导出</h2>
                    <div class="flex bg-gray-100 rounded-lg p-1 border border-black">
                        <button 
                            @click="reviewStore.currentMode = 'table'"
                            :class="['p-1.5 rounded transition-colors', reviewStore.currentMode === 'table' ? 'bg-white shadow-sm border border-black' : 'text-gray-500 hover:text-black']"
                            title="表格模式"
                        >
                            <LayoutList :size="18" />
                        </button>
                        <button 
                            @click="reviewStore.currentMode = 'card'"
                            :class="['p-1.5 rounded transition-colors', reviewStore.currentMode === 'card' ? 'bg-white shadow-sm border border-black' : 'text-gray-500 hover:text-black']"
                            title="卡片模式"
                        >
                            <LayoutGrid :size="18" />
                        </button>
                    </div>
                </div>
                
                <div class="flex-1 overflow-hidden bg-gray-200 relative">
                    <ExportCanvas 
                        ref="exportCanvasRef"
                        :reviews="reviewStore.reviews"
                        :mode="reviewStore.currentMode"
                    />
                </div>
                
                <div class="p-4 border-t-2 border-black bg-white">
                    <button 
                        @click="handleExport"
                        class="w-full btn-base bg-maimai-green text-white py-3 flex items-center justify-center gap-2 font-black text-lg"
                        :disabled="reviewStore.reviews.length === 0"
                    >
                        <Download :size="20" />
                        导出图片
                    </button>
                </div>
            </div>
        </div>

        <SongSelector 
            :is-open="showSelector" 
            :music-data="musicData"
            @close="showSelector = false"
            @select="handleSongSelect"
        />

        <ReviewForm
            v-if="showReviewForm"
            :song="currentSong"
            :initial-data="initialFormData"
            @save="handleSaveReview"
            @cancel="showReviewForm = false"
        />

        <ArchiveManager 
            :is-open="showArchiveManager"
            @close="showArchiveManager = false"
        />
    </div>
</template>
