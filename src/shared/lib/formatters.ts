export function formatDisplayDate(dateIso: string): string {
  const date = new Date(dateIso)
  return new Intl.DateTimeFormat('uk-UA').format(date)
}

export function formatDisplayAmount(amount: number, currency: string): string {
  const formatted = new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 0,
  }).format(amount)
  const cur = currency.toLowerCase() === 'usd' ? 'USD' : currency.toUpperCase()
  return `${formatted} ${cur}`
}
