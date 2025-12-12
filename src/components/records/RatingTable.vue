<script setup>
import { computed } from 'vue'
import { calculateRating } from '@/utils/rating'

const props = defineProps({
  dsList: {
    type: Array,
    default: () => [10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0, 13.5, 14.0, 14.5, 15.0]
  }
})

const ranks = [
  { label: 'S+', ach: 98.0, icon: 'S+' },
  { label: 'SS', ach: 99.0, icon: 'SS' },
  { label: 'SS+', ach: 99.5, icon: 'SS+' },
  { label: 'SSS', ach: 100.0, icon: 'SSS' },
  { label: 'SSS+', ach: 100.5, icon: 'SSS+' }
]

const tableData = computed(() => {
  return props.dsList.map(ds => {
    const row = { ds: ds.toFixed(1) }
    ranks.forEach(rank => {
      row[rank.label] = calculateRating(ds, rank.ach)
    })
    return row
  })
})
</script>

<template>
  <div class="w-full overflow-hidden rounded-lg border-2 border-blue-500 bg-white text-sm">
    <!-- Header -->
    <div class="grid grid-cols-6 bg-blue-50 text-center font-black text-blue-600">
      <div class="py-1 border-r border-blue-200 bg-blue-600 text-white flex items-center justify-center">
        RATING
      </div>
      <div v-for="rank in ranks" :key="rank.label" class="py-1 border-r border-blue-200 last:border-r-0 relative">
        <!-- Simple text representation for now, could use images if available -->
        <span class="drop-shadow-sm" :class="{
            'text-orange-500': rank.label.startsWith('S+'),
            'text-yellow-500': rank.label.startsWith('SS'),
            'text-red-500': rank.label.startsWith('SSS')
        }">{{ rank.label }}</span>
      </div>
    </div>

    <!-- Rows -->
    <div v-for="(row, index) in tableData" :key="row.ds" 
         class="grid grid-cols-6 text-center font-bold text-gray-700 border-t border-blue-200"
         :class="index % 2 === 0 ? 'bg-blue-50/30' : 'bg-white'">
      <div class="py-1 border-r border-blue-200 bg-blue-600 text-white">
        {{ row.ds }}
      </div>
      <div v-for="rank in ranks" :key="rank.label" class="py-1 border-r border-blue-200 last:border-r-0">
        {{ row[rank.label] }}
      </div>
    </div>
  </div>
</template>
