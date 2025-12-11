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
  <div class="relative rounded-lg overflow-hidden shadow-sm border border-white/20 flex flex-col select-none h-full">
    
    <!-- Background Layer -->
    <div class="absolute inset-0 z-0 overflow-hidden">
        <img :src="coverUrl" @error="handleImageError" class="w-full h-full object-cover blur-xl scale-150 opacity-40" />
        <div class="absolute inset-0 bg-white/80 backdrop-blur-md"></div>
    </div>

    <!-- Content Layer -->
    <div class="relative z-10 flex flex-col h-full">
        <!-- Top Section: Cover & Type -->
        <div class="relative aspect-[1.7/1] overflow-hidden shadow-sm">
            <img :src="coverUrl" @error="handleImageError" class="w-full h-full object-cover" />
            
            <!-- Type Badge -->
            <div :class="[typeColor, 'absolute top-0 right-0 px-1.5 py-0.5 text-[10px] font-black text-white rounded-bl-lg shadow-sm']">
                {{ record.type }}
            </div>

            <!-- Rank Number Badge -->
            <div v-if="rank > 0" class="absolute top-0 left-0 bg-black/60 text-white px-1.5 py-0.5 text-[10px] font-bold rounded-br-lg backdrop-blur-sm border-b border-r border-white/10">
                #{{ rank }}
            </div>

            <!-- Level & Rating (Bottom Left) -->
            <div class="absolute bottom-0 left-0 flex items-stretch">
                <!-- Level Block -->
                <div :class="[difficultyColor, 'relative z-10 px-2 py-0.5 text-white text-xs font-black rounded-tr-lg shadow-sm flex items-center justify-center min-w-[2rem]']">
                    {{ record.level }}
                </div>
                <!-- Rating Block -->
                <div class="bg-black/80 text-white px-2 py-0.5 text-xs font-bold rounded-tr-lg ml-[-4px] pl-3 flex items-center shadow-sm backdrop-blur-sm border-t border-r border-white/10">
                    {{ record.ra }}
                </div>
            </div>
        </div>

        <!-- Info Section -->
        <div class="p-1.5 flex flex-col gap-0.5 flex-1 justify-between bg-white/80 backdrop-blur-sm">
            <!-- Title -->
            <div class="text-[10px] font-bold leading-tight line-clamp-1 text-gray-900" :title="record.title">
                {{ record.title }}
            </div>

            <!-- Achievement & Icons -->
            <div class="flex items-end justify-between mt-1">
                <!-- Achievement (Left) -->
                <span :class="[rateColor, 'text-lg font-black italic tracking-tighter']" style="text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white, 0px 2px 4px rgba(0,0,0,0.2);">
                    {{ achievement }}
                </span>

                <!-- Icons (Right) -->
                <div class="flex items-center gap-0.5 h-5">
                    <img :src="rankIconUrl" class="h-full object-contain drop-shadow-sm" />
                    <img v-if="fcIconUrl" :src="fcIconUrl" class="h-full object-contain drop-shadow-sm" />
                    <img v-if="fsIconUrl" :src="fsIconUrl" class="h-full object-contain drop-shadow-sm" />
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
