import type { SelectedDestination } from '../../features/geoAutocomplete/model/geoAutocomplete.types'

export type SearchDestinationRef = {
  id: string | number
  type: SelectedDestination['type']
}

export function makeSearchCriteriaKey(
  countryId: string,
  destination: SearchDestinationRef
): string {
  return `${countryId}:${destination.type}:${String(destination.id)}`
}