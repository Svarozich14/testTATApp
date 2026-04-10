import { useState } from 'react'
import { useAppSelector } from '../../../shared/hooks/storeHooks'
import { selectSelectedDestination } from '../../geoAutocomplete/model/geoAutocomplete.selectors'
import { GeoInput } from '../../geoAutocomplete/ui/GeoInput'
import styles from './searchForm.module.css'

export function SearchForm() {
  const selected = useAppSelector(selectSelectedDestination)
  const [error, setError] = useState<string | null>(null)

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
        alert(`Submitted: ${selected.label} (${selected.type})`)
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
    </form>
  )
}

