import axios from 'axios'

const API_BASE = 'https://www.diving-fish.com/api/maimaidxprober'

// Create axios instance
const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
})

// Cache for music data
let musicDataCache = null
let musicMapCache = null

export const fetchMusicData = async () => {
    if (musicDataCache) return musicDataCache

    try {
        const response = await api.get('/music_data')
        musicDataCache = response.data

        // Build a map for easy lookup by ID
        musicMapCache = new Map()
        musicDataCache.forEach(song => {
            musicMapCache.set(song.id, song)
        })

        console.log(`Loaded ${musicDataCache.length} songs`)
        return musicDataCache
    } catch (error) {
        console.error('Failed to fetch music data:', error)
        throw error
    }
}

export const getSongById = (id) => {
    if (!musicMapCache) return null
    return musicMapCache.get(id)
}

export const getCoverUrl = (songId) => {
    let id = parseInt(songId)
    if (id > 10000 && id <= 11000) {
        id -= 10000
    }
    const originalUrl = `https://www.diving-fish.com/covers/${id.toString().padStart(5, '0')}.png`
    // Use weserv.nl as a CORS proxy to enable html2canvas export
    return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}`
}

export const fetchPlayerProfile = async (username) => {
    // The /player/profile endpoint requires login authentication.
    // For public data fetching, we should use /query/player.
    return fetchPlayerRecords(username)
}

// Fetch player records (Supports Import-Token or Username/QQ)
// Docs: https://github.com/Diving-Fish/maimaidx-prober/blob/main/doc/docs/developer/zh-api-document.md
export const fetchPlayerRecords = async (identifier) => {
    // 1. If it's all digits, treat as QQ and use /query/player
    if (/^\d+$/.test(identifier)) {
        return fetchByQuery({ qq: identifier })
    }

    // 2. Try as Import-Token (GET /player/records)
    // This returns full records if successful.
    try {
        const response = await api.get('/player/records', {
            headers: { 'Import-Token': identifier }
        })
        return response.data
    } catch (error) {
        // If 400/401/403, it might be an invalid token, or it might be a username.
        // We fallback to trying it as a username.
        // However, if the identifier is very long (likely a token), we might want to just fail.
        // But for robustness, let's try as username.
        console.warn('Token fetch failed, retrying as username...', error.message)

        try {
            return await fetchByQuery({ username: identifier })
        } catch (queryError) {
            // If both fail, throw the error from the query attempt (or the original one?)
            // The query error is likely more relevant if the user intended to use a username.
            // If the user intended a token, the first error was relevant.
            // Let's throw a combined or generic error.
            throw queryError
        }
    }
}

const fetchByQuery = async (payload) => {
    try {
        const response = await api.post('/query/player', { ...payload, b50: true })
        return response.data
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                throw new Error('用户不存在')
            } else if (error.response.status === 403) {
                throw new Error('用户已设置隐私或未同意用户协议')
            }
        }
        throw error
    }
}
