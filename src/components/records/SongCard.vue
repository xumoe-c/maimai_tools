<script setup>
import { computed } from 'vue'
import { getCoverUrl } from '@/services/diving-fish'

const props = defineProps({
  record: {
    type: Object,
    required: true
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

const difficultyLabel = computed(() => {
  const labels = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']
  return labels[props.record.level_index] || 'Unknown'
})

const coverUrl = computed(() => getCoverUrl(props.record.song_id))

const achievement = computed(() => {
    return props.record.achievements.toFixed(4) + '%'
})

const rankColor = computed(() => {
    const rate = props.record.rate.toLowerCase()
    if (rate.startsWith('ss')) return 'text-maimai-yellow' // SSS+, SSS, SS+, SS
    if (rate.startsWith('s')) return 'text-maimai-red' // S+, S
    return 'text-maimai-blue' // AAA and below
})
</script>

<template>
  <div class="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer hover:-translate-y-1 h-full flex flex-col border border-white/20">
    
    <!-- Background Layer: Blurred Cover -->
    <div class="absolute inset-0 z-0 overflow-hidden">
        <img :src="coverUrl" class="w-full h-full object-cover blur-xl scale-150 opacity-40" />
        <div class="absolute inset-0 bg-white/80 backdrop-blur-md"></div>
    </div>

    <!-- Content Layer -->
    <div class="relative z-10 flex flex-col h-full">
        <!-- Cover Image -->
        <div class="relative aspect-[2.2/1] overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
            <img :src="coverUrl" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Cover" />
            
            <!-- Difficulty Badge -->
            <div class="absolute top-0 right-0">
                <div :class="[difficultyColor, 'px-2 py-1 text-[10px] font-black text-white rounded-bl-lg shadow-sm']">
                    {{ difficultyLabel }}
                </div>
            </div>
            
            <!-- Level Badge -->
            <div class="absolute bottom-0 left-0">
                <div class="bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white rounded-tr-lg border-t border-r border-white/10">
                    Lv.{{ record.level }}
                </div>
            </div>
        </div>

        <!-- Info Section -->
        <div class="p-3 flex flex-col gap-1 flex-1">
            <div class="font-bold text-sm line-clamp-1 text-gray-900" :title="record.title">
                {{ record.title }}
            </div>
            
            <div class="flex items-end justify-between mt-auto pt-2">
                <div class="flex flex-col">
                    <span class="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Achievement</span>
                    <span class="text-sm font-black font-mono tracking-tight text-gray-900">{{ achievement }}</span>
                </div>
                <div class="text-right flex flex-col items-end">
                    <div :class="[rankColor, 'text-lg font-black italic leading-none']">{{ record.rate.toUpperCase() }}</div>
                    <div class="text-[10px] text-gray-600 font-bold mt-0.5">Rating <span class="text-maimai-blue">{{ record.ra }}</span></div>
                </div>
            </div>
        </div>
        
        <!-- Bottom Color Strip -->
        <div :class="[difficultyColor, 'h-1.5 w-full opacity-90']"></div>
    </div>
  </div>
</template>
