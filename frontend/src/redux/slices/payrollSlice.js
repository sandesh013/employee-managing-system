import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const generatePayroll = createAsyncThunk(
  'payroll/generate',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/payroll', payload)
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to generate payslip')
    }
  }
)

export const fetchMyPayroll = createAsyncThunk('payroll/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/payroll/me')
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load payslips')
  }
})

export const fetchAllPayroll = createAsyncThunk(
  'payroll/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/payroll', { params })
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load payroll records')
    }
  }
)

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: { mine: [], all: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPayroll.fulfilled, (state, action) => {
        state.mine = action.payload
      })
      .addCase(fetchAllPayroll.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllPayroll.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.all = action.payload
      })
      .addCase(generatePayroll.fulfilled, (state, action) => {
        state.all.unshift(action.payload)
      })
      .addCase(generatePayroll.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export default payrollSlice.reducer
