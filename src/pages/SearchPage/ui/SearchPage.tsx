import { useAppDispatch, useAppSelector } from '../../../shared/hooks/storeHooks'
import { SearchForm } from '../../../features/searchTour/ui/SearchForm'
import { searchActions } from '../../../processes/searchFlow/search.slice'
import {
  selectSearchError,
  selectSearchResultsEmpty,
  selectSearchStatus,
} from '../../../processes/searchFlow/search.selectors'
import styles from './searchPage.module.css'

export function SearchPage() {
  const dispatch = useAppDispatch()
  const searchStatus = useAppSelector(selectSearchStatus)
  const searchError = useAppSelector(selectSearchError)
  const resultsEmpty = useAppSelector(selectSearchResultsEmpty)

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Tours search</h1>
      <SearchForm
        searchStatus={searchStatus}
        searchError={searchError}
        resultsEmpty={resultsEmpty}
        onStartSearch={(destination) => dispatch(searchActions.submitSearch(destination))}
      />
    </main>
  )
}
