import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '../../shared/components/Button/Button';
import { Dialog } from '../../shared/components/Dialog/Dialog';
import {
  Form,
  FormActions,
  FormError,
  FormFull,
  FormGrid,
  FormHint,
} from '../../shared/components/Form/Form';
import { Select } from '../../shared/components/Select/Select';
import { TextArea } from '../../shared/components/TextArea/TextArea';
import { TextField } from '../../shared/components/TextField/TextField';
import { accounts } from '../../shared/types/accounts';
import type { Account } from '../../shared/types/accounts';
import { todayIso } from '../../shared/utils/date';
import { calculateGoal } from '../goal/model';
import { useLocalStore } from '../../services/local/useLocalStore';
import { createFinanceMovement } from '../../services/local/store';
import {
  isGoalMovement,
  movementTypeDescriptions,
  movementTypeLabels,
} from './model';
import type { CorrectionDirection, MovementType } from './model';

const movementTypes: MovementType[] = [
  'capital_contribution',
  'income',
  'expense',
  'transfer',
  'saved_capital',
  'investment_withdrawal',
  'correction',
];

type MovementFormProps = {
  open: boolean;
  onDismiss: () => void;
};

export function MovementForm({ open, onDismiss }: MovementFormProps) {
  const state = useLocalStore();
  const goal = state.goal?.status === 'active' ? state.goal : null;
  const saved = calculateGoal(goal, state.goalEntries).saved;

  const [type, setType] = useState<MovementType>('income');
  const [date, setDate] = useState(todayIso());
  const [account, setAccount] = useState<Account>('Caja');
  const [counterpart, setCounterpart] = useState<Account>('Banco');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [correctionDirection, setCorrectionDirection] =
    useState<CorrectionDirection>('in');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setType('income');
    setDate(todayIso());
    setAccount('Caja');
    setCounterpart('Banco');
    setAmount('');
    setDescription('');
    setCategory('');
    setNote('');
    setCorrectionDirection('in');
    setError(null);
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = createFinanceMovement({
      type,
      date,
      description,
      category,
      account,
      counterpart: type === 'transfer' ? counterpart : undefined,
      amount: Number(amount),
      currency: 'DOP',
      note,
      correctionDirection,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onDismiss();
  }

  const needsGoal = isGoalMovement(type);

  return (
    <Dialog
      open={open}
      onDismiss={onDismiss}
      title="Registrar movimiento"
      description="El movimiento se guarda en este dispositivo y queda pendiente de sincronizar."
    >
      <Form onSubmit={handleSubmit}>
        <FormGrid>
          <Select
            label="Tipo de movimiento"
            value={type}
            onChange={(event) => setType(event.target.value as MovementType)}
            hint={movementTypeDescriptions[type]}
          >
            {movementTypes.map((movementType) => (
              <option key={movementType} value={movementType}>
                {movementTypeLabels[movementType]}
              </option>
            ))}
          </Select>

          <TextField
            label="Fecha"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />

          <Select
            label="Cuenta"
            value={account}
            onChange={(event) => setAccount(event.target.value as Account)}
          >
            {accounts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          {type === 'transfer' ? (
            <Select
              label="Cuenta de destino"
              value={counterpart}
              onChange={(event) => setCounterpart(event.target.value as Account)}
            >
              {accounts
                .filter((item) => item !== account)
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </Select>
          ) : null}

          {type === 'correction' ? (
            <Select
              label="Dirección de la corrección"
              value={correctionDirection}
              onChange={(event) =>
                setCorrectionDirection(event.target.value as CorrectionDirection)
              }
              hint="Indica si el ajuste suma o resta a la cuenta."
            >
              <option value="in">Suma a la cuenta</option>
              <option value="out">Resta de la cuenta</option>
            </Select>
          ) : null}

          <TextField
            label="Importe"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />

          <FormFull>
            <TextField
              label="Descripción"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ej. Venta mostrador, compra a proveedor…"
              required
            />
          </FormFull>

          <TextField
            label="Categoría"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Opcional"
          />

          <FormFull>
            <TextArea
              label="Nota"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Opcional. En retiros para inversión explica el destino."
            />
          </FormFull>
        </FormGrid>

        {needsGoal ? (
          <FormHint>
            {goal
              ? `Se vinculará al objetivo activo. Capital guardado disponible: DOP ${saved.toFixed(2)}.`
              : 'Necesitas un objetivo activo para guardar capital o registrar retiros.'}
          </FormHint>
        ) : null}

        {error ? <FormError>{error}</FormError> : null}

        <FormActions>
          <Button variant="secondary" onClick={onDismiss}>
            Cancelar
          </Button>
          <Button type="submit">Guardar movimiento</Button>
        </FormActions>
      </Form>
    </Dialog>
  );
}
