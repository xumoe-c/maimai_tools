<script setup>
import { RouterLink } from 'vue-router'
import { Home, Palette, Calculator, HelpCircle, Github, Settings, Music, Trophy, Table, Sparkles, MessageSquare, Shuffle } from 'lucide-vue-next'

const emit = defineEmits(['close-mobile'])

const menuItems = [
  { name: '首页', path: '/', icon: Home },
  { name: '乐曲查询', path: '/music', icon: Music },
  { name: '随机选曲', path: '/random', icon: Shuffle },
  { name: 'B50查询', path: '/b50', icon: Trophy },
  { name: '拟合B50', path: '/fitting-b50', icon: Trophy },
  { name: '推分建议', path: '/recommendation', icon: Sparkles },
  { name: '一句话评价', path: '/review', icon: MessageSquare },
  { name: '版本对照表', path: '/versions', icon: Table },
  { name: '喜好表生成器', path: '/generator/preference-table', icon: Palette },
  // { name: 'B50计算器', path: '/calculator', icon: Calculator }, // Future
  { name: '设置 & 数据源', path: '/settings', icon: Settings },
  { name: '关于', path: '/about', icon: HelpCircle },
]
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Logo Area -->
    <div class="h-16 flex items-center justify-center border-b-2 border-black bg-maimai-yellow">
      <h1 class="text-xl font-black tracking-tighter">MAIMAI TOOLS</h1>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 font-bold border-2 border-transparent hover:bg-gray-100 rounded transition-colors"
        active-class="bg-maimai-purple text-white border-black shadow-hard"
        @click="emit('close-mobile')"
      >
        <component :is="item.icon" :size="20" />
        {{ item.name }}
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t-2 border-black bg-gray-50">
      <a 
        href="https://github.com/xumoe-c/maimai_tools" 
        target="_blank"
        class="flex items-center justify-center gap-2 w-full btn-base bg-white hover:bg-gray-100"
      >
        <Github :size="18" />
        <span>GitHub</span>
      </a>
      <div class="mt-4 text-xs text-center text-gray-500 font-bold">
        © 2025 Maimai Tools
      </div>
    </div>
  </div>
</template>
