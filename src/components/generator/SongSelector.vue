<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, X, Filter, Loader2, ChevronLeft, ChevronRight, ArrowUpDown, SlidersHorizontal } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { getCoverUrl as getServiceCoverUrl, fetchAllAliases } from '@/services/diving-fish'
import { markAsFailed, getCoverUrlWithFallback } from '@/utils/image-manager'
import { getVersionName } from '@/utils/version-map'

const props = defineProps({
  isOpen: Boolean,
  musicData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'select'])
const userStore = useUserStore()
const aliasMap = ref(new Map())

onMounted(async () => {
  // Ensure records are loaded if token exists
  if (userStore.token && userStore.records.length === 0 && !userStore.isLoading) {
    userStore.fetchProfile()
  }
  
  try {
    aliasMap.value = await fetchAllAliases()
  } catch (e) {
    console.error("Failed to load aliases", e)
  }
})

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedVersion = ref('all')
const showAdvancedFilters = ref(false)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 24

// Sorting
const sortBy = ref('default')
const sortDesc = ref(false)

const sortOptions = [
  { label: '默认', value: 'default' },
  { label: 'ID', value: 'id' },
  { label: '定数', value: 'ds' },
  { label: '达成率', value: 'achievement' },
]

// Advanced Filters
const minDs = ref('')
const maxDs = ref('')
const dsDiffIndex = ref(-1) // -1 = Any

const minAch = ref('')
const maxAch = ref('')
const achDiffIndex = ref(-1) // -1 = Any
const selectedRanks = ref([])

const diffLabels = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']
const rankOptions = ['SSS+', 'SSS', 'SS+', 'SS', 'S+', 'S', 'AAA', 'AA', 'A']

// Categories
const categories = [
  { id: 'all', name: '全部流派' },
  { id: 'my-records', name: '我的记录' },
  { id: '舞萌', name: '舞萌', aliases: ['maimai', '舞萌'] },
  { id: '流行&动漫', name: '流行&动漫', aliases: ['POPS & ANIME', '流行&动漫'] },
  { id: 'niconico & VOCALOID', name: 'niconico & V家', aliases: ['niconico & VOCALOID', 'niconico & V家'] },
  { id: '东方Project', name: '东方Project', aliases: ['Touhou Project', '东方Project'] },
  { id: '游戏&综合', name: '游戏&综合', aliases: ['GAME & VARIETY', '游戏&综合', '游戏 & 综合', 'Game & Variety', '其他游戏'] },
  { id: '音击&中二', name: '音击&中二', aliases: ['ONGEKI & CHUNITHM', '音击&中二', '音击 & 中二', 'Ongeki & Chunithm', '音击&中二节奏'] },
]

const versions = computed(() => {
  if (!props.musicData) return []
  const uniqueVersions = new Set(props.musicData.map(s => s.basic_info.from))
  return ['all', ...Array.from(uniqueVersions).sort()]
})

