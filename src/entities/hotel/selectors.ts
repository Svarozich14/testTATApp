import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

// Селекторы для работы с отелями - только в рамках entity hotel
export const selectHotelsCache = (state: RootState) => state.search.hotelsCache;

export const selectHotelsByCountry = createSelector(
  [selectHotelsCache, (_state: RootState, countryId: string) => countryId],
  (hotelsCache, countryId) => hotelsCache[countryId]?.data || {}
);

export const selectHotelsLoading = createSelector(
  [selectHotelsCache, (_state: RootState, countryId: string) => countryId],
  (hotelsCache, countryId) => hotelsCache[countryId]?.status === 'loading'
);

export const selectHotelsError = createSelector(
  [selectHotelsCache, (_state: RootState, countryId: string) => countryId],
  (hotelsCache, countryId) => hotelsCache[countryId]?.error || null
);
