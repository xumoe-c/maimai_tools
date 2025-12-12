<script setup>
import { ref, nextTick } from 'vue'
import { toPng } from 'html-to-image'
import TableTemplate from './TableTemplate.vue'
import CardTemplate from './CardTemplate.vue'
import { useUserStore } from '@/stores/user'
import { getCoverUrl } from '@/services/diving-fish'

const props = defineProps({
  reviews: {
    type: Array,
    required: true
  },
  mode: {
    type: String,
    default: 'table' // 'table' | 'card'
  }
})

const userStore = useUserStore()
const canvasRef = ref(null)
const exportRef = ref(null)
const isExporting = ref(false)

const preloadImages = async () => {
    const promises = props.reviews.map(async (review) => {
        const url = getCoverUrl(review.songId)
        try {
            const response = await fetch(url)
            if (!response.ok) throw new Error('Network response was not ok')
            await response.blob()
        } catch (e) {
            console.warn('Failed to preload image', url)
        }
    })
    await Promise.all(promises)
}

const exportImage = async () => {
    if (!exportRef.value) return
    isExporting.value = true
    
    try {
        await preloadImages()
        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const dataUrl = await toPng(exportRef.value, {
            cacheBust: false,
            pixelRatio: 2,
            skipAutoScale: true
        })
        
        const link = document.createElement('a')
        link.download = `maimai_review_${props.mode}_${Date.now()}.png`
        link.href = dataUrl
        link.click()
    } catch (error) {
        console.error('Export failed:', error)
        alert('图片生成失败，请重试')
    } finally {
        isExporting.value = false
    }
}

defineExpose({ exportImage })
</script>

<template>
  <div class="w-full h-full overflow-auto flex justify-center p-8 bg-gray-200">
    <!-- Preview Area -->
    <div ref="canvasRef" class="origin-top scale-75 md:scale-100 transition-transform w-fit shadow-xl">
        <TableTemplate 
            v-if="mode === 'table'" 
            :reviews="reviews" 
            :username="userStore.profile.nickname || 'PLAYER'" 
        />
        <CardTemplate 
            v-else 
            :reviews="reviews" 
            :username="userStore.profile.nickname || 'PLAYER'" 
        />
    </div>

    <!-- Hidden Export Area -->
    <div class="fixed left-[9999px] top-0 pointer-events-none opacity-0">
        <div ref="exportRef" class="w-fit">
            <TableTemplate 
                v-if="mode === 'table'" 
                :reviews="reviews" 
                :username="userStore.profile.nickname || 'PLAYER'" 
            />
            <CardTemplate 
                v-else 
                :reviews="reviews" 
                :username="userStore.profile.nickname || 'PLAYER'" 
            />
        </div>
    </div>
  </div>
</template>
