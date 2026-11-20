import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

import styles from './Dialog.module.css';

type DialogProps = {
  open: boolean;
  title: string;
  description?: string;
  onDismiss: () => void;
  children: ReactNode;
};

export function Dialog({ open, title, description, onDismiss, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = description ? `${titleId}-description` : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClose={() => {
        if (open) {
          onDismiss();
        }
      }}
    >
      <header className={styles.header}>
        <div>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={onDismiss}
          aria-label="Cerrar"
        >
          ×
        </button>
      </header>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
