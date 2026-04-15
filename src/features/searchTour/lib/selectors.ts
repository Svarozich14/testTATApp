import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../../app/store'
import { mergeResults } from './mergeResults'

const selectPrices = (state: RootState) => state.search.results ?? {}
const selectHotels = (state: RootState, countryId: string) =>
  state.search.hotelsCache[countryId]?.data ?? {}

export const makeSelectMergedResults = () =>
  createSelector([selectPrices, selectHotels], (prices, hotels) => mergeResults(prices, hotels))
