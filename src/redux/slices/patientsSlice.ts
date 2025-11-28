import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { GetPatientsParams } from '@api/patients'

type PatientsState = {
  search: string
  filters: GetPatientsParams
  currentPage: number
}

const DEFAULT_FILTERS: GetPatientsParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

const initialState: PatientsState = {
  search: '',
  filters: DEFAULT_FILTERS,
  currentPage: 1,
}

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    setFilters(state, action: PayloadAction<GetPatientsParams>) {
      state.filters = action.payload
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload
    },
    clearAllFilters(state) {
      state.search = ''
      state.filters = DEFAULT_FILTERS
      state.currentPage = 1
    },
  },
})

export const { setSearch, setFilters, setCurrentPage, clearAllFilters } = patientsSlice.actions
export default patientsSlice.reducer

