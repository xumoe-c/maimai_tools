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

export const fetchMusicData = async (forceRefresh = false) => {
    // 1. Try memory cache
    if (!forceRefresh && musicDataCache) return musicDataCache

    // 2. Try localStorage cache
    if (!forceRefresh) {
        const stored = localStorage.getItem('maimai_music_data')
        if (stored) {
            try {
                musicDataCache = JSON.parse(stored)
                buildMusicMap()
                console.log(`Loaded ${musicDataCache.length} songs from localStorage`)
                return musicDataCache
            } catch (e) {
                console.error('Failed to parse stored music data', e)
                localStorage.removeItem('maimai_music_data')
            }
        }
    }

    // 3. Fetch from API
    try {
        const response = await api.get('/music_data')
        musicDataCache = response.data

        // Save to localStorage
        localStorage.setItem('maimai_music_data', JSON.stringify(musicDataCache))

        buildMusicMap()
        console.log(`Loaded ${musicDataCache.length} songs from API`)
        return musicDataCache
    } catch (error) {
        console.error('Failed to fetch music data:', error)
        throw error
    }
}

const buildMusicMap = () => {
    if (!musicDataCache) return
    musicMapCache = new Map()
    musicDataCache.forEach(song => {
        musicMapCache.set(song.id, song)
    })
}

export const clearMusicCache = () => {
    musicDataCache = null
    musicMapCache = null
    localStorage.removeItem('maimai_music_data')
}

export const getSongById = (id) => {
    if (!musicMapCache) return null
    // Try exact match
    if (musicMapCache.has(id)) return musicMapCache.get(id)
    // Try string match
    if (musicMapCache.has(String(id))) return musicMapCache.get(String(id))
    // Try number match
    const numId = Number(id)
    if (!isNaN(numId) && musicMapCache.has(numId)) return musicMapCache.get(numId)

    return null
}

export const getCoverUrl = (songId) => {
    // Use local static resources from EasyMai
    // The static folder is configured as publicDir in vite.config.js
    // Images are in /maicover/ folder with .jpg extension
    const id = parseInt(songId)
    return `/maicover/${id}.jpg`
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

// Cache for alias data
let aliasMapCache = null

export const fetchAllAliases = async () => {
    if (aliasMapCache) return aliasMapCache

    try {
        const response = await axios.get('https://www.yuzuchan.moe/api/maimaidx/maimaidxalias')
        const aliases = response.data.content
        aliasMapCache = new Map()
        aliases.forEach(item => {
            if (item.Alias) {
                // Ensure SongID is stored as Number to match musicData
                aliasMapCache.set(Number(item.SongID), item.Alias)
            }
        })
        return aliasMapCache
    } catch (error) {
        console.error('Failed to fetch aliases:', error)
        return new Map() // Return empty map on failure
    }
}

export const fetchSongAliases = async (songId) => {
    try {
        // Use Yuzu API for aliases as Diving Fish doesn't provide one publicly
        const response = await axios.get(`https://www.yuzuchan.moe/api/maimaidx/getsongsalias`, {
            params: { song_id: songId }
        })

        if (response.data && response.data.content && response.data.content.Alias) {
            return response.data.content.Alias
        }
        return []
    } catch (error) {
        console.warn('Failed to fetch aliases', error)
        return []
    }
}

// Cache for chart stats
let chartStatsCache = null

export const fetchChartStats = async () => {
    if (chartStatsCache) return chartStatsCache

    try {
        const response = await api.get('/chart_stats')
        chartStatsCache = response.data
        return chartStatsCache
    } catch (error) {
        console.warn('Failed to fetch chart stats', error)
        return {}
    }
}
