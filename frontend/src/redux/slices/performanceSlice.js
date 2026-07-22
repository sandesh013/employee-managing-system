import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const createReview = createAsyncThunk(
  'performance/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/performance', payload)
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit review')
    }
  }
)

export const fetchMyReviews = createAsyncThunk(
  'performance/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/performance/me')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load reviews')
    }
  }
)

export const fetchAllReviews = createAsyncThunk(
  'performance/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/performance', { params })
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load reviews')
    }
  }
)

const performanceSlice = createSlice({
  name: 'performance',
  initialState: { mine: [], all: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.mine = action.payload
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.all = action.payload
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.all.unshift(action.payload)
      })
  },
})

export default performanceSlice.reducer
