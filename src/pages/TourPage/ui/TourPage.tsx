import { Link, useParams } from 'react-router-dom'

export function TourPage() {
  const { priceId } = useParams<{ priceId: string }>()

  return (
    <main style={{ maxWidth: 700, margin: '24px auto', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Tour details</h1>
      <p>
        Price ID: <strong>{priceId}</strong>
      </p>
      <p>Detailed tour page is planned for Task 4.</p>
      <Link to="/">Back to search</Link>
    </main>
  )
}
