import { Link } from 'react-router-dom'
import './PriceCard.css'

type PriceCardProps = {
  hotelName: string
  country: string
  city: string
  startDate: string
  amount: number
  currency: string
  imageUrl: string
  priceId: string
}

function formatDate(dateIso: string): string {
  const date = new Date(dateIso)
  return new Intl.DateTimeFormat('uk-UA').format(date)
}

function formatAmount(amount: number, currency: string): string {
  const formatted = new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 0,
  }).format(amount)
  const cur = currency.toLowerCase() === 'usd' ? 'USD' : currency.toUpperCase()
  return `${formatted} ${cur}`
}

export default function PriceCard({
  hotelName,
  country,
  city,
  startDate,
  amount,
  currency,
  imageUrl,
  priceId,
}: PriceCardProps) {
  return (
    <article className="price-card">
      <div className="price-card__image-wrap">
        <img className="price-card__image" src={imageUrl} alt={hotelName} />
      </div>
      <h3 className="price-card__title">{hotelName}</h3>
      <p className="price-card__meta">{country}{city ? `, ${city}` : ''}</p>
      <p className="price-card__meta">Початок туру: {formatDate(startDate)}</p>
      <p className="price-card__price">{formatAmount(amount, currency)}</p>
      <Link className="price-card__link" to={`/tour/${priceId}`}>
        Відкрити ціну
      </Link>
    </article>
  )
}
