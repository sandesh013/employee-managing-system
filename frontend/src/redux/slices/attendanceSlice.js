import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const checkIn = createAsyncThunk('attendance/checkIn', async (payload = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/attendance/check-in', payload)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Check-in failed')
  }
})

export const checkOut = createAsyncThunk('attendance/checkOut', async (payload = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/attendance/check-out', payload)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Check-out failed')
  }
})

export const fetchMyAttendance = createAsyncThunk(
  'attendance/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/attendance/me')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load attendance')
    }
  }
)

export const fetchTeamAttendance = createAsyncThunk(
  'attendance/fetchTeam',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/attendance', { params })
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load team attendance')
    }
  }
)

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: { myRecords: [], teamRecords: [], today: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkIn.fulfilled, (state, action) => {
        state.today = action.payload
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.today = action.payload
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.myRecords = action.payload
        state.today = action.payload.find(
          (r) => r.date === new Date().toISOString().split('T')[0]
        ) || null
      })
      .addCase(fetchTeamAttendance.fulfilled, (state, action) => {
        state.teamRecords = action.payload
      })
  },
})

export default attendanceSlice.reducer
