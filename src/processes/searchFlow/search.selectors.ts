import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export const selectSearchState = (state: RootState) => state.search

export const selectSearchStatus = createSelector(selectSearchState, (search) => search.status)
export const selectSearchError = createSelector(selectSearchState, (search) => search.error)
export const selectSearchResults = createSelector(selectSearchState, (search) => search.results)
export const selectResolvedCountryId = createSelector(
  selectSearchState,
  (search) => search.resolvedCountryId
)

export const selectSearchResultsEmpty = createSelector(selectSearchResults, (results) => {
  if (!results) return false
  return Object.keys(results).length === 0
})
