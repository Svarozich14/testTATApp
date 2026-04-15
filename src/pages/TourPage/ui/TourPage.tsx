import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getTourHotel, getTourPrice, type HotelDetails, type PriceDetails } from '../../../shared/api/tour.service'
import { formatDisplayAmount, formatDisplayDate } from '../../../shared/lib/formatters'
import styles from './tourPage.module.css'

type TourDetailsState = {
  price: PriceDetails | null
  hotel: HotelDetails | null
  loading: boolean
  linkError: string | null
  priceError: string | null
  hotelError: string | null
}

type TourLocationState = {
  priceSnapshot?: PriceDetails
}

const SERVICE_LABELS: Record<string, string> = {
  wifi: 'Wi-Fi',
  aquapark: 'Аквапарк',
  tennis_court: 'Тенісний корт',
  laundry: 'Пральня',
  parking: 'Паркінг',
}

function formatDurationDays(startDate: string, endDate: string): string {
  const start = Date.parse(startDate)
  const end = Date.parse(endDate)
  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
  return `${days} дн.`
}

function mapServices(services?: Record<string, string>): string[] {
  if (!services) return []
  return Object.entries(services)
    .filter(([, value]) => value === 'yes')
    .map(([key]) => SERVICE_LABELS[key] ?? key)
}

export function TourPage() {
  const { priceId, hotelId } = useParams<{ priceId: string; hotelId: string }>()
  const location = useLocation()
  const locationState = (location.state as TourLocationState | null) ?? null
  const [state, setState] = useState<TourDetailsState>({
    price: locationState?.priceSnapshot ?? null,
    hotel: null,
    loading: true,
    linkError: null,
    priceError: null,
    hotelError: null,
  })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!priceId || !hotelId) {
        setState((prev) => ({
          ...prev,
          loading: false,
          linkError: 'Invalid tour link.',
          priceError: null,
          hotelError: null,
        }))
        return
      }

      setState((prev) => ({
        ...prev,
        loading: true,
        linkError: null,
        priceError: null,
        hotelError: null,
      }))

      const [priceResult, hotelResult] = await Promise.allSettled([
        getTourPrice(priceId),
        getTourHotel(hotelId),
      ])
      if (cancelled) return

      const nextPrice =
        priceResult.status === 'fulfilled' ? priceResult.value : (locationState?.priceSnapshot ?? null)
      const nextHotel = hotelResult.status === 'fulfilled' ? hotelResult.value : null

      const priceError =
        priceResult.status === 'rejected'
          ? priceResult.reason instanceof Error
            ? priceResult.reason.message
            : 'Failed to load price details.'
          : null
      const hotelError =
        hotelResult.status === 'rejected'
          ? hotelResult.reason instanceof Error
            ? hotelResult.reason.message
            : 'Failed to load hotel details.'
          : null

      const isHotelValid = nextHotel && typeof nextHotel.id === 'number' && Boolean(nextHotel.name)
      const normalizedHotelError =
        !isHotelValid && !hotelError ? 'Hotel with this ID was not found.' : hotelError

      setState({
        price: nextPrice,
        hotel: isHotelValid ? nextHotel : null,
        loading: false,
        linkError: null,
        priceError,
        hotelError: normalizedHotelError,
      })
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [hotelId, locationState?.priceSnapshot, priceId, reloadToken])

  const hotelServices = useMemo(() => mapServices(state.hotel?.services), [state.hotel?.services])
  const canShowPageBody = Boolean(state.price || state.hotel)
  const combinedError =
    state.linkError ||
    (!canShowPageBody && (state.priceError || state.hotelError || 'Failed to load tour details.'))

  return (
    <main className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Сторінка туру</h1>
        <Link to="/" className={styles.backLink}>До пошуку</Link>
      </div>

      {state.loading ? <div className={styles.state}>Завантаження деталей туру…</div> : null}
      {combinedError ? <div className={styles.error}>{combinedError}</div> : null}

      {!state.loading && (state.priceError || state.hotelError) ? (
        <button
          type="button"
          className={styles.retryButton}
          onClick={() => setReloadToken((v) => v + 1)}
        >
          Спробувати ще раз
        </button>
      ) : null}

      {!state.loading && canShowPageBody ? (
        <section className={styles.card}>
          {state.hotel ? (
            <>
              <img className={styles.image} src={state.hotel.img} alt={state.hotel.name} />
              <h2 className={styles.hotelName}>{state.hotel.name}</h2>
              <p className={styles.meta}>{state.hotel.countryName}, {state.hotel.cityName}</p>
              <p className={styles.description}>
                {state.hotel.description ?? 'Опис готелю наразі недоступний.'}
              </p>

              <div className={styles.block}>
                <h3 className={styles.blockTitle}>Зручності</h3>
                {hotelServices.length > 0 ? (
                  <ul className={styles.tags}>
                    {hotelServices.map((service) => (
                      <li key={service} className={styles.tag}>{service}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.meta}>Немає доступних даних про зручності.</p>
                )}
              </div>
            </>
          ) : (
            <div className={styles.blockError}>
              {state.hotelError ?? 'Дані готелю тимчасово недоступні.'}
            </div>
          )}

          {state.price ? (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Інформація про тур</h3>
              <p className={styles.meta}>
                {formatDisplayDate(state.price.startDate)} - {formatDisplayDate(state.price.endDate)} ({formatDurationDays(state.price.startDate, state.price.endDate)})
              </p>
              <p className={styles.total}>{formatDisplayAmount(state.price.amount, state.price.currency)}</p>
            </div>
          ) : (
            <div className={styles.blockError}>
              {state.priceError ?? 'Дані ціни тимчасово недоступні.'}
            </div>
          )}
        </section>
      ) : null}
    </main>
  )
}
