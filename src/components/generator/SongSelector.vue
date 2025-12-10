<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, X, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { getCoverUrl as getServiceCoverUrl } from '@/services/diving-fish'

const props = defineProps({
  isOpen: Boolean,
  musicData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'select'])
const userStore = useUserStore()

onMounted(() => {
  // Ensure records are loaded if token exists
  if (userStore.token && userStore.records.length === 0 && !userStore.isLoading) {
    userStore.fetchProfile()
  }
})

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedVersion = ref('all')
const showFilters = ref(false)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 24

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
  
  let result = props.musicData

  // Filter by category
  if (selectedCategory.value === 'my-records') {
    // Use String conversion to ensure ID matching works regardless of type (number vs string)
    const playedIds = new Set(userStore.records.map(r => String(r.song_id)))
    result = result.filter(song => playedIds.has(String(song.id)))
  } else if (selectedCategory.value !== 'all') {
    const category = categories.find(c => c.id === selectedCategory.value)
    if (category && category.aliases) {
      // Normalize genre for comparison (trim spaces)
      result = result.filter(song => {
        const genre = song.basic_info.genre.trim()
        return category.aliases.includes(genre)
      })
    } else {
      result = result.filter(song => song.basic_info.genre === selectedCategory.value)
    }
  }

  // Filter by version
  if (selectedVersion.value !== 'all') {
    result = result.filter(song => song.basic_info.from === selectedVersion.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(song => {
      const title = song.title.toLowerCase()
      const artist = song.basic_info.artist.toLowerCase()
      const id = song.id.toString()
      return title.includes(query) || artist.includes(query) || id.includes(query)
    })
  }

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
  return getServiceCoverUrl(song.id)
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
      <div class="p-3 md:p-4 border-b-2 border-black space-y-3 shrink-0 bg-gray-50">
        <div class="flex gap-2">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
            <input 
              v-model="searchQuery"
              type="text" 
              class="input-base pl-10 py-2 w-full" 
              placeholder="搜索歌曲名、作曲家或ID..." 
              autoFocus
            />
          </div>
          <button 
            @click="showFilters = !showFilters"
            class="btn-base px-3 flex items-center justify-center bg-white border-2 border-black rounded-lg"
            :class="showFilters ? 'bg-gray-200' : ''"
          >
            <Filter :size="20" />
          </button>
        </div>

        <!-- Filters -->
        <div v-if="showFilters" class="space-y-3 pt-2 border-t-2 border-black/10 border-dashed animate-in slide-in-from-top-2 duration-200">
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
                {{ ver === 'all' ? '全部版本' : ver }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Active Filters Summary (When collapsed) -->
        <div v-else class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
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
