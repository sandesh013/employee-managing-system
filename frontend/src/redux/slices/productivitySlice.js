import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchMyProductivity = createAsyncThunk(
  'productivity/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/analytics/productivity/me')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load productivity score')
    }
  }
)

export const fetchAllProductivity = createAsyncThunk(
  'productivity/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/analytics/productivity')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load productivity scores')
    }
  }
)

const productivitySlice = createSlice({
  name: 'productivity',
  initialState: { mine: null, all: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProductivity.fulfilled, (state, action) => {
        state.mine = action.payload
      })
      .addCase(fetchAllProductivity.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllProductivity.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.all = action.payload
      })
  },
})

export default productivitySlice.reducer
