import { mockApi } from './mockApi'
import { readJson, readRejectedResponse } from './parse'
import type { HotelRecord } from './hotels.service'

export type PriceDetails = {
  id: string
  amount: number
  currency: string
  startDate: string
  endDate: string
}

export type HotelServices = Record<string, string>

export type HotelDetails = HotelRecord & {
  description?: string
  services?: HotelServices
}

function messageFromBody(body: unknown): string {
  if (typeof body === 'object' && body && 'message' in body) {
    return String((body as { message?: unknown }).message ?? '')
  }
  return ''
}

export async function getTourPrice(priceId: string): Promise<PriceDetails> {
  try {
    const resp = await mockApi.getPrice(priceId)
    return await readJson<PriceDetails>(resp)
  } catch (e) {
    if (e instanceof Response) {
      const { status, body } = await readRejectedResponse(e)
      throw new Error(messageFromBody(body) || `Request failed (${status}).`)
    }
    throw e
  }
}

export async function getTourHotel(hotelId: string): Promise<HotelDetails> {
  try {
    const resp = await mockApi.getHotel(Number.isFinite(Number(hotelId)) ? Number(hotelId) : hotelId)
    return await readJson<HotelDetails>(resp)
  } catch (e) {
    if (e instanceof Response) {
      const { status, body } = await readRejectedResponse(e)
      throw new Error(messageFromBody(body) || `Request failed (${status}).`)
    }
    throw e
  }
}
