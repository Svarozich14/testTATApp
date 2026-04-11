import { call, delay, put, select, takeLatest } from 'redux-saga/effects'
import type { RootState } from '../../app/store'
import {
  getSearchPricesWithRetry,
  startSearchPricesWithRetry,
  transientExhaustedMessage,
  type SearchPricesMap,
} from '../../shared/api/searchPrices.service'
import { resolveSearchCountryId, type ResolveCountryIdResult } from './resolveSearchCountryId'
import { searchActions } from './search.slice'
import { makeSearchCriteriaKey } from './search.types'

function* submitWorker(action: ReturnType<typeof searchActions.submitSearch>) {
  const { destination, sessionId } = action.payload

  const resolved = (yield call(resolveSearchCountryId, destination)) as ResolveCountryIdResult
  if (resolved.ok === false) {
    const sid = (yield select((s: RootState) => s.search.sessionId)) as string | null
    if (sid === sessionId) {
      yield put(searchActions.searchFailed({ sessionId, message: resolved.error }))
    }
    return
  }

  const { countryId } = resolved
  const criteriaKey = makeSearchCriteriaKey(countryId, destination)

  const cached = (yield select((s: RootState) => s.search.cache[criteriaKey])) as
    | SearchPricesMap
    | undefined
  if (cached) {
    const sid = (yield select((s: RootState) => s.search.sessionId)) as string | null
    if (sid === sessionId) {
      yield put(searchActions.searchFromCache({ sessionId, criteriaKey, results: cached }))
    }
    return
  }

  let start: Awaited<ReturnType<typeof startSearchPricesWithRetry>>
  try {
    start = (yield call(startSearchPricesWithRetry, countryId)) as Awaited<
      ReturnType<typeof startSearchPricesWithRetry>
    >
  } catch (e) {
    const sid = (yield select((s: RootState) => s.search.sessionId)) as string | null
    if (sid === sessionId) {
      yield put(
        searchActions.searchFailed({ sessionId, message: transientExhaustedMessage(e) })
      )
    }
    return
  }

  let sid = (yield select((s: RootState) => s.search.sessionId)) as string | null
  if (sid !== sessionId) return

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
    sid = (yield select((s: RootState) => s.search.sessionId)) as string | null
    if (sid !== sessionId) return

    let poll: Awaited<ReturnType<typeof getSearchPricesWithRetry>>
    try {
      poll = (yield call(getSearchPricesWithRetry, token)) as Awaited<ReturnType<typeof getSearchPricesWithRetry>>
    } catch (e) {
      sid = (yield select((s: RootState) => s.search.sessionId)) as string | null
      if (sid === sessionId) {
        yield put(
          searchActions.searchFailed({ sessionId, message: transientExhaustedMessage(e) })
        )
      }
      return
    }

    sid = (yield select((s: RootState) => s.search.sessionId)) as string | null
    if (sid !== sessionId) return

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

export function* searchFlowSaga() {
  yield takeLatest(searchActions.submitSearch.type, submitWorker)
}
