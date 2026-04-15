import { Link } from 'react-router-dom'
import { formatDisplayAmount, formatDisplayDate } from '../../../shared/lib/formatters'
import './PriceCard.css'

type PriceCardProps = {
  hotelName: string
  country: string
  city: string
  startDate: string
  endDate: string
  amount: number
  currency: string
  imageUrl: string
  priceId: string
  hotelId: string
}

export default function PriceCard({
  hotelName,
  country,
  city,
  startDate,
  endDate,
  amount,
  currency,
  imageUrl,
  priceId,
  hotelId,
}: PriceCardProps) {
  const canOpenDetails = hotelId.trim().length > 0
  const tourPath = `/tour/${priceId}/${hotelId}`

  return (
    <article className="price-card">
      <div className="price-card__image-wrap">
        <img className="price-card__image" src={imageUrl} alt={hotelName} />
      </div>
      <h3 className="price-card__title">{hotelName}</h3>
      <p className="price-card__meta">{country}{city ? `, ${city}` : ''}</p>
      <p className="price-card__meta">Початок туру: {formatDisplayDate(startDate)}</p>
      <p className="price-card__price">{formatDisplayAmount(amount, currency)}</p>
      {canOpenDetails ? (
        <Link
          className="price-card__link"
          to={tourPath}
          state={{
            priceSnapshot: {
              id: priceId,
              amount,
              currency,
              startDate,
              endDate,
            },
          }}
        >
          Відкрити ціну
        </Link>
      ) : (
        <span className="price-card__link" aria-disabled="true" title="Немає даних для переходу">
          Відкрити ціну
        </span>
      )}
    </article>
  )
}
