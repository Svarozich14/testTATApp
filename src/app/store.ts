import { configureStore } from '@reduxjs/toolkit'
import { countryReducer } from '../entities/country/model/country.slice'
import { geoAutocompleteReducer } from '../features/geoAutocomplete/model/geoAutocomplete.slice'

export const store = configureStore({
  reducer: {
    country: countryReducer,
    geoAutocomplete: geoAutocompleteReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

