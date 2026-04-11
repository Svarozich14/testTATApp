import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { countryReducer } from '../entities/country/model/country.slice'
import { geoAutocompleteReducer } from '../features/geoAutocomplete/model/geoAutocomplete.slice'
import { searchReducer } from '../processes/searchFlow/search.slice'
import { rootSaga } from './rootSaga'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: {
    country: countryReducer,
    geoAutocomplete: geoAutocompleteReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
})

sagaMiddleware.run(rootSaga)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

