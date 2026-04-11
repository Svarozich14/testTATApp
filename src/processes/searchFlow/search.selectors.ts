import type { RootState } from '../../app/store'
import { SearchFlowStatuses } from '../../shared/model/searchFlowStatus'

export const selectSearchStatus = (s: RootState) => s.search.status
export const selectSearchError = (s: RootState) => s.search.error
export const selectSearchResultsEmpty = (s: RootState) =>
  s.search.status === SearchFlowStatuses.Success &&
  s.search.results !== null &&
  Object.keys(s.search.results).length === 0
