import { GeoEntityTypes } from '../../features/geoAutocomplete/model/geoAutocomplete.types'
import { mockApi } from '../../shared/api/mockApi'
import { readJson, readRejectedResponse } from '../../shared/api/parse'
import type { SearchDestinationRef } from './search.types'

function messageFromBody(body: unknown): string {
  if (typeof body === 'object' && body && 'message' in body) {
    return String((body as { message?: unknown }).message ?? '')
  }
  return ''
}

async function formatApiFailure(e: unknown): Promise<string> {
  try {
    const { status, body } = await readRejectedResponse(e)
    const msg = messageFromBody(body)
    return msg || `Request failed (${status}).`
  } catch {
    return 'Request failed.'
  }
}

export type ResolveCountryIdResult =
  | { ok: true; countryId: string }
  | { ok: false; error: string }

export async function resolveSearchCountryId(
  destination: SearchDestinationRef
): Promise<ResolveCountryIdResult> {
  if (destination.type === GeoEntityTypes.Country) {
    return { ok: true, countryId: String(destination.id) }
  }

  if (destination.type === GeoEntityTypes.Hotel) {
    try {
      const hotelId = typeof destination.id === 'number' ? destination.id : Number(destination.id)
      const resp = await mockApi.getHotel(Number.isFinite(hotelId) ? hotelId : destination.id)
      const hotel = await readJson<{ countryId?: string | number }>(resp)
      if (hotel.countryId === undefined || hotel.countryId === null) {
        return { ok: false, error: 'Invalid hotel response.' }
      }
      return { ok: true, countryId: String(hotel.countryId) }
    } catch (e) {
      return { ok: false, error: await formatApiFailure(e) }
    }
  }

  if (destination.type !== GeoEntityTypes.City) {
    return { ok: false, error: 'Unsupported destination type.' }
  }

  try {
    const countriesResp = await mockApi.getCountries()
    const countries = await readJson<Record<string, unknown>>(countriesResp)
    for (const countryId of Object.keys(countries)) {
      const hotelsResp = await mockApi.getHotels(countryId)
      const hotels = await readJson<Record<string, { cityId?: number | string }>>(hotelsResp)
      const match = Object.values(hotels).some((h) => String(h.cityId) === String(destination.id))
      if (match) return { ok: true, countryId }
    }
    return { ok: false, error: 'Could not resolve country for the selected city.' }
  } catch (e) {
    return { ok: false, error: await formatApiFailure(e) }
  }
}
