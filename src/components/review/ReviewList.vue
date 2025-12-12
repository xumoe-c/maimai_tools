<script setup>
import { Trash2, Edit2 } from 'lucide-vue-next'
import { getCoverUrl } from '@/services/diving-fish'
import RatingInput from './RatingInput.vue'

const props = defineProps({
  reviews: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const getQualityLabel = (val) => {
    const map = { 5: '🔥', 4: '👍', 3: '😐', 2: '👎', 1: '💩' }
    return map[val] || ''
}
</script>

<template>
  <div class="space-y-3">
    <div v-for="review in reviews" :key="review.id" class="bg-white border-2 border-black p-3 rounded-lg flex gap-3 shadow-sm hover:shadow-md transition-shadow group">
      <!-- Cover -->
      <div class="w-16 h-16 flex-shrink-0 border border-black rounded overflow-hidden bg-gray-100">
        <img :src="getCoverUrl(review.songId)" class="w-full h-full object-cover" loading="lazy" />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div class="flex justify-between items-start">
            <div class="font-bold truncate text-sm">{{ review.title }}</div>
            <div class="text-xs font-black px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 ml-2 flex-shrink-0">
                {{ review.type }}
            </div>
        </div>
        
        <div class="flex items-center gap-2 text-xs">
            <RatingInput :model-value="review.starRating" :max="5" readonly class="scale-75 origin-left" />
            <span class="text-base leading-none" title="谱面质量">{{ getQualityLabel(review.qualityRating) }}</span>
        </div>

        <div class="text-xs text-gray-600 truncate font-medium">
            "{{ review.oneLiner }}"
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button @click="$emit('edit', review)" class="text-gray-400 hover:text-maimai-blue p-1">
            <Edit2 :size="14" />
        </button>
        <button @click="$emit('delete', review.id)" class="text-gray-400 hover:text-red-500 p-1">
            <Trash2 :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>
