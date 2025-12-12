<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 3
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const options = [
  { value: 5, label: '夯 (神谱)', icon: '🔥', color: 'bg-red-500 text-white' },
  { value: 4, label: '好谱', icon: '👍', color: 'bg-orange-400 text-white' },
  { value: 3, label: '一般', icon: '😐', color: 'bg-yellow-400 text-black' },
  { value: 2, label: '有点拉', icon: '👎', color: 'bg-blue-400 text-white' },
  { value: 1, label: '依托答辩', icon: '💩', color: 'bg-gray-600 text-white' },
]

const updateValue = (value) => {
  if (!props.readonly) {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        @click="updateValue(opt.value)"
        :disabled="readonly"
        :class="[
          'flex-1 py-2 px-1 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1',
          modelValue === opt.value 
            ? `${opt.color} border-black shadow-[2px_2px_0px_0px_#000000] translate-x-[-1px] translate-y-[-1px]` 
            : 'bg-white border-gray-200 text-gray-400 hover:border-gray-400'
        ]"
      >
        <span class="text-xl">{{ opt.icon }}</span>
        <span class="text-[10px] font-bold leading-none">{{ opt.label }}</span>
      </button>
    </div>
  </div>
</template>
