import axios from 'axios'
import httpClient from './httpClient'
import type { LoginPayload, LoginResponse, RefreshTokenResponse } from '@models/auth'

export async function login(payload: LoginPayload) {
  const { data } = await httpClient.post<LoginResponse>('auth/login', payload)
  return data
}

export async function refreshTokenRequest(refreshToken: string) {
  const baseURL = import.meta.env.VITE_API_BASE_URL || ''
  const { data } = await axios.post<RefreshTokenResponse>(
    `${baseURL}auth/refresh`,
    { refreshToken },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  )
  if (!data.success) {
    throw new Error(data.error.message)
  }
  return data.data
}

