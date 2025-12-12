<script setup>
import { computed, ref } from 'vue'
import { useRandomStore } from '@/stores/random'
import { RotateCw, Filter, ChevronDown, ChevronUp } from 'lucide-vue-next'

const props = defineProps({
  musicData: {
    type: Array,
    required: true
  }
})

const store = useRandomStore()
const isCollapsed = ref(false)

// Extract unique options
const availableGenres = computed(() => {
    const genres = new Set(props.musicData.map(s => s.basic_info.genre))
    return Array.from(genres).sort()
})

const availableVersions = computed(() => {
    const versions = new Set(props.musicData.map(s => s.basic_info.from))
    return Array.from(versions).sort()
})

const handleRoll = () => {
    store.roll(props.musicData)
}
</script>

<template>
  <div class="bg-white border-2 border-black shadow-hard rounded-xl p-6 flex flex-col gap-6 transition-all duration-300">
    <div 
        class="flex items-center justify-between border-b-2 border-black pb-4 cursor-pointer select-none"
        @click="isCollapsed = !isCollapsed"
    >
        <div class="flex items-center gap-2">
            <Filter :size="24" />
            <h2 class="text-xl font-black">筛选条件</h2>
        </div>
        <component :is="isCollapsed ? ChevronDown : ChevronUp" :size="24" />
    </div>

    <div v-show="!isCollapsed" class="flex flex-col gap-6 animate-in slide-in-from-top-2 duration-200">
        <!-- Level Range -->
        <div class="space-y-2">
            <label class="font-bold text-sm">定数范围 (1.0 - 15.0)</label>
            <div class="flex items-center gap-2">
                <input 
                    v-model.number="store.filters.levelMin" 
                    type="number" 
                    step="0.1" 
                    min="1" 
                    max="15" 
                    class="w-full input-base text-center font-bold"
                />
                <span class="font-black">-</span>
                <input 
                    v-model.number="store.filters.levelMax" 
                    type="number" 
                    step="0.1" 
                    min="1" 
                    max="15" 
                    class="w-full input-base text-center font-bold"
                />
            </div>
        </div>

        <!-- Type & Utage -->
        <div class="space-y-2">
            <label class="font-bold text-sm">谱面类型</label>
            <div class="flex gap-2">
                <select v-model="store.filters.type" class="input-base flex-1">
                    <option value="ALL">全部 (DX & SD)</option>
                    <option value="DX">DX 谱面</option>
                    <option value="SD">标准谱面</option>
                </select>
            </div>
            <div class="flex items-center gap-2 mt-2">
                <input 
                    id="excludeUtage" 
                    type="checkbox" 
                    v-model="store.filters.excludeUtage"
                    class="w-5 h-5 border-2 border-black rounded text-maimai-pink focus:ring-0"
                />
                <label for="excludeUtage" class="font-bold text-sm cursor-pointer select-none">
                    不包含宴会场 (Utage)
                </label>
            </div>
        </div>

        <!-- Genre -->
        <div class="space-y-2">
            <label class="font-bold text-sm">流派 (多选)</label>
            <div class="h-32 overflow-y-auto border-2 border-black rounded p-2 bg-gray-50 grid grid-cols-1 gap-1">
                <label v-for="genre in availableGenres" :key="genre" class="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1 rounded">
                    <input type="checkbox" :value="genre" v-model="store.filters.genres" class="border-2 border-black rounded text-maimai-blue" />
                    <span class="text-xs font-bold">{{ genre }}</span>
                </label>
            </div>
            <div class="text-xs text-gray-500 text-right">未选则默认全选</div>
        </div>

        <!-- Version -->
        <div class="space-y-2">
            <label class="font-bold text-sm">版本 (多选)</label>
            <div class="h-32 overflow-y-auto border-2 border-black rounded p-2 bg-gray-50 grid grid-cols-1 gap-1">
                <label v-for="ver in availableVersions" :key="ver" class="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1 rounded">
                    <input type="checkbox" :value="ver" v-model="store.filters.versions" class="border-2 border-black rounded text-maimai-green" />
                    <span class="text-xs font-bold">{{ ver }}</span>
                </label>
            </div>
            <div class="text-xs text-gray-500 text-right">未选则默认全选</div>
        </div>
    </div>

    <!-- Action -->
    <button 
        @click="handleRoll" 
        :disabled="store.isRolling"
        class="w-full py-4 bg-maimai-yellow border-2 border-black shadow-hard rounded-xl font-black text-xl flex items-center justify-center gap-2 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <RotateCw :class="{'animate-spin': store.isRolling}" :size="24" />
        {{ store.isRolling ? '抽选中...' : '开始随机' }}
    </button>
  </div>
</template>
