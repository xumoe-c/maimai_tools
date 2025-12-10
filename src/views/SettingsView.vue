<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { Loader2, CheckCircle2, AlertCircle, LogOut } from 'lucide-vue-next'

const userStore = useUserStore()
const loadStatus = ref('idle') // idle, success, error
const statusMessage = ref('')

// Determine initial auth type based on token format
const authType = ref('username') // 'username' or 'token'

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
              />
              <input 
                v-else
                v-model="userStore.token" 
                type="password" 
                class="input-base w-full" 
                placeholder="请输入查分器 Import Token" 
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
  </div>
</template>
