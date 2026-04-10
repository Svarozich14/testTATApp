import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { mockApi } from '../../../shared/api/mockApi'
import { readJson, readRejectedResponse } from '../../../shared/api/parse'
import type { CountriesMap } from './country.types'

type CountryState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  errorMessage: string | null
  countriesById: CountriesMap
}

const initialState: CountryState = {
  status: 'idle',
  errorMessage: null,
  countriesById: {},
}

export const fetchCountries = createAsyncThunk<CountriesMap, void>(
  'country/fetchCountries',
  async (_, { rejectWithValue }) => {
    try {
      const resp = await mockApi.getCountries()
      return await readJson<CountriesMap>(resp)
    } catch (e) {
      try {
        const { status, body } = await readRejectedResponse(e)
        return rejectWithValue(body?.message ?? `Failed to load countries (${status}).`)
      } catch {
        return rejectWithValue('Failed to load countries.')
      }
    }
  }
)

const countrySlice = createSlice({
  name: 'country',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.status = 'loading'
        state.errorMessage = null
      })
      .addCase(fetchCountries.fulfilled, (state, action: PayloadAction<CountriesMap>) => {
        state.status = 'success'
        state.countriesById = action.payload
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.status = 'error'
        state.errorMessage = (action.payload as string | undefined) ?? 'Failed to load countries.'
      })
  },
})

export const countryReducer = countrySlice.reducer

