import { useState } from 'react'
import { useAppSelector } from '../../../shared/hooks/storeHooks'
import type { SelectedDestination } from '../../geoAutocomplete/model/geoAutocomplete.types'
import { selectSelectedDestination } from '../../geoAutocomplete/model/geoAutocomplete.selectors'
import { GeoInput } from '../../geoAutocomplete/ui/GeoInput'
import { SearchFlowStatuses, type SearchFlowStatus } from '../../../shared/model/searchFlowStatus'
import styles from './searchForm.module.css'

export type SearchFormProps = {
  searchStatus: SearchFlowStatus
  searchError: string | null
  resultsEmpty: boolean
  onStartSearch: (destination: SelectedDestination) => void
}

export function SearchForm({ searchStatus, searchError, resultsEmpty, onStartSearch }: SearchFormProps) {
  const selected = useAppSelector(selectSelectedDestination)
  const [error, setError] = useState<string | null>(null)

  const showSearchLoading =
    searchStatus === SearchFlowStatuses.Loading || searchStatus === SearchFlowStatuses.Polling

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        if (!selected) {
          setError('Please choose a destination.')
          return
        }
        setError(null)
        onStartSearch(selected)
      }}
    >
      <div className={styles.card}>
        <div className={styles.field}>
          <GeoInput />
          {error ? <div className={styles.error}>{error}</div> : null}
        </div>

        <button className={styles.submit} type="submit">
          Знайти
        </button>
      </div>

      {showSearchLoading ? (
        <div className={styles.stateBox} role="status" aria-live="polite">
          Пошук турів…
        </div>
      ) : null}
      {searchStatus === SearchFlowStatuses.Error && searchError ? (
        <div className={styles.stateError} role="alert">
          {searchError}
        </div>
      ) : null}
      {resultsEmpty ? (
        <div className={styles.stateBox} role="status">
          За вашим запитом турів не знайдено
        </div>
      ) : null}
    </form>
  )
}
