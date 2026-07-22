import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchDepartments = createAsyncThunk(
  'departments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/departments')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load departments')
    }
  }
)

export const createDepartment = createAsyncThunk(
  'departments/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/departments', payload)
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create department')
    }
  }
)

export const updateDepartment = createAsyncThunk(
  'departments/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/departments/${id}`, payload)
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update department')
    }
  }
)

export const deleteDepartment = createAsyncThunk(
  'departments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/departments/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete department')
    }
  }
)

const departmentSlice = createSlice({
  name: 'departments',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.list.push(action.payload)
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const idx = state.list.findIndex((d) => d._id === action.payload._id)
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload }
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.list = state.list.filter((d) => d._id !== action.payload)
      })
  },
})

export default departmentSlice.reducer
