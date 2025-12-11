<script setup>
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { Loader2, CheckCircle2, AlertCircle, LogOut, RefreshCw, Trash2, ExternalLink } from 'lucide-vue-next'

const userStore = useUserStore()
const loadStatus = ref('idle') // idle, success, error
const statusMessage = ref('')
const isRefreshingScores = ref(false)
const isRefreshingMusic = ref(false)
const tokenInputRef = ref(null)

// Determine initial auth type based on token format
const authType = ref('token') // Default to token as requested

if (userStore.token) {
  // Simple heuristic: Tokens are usually long strings, Usernames/QQs are shorter
  if (userStore.token.length > 32) {
    authType.value = 'token'
  } else {
    authType.value = 'username'
  }
}

// Clear token when switching modes to avoid confusion
watch(authType, (newVal, oldVal) => {
  if (newVal !== oldVal && userStore.token) {
    // Optional: Clear token if user switches mode? 
    // Maybe better to keep it but let them overwrite.
    // userStore.token = '' 
  }
})

onMounted(() => {
  if (!userStore.isAuthenticated && tokenInputRef.value) {
    tokenInputRef.value.focus()
  }
})

const handleLoadData = async () => {
  if (!userStore.token) return
  
  loadStatus.value = 'idle'
  statusMessage.value = ''
  
  const success = await userStore.fetchProfile()
  
  if (success) {
    loadStatus.value = 'success'
    statusMessage.value = `成功加载: ${userStore.profile.nickname}`
  } else {
    loadStatus.value = 'error'
    statusMessage.value = userStore.error || '加载失败'
  }
}


const handleLogout = () => {
  userStore.clearUser()
  loadStatus.value = 'idle'
  statusMessage.value = ''
}

const handleRefreshScores = async () => {
  if (!userStore.isAuthenticated) return
  isRefreshingScores.value = true
  const success = await userStore.fetchProfile()
  if (success) {
    alert('成绩数据已更新')
  } else {
    alert('更新失败: ' + (userStore.error || '未知错误'))
  }
  isRefreshingScores.value = false
}

const handleRefreshMusic = async () => {
  isRefreshingMusic.value = true
  const success = await userStore.refreshMusic()
  if (success) {
    alert('乐曲数据库已更新')
  } else {
    alert('更新失败')
  }
  isRefreshingMusic.value = false
}

