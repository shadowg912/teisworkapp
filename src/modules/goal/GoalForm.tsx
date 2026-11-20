import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '../../shared/components/Button/Button';
import { Dialog } from '../../shared/components/Dialog/Dialog';
import { Form, FormActions, FormError, FormGrid } from '../../shared/components/Form/Form';
import { TextField } from '../../shared/components/TextField/TextField';
import { createGoal, updateGoal } from '../../services/local/store';
import type { Goal } from './model';

type GoalFormProps = {
  open: boolean;
  mode: 'create' | 'edit';
  goal?: Goal | null;
  onDismiss: () => void;
};

export function GoalForm({ open, mode, goal, onDismiss }: GoalFormProps) {
  const [name, setName] = useState('Objetivo de utilidad');
  const [target, setTarget] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(goal?.name ?? 'Objetivo de utilidad');
    setTarget(goal ? String(goal.target) : '');
    setError(null);
  }, [goal, open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const input = {
      name,
      target: Number(target),
      currency: goal?.currency ?? 'DOP',
    };
    const result = mode === 'edit' ? updateGoal(input) : createGoal(input);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onDismiss();
  }

  return (
    <Dialog
      open={open}
      onDismiss={onDismiss}
      title={mode === 'edit' ? 'Actualizar objetivo' : 'Crear objetivo'}
      description="Solo puede existir un objetivo activo. El avance se mide por el capital guardado."
    >
      <Form onSubmit={handleSubmit}>
        <FormGrid>
          <TextField
            label="Nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <TextField
            label="Meta"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            hint="Importe total que quieres alcanzar."
            required
          />

        </FormGrid>

        {error ? <FormError>{error}</FormError> : null}

        <FormActions>
          <Button variant="secondary" onClick={onDismiss}>
            Cancelar
          </Button>
          <Button type="submit">
            {mode === 'edit' ? 'Guardar cambios' : 'Crear objetivo'}
          </Button>
        </FormActions>
      </Form>
    </Dialog>
  );
}
