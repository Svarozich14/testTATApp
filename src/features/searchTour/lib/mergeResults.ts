import type { SearchPricesMap } from '../../../shared/api/searchPrices.service'
import type { HotelsMap } from '../../../shared/api/hotels.service'

export interface MergedResult {
  priceId: string
  hotelId: string
  amount: number
  currency: string
  startDate: string
  endDate: string
  hotelName: string
  hotelImg: string
  city: string
  country: string
}

export function mergeResults(prices: SearchPricesMap, hotels: HotelsMap): MergedResult[] {
  return Object.values(prices).map((price) => {
    const hotel = hotels[String(price.hotelID)]
    return {
      priceId: price.id,
      hotelId: String(price.hotelID ?? ''),
      amount: price.amount,
      currency: price.currency,
      startDate: price.startDate,
      endDate: price.endDate,
      hotelName: hotel?.name ?? 'Unknown hotel',
      hotelImg: hotel?.img ?? '',
      city: hotel?.cityName ?? '',
      country: hotel?.countryName ?? '',
    }
  })
}