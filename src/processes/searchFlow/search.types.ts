import type { GeoEntityType } from '../../features/geoAutocomplete/model/geoAutocomplete.types'

export type SearchDestinationRef = {
  id: string | number
  type: GeoEntityType
}

export function makeSearchCriteriaKey(countryId: string, destination: SearchDestinationRef): string {
  return `${countryId}:${destination.type}:${destination.id}`
}
