import type { UserSummary } from '@models/auth'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

type PersistPayload = {
  accessToken: string
  refreshToken: string
  user: UserSummary
}

function isBrowser() {
  return typeof window !== 'undefined'
}

export function persistAuth(payload: PersistPayload) {
  if (!isBrowser()) return
  window.localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
  window.localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
}

export function clearAuth() {
  if (!isBrowser()) return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function getStoredAuth() {
  if (!isBrowser()) {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    }
  }
  const storedUser = window.localStorage.getItem(USER_KEY)
  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY)
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY)
  const user = storedUser ? (JSON.parse(storedUser) as UserSummary) : null
  const isAuthenticated = Boolean(accessToken && refreshToken && user)
  return { user, accessToken, refreshToken, isAuthenticated }
}

export function getRefreshToken() {
  if (!isBrowser()) return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function updateTokens(accessToken: string, refreshToken: string) {
  if (!isBrowser()) return
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

