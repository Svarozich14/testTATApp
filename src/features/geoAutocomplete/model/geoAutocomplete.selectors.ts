import type { RootState } from '../../../app/store'

export const selectSelectedDestination = (s: RootState) => s.geoAutocomplete.selected

