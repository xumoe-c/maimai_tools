<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import MusicCard from '@/components/music/MusicCard.vue'
import { Loader2, Search, Filter, ArrowUpDown, Music, SlidersHorizontal, X } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { fetchMusicData, fetchAllAliases } from '@/services/diving-fish'
import { getVersionName } from '@/utils/version-map'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const musicData = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const filterGenre = ref('all')
const filterVersion = ref('all')
const onlyPlayed = ref(false)
const showAdvancedFilters = ref(false)

// Advanced Filters
const minDs = ref('')
const maxDs = ref('')
const dsDiffIndex = ref(-1) // -1: All, 0-4: Specific

const minAch = ref('')
const maxAch = ref('')
const achDiffIndex = ref(-1) // -1: All, 0-4: Specific
const selectedRanks = ref([]) // ['SSS+', 'SSS', ...]

const genreOptions = ref([])
const versionOptions = ref([])
const aliasMap = ref(new Map())

const sortOptions = [
  { label: '默认 (ID)', value: 'id' },
  { label: '达成率', value: 'achievement' },
]

const sortBy = ref('id')
const sortDesc = ref(false) // Default ID Ascending
const currentPage = ref(1)
const pageSize = 48

const diffLabels = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']
const rankOptions = ['SSS+', 'SSS', 'SS+', 'SS', 'S+', 'S', 'AAA', 'AA', 'A']

// User Records Map
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

// Computed Songs
const filteredSongs = computed(() => {
  let res = [...musicData.value]

  // 1. Search Filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    res = res.filter(song => {
      // Title match
      if (song.title.toLowerCase().includes(q)) return true
      
      // ID match
      if (String(song.id).includes(q)) return true
      
      // Alias match
      const alias = aliasMap.value.get(Number(song.id))
      if (alias && alias.some(a => a.toLowerCase().includes(q))) return true

      // Metadata match (Artist, Charter)
      if (song.basic_info.artist.toLowerCase().includes(q)) return true
      if (song.charts && song.charts.some(chart => chart.charter.toLowerCase().includes(q))) return true
      
      return false
    })
  }

  // 2. Basic Filters
  if (filterGenre.value !== 'all') {
    res = res.filter(song => song.basic_info.genre === filterGenre.value)
  }

  if (filterVersion.value !== 'all') {
    res = res.filter(song => song.basic_info.from === filterVersion.value)
  }

  if (onlyPlayed.value) {
    res = res.filter(song => userRecordMap.value.has(Number(song.id)))
  }

  // 3. DS Filter
  if (minDs.value !== '' || maxDs.value !== '') {
    const min = minDs.value === '' ? 0 : Number(minDs.value)
    const max = maxDs.value === '' ? 99 : Number(maxDs.value)
    
    res = res.filter(song => {
      if (dsDiffIndex.value === -1) {
        // Check if ANY chart matches
        return song.ds.some(ds => ds >= min && ds <= max)
      } else {
        // Check specific chart
        const ds = song.ds[dsDiffIndex.value]
        return ds !== undefined && ds >= min && ds <= max
      }
    })
  }

  // 4. Achievement Filter
  if (minAch.value !== '' || maxAch.value !== '' || selectedRanks.value.length > 0) {
    const min = minAch.value === '' ? 0 : Number(minAch.value)
    const max = maxAch.value === '' ? 101 : Number(maxAch.value)
    
    res = res.filter(song => {
      const records = userRecordMap.value.get(Number(song.id))
      if (!records) return false // Must have played to have achievement

      if (achDiffIndex.value === -1) {
        // Check ANY record
        return Object.values(records).some(r => {
          const inRange = r.achievements >= min && r.achievements <= max
          const inRank = selectedRanks.value.length === 0 || selectedRanks.value.includes(r.rate.toUpperCase().replace('P', '+'))
          return inRange && inRank
        })
      } else {
        // Check specific record
        const r = records[achDiffIndex.value]
        if (!r) return false
        const inRange = r.achievements >= min && r.achievements <= max
        const inRank = selectedRanks.value.length === 0 || selectedRanks.value.includes(r.rate.toUpperCase().replace('P', '+'))
        return inRange && inRank
      }
    })
  }

  // Sort
  res.sort((a, b) => {
    let valA, valB
    
    if (sortBy.value === 'id') {
      valA = Number(a.id)
      valB = Number(b.id)
    } else if (sortBy.value === 'achievement') {
      // Get max achievement for the song (or specific diff)
      const getAch = (songId) => {
        const records = userRecordMap.value.get(Number(songId))
        if (!records) return -1
        
        if (achDiffIndex.value !== -1) {
          return records[achDiffIndex.value]?.achievements || -1
        } else {
          return Math.max(...Object.values(records).map(r => r.achievements))
        }
      }
      valA = getAch(a.id)
      valB = getAch(b.id)
    }
    
    return sortDesc.value ? valB - valA : valA - valB
  })

  return res
})

const totalPages = computed(() => Math.ceil(filteredSongs.value.length / pageSize))

const paginatedSongs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSongs.value.slice(start, start + pageSize)
})

