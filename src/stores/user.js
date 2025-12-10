import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { saveToken, getToken, removeToken } from '@/utils/storage'
import { fetchPlayerRecords } from '@/services/diving-fish'

export const useUserStore = defineStore('user', () => {
    // State
    const token = ref(getToken() || '')

    // Load initial state from localStorage if available
    const storedProfile = localStorage.getItem('maimai_profile')
    const storedRecords = localStorage.getItem('maimai_records')

    const profile = ref(storedProfile ? JSON.parse(storedProfile) : {
        nickname: '',
        rating: 0,
        title: '', // 称号
        course_rank: 0, // 段位
        class_rank: 0, // 阶级
    })

    const records = ref(storedRecords ? JSON.parse(storedRecords) : []) // Store user records
    const isLoading = ref(false)
    const error = ref(null)

    // Getters
    const isAuthenticated = computed(() => !!token.value && !!profile.value.nickname)

    // Actions
    const setToken = (newToken) => {
        token.value = newToken
        saveToken(newToken)
    }

    const clearUser = () => {
        token.value = ''
        profile.value = { nickname: '', rating: 0, title: '', course_rank: 0, class_rank: 0 }
        records.value = []
        removeToken()
        localStorage.removeItem('maimai_profile')
        localStorage.removeItem('maimai_records')
    }

    const fetchProfile = async () => {
        if (!token.value) return

        isLoading.value = true
        error.value = null

        try {
            const data = await fetchPlayerRecords(token.value)
            if (data) {
                // Diving Fish API structure adaptation
                profile.value = {
                    nickname: data.nickname || data.username || '',
                    rating: data.rating || 0,
                    title: data.plate || '',
                }

                // Handle B50 data structure
                if (data.charts) {
                    records.value = [...(data.charts.dx || []), ...(data.charts.sd || [])]
                } else if (Array.isArray(data.records)) {
                    records.value = data.records
                } else {
                    records.value = []
                }

                // Save to localStorage
                localStorage.setItem('maimai_profile', JSON.stringify(profile.value))
                localStorage.setItem('maimai_records', JSON.stringify(records.value))

                return true
            }
        } catch (err) {
            console.error(err)
            error.value = err.message || '获取数据失败，请检查用户名或QQ号'
            return false
        } finally {
            isLoading.value = false
        }
    }

    return {
        token,
        profile,
        records,
        isLoading,
        error,
        isAuthenticated,
        setToken,
        clearUser,
        fetchProfile
    }
})
