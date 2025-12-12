<script setup>
import { ref, computed } from 'vue'
import { X, Save } from 'lucide-vue-next'
import RatingInput from './RatingInput.vue'
import QualityInput from './QualityInput.vue'
import { getCoverUrl } from '@/services/diving-fish'

const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['save', 'cancel'])

const formData = ref({
  starRating: props.initialData.starRating || 5,
  qualityRating: props.initialData.qualityRating || 3,
  oneLiner: props.initialData.oneLiner || '',
  comment: props.initialData.comment || ''
})

const coverUrl = computed(() => {
    if (props.song.cover) return props.song.cover
    return getCoverUrl(props.song.id)
})

const handleSave = () => {
  if (!formData.value.oneLiner.trim()) {
    alert('请填写一句话评价')
    return
  }
  emit('save', {
    ...props.song,
    ...formData.value,
    // Ensure we have necessary song info
    songId: props.song.id,
    title: props.song.title,
    type: props.song.type,
    level: props.song.level,
    levelIndex: props.song.level_index
  })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
    <div class="bg-white w-full max-w-lg rounded-xl border-2 border-black shadow-hard p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
      <button @click="$emit('cancel')" class="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors">
        <X :size="24" class="text-gray-500" />
      </button>

      <h2 class="text-xl font-black mb-6 flex items-center gap-2">
        <span class="w-2 h-6 bg-maimai-blue block"></span>
        评价谱面
      </h2>

      <div class="flex gap-4 mb-6">
        <img :src="coverUrl" class="w-24 h-24 object-cover border-2 border-black rounded-lg shadow-sm" />
        <div>
          <h3 class="font-bold text-lg leading-tight mb-1">{{ song.title }}</h3>
          <div class="text-sm text-gray-500 mb-2">ID: {{ song.id }}</div>
          <div class="inline-block px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-bold text-gray-600">
            {{ song.type }} {{ song.level }}
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSave" class="space-y-6">
        <!-- Star Rating -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">推荐度</label>
          <RatingInput v-model="formData.starRating" />
        </div>

        <!-- Quality Rating -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">谱面质量</label>
          <QualityInput v-model="formData.qualityRating" />
        </div>

        <!-- One Liner -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            一句话评价 <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="formData.oneLiner"
            type="text" 
            placeholder="例如：爽局！/ 尾杀太难了 / 建议手元"
            class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-maimai-blue focus:outline-none font-medium"
            maxlength="20"
          />
          <div class="text-right text-xs text-gray-400 mt-1">{{ formData.oneLiner.length }}/20</div>
        </div>

        <!-- Comment -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">详细短评 (选填)</label>
          <textarea 
            v-model="formData.comment"
            rows="3"
            placeholder="展开说说..."
            class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-maimai-blue focus:outline-none font-medium resize-none"
            maxlength="100"
          ></textarea>
          <div class="text-right text-xs text-gray-400 mt-1">{{ formData.comment.length }}/100</div>
        </div>

        <div class="pt-4 flex gap-3">
          <button type="button" @click="$emit('cancel')" class="flex-1 btn-base bg-white border-gray-300 text-gray-600 py-2.5">
            取消
          </button>
          <button type="submit" class="flex-1 btn-base bg-maimai-blue text-white py-2.5 flex items-center justify-center gap-2">
            <Save :size="18" />
            保存评价
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
