import axios from 'axios'
import { refreshTokenRequest } from './auth'
import { getRefreshToken, updateTokens, clearAuth } from '@utils/storage'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

const httpClient = axios.create({
  baseURL,
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (error?: any) => void
}> = []

let logoutCallback: (() => void) | null = null

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback
}

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

httpClient.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return httpClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        clearAuth()
        if (logoutCallback) {
          logoutCallback()
        }
        processQueue(error, null)
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const response = await refreshTokenRequest(refreshToken)
        const { accessToken, refreshToken: newRefreshToken } = response

        updateTokens(accessToken, newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        processQueue(null, accessToken)

        return httpClient(originalRequest)
      } catch (refreshError) {
        clearAuth()
        if (logoutCallback) {
          logoutCallback()
        }
        processQueue(refreshError, null)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response && [403].includes(error.response.status)) {
      console.warn('Auth error:', error.response.status)
    }

    return Promise.reject(error)
  }
)

export default httpClient

