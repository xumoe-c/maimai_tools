import CryptoJS from 'crypto-js'
import Cookies from 'js-cookie'

const SECRET_KEY = 'maimai-tools-secret-key' // In a real app, this should be more secure or user-provided
const COOKIE_KEY = 'maimai_dx_token'

export const saveToken = (token) => {
    if (!token) return
    const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString()
    Cookies.set(COOKIE_KEY, encrypted, { expires: 365, secure: true, sameSite: 'Strict' })
}

export const getToken = () => {
    const encrypted = Cookies.get(COOKIE_KEY)
    if (!encrypted) return null
    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
        return bytes.toString(CryptoJS.enc.Utf8)
    } catch (e) {
        console.error('Failed to decrypt token', e)
        return null
    }
}

export const removeToken = () => {
    Cookies.remove(COOKIE_KEY)
}
