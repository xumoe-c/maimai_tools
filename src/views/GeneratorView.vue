<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePreferenceStore } from '@/stores/preference'
import { fetchMusicData } from '@/services/diving-fish'
import PreferenceCanvas from '@/components/generator/PreferenceCanvas.vue'
import SongSelector from '@/components/generator/SongSelector.vue'
import PreferenceArchiveManager from '@/components/generator/PreferenceArchiveManager.vue'
import { ChevronDown, ChevronUp, FolderOpen } from 'lucide-vue-next'

const userStore = useUserStore()
const prefStore = usePreferenceStore()
const musicData = ref([])

const isConfigOpen = ref(false)
const showArchiveManager = ref(false)

// Accordion State
const activeAccordion = ref('basic') // 'basic', 'theme', 'labels' or null

const toggleAccordion = (section) => {
  if (activeAccordion.value === section) {
    activeAccordion.value = null
  } else {
    activeAccordion.value = section
  }
}

const themes = [
  { id: 'default', name: '默认 (简约白)' },
  { id: 'dark', name: '酷炫黑' },
  { id: 'pink', name: '萌系粉' },
  { id: 'blue', name: '清爽蓝' },
]

// Computed bindings for form inputs to trigger store updates
const configTitle = computed({
    get: () => prefStore.config.title,
    set: (val) => prefStore.updateConfig({ title: val })
})

const configTheme = computed({
    get: () => prefStore.config.theme,
    set: (val) => prefStore.updateConfig({ theme: val })
})

// Selector State
const showSelector = ref(false)
const currentCellIndex = ref(-1)

const handleCellClick = (index) => {
  currentCellIndex.value = index
  showSelector.value = true
}

const handleSongSelect = (song) => {
  if (currentCellIndex.value !== -1) {
    prefStore.updateCell(currentCellIndex.value, song)
  }
  showSelector.value = false
  currentCellIndex.value = -1
}

const handleLabelChange = (index, value) => {
    prefStore.updateCellLabel(index, value)
}

// Load token on mount
onMounted(async () => {
  // Pre-load music data
  try {
    musicData.value = await fetchMusicData()
  } catch (err) {
    console.error('Failed to load music data', err)
  }

  // Auto-fetch profile if token exists but no profile data
  if (userStore.token && !userStore.profile.nickname) {
    userStore.fetchProfile()
  }
})
</script>

