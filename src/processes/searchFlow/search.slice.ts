import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SelectedDestination } from '../../features/geoAutocomplete/model/geoAutocomplete.types'
import type { SearchPricesMap } from '../../shared/api/searchPrices.service'
import { SearchFlowStatuses, type SearchFlowStatus } from '../../shared/model/searchFlowStatus'
import type { HotelsMap } from '../../shared/api/hotels.service'

export type HotelsCacheEntry = {
  data: HotelsMap
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
  timestamp: number // Timestamp for TTL
}

type SearchState = {
  sessionId: string | null
  token: string | null
  waitUntil: string | null
  status: SearchFlowStatus
  error: string | null
  results: SearchPricesMap | null
  criteriaKey: string | null
  cache: Record<string, SearchPricesMap>
  hotelsCache: Record<string, HotelsCacheEntry>
  resolvedCountryId: string | null
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
  hotelsCache: {},
  resolvedCountryId: null,
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    cancelSearch(state) {
      state.status = SearchFlowStatuses.Cancelling
    },
    submitSearch: {
      prepare: (destination: SelectedDestination) => ({
        payload: { destination, sessionId: nextSessionId() },
      }),
      reducer(state, action: PayloadAction<{ destination: SelectedDestination; sessionId: string }>) {
        state.sessionId = action.payload.sessionId
        state.status = SearchFlowStatuses.Loading
        state.error = null
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

    fetchHotelsRequest(state, action: PayloadAction<string>) {
      const countryId = action.payload
      if (!state.hotelsCache[countryId]) {
        state.hotelsCache[countryId] = {
          data: {},
          status: 'loading',
          error: null,
          timestamp: Date.now(),
        };
      } else {
        state.hotelsCache[countryId].status = 'loading'
        state.hotelsCache[countryId].error = null
        state.hotelsCache[countryId].timestamp = Date.now()
      }
    },

    fetchHotelsSuccess(state, action: PayloadAction<{ countryId: string; data: HotelsMap }>) {
      const { countryId, data } = action.payload
      state.hotelsCache[countryId] = {
        data,
        status: 'success',
        error: null,
        timestamp: Date.now(),
      }
    },

    fetchHotelsFailure(state, action: PayloadAction<{ countryId: string; error: string }>) {
      const { countryId, error } = action.payload
      if (state.hotelsCache[countryId]) {
        state.hotelsCache[countryId].status = 'error'
        state.hotelsCache[countryId].error = error
        state.hotelsCache[countryId].timestamp = Date.now()
      }
    },

    setResolvedCountryId(state, action: PayloadAction<string>) {
      state.resolvedCountryId = action.payload
    },

    clearResolvedCountryId(state) {
      state.resolvedCountryId = null
    },

    pruneExpiredHotelsCache(state, action: PayloadAction<{ now: number; ttl: number }>) {
      const { now, ttl } = action.payload
      for (const countryId in state.hotelsCache) {
        if (now - state.hotelsCache[countryId].timestamp > ttl) {
          delete state.hotelsCache[countryId]
        }
      }
    },
  },
})

export const searchActions = searchSlice.actions
export const searchReducer = searchSlice.reducer
