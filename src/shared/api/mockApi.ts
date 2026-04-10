// Mock API lives in ../knowledge-base/api.js (outside Vite root).
// Vite is configured to allow this import in vite.config.ts.
import {
  getCountries,
  searchGeo,
  startSearchPrices,
  getSearchPrices,
  stopSearchPrices,
  getHotels,
  getHotel,
  getPrice,
} from './api.js'

export const mockApi = {
  getCountries,
  searchGeo,
  startSearchPrices,
  getSearchPrices,
  stopSearchPrices,
  getHotels,
  getHotel,
  getPrice,
}

