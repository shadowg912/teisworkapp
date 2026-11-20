export type Currency = 'DOP' | 'USD';

const amountFormatter = new Intl.NumberFormat('es-DO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const quantityFormatter = new Intl.NumberFormat('es-DO');

const dateFormatter = new Intl.DateTimeFormat('es-DO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const percentFormatter = new Intl.NumberFormat('es-DO', {
  style: 'percent',
  maximumFractionDigits: 0,
});

export function formatMoney(value: number, currency: Currency = 'DOP'): string {
  return `${currency} ${amountFormatter.format(value)}`;
}

export function formatSignedMoney(value: number, currency: Currency = 'DOP'): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${formatMoney(Math.abs(value), currency)}`;
}

export function formatQuantity(value: number): string {
  return quantityFormatter.format(value);
}

export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return dateFormatter.format(date);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}
