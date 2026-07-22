import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const storedUser = localStorage.getItem('user')

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('token') || null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
}

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      return data.message
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Request failed')
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password })
      return data.message
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Reset failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { token, ...user } = action.payload
        state.user = user
        state.token = token
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { token, ...user } = action.payload
        state.user = user
        state.token = token
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
