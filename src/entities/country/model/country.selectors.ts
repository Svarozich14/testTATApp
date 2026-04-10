import type { RootState } from '../../../app/store'

export const selectCountriesById = (s: RootState) => s.country.countriesById
export const selectCountriesStatus = (s: RootState) => s.country.status
export const selectCountriesError = (s: RootState) => s.country.errorMessage

export const selectCountriesList = (s: RootState) =>
  Object.values(selectCountriesById(s)).sort((a, b) => a.name.localeCompare(b.name))