<template>
  <div class="h-[calc(100vh-80px)] flex flex-col gap-4 lg:gap-6">
    <div class="flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-4">
        <h1 class="text-xl lg:text-2xl font-black">生涯歌曲喜好表生成器</h1>
        <button 
            @click="showArchiveManager = true"
            class="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-bold text-gray-700 transition-colors border border-gray-300"
        >
            <FolderOpen :size="16" />
            {{ prefStore.currentArchive?.name || '默认存档' }}
        </button>
      </div>
      <div class="text-xs lg:text-sm font-bold bg-maimai-yellow px-2 lg:px-3 py-1 border-2 border-black rounded shadow-hard-sm">
        Beta
      </div>
    </div>

    <div class="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 min-h-0 pb-4 lg:pb-0">
      <!-- Left Column -->
      <div class="lg:col-span-4 flex flex-col gap-6 flex-shrink-0 lg:h-full lg:overflow-y-auto pr-1">
        
        <!-- Config Panel (Accordion Style) -->
        <div class="bg-white border-2 border-black shadow-hard rounded-xl overflow-hidden flex flex-col">
          <div class="p-4 border-b-2 border-black bg-gray-50">
            <h2 class="font-bold text-lg">配置面板</h2>
          </div>

          <!-- Basic Info Section -->
          <div class="border-b-2 border-black last:border-0">
            <button 
              @click="toggleAccordion('basic')"
              class="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              :class="activeAccordion === 'basic' ? 'bg-gray-50' : 'bg-white'"
            >
              <div class="font-bold text-maimai-blue flex items-center gap-2">
                <span class="w-2 h-6 bg-maimai-blue rounded-full"></span>
                基础信息
              </div>
              <component :is="activeAccordion === 'basic' ? ChevronUp : ChevronDown" :size="20" />
            </button>
            <div v-show="activeAccordion === 'basic'" class="p-4 border-t-2 border-black space-y-3 bg-white">
              <div>
                <label class="block font-bold text-sm mb-1">玩家名称</label>
                <input v-model="userStore.profile.nickname" type="text" class="input-base" placeholder="从水鱼查分器获取" />
              </div>
              <div>
                <label class="block font-bold text-sm mb-1">DX Rating</label>
                <input v-model="userStore.profile.rating" type="number" class="input-base" placeholder="从水鱼查分器获取" />
              </div>
            </div>
          </div>

          <!-- Theme Settings Section -->
          <div class="border-b-2 border-black last:border-0">
            <button 
              @click="toggleAccordion('theme')"
              class="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              :class="activeAccordion === 'theme' ? 'bg-gray-50' : 'bg-white'"
            >
              <div class="font-bold text-maimai-yellow flex items-center gap-2">
                <span class="w-2 h-6 bg-maimai-yellow rounded-full"></span>
                外观设置
              </div>
              <component :is="activeAccordion === 'theme' ? ChevronUp : ChevronDown" :size="20" />
            </button>
            <div v-show="activeAccordion === 'theme'" class="p-4 border-t-2 border-black space-y-3 bg-white">
              <div>
                <label class="block font-bold text-sm mb-1">表格标题</label>
                <input v-model="configTitle" type="text" class="input-base" placeholder="Maimai歌曲喜好表" />
              </div>
              <div>
                <label class="block font-bold text-sm mb-1">主题风格</label>
                <select v-model="configTheme" class="input-base">
                  <option v-for="theme in themes" :key="theme.id" :value="theme.id">
                    {{ theme.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Cell Labels Section -->
          <div class="border-b-2 border-black last:border-0">
            <button 
              @click="toggleAccordion('labels')"
              class="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              :class="activeAccordion === 'labels' ? 'bg-gray-50' : 'bg-white'"
            >
              <div class="font-bold text-pink-400 flex items-center gap-2">
                <span class="w-2 h-6 bg-pink-400 rounded-full"></span>
                格子标题
              </div>
              <component :is="activeAccordion === 'labels' ? ChevronUp : ChevronDown" :size="20" />
            </button>
            <div v-show="activeAccordion === 'labels'" class="p-4 border-t-2 border-black space-y-3 bg-white">
              <div class="grid grid-cols-2 gap-2">
                <div v-for="(cell, idx) in prefStore.cells" :key="idx">
                  <input 
                    :value="cell.label"
                    @input="e => handleLabelChange(idx, e.target.value)"
                    type="text" 
                    class="input-base text-xs py-1 px-2" 
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Preview Canvas -->
      <div class="flex-1 lg:col-span-8 bg-gray-200 border-2 border-black shadow-hard rounded-xl relative min-h-0 overflow-hidden flex flex-col">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;"></div>
        
        <!-- Scrollable Container -->
        <div class="w-full h-full overflow-auto relative z-10 flex flex-col items-center">
          <!-- Canvas Wrapper -->
          <div class="my-auto p-4 lg:p-8 origin-top lg:origin-center transform scale-[0.4] xs:scale-[0.45] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.8] xl:scale-[0.9] 2xl:scale-100 transition-transform">
            <PreferenceCanvas 
              :config="prefStore.config" 
              :cells="prefStore.cells" 
              @cell-click="handleCellClick" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Song Selector Modal -->
    <SongSelector 
      v-if="showSelector" 
      :isOpen="true"
      :musicData="musicData"
      @select="handleSongSelect" 
      @close="showSelector = false" 
    />

    <PreferenceArchiveManager 
        :is-open="showArchiveManager"
        @close="showArchiveManager = false"
    />
  </div>
</template>
