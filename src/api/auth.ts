import httpClient from './httpClient'
import type { LoginPayload, LoginResponse } from '@models/auth'

export async function login(payload: LoginPayload) {
  const { data } = await httpClient.post<LoginResponse>('auth/login', payload)
  return data
}

