import { mockApi } from './mockApi'
import { readJson, readRejectedResponse } from './parse'

export type SearchPriceRecord = {
  id: string
  amount: number
  currency: string
  startDate: string
  endDate: string
  hotelID: string | number
}

export type SearchPricesMap = Record<string, SearchPriceRecord>

export type StartSearchOk = { token: string; waitUntil: string }

export type GetSearchPricesOutcome =
  | { kind: 'success'; prices: SearchPricesMap }
  | { kind: 'not_ready'; waitUntil: string }
  | { kind: 'fatal'; message: string }

function messageFromBody(body: unknown): string {
  if (typeof body === 'object' && body && 'message' in body) {
    return String((body as { message?: unknown }).message ?? '')
  }
  return ''
}

function waitUntilFromBody(body: unknown): string | null {
  if (typeof body === 'object' && body && 'waitUntil' in body) {
    const w = (body as { waitUntil?: unknown }).waitUntil
    return typeof w === 'string' ? w : null
  }
  return null
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function backoffMs(attempt: number): number {
  const base = 250 + attempt * 250
  const jitter = Math.floor(Math.random() * 120)
  return base + jitter
}

function isTransientUnknown(e: unknown): boolean {
  if (e instanceof SyntaxError) return true
  if (e instanceof TypeError) return true
  return !(e instanceof Response)
}

export async function startSearchPricesWithRetry(countryID: string): Promise<StartSearchOk> {
  let lastError: unknown
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const resp = await mockApi.startSearchPrices(countryID)
      const body = await readJson<{ token?: string; waitUntil?: string }>(resp)
      if (!body.token || !body.waitUntil) throw new SyntaxError('INVALID_JSON')
      return { token: body.token, waitUntil: body.waitUntil }
    } catch (e) {
      lastError = e
      if (e instanceof Response) {
        const { status, body } = await readRejectedResponse(e)
        if (status >= 400 && status < 500) {
          throw new Error(messageFromBody(body) || `Request failed (${status}).`)
        }
        if (status >= 500) {
          if (attempt === 3) throw e
          await sleep(backoffMs(attempt))
          continue
        }
        throw new Error(messageFromBody(body) || `Request failed (${status}).`)
      }
      if (isTransientUnknown(e)) {
        if (attempt === 3) throw e
        await sleep(backoffMs(attempt))
        continue
      }
      throw e
    }
  }
  throw lastError
}

export async function getSearchPricesWithRetry(token: string): Promise<GetSearchPricesOutcome> {
  let lastError: unknown
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const resp = await mockApi.getSearchPrices(token)
      const body = await readJson<{ prices?: SearchPricesMap }>(resp)
      if (!body.prices || typeof body.prices !== 'object') throw new SyntaxError('INVALID_JSON')
      return { kind: 'success', prices: body.prices }
    } catch (e) {
      lastError = e
      if (e instanceof Response) {
        const { status, body } = await readRejectedResponse(e)
        if (status === 425) {
          const w = waitUntilFromBody(body)
          if (w) return { kind: 'not_ready', waitUntil: w }
          if (attempt === 3) throw new SyntaxError('INVALID_JSON')
          await sleep(backoffMs(attempt))
          continue
        }
        if (status === 404) {
          return { kind: 'fatal', message: 'Search session expired. Please start again.' }
        }
        if (status >= 400 && status < 500) {
          return { kind: 'fatal', message: messageFromBody(body) || `Request failed (${status}).` }
        }
        if (status >= 500) {
          if (attempt === 3) throw e
          await sleep(backoffMs(attempt))
          continue
        }
        return { kind: 'fatal', message: messageFromBody(body) || `Request failed (${status}).` }
      }
      if (isTransientUnknown(e)) {
        if (attempt === 3) throw e
        await sleep(backoffMs(attempt))
        continue
      }
      throw e
    }
  }
  throw lastError
}

export function transientExhaustedMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message
  return 'Search failed after several attempts. Please try again.'
}
