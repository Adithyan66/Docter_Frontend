import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login } from '@api/auth'
import type { LoginPayload, UserSummary } from '@models/auth'
import { clearAuth, getStoredAuth, persistAuth } from '@utils/storage'

type AuthState = {
  user: UserSummary | null
  isAuthenticated: boolean
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const persisted = getStoredAuth()

const initialState: AuthState = {
  user: persisted.user,
  isAuthenticated: persisted.isAuthenticated,
  status: 'idle',
  error: null,
}

export const loginUser = createAsyncThunk<
  UserSummary,
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const response = await login(payload)
    if (!response.success) {
      return rejectWithValue(response.error.message)
    }
    persistAuth({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      user: response.data.user,
    })
    return response.data.user
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message)
    }
    return rejectWithValue('Unable to login')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      state.status = 'idle'
      state.error = null
      clearAuth()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload ?? 'Unable to login'
        state.user = null
        state.isAuthenticated = false
        clearAuth()
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer

