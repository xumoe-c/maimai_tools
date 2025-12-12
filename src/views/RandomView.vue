<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Shuffle } from 'lucide-vue-next'
import { fetchMusicData } from '@/services/diving-fish'
import RandomConfig from '@/components/random/RandomConfig.vue'
import RandomResult from '@/components/random/RandomResult.vue'

const router = useRouter()
const musicData = ref([])
const isLoading = ref(true)

onMounted(async () => {
    try {
        musicData.value = await fetchMusicData()
    } catch (e) {
        console.error('Failed to load music data', e)
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
  <div class="flex flex-col gap-4 h-full lg:h-[calc(100vh-80px)]">
    <!-- Header -->
    <div class="flex items-center justify-between flex-shrink-0 px-4 md:px-0">
        <div class="flex items-center gap-4">
            <button @click="router.back()" class="flex items-center gap-1 text-gray-500 font-bold hover:text-black transition-colors">
                <ArrowLeft :size="20" />
                返回
            </button>
            <h1 class="text-xl lg:text-2xl font-black flex items-center gap-2">
                <Shuffle :size="24" />
                随机选曲
            </h1>
        </div>
    </div>

    <!-- Content -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
    </div>

    <div v-else class="flex-1 flex flex-col lg:flex-row gap-6 lg:overflow-hidden min-h-0 pb-4">
        <!-- Left: Config -->
        <div class="w-full lg:w-1/3 flex-shrink-0 lg:overflow-y-auto">
            <RandomConfig :music-data="musicData" />
        </div>

        <!-- Right: Result -->
        <div class="flex-1 lg:overflow-y-auto min-h-[400px]">
            <RandomResult :music-data="musicData" />
        </div>
    </div>
  </div>
</template>
