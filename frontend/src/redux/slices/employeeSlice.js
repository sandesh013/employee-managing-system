import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/employees', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load employees')
    }
  }
)

export const fetchMyProfile = createAsyncThunk(
  'employees/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/employees/me/profile')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load profile')
    }
  }
)

export const createEmployee = createAsyncThunk(
  'employees/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/employees', payload)
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create employee')
    }
  }
)

export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/employees/${id}`, payload)
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update employee')
    }
  }
)

export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete employee')
    }
  }
)

export const enrollFace = createAsyncThunk(
  'employees/enrollFace',
  async (descriptor, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/employees/me/face', { descriptor })
      return data.message
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to enroll face')
    }
  }
)

export const removeFace = createAsyncThunk(
  'employees/removeFace',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.delete('/employees/me/face')
      return data.message
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove face enrollment')
    }
  }
)

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    list: [],
    count: 0,
    totalPages: 1,
    myProfile: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload.data
        state.count = action.payload.count
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.list.findIndex((e) => e._id === action.payload._id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.myProfile?._id === action.payload._id) state.myProfile = action.payload
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e._id !== action.payload)
      })
  },
})

export default employeeSlice.reducer