const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openDetail = (song) => {
  router.push(`/song/${song.id}`)
}

onMounted(async () => {
  isLoading.value = true
  try {
    musicData.value = await fetchMusicData()
    
    // Populate options
    const genres = new Set()
    const versions = new Set()
    musicData.value.forEach(s => {
      if (s.basic_info.genre) genres.add(s.basic_info.genre)
      if (s.basic_info.from) versions.add(s.basic_info.from)
    })
    genreOptions.value = Array.from(genres).sort()
    versionOptions.value = Array.from(versions).sort()

    // Load aliases
    aliasMap.value = await fetchAllAliases()

    // Handle query params
    if (route.query.version) {
      filterVersion.value = route.query.version
    }
  } catch (e) {
    console.error("Failed to load metadata", e)
  } finally {
    isLoading.value = false
  }
})

// Reset page on filter change
watch([searchQuery, filterGenre, filterVersion], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black flex items-center gap-2">
          <Music class="text-maimai-blue" :size="32" />
          乐曲查询
        </h1>
        <p class="text-gray-500 font-bold mt-1">
          收录曲目: {{ musicData.length }} 首
        </p>
      </div>
    </div>

    <!-- Controls -->
    <div class="bg-white border-2 border-black shadow-hard rounded-xl p-4 flex flex-col gap-4">
      <!-- Search -->
      <div class="relative w-full">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索曲名、别名、曲师、谱师、ID..." 
          class="input-base w-full pl-10"
        />
      </div>

      <!-- Filters -->
      <div class="space-y-3">
        <!-- Row 1: Sort Tabs & Checkbox -->
        <div class="flex flex-col md:flex-row gap-2 relative">
          <div class="flex-1 bg-gray-100 p-1 rounded-lg flex">
            <button 
              v-for="opt in sortOptions" 
              :key="opt.value"
              @click="sortBy = opt.value"
              :class="[
                'flex-1 px-3 py-1.5 text-sm font-bold rounded-md transition-all whitespace-nowrap',
                sortBy === opt.value 
                  ? 'bg-white shadow-sm text-black ring-1 ring-black/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              ]"
            >
              {{ opt.label }}
            </button>
          </div>

          <div class="flex gap-2">
            <button 
              @click="sortDesc = !sortDesc"
              class="bg-gray-100 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300 rounded-lg px-3 flex items-center justify-center transition-all"
              title="切换排序顺序"
            >
              <ArrowUpDown :size="20" :class="{ 'rotate-180': !sortDesc }" class="transition-transform text-gray-600" />
            </button>

            <label v-if="userStore.isAuthenticated" class="bg-gray-100 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300 rounded-lg px-3 flex items-center justify-center gap-2 cursor-pointer select-none transition-all">
              <input type="checkbox" v-model="onlyPlayed" class="w-4 h-4 rounded border-gray-400 text-maimai-blue focus:ring-maimai-blue">
              <span class="text-sm font-bold text-gray-700 whitespace-nowrap">只看已玩</span>
            </label>

            <button 
              @click="showAdvancedFilters = !showAdvancedFilters"
              :class="[
                'bg-gray-100 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300 rounded-lg px-3 flex items-center justify-center transition-all',
                showAdvancedFilters ? 'bg-gray-200 border-gray-300' : ''
              ]"
              title="高级筛选"
            >
              <SlidersHorizontal :size="20" class="text-gray-600" />
            </button>
          </div>

          <!-- Floating Advanced Filters Window -->
          <div v-if="showAdvancedFilters" class="absolute top-full right-0 mt-2 w-full md:w-[480px] bg-white rounded-xl shadow-xl border-2 border-gray-100 p-4 z-20">
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
              <!-- Basic Filters -->
              <div class="space-y-2">
                <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">基础筛选</div>
                <div class="grid grid-cols-2 gap-2">
                  <select v-model="filterGenre" class="input-base w-full text-sm">
                    <option value="all">所有流派</option>
                    <option v-for="g in genreOptions" :key="g" :value="g">{{ g }}</option>
                  </select>

                  <select v-model="filterVersion" class="input-base w-full text-sm">
                    <option value="all">所有版本</option>
                    <option v-for="v in versionOptions" :key="v" :value="v">{{ getVersionName(v) }}</option>
                  </select>
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
      </div>
    </div>

    <!-- Content -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <Loader2 class="animate-spin text-maimai-blue" :size="48" />
    </div>

    <div v-else-if="filteredSongs.length > 0">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <MusicCard 
          v-for="song in paginatedSongs" 
          :key="song.id" 
          :song="song"
          :user-records="userRecordMap.get(Number(song.id))"
          @click="openDetail(song)"
        />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8 gap-2">
        <button 
          @click="handlePageChange(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="btn-base px-3 py-1 bg-white border-2 border-black disabled:opacity-50"
        >
          上一页
        </button>
        <span class="flex items-center font-bold px-2">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          @click="handlePageChange(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="btn-base px-3 py-1 bg-white border-2 border-black disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-500 font-bold">
      没有找到符合条件的乐曲
    </div>
  </div>
</template>
