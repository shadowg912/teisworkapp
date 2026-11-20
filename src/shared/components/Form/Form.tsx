import type { FormHTMLAttributes, ReactNode } from 'react';

import styles from './Form.module.css';

type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
};

export function Form({ children, className, ...rest }: FormProps) {
  return (
    <form className={[styles.form, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </form>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

export function FormFull({ children }: { children: ReactNode }) {
  return <div className={styles.full}>{children}</div>;
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p className={styles.error} role="alert">
      {children}
    </p>
  );
}

export function FormHint({ children }: { children: ReactNode }) {
  return <p className={styles.hint}>{children}</p>;
}
