<script setup>
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { ref } from 'vue'
import { Menu } from 'lucide-vue-next'

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
    <main class="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
      <RouterView />
    </main>
  </div>
</template>
