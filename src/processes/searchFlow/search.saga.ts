import { all, call, delay, put, select, takeLatest } from 'redux-saga/effects'
import type { RootState } from '../../app/store'
import {
  getSearchPricesWithRetry,
  startSearchPricesWithRetry,
  transientExhaustedMessage,
  type SearchPricesMap,
} from '../../shared/api/searchPrices.service'
import { getHotelsByCountry } from '../../shared/api/hotels.service'
import { resolveSearchCountryId, type ResolveCountryIdResult } from './resolveSearchCountryId'
import { searchActions } from './search.slice'
import { makeSearchCriteriaKey } from './search.types'

const HOTELS_CACHE_TTL_MS = 60 * 60 * 1000

function* isSessionActual(sessionId: string) {
  const sid = (yield select((s: RootState) => s.search.sessionId)) as string | null
  return sid === sessionId
}

function* ensureHotelsLoaded(sessionId: string, countryId: string) {
  yield put(
    searchActions.pruneExpiredHotelsCache({ now: Date.now(), ttl: HOTELS_CACHE_TTL_MS })
  )

  const state = (yield select((s: RootState) => s.search)) as RootState['search']
  const cacheEntry = state.hotelsCache[countryId]
  if (cacheEntry?.status === 'success') return

  if (!(yield* isSessionActual(sessionId))) return
  yield put(searchActions.fetchHotelsRequest(countryId))

  try {
    const hotels = (yield call(getHotelsByCountry, countryId)) as Awaited<
      ReturnType<typeof getHotelsByCountry>
    >
    if (!(yield* isSessionActual(sessionId))) return
    yield put(searchActions.fetchHotelsSuccess({ countryId, data: hotels }))
  } catch (e) {
    if (!(yield* isSessionActual(sessionId))) return
    yield put(searchActions.fetchHotelsFailure({ countryId, error: transientExhaustedMessage(e) }))
  }
}

function* runPricesSearch(
  sessionId: string,
  countryId: string,
  criteriaKey: string
) {
  let start: Awaited<ReturnType<typeof startSearchPricesWithRetry>>
  try {
    start = (yield call(startSearchPricesWithRetry, countryId)) as Awaited<
      ReturnType<typeof startSearchPricesWithRetry>
    >
  } catch (e) {
    if (yield* isSessionActual(sessionId)) {
      yield put(searchActions.searchFailed({ sessionId, message: transientExhaustedMessage(e) }))
    }
    return
  }

  if (!(yield* isSessionActual(sessionId))) return
  yield put(
    searchActions.searchAwaitingPoll({
      sessionId,
      token: start.token,
      waitUntil: start.waitUntil,
      criteriaKey,
    })
  )

  let waitUntil = start.waitUntil
  const token = start.token

  while (true) {
    const ms = Math.max(0, Date.parse(waitUntil) - Date.now())
    if (ms > 0) {
      yield delay(ms)
    }
    if (!(yield* isSessionActual(sessionId))) return

    let poll: Awaited<ReturnType<typeof getSearchPricesWithRetry>>
    try {
      poll = (yield call(getSearchPricesWithRetry, token)) as Awaited<
        ReturnType<typeof getSearchPricesWithRetry>
      >
    } catch (e) {
      if (yield* isSessionActual(sessionId)) {
        yield put(searchActions.searchFailed({ sessionId, message: transientExhaustedMessage(e) }))
      }
      return
    }

    if (!(yield* isSessionActual(sessionId))) return

    if (poll.kind === 'not_ready') {
      waitUntil = poll.waitUntil
      continue
    }
    if (poll.kind === 'fatal') {
      yield put(searchActions.searchFailed({ sessionId, message: poll.message }))
      return
    }
    yield put(searchActions.searchSucceeded({ sessionId, criteriaKey, results: poll.prices }))
    return
  }
}

function* submitWorker(action: ReturnType<typeof searchActions.submitSearch>) {
  const { destination, sessionId } = action.payload

  const resolved = (yield call(resolveSearchCountryId, destination)) as ResolveCountryIdResult
  if (resolved.ok === false) {
    if (yield* isSessionActual(sessionId)) {
      yield put(searchActions.searchFailed({ sessionId, message: resolved.error }))
    }
    return
  }

  const { countryId } = resolved
  if (!(yield* isSessionActual(sessionId))) return
  yield put(searchActions.setResolvedCountryId(countryId))

  const criteriaKey = makeSearchCriteriaKey(countryId, destination)

  const cached = (yield select((s: RootState) => s.search.cache[criteriaKey])) as
    | SearchPricesMap
    | undefined
  if (cached) {
    // Keep loading state until hotel cache is ready to avoid success/loading flicker.
    yield call(ensureHotelsLoaded, sessionId, countryId)
    if (!(yield* isSessionActual(sessionId))) return
    if (yield* isSessionActual(sessionId)) {
      yield put(searchActions.searchFromCache({ sessionId, criteriaKey, results: cached }))
    }
    return
  }

  yield all([
    call(ensureHotelsLoaded, sessionId, countryId),
    call(runPricesSearch, sessionId, countryId, criteriaKey),
  ])
}

export function* searchFlowSaga() {
  yield takeLatest(searchActions.submitSearch.type, submitWorker)
}
