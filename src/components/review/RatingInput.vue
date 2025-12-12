<script setup>
import { Star } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 5
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (value) => {
  if (!props.readonly) {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="i in max"
      :key="i"
      type="button"
      @click="updateValue(i)"
      :class="['transition-transform', readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95']"
      :disabled="readonly"
    >
      <Star
        :size="24"
        :class="[
          'transition-colors',
          i <= modelValue ? 'fill-maimai-yellow text-maimai-yellow' : 'text-gray-300'
        ]"
        stroke-width="2.5"
      />
    </button>
  </div>
</template>