const filteredSongs = computed(() => {
  if (!props.musicData) return []
  
  let result = [...props.musicData]

  // 1. Filter by category
  if (selectedCategory.value === 'my-records') {
    const playedIds = new Set(userStore.records.map(r => String(r.song_id)))
    result = result.filter(song => playedIds.has(String(song.id)))
  } else if (selectedCategory.value !== 'all') {
    const category = categories.find(c => c.id === selectedCategory.value)
    if (category && category.aliases) {
      result = result.filter(song => {
        const genre = song.basic_info.genre.trim()
        return category.aliases.includes(genre)
      })
    } else {
      result = result.filter(song => song.basic_info.genre === selectedCategory.value)
    }
  }

  // 2. Filter by version
  if (selectedVersion.value !== 'all') {
    result = result.filter(song => song.basic_info.from === selectedVersion.value)
  }

  // 3. Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(song => {
      if (song.title.toLowerCase().includes(query)) return true
      if (song.id.toString().includes(query)) return true
      const alias = aliasMap.value.get(Number(song.id)) // Ensure ID is number for map lookup
      if (alias && alias.some(a => a.toLowerCase().includes(query))) return true
      if (song.basic_info.artist.toLowerCase().includes(query)) return true
      if (song.charts && song.charts.some(chart => chart.charter.toLowerCase().includes(query))) return true
      return false
    })
  }

  // 4. DS Filter
  if (minDs.value !== '' || maxDs.value !== '') {
    const min = minDs.value === '' ? 0 : Number(minDs.value)
    const max = maxDs.value === '' ? 99 : Number(maxDs.value)
    
    result = result.filter(song => {
      if (dsDiffIndex.value === -1) {
        return song.ds.some(ds => ds >= min && ds <= max)
      } else {
        const ds = song.ds[dsDiffIndex.value]
        return ds !== undefined && ds >= min && ds <= max
      }
    })
  }

  // 5. Achievement Filter
  if (minAch.value !== '' || maxAch.value !== '' || selectedRanks.value.length > 0) {
    const min = minAch.value === '' ? 0 : Number(minAch.value)
    const max = maxAch.value === '' ? 101 : Number(maxAch.value)
    
    result = result.filter(song => {
      const records = userRecordMap.value.get(Number(song.id))
      if (!records) return false

      if (achDiffIndex.value === -1) {
        return Object.values(records).some(r => {
          const inRange = r.achievements >= min && r.achievements <= max
          const inRank = selectedRanks.value.length === 0 || selectedRanks.value.includes(r.rate.toUpperCase().replace('P', '+'))
          return inRange && inRank
        })
      } else {
        const r = records[achDiffIndex.value]
        if (!r) return false
        const inRange = r.achievements >= min && r.achievements <= max
        const inRank = selectedRanks.value.length === 0 || selectedRanks.value.includes(r.rate.toUpperCase().replace('P', '+'))
        return inRange && inRank
      }
    })
  }

  // 6. Sort
  result.sort((a, b) => {
    let valA, valB
    
    if (sortBy.value === 'id') {
      valA = Number(a.id)
      valB = Number(b.id)
    } else if (sortBy.value === 'ds') {
      const getDs = (song) => dsDiffIndex.value === -1 ? Math.max(...song.ds) : (song.ds[dsDiffIndex.value] || 0)
      valA = getDs(a)
      valB = getDs(b)
    } else if (sortBy.value === 'achievement') {
      const getAch = (song) => {
        const records = userRecordMap.value.get(Number(song.id))
        if (!records) return -1
        if (achDiffIndex.value === -1) {
          const vals = Object.values(records).map(r => r.achievements)
          return vals.length ? Math.max(...vals) : -1
        }
        return records[achDiffIndex.value]?.achievements || -1
      }
      valA = getAch(a)
      valB = getAch(b)
    } else {
      return 0 // Default order (usually ID asc from source, or preserve)
    }

    if (valA === valB) return Number(b.id) - Number(a.id)
    return sortDesc.value ? valB - valA : valA - valB
  })

  return result
})

const totalPages = computed(() => Math.ceil(filteredSongs.value.length / itemsPerPage))

const paginatedSongs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredSongs.value.slice(start, end)
})

// Reset pagination when filters change
watch([searchQuery, selectedCategory, selectedVersion], () => {
  currentPage.value = 1
})

const getCoverUrl = (song) => {
  const url = getServiceCoverUrl(song.id)
  return getCoverUrlWithFallback(url)
}

const handleImageError = (song) => {
  const url = getServiceCoverUrl(song.id)
  markAsFailed(url)
}

const selectSong = (song) => {
  // Find best record for this song
  const songRecords = userStore.records.filter(r => r.song_id === song.id)
  let bestRecord = null
  
  if (songRecords.length > 0) {
    // Sort by achievement descending
    songRecords.sort((a, b) => b.achievements - a.achievements)
    bestRecord = songRecords[0]
  }

  emit('select', { ...song, record: bestRecord })
  emit('close')
}

