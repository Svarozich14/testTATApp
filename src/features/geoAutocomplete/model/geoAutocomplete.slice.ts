import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SelectedDestination } from './geoAutocomplete.types'

type GeoAutocompleteState = {
  selected: SelectedDestination | null
}

const initialState: GeoAutocompleteState = {
  selected: null,
}

const geoAutocompleteSlice = createSlice({
  name: 'geoAutocomplete',
  initialState,
  reducers: {
    setSelectedDestination(state, action: PayloadAction<SelectedDestination | null>) {
      state.selected = action.payload
    },
  },
})

export const geoAutocompleteActions = geoAutocompleteSlice.actions
export const geoAutocompleteReducer = geoAutocompleteSlice.reducer

