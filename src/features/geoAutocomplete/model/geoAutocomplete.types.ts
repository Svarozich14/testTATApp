export const GeoEntityTypes = {
  Country: 'country',
  City: 'city',
  Hotel: 'hotel',
} as const

export type GeoEntityType = (typeof GeoEntityTypes)[keyof typeof GeoEntityTypes]

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
