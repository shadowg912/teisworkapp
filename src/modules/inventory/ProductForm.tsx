import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '../../shared/components/Button/Button';
import { Dialog } from '../../shared/components/Dialog/Dialog';
import { Form, FormActions, FormError, FormGrid } from '../../shared/components/Form/Form';
import { TextField } from '../../shared/components/TextField/TextField';
import { createProduct } from '../../services/local/store';

type ProductFormProps = {
  open: boolean;
  onDismiss: () => void;
};

export function ProductForm({ open, onDismiss }: ProductFormProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('u');
  const [minStock, setMinStock] = useState('0');
  const [cost, setCost] = useState('0');
  const [price, setPrice] = useState('0');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName('');
    setSku('');
    setUnit('u');
    setMinStock('0');
    setCost('0');
    setPrice('0');
    setError(null);
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = createProduct({
      name,
      sku,
      unit,
      minStock: Number(minStock),
      cost: Number(cost),
      price: Number(price),
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
      title="Registrar producto"
      description="El producto se guarda en este dispositivo y queda pendiente de sincronizar."
    >
      <Form onSubmit={handleSubmit}>
        <FormGrid>
          <TextField
            label="Nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Café de origen 500 g"
            required
          />

          <TextField
            label="SKU"
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            placeholder="Ej. CAF-500"
            required
          />

          <TextField
            label="Unidad"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            hint="u, kg, caja…"
          />

          <TextField
            label="Existencia mínima"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.001"
            value={minStock}
            onChange={(event) => setMinStock(event.target.value)}
          />

          <TextField
            label="Costo unitario"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
          />

          <TextField
            label="Precio de venta"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </FormGrid>

        {error ? <FormError>{error}</FormError> : null}

        <FormActions>
          <Button variant="secondary" onClick={onDismiss}>
            Cancelar
          </Button>
          <Button type="submit">Guardar producto</Button>
        </FormActions>
      </Form>
    </Dialog>
  );
}
