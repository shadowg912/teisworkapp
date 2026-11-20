import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

import fieldStyles from '../TextField/TextField.module.css';
import styles from './TextArea.module.css';

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextArea({ label, hint, error, className, ...rest }: TextAreaProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={[fieldStyles.field, className].filter(Boolean).join(' ')}>
      <label className={fieldStyles.label} htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className={[fieldStyles.input, styles.textarea].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
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
