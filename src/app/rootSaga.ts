import { all } from 'redux-saga/effects'
import { searchFlowSaga } from '../processes/searchFlow/search.saga'

export function* rootSaga() {
  yield all([searchFlowSaga()])
}