const handleClearCache = (type) => {
  if (!confirm('确定要清除选定的缓存吗？')) return
  userStore.clearCache(type)
  alert('缓存已清除')
  if (type === 'all' || type === 'records') {
    loadStatus.value = 'idle'
    statusMessage.value = ''
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-black">设置 & 数据源</h1>

    <!-- Data Source Card -->
    <div class="bg-white border-2 border-black shadow-hard rounded-xl p-6">
      <h2 class="font-bold text-xl mb-4 flex items-center gap-2">
        <span class="w-3 h-3 bg-maimai-purple border-2 border-black"></span>
        数据源配置 (Diving Fish)
      </h2>
      
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          配置您的查分器 Token 或 用户名，以便在各个工具中自动获取您的玩家数据（昵称、Rating、成绩等）。
        </p>

        <div class="space-y-4">
          <label class="block text-xs font-bold text-gray-500">验证方式</label>
          <div class="flex gap-4 p-1 bg-gray-100 rounded-lg w-fit">
            <button 
              @click="authType = 'username'"
              class="px-4 py-1.5 text-sm font-bold rounded-md transition-all"
              :class="authType === 'username' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'"
            >
              用户名 / QQ号
            </button>
            <button 
              @click="authType = 'token'"
              class="px-4 py-1.5 text-sm font-bold rounded-md transition-all"
              :class="authType === 'token' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'"
            >
              Import Token
            </button>
          </div>

          <div class="flex gap-2">
            <div class="flex-1">
              <input 
                v-if="authType === 'username'"
                v-model="userStore.token" 
                type="text" 
                class="input-base w-full" 
                placeholder="请输入查分器用户名或QQ号" 
                ref="tokenInputRef"
              />
              <input 
                v-else
                v-model="userStore.token" 
                type="password" 
                class="input-base w-full" 
                placeholder="请输入查分器 Import Token" 
                ref="tokenInputRef"
              />
            </div>
            <button 
              @click="handleLoadData" 
              :disabled="userStore.isLoading || !userStore.token"
              class="btn-base bg-black text-white px-4 py-2 flex items-center justify-center min-w-[80px]"
            >
              <Loader2 v-if="userStore.isLoading" class="animate-spin" :size="20" />
              <span v-else>验证并保存</span>
            </button>
          </div>

          <!-- Helper Link -->
          <div v-if="authType === 'token'" class="flex justify-end">
            <a 
              href="https://www.diving-fish.com/maimaidx/docs/docs/intro" 
              target="_blank" 
              class="text-xs font-bold text-maimai-blue hover:underline flex items-center gap-1"
            >
              <ExternalLink :size="12" />
              如何获取 Token?
            </a>
          </div>
          
          <!-- Status Feedback -->
          <div v-if="loadStatus === 'success'" class="flex items-center gap-2 text-sm text-maimai-green font-bold p-2 bg-green-50 border-2 border-maimai-green rounded">
            <CheckCircle2 :size="16" />
            {{ statusMessage }}
          </div>
          <div v-if="loadStatus === 'error'" class="flex items-center gap-2 text-sm text-maimai-red font-bold p-2 bg-red-50 border-2 border-maimai-red rounded">
            <AlertCircle :size="16" />
            {{ statusMessage }}
          </div>
          
          <p class="text-xs text-gray-400 mt-2">
            * 凭证将存储在本地，仅用于获取您的数据。
          </p>
        </div>

        <!-- Current User Info -->
        <div v-if="userStore.isAuthenticated" class="mt-6 pt-6 border-t-2 border-black/10 border-dashed">
          <h3 class="font-bold text-sm mb-3">当前已绑定用户</h3>
          <div class="flex items-center justify-between bg-gray-50 p-3 border-2 border-black rounded">
            <div>
              <div class="font-black text-lg">{{ userStore.profile.nickname }}</div>
              <div class="text-xs font-bold text-maimai-blue">Rating: {{ userStore.profile.rating }}</div>
            </div>
            <button 
              @click="handleLogout"
              class="text-xs font-bold text-maimai-red hover:underline flex items-center gap-1"
            >
              <LogOut :size="14" />
              清除数据
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Management Card -->
    <div class="bg-white border-2 border-black shadow-hard rounded-xl p-6">
      <h2 class="font-bold text-xl mb-4 flex items-center gap-2">
        <span class="w-3 h-3 bg-maimai-blue border-2 border-black"></span>
        数据管理
      </h2>

      <div class="space-y-6">
        <!-- Refresh Section -->
        <div class="space-y-3">
          <h3 class="font-bold text-sm text-gray-700">数据更新</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              @click="handleRefreshScores"
              :disabled="!userStore.isAuthenticated || isRefreshingScores"
              class="btn-base bg-white text-black border-2 border-black px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isRefreshingScores" class="animate-spin" :size="18" />
              <RefreshCw v-else :size="18" />
              <span>刷新成绩数据</span>
            </button>

            <button 
              @click="handleRefreshMusic"
              :disabled="isRefreshingMusic"
              class="btn-base bg-white text-black border-2 border-black px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isRefreshingMusic" class="animate-spin" :size="18" />
              <RefreshCw v-else :size="18" />
              <span>刷新乐曲数据库</span>
            </button>
          </div>
          <p class="text-xs text-gray-500">
            * 成绩数据仅在已绑定用户时可用。乐曲数据库包含所有歌曲的基础信息。
          </p>
        </div>

        <!-- Cache Section -->
        <div class="space-y-3 pt-4 border-t-2 border-black/5 border-dashed">
          <h3 class="font-bold text-sm text-gray-700">缓存清理</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button 
              @click="handleClearCache('music')"
              class="btn-base bg-gray-100 text-gray-700 border-2 border-transparent hover:border-black hover:bg-white px-2 py-2 text-xs font-bold flex flex-col items-center gap-1"
            >
              <Trash2 :size="14" />
              清除乐曲缓存
            </button>
            <button 
              @click="handleClearCache('records')"
              class="btn-base bg-gray-100 text-gray-700 border-2 border-transparent hover:border-black hover:bg-white px-2 py-2 text-xs font-bold flex flex-col items-center gap-1"
            >
              <Trash2 :size="14" />
              清除成绩缓存
            </button>
            <button 
              @click="handleClearCache('other')"
              class="btn-base bg-gray-100 text-gray-700 border-2 border-transparent hover:border-black hover:bg-white px-2 py-2 text-xs font-bold flex flex-col items-center gap-1"
            >
              <Trash2 :size="14" />
              清除其他缓存
            </button>
            <button 
              @click="handleClearCache('all')"
              class="btn-base bg-red-50 text-maimai-red border-2 border-transparent hover:border-maimai-red hover:bg-white px-2 py-2 text-xs font-bold flex flex-col items-center gap-1"
            >
              <Trash2 :size="14" />
              清除所有缓存
            </button>
          </div>
          <p class="text-xs text-gray-500">
            * 清除缓存后，下次使用相关功能时将重新从服务器获取数据。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
