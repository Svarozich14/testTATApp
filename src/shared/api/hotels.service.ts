import { mockApi } from './mockApi'
import { readJson, readRejectedResponse } from './parse'

export type HotelRecord = {
  id: number
  name: string
  img: string
  cityId: number
  cityName: string
  countryId: string
  countryName: string
}

export type HotelsMap = Record<string, HotelRecord>

function messageFromBody(body: unknown): string {
  if (typeof body === 'object' && body && 'message' in body) {
    return String((body as { message?: unknown }).message ?? '')
  }
  return ''
}

export async function getHotelsByCountry(countryId: string): Promise<HotelsMap> {
  try {
    const resp = await mockApi.getHotels(countryId)
    const hotels = await readJson<HotelsMap>(resp)
    return hotels
  } catch (e) {
    if (e instanceof Response) {
      const { status, body } = await readRejectedResponse(e)
      throw new Error(messageFromBody(body) || `Request failed (${status}).`)
    }
    throw e
  }
}