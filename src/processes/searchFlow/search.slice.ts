import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SelectedDestination } from '../../features/geoAutocomplete/model/geoAutocomplete.types'
import type { SearchPricesMap } from '../../shared/api/searchPrices.service'
import { SearchFlowStatuses, type SearchFlowStatus } from '../../shared/model/searchFlowStatus'

type SearchState = {
  sessionId: string | null
  token: string | null
  waitUntil: string | null
  status: SearchFlowStatus
  error: string | null
  results: SearchPricesMap | null
  criteriaKey: string | null
  cache: Record<string, SearchPricesMap>
}

function nextSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const initialState: SearchState = {
  sessionId: null,
  token: null,
  waitUntil: null,
  status: SearchFlowStatuses.Idle,
  error: null,
  results: null,
  criteriaKey: null,
  cache: {},
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    submitSearch: {
      prepare: (destination: SelectedDestination) => ({
        payload: { destination, sessionId: nextSessionId() },
      }),
      reducer(state, action: PayloadAction<{ destination: SelectedDestination; sessionId: string }>) {
        state.sessionId = action.payload.sessionId
        state.status = SearchFlowStatuses.Loading
        state.error = null
        state.token = null
        state.waitUntil = null
        state.results = null
        state.criteriaKey = null
      },
    },
    searchAwaitingPoll(
      state,
      action: PayloadAction<{
        sessionId: string
        token: string
        waitUntil: string
        criteriaKey: string
      }>
    ) {
      if (state.sessionId !== action.payload.sessionId) return
      state.token = action.payload.token
      state.waitUntil = action.payload.waitUntil
      state.criteriaKey = action.payload.criteriaKey
      state.status = SearchFlowStatuses.Polling
    },
    searchSucceeded(
      state,
      action: PayloadAction<{ sessionId: string; criteriaKey: string; results: SearchPricesMap }>
    ) {
      if (state.sessionId !== action.payload.sessionId) return
      state.status = SearchFlowStatuses.Success
      state.error = null
      state.results = action.payload.results
      state.cache[action.payload.criteriaKey] = action.payload.results
    },
    searchFromCache(
      state,
      action: PayloadAction<{ sessionId: string; criteriaKey: string; results: SearchPricesMap }>
    ) {
      if (state.sessionId !== action.payload.sessionId) return
      state.status = SearchFlowStatuses.Success
      state.error = null
      state.results = action.payload.results
      state.criteriaKey = action.payload.criteriaKey
    },
    searchFailed(state, action: PayloadAction<{ sessionId: string; message: string }>) {
      if (state.sessionId !== action.payload.sessionId) return
      state.status = SearchFlowStatuses.Error
      state.error = action.payload.message
    },
  },
})

export const searchActions = searchSlice.actions
export const searchReducer = searchSlice.reducer
