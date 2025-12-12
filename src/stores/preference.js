import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const usePreferenceStore = defineStore('preference', () => {
    // --- State ---
    const archives = ref([])
    const activeArchiveId = ref(null)

    // --- Presets ---
    const PRESETS = {
        default: {
            name: '标准 12 格',
            config: {
                theme: 'default',
                title: 'Maimai 歌曲喜好表'
            },
            labels: [
                '入坑曲', '最喜欢', '最近练习',
                '最强', '最弱', '初鸟 (AP)',
                '初FC', '想要AP', '想要FC',
                '听不腻', '推荐曲', '随便填'
            ]
        },
        simple9: {
            name: '九宫格',
            config: {
                theme: 'default',
                title: 'Maimai 九宫格'
            },
            labels: [
                '入坑曲', '最喜欢', '最近练习',
                '最强', '最弱', '初鸟 (AP)',
                '想要AP', '想要FC', '推荐曲'
            ]
        },
        top3: {
            name: 'Top 3',
            config: {
                theme: 'default',
                title: '我的 Top 3'
            },
            labels: [
                'No.1', 'No.2', 'No.3'
            ]
        }
    }

    // --- Initialization & Migration ---
    const init = () => {
        const storedArchives = localStorage.getItem('preference_archives')
        const storedActiveId = localStorage.getItem('preference_active_archive_id')

        // Legacy data
        const oldConfig = localStorage.getItem('generator_config')
        const oldCells = localStorage.getItem('generator_cells')

        if (storedArchives) {
            archives.value = JSON.parse(storedArchives)
            activeArchiveId.value = storedActiveId || (archives.value.length > 0 ? archives.value[0].id : null)
        } else if (oldCells) {
            // Migration
            const parsedConfig = oldConfig ? JSON.parse(oldConfig) : PRESETS.default.config
            const parsedCells = JSON.parse(oldCells)

            const defaultArchive = {
                id: Date.now().toString(),
                name: '默认存档',
                config: parsedConfig,
                cells: parsedCells,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
            archives.value = [defaultArchive]
            activeArchiveId.value = defaultArchive.id
        } else {
            // Fresh start
            createArchive('默认存档', 'default')
        }
    }

    // --- Persistence ---
    watch(archives, (newVal) => {
        localStorage.setItem('preference_archives', JSON.stringify(newVal))
    }, { deep: true })

    watch(activeArchiveId, (newVal) => {
        if (newVal) localStorage.setItem('preference_active_archive_id', newVal)
    })

    // --- Getters ---
    const currentArchive = computed(() => {
        return archives.value.find(a => a.id === activeArchiveId.value) || null
    })

    const config = computed(() => currentArchive.value?.config || {})
    const cells = computed(() => currentArchive.value?.cells || [])

    // --- Actions ---
    const createArchive = (name, presetKey = 'default') => {
        const preset = PRESETS[presetKey] || PRESETS.default
        const newArchive = {
            id: Date.now().toString(),
            name: name || `存档 ${archives.value.length + 1}`,
            config: { ...preset.config },
            cells: preset.labels.map(label => ({ label, song: null })),
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        archives.value.push(newArchive)
        activeArchiveId.value = newArchive.id
        return newArchive.id
    }

    const switchArchive = (id) => {
        if (archives.value.find(a => a.id === id)) {
            activeArchiveId.value = id
        }
    }

    const renameArchive = (id, newName) => {
        const archive = archives.value.find(a => a.id === id)
        if (archive) {
            archive.name = newName
            archive.updatedAt = Date.now()
        }
    }

    const deleteArchive = (id) => {
        if (archives.value.length <= 1) {
            alert('至少保留一个存档')
            return
        }
        const index = archives.value.findIndex(a => a.id === id)
        if (index !== -1) {
            archives.value.splice(index, 1)
            if (activeArchiveId.value === id) {
                activeArchiveId.value = archives.value[0].id
            }
        }
    }

    const updateConfig = (newConfig) => {
        if (currentArchive.value) {
            currentArchive.value.config = { ...currentArchive.value.config, ...newConfig }
            currentArchive.value.updatedAt = Date.now()
        }
    }

    const updateCell = (index, song) => {
        if (currentArchive.value && currentArchive.value.cells[index]) {
            currentArchive.value.cells[index].song = song
            currentArchive.value.updatedAt = Date.now()
        }
    }

    const updateCellLabel = (index, label) => {
        if (currentArchive.value && currentArchive.value.cells[index]) {
            currentArchive.value.cells[index].label = label
            currentArchive.value.updatedAt = Date.now()
        }
    }

    // Initialize immediately
    init()

    return {
        archives,
        activeArchiveId,
        currentArchive,
        config,
        cells,
        PRESETS,
        createArchive,
        switchArchive,
        renameArchive,
        deleteArchive,
        updateConfig,
        updateCell,
        updateCellLabel
    }
})
