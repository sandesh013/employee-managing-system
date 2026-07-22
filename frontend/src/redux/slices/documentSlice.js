import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Upload failed')
    }
  }
)

export const fetchMyDocuments = createAsyncThunk(
  'documents/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/documents/me')
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load documents')
    }
  }
)

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/documents/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete document')
    }
  }
)

const documentSlice = createSlice({
  name: 'documents',
  initialState: { mine: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyDocuments.fulfilled, (state, action) => {
        state.mine = action.payload
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.mine.unshift(action.payload)
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.mine = state.mine.filter((d) => d._id !== action.payload)
      })
  },
})

export default documentSlice.reducer
