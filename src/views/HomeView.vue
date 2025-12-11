<script setup>
import { Palette, Calculator, Shuffle, List, Trophy, X, ExternalLink, LogIn } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const showLoginModal = ref(false)

onMounted(() => {
  if (!userStore.isAuthenticated) {
    showLoginModal.value = true
  }
})
</script>

<template>
  <div class="space-y-8">
    <!-- Login Suggestion Modal -->
    <div v-if="showLoginModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white w-full max-w-md rounded-xl border-2 border-black shadow-hard p-6 relative animate-in zoom-in-95 duration-200">
        <button @click="showLoginModal = false" class="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X :size="20" class="text-gray-500" />
        </button>

        <div class="flex flex-col items-center text-center space-y-4">
          <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100">
            <LogIn :size="32" class="text-maimai-blue" />
          </div>
          
          <h3 class="text-xl font-black text-gray-900">欢迎来到 Maimai Tools</h3>
          
          <p class="text-gray-600 font-medium text-sm leading-relaxed">
            检测到您尚未登录。为了使用查询成绩、生成 B50 等核心功能，建议您先绑定水鱼查分器 Token。
          </p>

          <div class="w-full space-y-3 pt-2">
            <RouterLink to="/settings" class="btn-base w-full bg-maimai-blue text-white flex items-center justify-center gap-2 py-2.5">
              去设置页面登录
            </RouterLink>
            
            <a href="https://www.diving-fish.com/maimaidx/docs/docs/intro" target="_blank" class="btn-base w-full bg-white border-2 border-gray-200 text-gray-600 flex items-center justify-center gap-2 py-2.5 hover:border-maimai-blue hover:text-maimai-blue">
              <ExternalLink :size="18" />
              如何获取 Token?
            </a>
          </div>
          
          <button @click="showLoginModal = false" class="text-xs font-bold text-gray-400 hover:text-gray-600">
            暂不登录，随便看看
          </button>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="bg-white border-2 border-black shadow-hard p-6 md:p-10 rounded-xl">
      <h1 class="text-3xl md:text-4xl font-black mb-4">舞萌DX 实用工具站</h1>
      <p class="text-lg font-medium text-gray-600 mb-6">
        专为 Maimai 玩家打造的现代化工具集合。生成生涯喜好表、计算 B50、查询定数，一站式搞定。
      </p>
      <div class="flex gap-4">
        <RouterLink to="/generator/preference-table" class="btn-base bg-maimai-purple text-white">
          开始制作喜好表
        </RouterLink>
        <a href="https://github.com/xumoe-c/maimai_tools" target="_blank" class="btn-base bg-white">
          了解更多
        </a>
      </div>
    </div>

    <!-- Tools Grid -->
    <div>
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <span class="w-4 h-4 bg-black block"></span>
        工具列表
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Tool Card: Preference Table -->
        <RouterLink to="/generator/preference-table" class="group block">
          <div class="h-full bg-maimai-purple border-2 border-black shadow-hard rounded-xl p-6 transition-transform group-hover:-translate-y-1 group-active:translate-y-1 group-active:shadow-none">
            <div class="bg-white w-12 h-12 border-2 border-black rounded flex items-center justify-center mb-4 shadow-hard-sm">
              <Palette :size="24" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2 drop-shadow-md">生涯喜好表生成器</h3>
            <p class="text-white font-medium opacity-90">
              自定义生成你的 Maimai 生涯歌曲喜好表，支持自动填歌、导出高清图片。
            </p>
          </div>
        </RouterLink>

        <!-- Tool Card: Score Query -->
        <RouterLink to="/music" class="group block">
          <div class="h-full bg-maimai-blue border-2 border-black shadow-hard rounded-xl p-6 transition-transform group-hover:-translate-y-1 group-active:translate-y-1 group-active:shadow-none">
            <div class="bg-white w-12 h-12 border-2 border-black rounded flex items-center justify-center mb-4 shadow-hard-sm">
              <List :size="24" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2 drop-shadow-md">乐曲查询</h3>
            <p class="text-white font-medium opacity-90">
              浏览所有游玩记录。支持筛选与排序。
            </p>
          </div>
        </RouterLink>

        <!-- Tool Card: B50 -->
        <RouterLink to="/b50" class="group block">
          <div class="h-full bg-maimai-yellow border-2 border-black shadow-hard rounded-xl p-6 transition-transform group-hover:-translate-y-1 group-active:translate-y-1 group-active:shadow-none">
            <div class="bg-white w-12 h-12 border-2 border-black rounded flex items-center justify-center mb-4 shadow-hard-sm">
              <Trophy :size="24" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2 drop-shadow-md">B50 查询</h3>
            <p class="text-white font-medium opacity-90">
              查询你的 B50 成绩构成与 Rating 计算详情。
            </p>
          </div>
        </RouterLink>

        <!-- Tool Card: Random (Coming Soon) -->
        <div class="opacity-60 cursor-not-allowed">
          <div class="h-full bg-maimai-yellow border-2 border-black shadow-hard rounded-xl p-6">
            <div class="bg-white w-12 h-12 border-2 border-black rounded flex items-center justify-center mb-4 shadow-hard-sm">
              <Shuffle :size="24" />
            </div>
            <h3 class="text-xl font-bold text-black mb-2">随机选曲</h3>
            <p class="text-black font-medium opacity-90">
              (开发中) 治好选择困难症，支持按等级、版本随机。
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
