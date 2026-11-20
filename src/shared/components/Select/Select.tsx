import { useId } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';

import fieldStyles from '../TextField/TextField.module.css';
import styles from './Select.module.css';

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function Select({ label, hint, error, className, children, ...rest }: SelectProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={[fieldStyles.field, className].filter(Boolean).join(' ')}>
      <label className={fieldStyles.label} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={[fieldStyles.input, styles.select].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      >
        {children}
      </select>
      {hint ? (
        <p id={hintId} className={fieldStyles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={fieldStyles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
