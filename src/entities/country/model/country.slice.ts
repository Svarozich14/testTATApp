import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { mockApi } from '../../../shared/api/mockApi'
import { readJson, readRejectedResponse } from '../../../shared/api/parse'
import { CountryLoadStatuses, type CountriesMap, type CountryLoadStatus } from './country.types'

type CountryState = {
  status: CountryLoadStatus
  errorMessage: string | null
  countriesById: CountriesMap
}

const initialState: CountryState = {
  status: CountryLoadStatuses.Idle,
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
        const msg =
          typeof body === 'object' && body && 'message' in body
            ? String((body as { message?: unknown }).message ?? '')
            : ''
        return rejectWithValue(msg || `Failed to load countries (${status}).`)
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
        state.status = CountryLoadStatuses.Loading
        state.errorMessage = null
      })
      .addCase(fetchCountries.fulfilled, (state, action: PayloadAction<CountriesMap>) => {
        state.status = CountryLoadStatuses.Success
        state.countriesById = action.payload
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.status = CountryLoadStatuses.Error
        state.errorMessage = (action.payload as string | undefined) ?? 'Failed to load countries.'
      })
  },
})

export const countryReducer = countrySlice.reducer