// User Record Map for efficient lookup
const userRecordMap = computed(() => {
  const map = new Map()
  if (!userStore.records) return map
  
  userStore.records.forEach(record => {
    const id = Number(record.song_id)
    if (!map.has(id)) {
      map.set(id, {})
    }
    map.get(id)[record.level_index] = record
  })
  return map
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white w-full md:max-w-4xl h-[90vh] md:h-[80vh] flex flex-col border-t-2 md:border-2 border-black md:shadow-hard rounded-t-xl md:rounded-xl overflow-hidden">
      
      <!-- Header -->
      <div class="p-3 md:p-4 border-b-2 border-black flex items-center justify-between bg-gray-50 shrink-0">
        <h3 class="font-bold text-lg">选择歌曲</h3>
        <button @click="$emit('close')" class="p-1 hover:bg-gray-200 rounded">
          <X :size="24" />
        </button>
      </div>

      <!-- Search & Filter -->
      <div class="p-3 md:p-4 border-b-2 border-black space-y-3 shrink-0 bg-gray-50 relative z-20">
        <div class="flex gap-2">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
            <input 
              v-model="searchQuery"
              type="text" 
              class="input-base pl-10 py-2 w-full" 
              placeholder="搜索曲名、别名、曲师、谱师..." 
              autoFocus
            />
          </div>
          <button 
            @click="showAdvancedFilters = !showAdvancedFilters"
            class="btn-base px-3 flex items-center justify-center bg-white border-2 border-black rounded-lg"
            :class="showAdvancedFilters ? 'bg-gray-200' : ''"
          >
            <SlidersHorizontal :size="20" />
          </button>
        </div>

        <!-- Sort Options -->
        <div class="flex gap-2">
           <div class="flex-1 bg-gray-200 p-1 rounded-lg flex">
            <button 
              v-for="opt in sortOptions" 
              :key="opt.value"
              @click="sortBy = opt.value"
              :class="[
                'flex-1 px-2 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap',
                sortBy === opt.value 
                  ? 'bg-white shadow-sm text-black ring-1 ring-black/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-300/50'
              ]"
            >
              {{ opt.label }}
            </button>
          </div>
          <button 
            @click="sortDesc = !sortDesc"
            class="bg-gray-200 hover:bg-gray-300 border-2 border-transparent hover:border-gray-400 rounded-lg px-3 flex items-center justify-center transition-all"
          >
            <ArrowUpDown :size="18" :class="{ 'rotate-180': !sortDesc }" class="transition-transform text-gray-600" />
          </button>
        </div>

        <!-- Advanced Filters Popover -->
        <div v-if="showAdvancedFilters" class="absolute top-full right-0 mt-2 w-full md:w-[480px] bg-white rounded-xl shadow-xl border-2 border-black p-4 z-50 max-h-[60vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h3 class="font-bold text-lg flex items-center gap-2">
              <SlidersHorizontal :size="20" />
              高级筛选
            </h3>
            <button @click="showAdvancedFilters = false" class="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X :size="20" class="text-gray-500" />
            </button>
          </div>

          <div class="space-y-4">
            <!-- Categories -->
            <div class="space-y-1">
              <div class="text-xs font-bold text-gray-500 ml-1">流派</div>
              <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                  v-for="cat in categories" 
                  :key="cat.id"
                  @click="selectedCategory = cat.id"
                  class="px-3 py-1 text-xs font-bold border-2 border-black rounded-full whitespace-nowrap transition-colors flex-shrink-0"
                  :class="selectedCategory === cat.id ? 'bg-pink-400 text-black' : 'bg-white hover:bg-gray-100'"
                >
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <!-- Versions -->
            <div class="space-y-1">
              <div class="text-xs font-bold text-gray-500 ml-1">版本</div>
              <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                  v-for="ver in versions" 
                  :key="ver"
                  @click="selectedVersion = ver"
                  class="px-3 py-1 text-xs font-bold border-2 border-black rounded-full whitespace-nowrap transition-colors flex-shrink-0"
                  :class="selectedVersion === ver ? 'bg-blue-400 text-black' : 'bg-white hover:bg-gray-100'"
                >
                  {{ ver === 'all' ? '全部版本' : getVersionName(ver) }}
                </button>
              </div>
            </div>

            <!-- DS Filter -->
            <div class="space-y-2">
              <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">定数筛选</div>
              <div class="flex gap-2">
                <select v-model="dsDiffIndex" class="input-base w-24 text-sm px-2">
                  <option :value="-1">任意难度</option>
                  <option v-for="(label, idx) in diffLabels" :key="idx" :value="idx">{{ label }}</option>
                </select>
                <input v-model="minDs" type="number" placeholder="Min" class="input-base w-full text-sm" step="0.1" />
                <span class="self-center font-bold text-gray-400">-</span>
                <input v-model="maxDs" type="number" placeholder="Max" class="input-base w-full text-sm" step="0.1" />
              </div>
            </div>

            <!-- Achievement Filter -->
            <div v-if="userStore.isAuthenticated" class="space-y-2">
              <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">达成率筛选</div>
              <div class="flex gap-2">
                <select v-model="achDiffIndex" class="input-base w-24 text-sm px-2">
                  <option :value="-1">任意难度</option>
                  <option v-for="(label, idx) in diffLabels" :key="idx" :value="idx">{{ label }}</option>
                </select>
                <input v-model="minAch" type="number" placeholder="Min %" class="input-base w-full text-sm" step="0.1" />
                <span class="self-center font-bold text-gray-400">-</span>
                <input v-model="maxAch" type="number" placeholder="Max %" class="input-base w-full text-sm" step="0.1" />
              </div>
              <!-- Rank Checkboxes -->
              <div class="flex flex-wrap gap-2 mt-2">
                <label v-for="rank in rankOptions" :key="rank" class="flex items-center gap-1 cursor-pointer select-none bg-gray-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100">
                  <input type="checkbox" :value="rank" v-model="selectedRanks" class="w-3 h-3 rounded border-gray-400 text-maimai-blue focus:ring-maimai-blue">
                  <span class="text-xs font-bold text-gray-600">{{ rank }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Song List -->
      <div class="flex-1 overflow-y-auto p-2 md:p-4 bg-gray-100 relative">
        <!-- Loading State -->
        <div v-if="userStore.isLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/80 z-10">
          <Loader2 class="animate-spin text-maimai-blue mb-2" :size="32" />
          <p class="text-sm font-bold text-gray-500">正在加载记录...</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          <button 
            v-for="song in paginatedSongs" 
            :key="song.id"
            @click="selectSong(song)"
            class="flex items-center gap-3 p-2 bg-white border-2 border-black rounded-lg active:scale-[0.98] md:hover:translate-x-1 md:hover:translate-y-1 md:hover:shadow-none md:shadow-hard-sm transition-all text-left group"
          >
            <img 
              :src="getCoverUrl(song)" 
              @error="handleImageError(song)"
              class="w-14 h-14 md:w-16 md:h-16 object-cover border-2 border-black rounded shrink-0"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <div class="flex-1 min-w-0">
              <div class="font-bold truncate text-sm group-hover:text-maimai-purple transition-colors">{{ song.title }}</div>
              <div class="text-xs text-gray-500 truncate">{{ song.basic_info.artist }}</div>
              <div class="text-xs font-mono bg-gray-100 inline-block px-1 rounded mt-1">ID: {{ song.id }}</div>
            </div>
          </button>
        </div>
        
        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 mt-6 pb-2">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="p-2 rounded-lg border-2 border-black hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft :size="20" />
          </button>
          
          <span class="font-bold text-sm">
            Page {{ currentPage }} / {{ totalPages }}
          </span>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="p-2 rounded-lg border-2 border-black hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight :size="20" />
          </button>
        </div>

        <div v-if="filteredSongs.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 min-h-[200px]">
          <Search :size="48" class="mb-4 opacity-20" />
          <div v-if="selectedCategory === 'my-records' && userStore.records.length === 0" class="text-center px-4">
            <p class="font-bold text-gray-500 mb-1">暂无记录数据</p>
            <p class="text-xs">请检查设置中的用户名/Token，或确认是否已在查分器公开数据。</p>
            <p v-if="userStore.error" class="text-xs text-red-500 mt-2">{{ userStore.error }}</p>
          </div>
          <p v-else>没有找到相关歌曲</p>
        </div>
      </div>

    </div>
  </div>
</template>
