import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchSummary = createAsyncThunk(
  'analytics/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/analytics/summary')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load analytics')
    }
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { summary: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.summary = action.payload
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export default analyticsSlice.reducer
