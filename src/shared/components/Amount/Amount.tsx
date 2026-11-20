import { formatMoney, formatSignedMoney } from '../../utils/format';
import type { Currency } from '../../utils/format';
import styles from './Amount.module.css';

type AmountProps = {
  value: number;
  currency?: Currency;
  signed?: boolean;
  className?: string;
};

export function Amount({ value, currency = 'DOP', signed = false, className }: AmountProps) {
  const tone = signed ? (value > 0 ? styles.positive : value < 0 ? styles.negative : '') : '';

  return (
    <span className={[styles.amount, tone, className].filter(Boolean).join(' ')}>
      {signed ? formatSignedMoney(value, currency) : formatMoney(value, currency)}
    </span>
  );
}
