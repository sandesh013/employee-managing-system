import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const createTask = createAsyncThunk('tasks/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/tasks', payload)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create task')
  }
})

export const fetchMyTasks = createAsyncThunk('tasks/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/tasks/me')
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load tasks')
  }
})

export const fetchAllTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/tasks', { params })
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load tasks')
    }
  }
)

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/tasks/${id}/status`, { status })
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update task')
    }
  }
)

const taskSlice = createSlice({
  name: 'tasks',
  initialState: { mine: [], all: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.mine = action.payload
      })
      .addCase(fetchAllTasks.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.all = action.payload
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.all.unshift(action.payload)
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updateIn = (list) => {
          const idx = list.findIndex((t) => t._id === action.payload._id)
          if (idx !== -1) list[idx] = action.payload
        }
        updateIn(state.mine)
        updateIn(state.all)
      })
  },
})

export default taskSlice.reducer
