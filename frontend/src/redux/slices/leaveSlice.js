import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const applyLeave = createAsyncThunk('leaves/apply', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/leaves', payload)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to apply for leave')
  }
})

export const fetchMyLeaves = createAsyncThunk('leaves/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/leaves/me')
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load leaves')
  }
})

export const fetchAllLeaves = createAsyncThunk(
  'leaves/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/leaves', { params })
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load leave requests')
    }
  }
)

export const updateLeaveStatus = createAsyncThunk(
  'leaves/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/leaves/${id}/status`, { status })
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update leave status')
    }
  }
)

const leaveSlice = createSlice({
  name: 'leaves',
  initialState: { mine: [], all: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.mine.unshift(action.payload)
      })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.mine = action.payload
      })
      .addCase(fetchAllLeaves.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.all = action.payload
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        const idx = state.all.findIndex((l) => l._id === action.payload._id)
        if (idx !== -1) state.all[idx] = action.payload
      })
  },
})

export default leaveSlice.reducer
