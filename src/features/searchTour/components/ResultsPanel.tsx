import { useMemo } from 'react'
import { useAppSelector } from '../../../shared/hooks/storeHooks'
import { SearchFlowStatuses } from '../../../shared/model/searchFlowStatus'
import {
  selectResolvedCountryId,
  selectSearchError,
  selectSearchStatus,
} from '../../../processes/searchFlow/search.selectors'
import { selectHotelsError, selectHotelsLoading } from '../../../entities/hotel/selectors'
import { makeSelectMergedResults } from '../lib/selectors'
import PriceCard from './PriceCard'
import './ResultsPanel.css'

export default function ResultsPanel() {
  const countryId = useAppSelector(selectResolvedCountryId)
  const searchStatus = useAppSelector(selectSearchStatus)
  const searchError = useAppSelector(selectSearchError)
  const selectMerged = useMemo(makeSelectMergedResults, [])
  const mergedResults = useAppSelector((state) =>
    countryId ? selectMerged(state, countryId) : []
  )
  const hotelsLoading = useAppSelector((state) =>
    countryId ? selectHotelsLoading(state, countryId) : false
  )
  const hotelsError = useAppSelector((state) =>
    countryId ? selectHotelsError(state, countryId) : null
  )

  const isSearchLoading =
    searchStatus === SearchFlowStatuses.Loading || searchStatus === SearchFlowStatuses.Polling
  const isLoading = isSearchLoading || hotelsLoading
  const error = searchError ?? hotelsError
  const isSuccess = searchStatus === SearchFlowStatuses.Success

  if (!countryId && searchStatus === SearchFlowStatuses.Idle) return null

  return (
    <section className="results-panel" aria-live="polite">
      {isLoading ? <div className="results-panel__state">Завантаження результатів…</div> : null}
      {!isLoading && error ? <div className="results-panel__error">{error}</div> : null}
      {!isLoading && !error && isSuccess && mergedResults.length === 0 ? (
        <div className="results-panel__state">За вашим запитом турів не знайдено</div>
      ) : null}

      {!isLoading && !error && mergedResults.length > 0 ? (
        <div className="results-panel__grid">
          {mergedResults.map((result) => (
            <PriceCard
              key={result.priceId}
              hotelName={result.hotelName}
              country={result.country}
              city={result.city}
              startDate={result.startDate}
              amount={result.amount}
              currency={result.currency}
              imageUrl={result.hotelImg}
              priceId={result.priceId}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
