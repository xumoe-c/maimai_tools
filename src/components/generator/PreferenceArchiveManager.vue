<script setup>
import { ref } from 'vue'
import { usePreferenceStore } from '@/stores/preference'
import { X, Plus, Edit2, Trash2, Check, FolderOpen, LayoutTemplate } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const store = usePreferenceStore()
const isCreating = ref(false)
const newArchiveName = ref('')
const selectedPreset = ref('default')
const editingId = ref(null)
const editingName = ref('')

const handleCreate = () => {
    if (!newArchiveName.value.trim()) return
    store.createArchive(newArchiveName.value, selectedPreset.value)
    newArchiveName.value = ''
    isCreating.value = false
}

const startEdit = (archive) => {
    editingId.value = archive.id
    editingName.value = archive.name
}

const saveEdit = () => {
    if (editingName.value.trim()) {
        store.renameArchive(editingId.value, editingName.value)
    }
    editingId.value = null
}

const handleDelete = (id) => {
    if (confirm('确定要删除这个存档吗？此操作不可恢复。')) {
        store.deleteArchive(id)
    }
}

const handleSwitch = (id) => {
    store.switchArchive(id)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white w-full max-w-md rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden flex flex-col max-h-[80vh]">
        <!-- Header -->
        <div class="p-4 border-b-2 border-black flex justify-between items-center bg-maimai-purple text-white">
            <h2 class="text-xl font-black flex items-center gap-2">
                <FolderOpen :size="24" />
                喜好表存档
            </h2>
            <button @click="emit('close')" class="p-1 hover:bg-white/20 rounded transition-colors">
                <X :size="24" />
            </button>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div 
                v-for="archive in store.archives" 
                :key="archive.id"
                :class="[
                    'p-3 border-2 rounded-lg flex items-center justify-between group transition-all',
                    store.activeArchiveId === archive.id 
                        ? 'border-black bg-purple-50 shadow-[2px_2px_0px_0px_#000000]' 
                        : 'border-gray-200 hover:border-gray-400'
                ]"
            >
                <div class="flex-1 min-w-0 mr-3">
                    <div v-if="editingId === archive.id" class="flex items-center gap-2">
                        <input 
                            v-model="editingName" 
                            class="w-full px-2 py-1 text-sm border border-black rounded"
                            @keyup.enter="saveEdit"
                            autoFocus
                        />
                        <button @click="saveEdit" class="text-green-600 hover:bg-green-100 p-1 rounded">
                            <Check :size="16" />
                        </button>
                    </div>
                    <div v-else @click="handleSwitch(archive.id)" class="cursor-pointer">
                        <div class="font-bold truncate flex items-center gap-2">
                            {{ archive.name }}
                            <span v-if="store.activeArchiveId === archive.id" class="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">当前</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5">
                            {{ archive.cells.length }} 格 • {{ new Date(archive.updatedAt).toLocaleDateString() }}
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" v-if="editingId !== archive.id">
                    <button @click="startEdit(archive)" class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="重命名">
                        <Edit2 :size="16" />
                    </button>
                    <button 
                        @click="handleDelete(archive.id)" 
                        class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" 
                        title="删除"
                        :disabled="store.archives.length <= 1"
                        :class="{ 'cursor-not-allowed opacity-50': store.archives.length <= 1 }"
                    >
                        <Trash2 :size="16" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Footer / Create -->
        <div class="p-4 border-t-2 border-black bg-gray-50">
            <div v-if="isCreating" class="flex flex-col gap-3">
                <input 
                    v-model="newArchiveName" 
                    placeholder="输入存档名称..." 
                    class="w-full px-3 py-2 border-2 border-black rounded-lg text-sm"
                    autoFocus
                />
                
                <div class="flex gap-2 overflow-x-auto pb-1">
                    <button 
                        v-for="(preset, key) in store.PRESETS" 
                        :key="key"
                        @click="selectedPreset = key"
                        :class="[
                            'px-3 py-1.5 rounded border text-xs font-bold whitespace-nowrap transition-colors',
                            selectedPreset === key 
                                ? 'bg-purple-600 text-white border-black' 
                                : 'bg-white border-gray-300 text-gray-600 hover:border-gray-500'
                        ]"
                    >
                        {{ preset.name }}
                    </button>
                </div>

                <div class="flex gap-2 mt-1">
                    <button @click="handleCreate" class="flex-1 px-3 py-2 bg-black text-white font-bold rounded-lg text-sm">确定创建</button>
                    <button @click="isCreating = false" class="px-3 py-2 bg-gray-200 font-bold rounded-lg text-sm">取消</button>
                </div>
            </div>
            <button 
                v-else 
                @click="isCreating = true"
                class="w-full py-2 border-2 border-dashed border-gray-400 rounded-lg text-gray-500 font-bold hover:border-black hover:text-black hover:bg-white transition-all flex items-center justify-center gap-2"
            >
                <Plus :size="18" />
                新建存档
            </button>
        </div>
    </div>
  </div>
</template>
