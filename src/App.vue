<script setup>
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { ref } from 'vue'
import { Menu, ShieldCheck, Globe } from 'lucide-vue-next'

const isMobileMenuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen flex flex-col md:flex-row">
    <!-- Mobile Header -->
    <header class="md:hidden h-16 border-b-2 border-black flex items-center justify-between px-4 bg-white sticky top-0 z-50">
      <div class="font-bold text-xl">Maimai Tools</div>
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="p-2 border-2 border-black shadow-hard-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
        <Menu :size="24" />
      </button>
    </header>

    <!-- Sidebar (Desktop & Mobile Drawer) -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r-2 border-black transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <AppSidebar @close-mobile="isMobileMenuOpen = false" />
    </aside>

    <!-- Overlay for mobile -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-black/50 z-30 md:hidden"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- Main Content -->
    <main class="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen flex flex-col">
      <div class="flex-1">
        <RouterView />
      </div>

      <!-- Footer -->
      <footer class="mt-12 py-6 border-t-2 border-gray-200 text-center text-sm text-gray-500 font-bold space-y-2">
        <div class="flex items-center justify-center gap-2">
          <span>© 徐某徐某徐某 2025-2026</span>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <a href="https://beian.miit.gov.cn/" target="_blank" class="hover:text-black transition-colors flex items-center gap-1">
            <Globe :size="14" />
            陕ICP备2024056353号-4
          </a>
          <a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=61011602000749" target="_blank" class="hover:text-black transition-colors flex items-center gap-1">
            <ShieldCheck :size="14" />
            陕公网安备61011602000749号
          </a>
        </div>
      </footer>
    </main>
  </div>
</template>
