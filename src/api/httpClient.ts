import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

const httpClient = axios.create({
  baseURL,
})

httpClient.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default httpClient

