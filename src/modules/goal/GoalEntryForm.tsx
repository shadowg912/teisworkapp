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
import { createGoalEntry } from '../../services/local/store';
import { useLocalStore } from '../../services/local/useLocalStore';
import { calculateGoal } from './model';
import type { GoalEntryType } from './model';

type GoalEntryFormProps = {
  open: boolean;
  onDismiss: () => void;
};

export function GoalEntryForm({ open, onDismiss }: GoalEntryFormProps) {
  const state = useLocalStore();
  const saved = calculateGoal(state.goal, state.goalEntries).saved;

  const [type, setType] = useState<GoalEntryType>('contribution');
  const [account, setAccount] = useState<Account>('Banco');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setType('contribution');
    setAccount('Banco');
    setAmount('');
    setDate(todayIso());
    setNote('');
    setError(null);
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = createGoalEntry({
      type,
      account,
      amount: Number(amount),
      currency: 'DOP',
      date,
      note,
    });

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
      title="Registrar movimiento del objetivo"
      description="El aporte o retiro genera también el movimiento financiero correspondiente."
    >
      <Form onSubmit={handleSubmit}>
        <FormGrid>
          <Select
            label="Tipo"
            value={type}
            onChange={(event) => setType(event.target.value as GoalEntryType)}
          >
            <option value="contribution">Aporte al objetivo</option>
            <option value="investment_withdrawal">Retiro para inversión</option>
          </Select>

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

          <TextField
            label="Fecha"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />

          <FormFull>
            <TextArea
              label="Nota"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                type === 'investment_withdrawal'
                  ? 'Obligatoria: explica el destino de la inversión.'
                  : 'Opcional.'
              }
              required={type === 'investment_withdrawal'}
            />
          </FormFull>
        </FormGrid>

        <FormHint>
          {type === 'contribution'
            ? `El importe sale de ${account} y se guarda en el objetivo.`
            : `Capital guardado disponible: DOP ${saved.toFixed(2)}. El retiro vuelve a ${account} y no es un gasto.`}
        </FormHint>

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
