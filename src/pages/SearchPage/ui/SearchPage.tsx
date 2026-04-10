import styles from './searchPage.module.css'
import { SearchForm } from '../../../features/searchTour/ui/SearchForm'

export function SearchPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Tours search</h1>
      <SearchForm />
    </main>
  )
}

