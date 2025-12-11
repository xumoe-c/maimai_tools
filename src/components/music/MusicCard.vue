<script setup>
import { computed } from 'vue'
import { getCoverUrl } from '@/services/diving-fish'

const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  userRecords: {
    type: Object,
    default: () => ({})
  }
})

const coverUrl = computed(() => getCoverUrl(props.song.id))

const typeColor = computed(() => {
    return props.song.type === 'DX' ? 'bg-blue-500' : 'bg-yellow-500'
})

const getRankImage = (levelIndex) => {
    if (!props.userRecords || !props.userRecords[levelIndex]) return null
    const record = props.userRecords[levelIndex]
    const rate = record.rate.toLowerCase().replace('+', 'p')
    return `/maiFCFS/${rate}.png`
}

const handleImageError = (e) => {
  e.target.src = '/default_cover.jpg'
}
</script>

<template>
  <div class="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer hover:-translate-y-1 h-full flex flex-col border border-white/20 bg-white">
    
    <!-- Background Layer: Blurred Cover -->
    <div class="absolute inset-0 z-0 overflow-hidden">
        <img :src="coverUrl" @error="handleImageError" class="w-full h-full object-cover blur-xl scale-150 opacity-40" />
        <div class="absolute inset-0 bg-white/80 backdrop-blur-md"></div>
    </div>

    <!-- Content Layer -->
    <div class="relative z-10 flex flex-col h-full">
        <!-- Top Section: Cover & Type -->
        <div class="relative aspect-[2/1] overflow-hidden m-3 rounded-lg shadow-sm">
            <img :src="coverUrl" @error="handleImageError" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Cover" />
            
            <!-- Type Badge -->
            <div :class="[typeColor, 'absolute top-0 right-0 px-2 py-0.5 text-xs font-black text-white rounded-bl-lg shadow-sm']">
                {{ song.type }}
            </div>
            
            <!-- ID Badge -->
            <div class="absolute bottom-0 left-0 bg-black/60 text-white px-1.5 py-0.5 text-[10px] font-mono rounded-tr-lg backdrop-blur-sm">
                ID: {{ song.id }}
            </div>
        </div>

        <!-- Info Section -->
        <div class="px-3 pb-3 flex flex-col gap-1 flex-1">
            <!-- Title -->
            <div class="font-bold leading-tight line-clamp-2 text-gray-900 min-h-[2.5em]" :title="song.title">
                {{ song.title }}
            </div>
            
            <!-- Artist -->
            <div class="text-xs text-gray-600 line-clamp-1" :title="song.basic_info.artist">
                {{ song.basic_info.artist }}
            </div>

            <!-- Levels -->
            <div class="mt-auto pt-4 flex gap-1 justify-between items-end h-10">
                <div 
                    v-for="(level, index) in song.level" 
                    :key="index"
                    class="flex-1 flex flex-col items-center gap-0.5"
                >
                    <!-- Rank Image -->
                    <img 
                        v-if="getRankImage(index)" 
                        :src="getRankImage(index)" 
                        class="w-full object-contain drop-shadow-sm mb-0.5"
                    />
                    
                    <!-- Level Bar -->
                    <div 
                        :class="[
                            'w-full h-4 rounded flex items-center justify-center',
                            index === 0 ? 'bg-maimai-green' :
                            index === 1 ? 'bg-maimai-yellow' :
                            index === 2 ? 'bg-maimai-red' :
                            index === 3 ? 'bg-maimai-purple' :
                            'bg-pink-300'
                        ]"
                        :title="level"
                    >
                        <span class="text-[9px] font-black text-white leading-none shadow-black drop-shadow-md">{{ song.ds[index] }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
