export type GeoEntityType = 'country' | 'city' | 'hotel'

export type GeoEntity = {
  id: string | number
  name: string
  type: GeoEntityType
  // countries from getCountries() provide flag; searchGeo() countries may not
  flag?: string
}

export type SelectedDestination = {
  id: string | number
  type: GeoEntityType
  label: string
}

