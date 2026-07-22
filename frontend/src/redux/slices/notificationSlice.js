import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/notifications')
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load notifications')
    }
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/notifications/${id}/read`)
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update notification')
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/read-all')
      return true
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update notifications')
    }
  }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload.data
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const idx = state.list.findIndex((n) => n._id === action.payload._id)
        if (idx !== -1) state.list[idx] = action.payload
        state.unreadCount = state.list.filter((n) => !n.isRead).length
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.list = state.list.map((n) => ({ ...n, isRead: true }))
        state.unreadCount = 0
      })
  },
})

export default notificationSlice.reducer
