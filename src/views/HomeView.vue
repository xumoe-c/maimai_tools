<script setup>
import { Palette, Calculator, Shuffle } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="space-y-8">
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

        <!-- Tool Card: B50 (Coming Soon) -->
        <div class="opacity-60 cursor-not-allowed">
          <div class="h-full bg-maimai-blue border-2 border-black shadow-hard rounded-xl p-6">
            <div class="bg-white w-12 h-12 border-2 border-black rounded flex items-center justify-center mb-4 shadow-hard-sm">
              <Calculator :size="24" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2 drop-shadow-md">B50 计算器</h3>
            <p class="text-white font-medium opacity-90">
              (开发中) 快速计算你的 B50 数据，分析推分进度。
            </p>
          </div>
        </div>

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
