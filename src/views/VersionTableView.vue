<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft, Info } from 'lucide-vue-next'
import { VERSION_CONFIG } from '@/utils/version-map'

const router = useRouter()

const goToMusicList = (versionId) => {
    router.push({
        path: '/music',
        query: { version: versionId }
    })
}
</script>

<template>
    <div class="max-w-4xl mx-auto pb-12 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <button @click="router.back()" class="flex items-center gap-1 text-gray-500 font-bold hover:text-black transition-colors">
                <ArrowLeft :size="20" />
                返回
            </button>
        </div>

        <div class="space-y-2">
            <h1 class="text-3xl font-black">版本对照表</h1>
            <p class="text-gray-500 font-bold">
                舞萌DX 各版本名称对照及 B50 计算分类
            </p>
        </div>

        <div class="bg-white border-2 border-black shadow-hard rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b-2 border-black">
                            <th class="p-4 font-black text-sm uppercase tracking-wider">API 原始名称</th>
                            <th class="p-4 font-black text-sm uppercase tracking-wider">显示名称</th>
                            <th class="p-4 font-black text-sm uppercase tracking-wider text-center">简称</th>
                            <th class="p-4 font-black text-sm uppercase tracking-wider">B50 分类</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr 
                            v-for="version in VERSION_CONFIG" 
                            :key="version.id" 
                            class="hover:bg-blue-50 transition-colors cursor-pointer group"
                            @click="goToMusicList(version.id)"
                        >
                            <td class="p-4 font-mono text-sm font-bold text-gray-600 group-hover:text-maimai-blue transition-colors">{{ version.id }}</td>
                            <td class="p-4 font-bold group-hover:text-maimai-blue transition-colors">{{ version.name }}</td>
                            <td class="p-4 font-bold text-center text-blue-600">{{ version.abbr || '-' }}</td>
                            <td class="p-4">
                                <span 
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                                    :class="version.isCurrent ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'"
                                >
                                    {{ version.isCurrent ? 'Current (B15)' : 'Past (B35)' }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info class="text-blue-500 shrink-0" :size="20" />
            <div class="text-sm text-blue-700 space-y-1">
                <p class="font-bold">关于 B50 计算规则：</p>
                <p>
                    Rating 计算由 <strong>Past (Best 35)</strong> 和 <strong>Current (Best 15)</strong> 两部分组成。
                    当大版本更新时（如从 BUDDiES+ 更新到 PRiSM），旧版本的 "Current" 曲目会移动到 "Past" 分区，而新版本的曲目将填入新的 "Current" 分区。
                </p>
            </div>
        </div>
    </div>
</template>
