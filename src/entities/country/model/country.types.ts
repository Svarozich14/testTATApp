export type Country = { id: string; name: string; flag: string }
export type CountriesMap = Record<string, Country>

export const CountryLoadStatuses = {
  Idle: 'idle',
  Loading: 'loading',
  Success: 'success',
  Error: 'error',
} as const

export type CountryLoadStatus = (typeof CountryLoadStatuses)[keyof typeof CountryLoadStatuses]

