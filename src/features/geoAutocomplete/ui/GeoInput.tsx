import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/storeHooks'
import { selectSelectedDestination } from '../model/geoAutocomplete.selectors'
import { geoAutocompleteActions } from '../model/geoAutocomplete.slice'
import { GeoEntityTypes, type GeoEntity, type GeoEntityType } from '../model/geoAutocomplete.types'
import { CountryLoadStatuses } from '../../../entities/country/model/country.types'
import { fetchCountries } from '../../../entities/country/model/country.slice'
import {
  selectCountriesList,
  selectCountriesStatus,
} from '../../../entities/country/model/country.selectors'
import { Combobox, type ComboboxItem } from '../../../shared/ui/Combobox/Combobox'
import { mockApi } from '../../../shared/api/mockApi'
import { readJson, readRejectedResponse } from '../../../shared/api/parse'

type GeoResponse = Record<string, GeoEntity>

function iconFor(type: GeoEntityType) {
  if (type === GeoEntityTypes.Country) return '🌍'
  if (type === GeoEntityTypes.City) return '🏙️'
  return '🏨'
}

export function GeoInput() {
  const dispatch = useAppDispatch()
  const selected = useAppSelector(selectSelectedDestination)
  const countries = useAppSelector(selectCountriesList)
  const countriesStatus = useAppSelector(selectCountriesStatus)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(selected?.label ?? '')
  const [editedSinceOpen, setEditedSinceOpen] = useState(false)

  const [searchItems, setSearchItems] = useState<ComboboxItem[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchErrorText, setSearchErrorText] = useState<string | null>(null)

  const requestIdRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const selectedItem: ComboboxItem | null = useMemo(() => {
    if (!selected) return null
    return {
      key: `${selected.type}:${selected.id}`,
      label: selected.label,
      leading: iconFor(selected.type),
    }
  }, [selected])

  const countryItems: ComboboxItem[] = useMemo(
    () =>
      countries.map((c) => ({
        key: `country:${c.id}`,
        label: c.name,
        leading: <span aria-hidden="true">{iconFor(GeoEntityTypes.Country)}</span>,
        meta: c.flag ? <img src={c.flag} alt="" width={18} height={12} /> : undefined,
      })),
    [countries]
  )

  const runSearch = useCallback(async (q: string) => {
    const requestId = ++requestIdRef.current
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setSearchLoading(true)
    setSearchErrorText(null)

    try {
      const resp = await mockApi.searchGeo(q)
      const body = await readJson<GeoResponse>(resp)
      if (controller.signal.aborted) return
      if (requestId !== requestIdRef.current) return

      const nextItems = Object.values(body).map((e) => ({
        key: `${e.type}:${e.id}`,
        label: e.name,
        leading: <span aria-hidden="true">{iconFor(e.type)}</span>,
      }))
      setSearchItems(nextItems)
      setSearchLoading(false)
    } catch (e) {
      if (controller.signal.aborted) return
      if (requestId !== requestIdRef.current) return

      try {
        const { status, body } = await readRejectedResponse(e)
        const msg =
          typeof body === 'object' && body && 'message' in body
            ? String((body as { message?: unknown }).message ?? '')
            : ''
        setSearchErrorText(msg || `Search failed (${status}).`)
      } catch {
        setSearchErrorText('Search failed.')
      }
      setSearchLoading(false)
    }
  }, [])

  const mode: 'countries' | 'search' = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return 'countries'

    // Spec: if a country was selected and the user re-opens the input (no typing yet),
    // show the base countries list, not searchGeo results.
    if (selected?.type === GeoEntityTypes.Country && !editedSinceOpen) return 'countries'

    return 'search'
  }, [query, selected?.type, editedSinceOpen])

  useEffect(() => {
    if (!open) return

    // Behavior required by task:
    // - click opens countries list (base)
    // - typing keeps dropdown open and shows searchGeo results
    // - when clicking input again with an existing value:
    //   - if selected is country -> show countries
    //   - if selected is city/hotel -> show search results for entered value
    if (mode === 'countries') {
      if (countriesStatus === CountryLoadStatuses.Idle) dispatch(fetchCountries())
      return
    }

    const trimmed = query.trim()
    const id = window.setTimeout(() => runSearch(trimmed), 200)
    return () => window.clearTimeout(id)
  }, [open, mode, query, countriesStatus, dispatch, runSearch])

  const items = mode === 'countries' ? countryItems : searchItems
  const loading = mode === 'countries' ? countriesStatus === CountryLoadStatuses.Loading : searchLoading
  const errorText = mode === 'countries' ? null : searchErrorText

  return (
    <Combobox
      label="Destination"
      placeholder="Choose a country / city / hotel"
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setEditedSinceOpen(false)
        if (next && countriesStatus === CountryLoadStatuses.Idle) dispatch(fetchCountries())
      }}
      query={query}
      onQueryChange={(q) => {
        setQuery(q)
        if (open) setEditedSinceOpen(true)
      }}
      items={items}
      loading={loading}
      errorText={errorText}
      value={selectedItem}
      onChange={(it) => {
        if (!it) {
          dispatch(geoAutocompleteActions.setSelectedDestination(null))
          return
        }

        const [type, rawId] = it.key.split(':')
        dispatch(
          geoAutocompleteActions.setSelectedDestination({
            type: type as GeoEntityType,
            id: rawId,
            label: it.label,
          })
        )
      }}
    />
  )
}

