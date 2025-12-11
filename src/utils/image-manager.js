import { reactive } from 'vue'

// Store image loading states
const state = reactive({
    failedUrls: new Set()
})

// Default Cover (Use local static file)
export const DEFAULT_COVER = '/default_cover.jpg'

/**
 * Mark a URL as failed to prevent future requests
 * @param {string} url 
 */
export const markAsFailed = (url) => {
    if (url && !state.failedUrls.has(url)) {
        state.failedUrls.add(url)
    }
}

/**
 * Get the URL or fallback if it has failed previously
 * @param {string} originalUrl 
 * @returns {string}
 */
export const getCoverUrlWithFallback = (originalUrl) => {
    if (!originalUrl) return DEFAULT_COVER
    if (state.failedUrls.has(originalUrl)) {
        return DEFAULT_COVER
    }
    return originalUrl
}
