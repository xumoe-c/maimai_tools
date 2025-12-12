import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useReviewStore = defineStore('review', () => {
    // --- State ---
    const archives = ref([])
    const activeArchiveId = ref(null)
    const currentMode = ref('table') // 'table' | 'card'

    // --- Initialization & Migration ---
    const init = () => {
        const storedArchives = localStorage.getItem('review_archives')
        const storedActiveId = localStorage.getItem('review_active_archive_id')
        const oldStoredReviews = localStorage.getItem('review_list')

        if (storedArchives) {
            archives.value = JSON.parse(storedArchives)
            activeArchiveId.value = storedActiveId || (archives.value.length > 0 ? archives.value[0].id : null)
        } else if (oldStoredReviews) {
            // Migration from old version
            const oldReviews = JSON.parse(oldStoredReviews)
            const defaultArchive = {
                id: Date.now().toString(),
                name: '默认存档',
                reviews: oldReviews,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
            archives.value = [defaultArchive]
            activeArchiveId.value = defaultArchive.id
        } else {
            // Fresh start
            const defaultArchive = {
                id: Date.now().toString(),
                name: '默认存档',
                reviews: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
            archives.value = [defaultArchive]
            activeArchiveId.value = defaultArchive.id
        }
    }

    init()

    // --- Persistence ---
    watch(archives, (newVal) => {
        localStorage.setItem('review_archives', JSON.stringify(newVal))
    }, { deep: true })

    watch(activeArchiveId, (newVal) => {
        if (newVal) localStorage.setItem('review_active_archive_id', newVal)
    })

    // --- Getters ---
    const currentArchive = computed(() => {
        return archives.value.find(a => a.id === activeArchiveId.value) || null
    })

    const reviews = computed(() => {
        return currentArchive.value ? currentArchive.value.reviews : []
    })

    // --- Actions: Archive Management ---
    const createArchive = (name) => {
        const newArchive = {
            id: Date.now().toString(),
            name: name || `存档 ${archives.value.length + 1}`,
            reviews: [],
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
            // If we deleted the active archive, switch to another one
            if (activeArchiveId.value === id) {
                activeArchiveId.value = archives.value[0].id
            }
        }
    }

    // --- Actions: Review Management (Operates on Active Archive) ---
    const touchArchive = () => {
        if (currentArchive.value) {
            currentArchive.value.updatedAt = Date.now()
        }
    }

    const addReview = (review) => {
        if (!currentArchive.value) return
        if (!review.id) review.id = Date.now()
        currentArchive.value.reviews.push(review)
        touchArchive()
    }

    const removeReview = (id) => {
        if (!currentArchive.value) return
        const index = currentArchive.value.reviews.findIndex(r => r.id === id)
        if (index !== -1) {
            currentArchive.value.reviews.splice(index, 1)
            touchArchive()
        }
    }

    const updateReview = (id, updatedFields) => {
        if (!currentArchive.value) return
        const index = currentArchive.value.reviews.findIndex(r => r.id === id)
        if (index !== -1) {
            currentArchive.value.reviews[index] = { ...currentArchive.value.reviews[index], ...updatedFields }
            touchArchive()
        }
    }

    const clearReviews = () => {
        if (!currentArchive.value) return
        currentArchive.value.reviews = []
        touchArchive()
    }

    return {
        archives,
        activeArchiveId,
        currentArchive,
        reviews,
        currentMode,
        createArchive,
        switchArchive,
        renameArchive,
        deleteArchive,
        addReview,
        removeReview,
        updateReview,
        clearReviews
    }
})
