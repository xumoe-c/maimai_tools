<script setup>
import { computed } from 'vue'
import { getCoverUrl } from '@/services/diving-fish'

const props = defineProps({
  record: {
    type: Object,
    required: true
  },
  rank: {
    type: Number,
    default: 0
  },
  customCoverUrl: {
    type: String,
    default: ''
  }
})

const difficultyColor = computed(() => {
  const colors = [
    'bg-maimai-green',   // Basic
    'bg-maimai-yellow',  // Advanced
    'bg-maimai-red',     // Expert
    'bg-maimai-purple',  // Master
    'bg-pink-300'        // Re:Master
  ]
  return colors[props.record.level_index] || 'bg-gray-400'
})

const difficultyTextColor = computed(() => {
    // Re:Master (index 4) is pink-300, white text might be hard to read? 
    // Usually white is fine with text-shadow or if bg is dark enough. 
    // Pink-300 is light. Let's use black for Re:Master? 
    // Standard maimai uses white text with outline.
    return 'text-white'
})

const coverUrl = computed(() => {
    if (props.customCoverUrl) return props.customCoverUrl
    const url = getCoverUrl(props.record.song_id)
    // Ensure absolute URL for html-to-image to avoid 404s
    try {
        return new URL(url, window.location.origin).href
    } catch (e) {
        return url
    }
})

const achievement = computed(() => {
    return props.record.achievements.toFixed(4) + '%'
})

const rateColor = computed(() => {
    const r = props.record.rate.toLowerCase()
    if (r.startsWith('ss')) return 'text-[#FFD700]' // Gold
    if (r.startsWith('s')) return 'text-[#FF4500]' // Red-Orange
    return 'text-blue-500'
})

const typeColor = computed(() => {
    return props.record.type === 'DX' ? 'bg-blue-500' : 'bg-yellow-500'
})

const rankIconUrl = computed(() => {
    const rate = props.record.rate.toLowerCase().replace('+', 'p')
    return `/maiFCFS/${rate}.png`
})

const fcIconUrl = computed(() => {
    if (!props.record.fc) return null
    return `/maiFCFS/${props.record.fc}.png`
})

const fsIconUrl = computed(() => {
    if (!props.record.fs) return null
    return `/maiFCFS/${props.record.fs}.png`
})

const handleImageError = (e) => {
  e.target.src = '/default_cover.jpg'
}
</script>

<template>
  <div class="relative bg-white border-2 border-black flex flex-col select-none h-full shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
    
    <!-- Content Layer -->
    <div class="relative z-10 flex flex-col h-full">
        <!-- Top Section: Cover & Type -->
        <div class="relative aspect-[1.7/1] overflow-hidden border-b-2 border-black">
            <img :src="coverUrl" @error="handleImageError" class="w-full h-full object-cover" />
            
            <!-- Type Badge -->
            <div :class="[typeColor, 'absolute top-0 right-0 px-1.5 py-0.5 text-[10px] font-black text-white border-l-2 border-b-2 border-black']">
                {{ record.type }}
            </div>

            <!-- Rank Number Badge -->
            <div v-if="rank > 0" class="absolute top-0 left-0 bg-black text-white px-1.5 py-0.5 text-[10px] font-bold border-r-2 border-b-2 border-white">
                #{{ rank }}
            </div>

            <!-- Level & Rating (Bottom Left) -->
            <div class="absolute bottom-0 left-0 flex items-stretch">
                <!-- Level Block -->
                <div :class="[difficultyColor, 'relative z-10 px-2 py-0.5 text-white text-xs font-black border-t-2 border-r-2 border-black flex items-center justify-center min-w-[2rem]']">
                    {{ record.level }}
                </div>
                <!-- Rating Block -->
                <div class="bg-black text-white px-2 py-0.5 text-xs font-bold border-t-2 border-r-2 border-white ml-[-2px] pl-3 flex items-center">
                    {{ record.ra }}
                </div>
            </div>
        </div>

        <!-- Info Section -->
        <div class="p-2 flex flex-col gap-1 flex-1 justify-between bg-white">
            <!-- Title -->
            <div class="text-[10px] font-bold leading-tight line-clamp-1 text-black" :title="record.title">
                {{ record.title }}
            </div>

            <!-- Achievement & Icons -->
            <div class="flex items-end justify-between mt-1">
                <!-- Achievement (Left) -->
                <span :class="[rateColor, 'text-sm md:text-lg font-black italic tracking-tighter']">
                    {{ achievement }}
                </span>

                <!-- Icons (Right) -->
                <div class="flex items-center gap-0.5 h-4 md:h-5">
                    <img :src="rankIconUrl" class="h-full object-contain" />
                    <img v-if="fcIconUrl" :src="fcIconUrl" class="h-full object-contain" />
                    <img v-if="fsIconUrl" :src="fsIconUrl" class="h-full object-contain" />
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
