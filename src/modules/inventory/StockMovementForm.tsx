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
import { todayIso } from '../../shared/utils/date';
import { createStockMovement } from '../../services/local/store';
import { useLocalStore } from '../../services/local/useLocalStore';
import { calculateStock } from './model';
import type { StockMovementType } from './model';

type StockMovementFormProps = {
  open: boolean;
  onDismiss: () => void;
};

export function StockMovementForm({ open, onDismiss }: StockMovementFormProps) {
  const state = useLocalStore();
  const [productId, setProductId] = useState(state.products[0]?.id ?? '');
  const [type, setType] = useState<StockMovementType>('in');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(todayIso());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setProductId(state.products[0]?.id ?? '');
    setType('in');
    setQuantity('');
    setUnitCost('');
    setReason('');
    setDate(todayIso());
    setError(null);
  }, [open, state.products]);

  const product = state.products.find((item) => item.id === productId);
  const stock = product ? calculateStock(product.id, state.stockMovements) : 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = createStockMovement({
      productId,
      type,
      quantity: Number(quantity),
      unitCost: unitCost === '' ? undefined : Number(unitCost),
      reason,
      date,
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
      title="Registrar movimiento de inventario"
      description="Las entradas y salidas son la fuente de verdad de las existencias."
    >
      {state.products.length === 0 ? (
        <FormError>
          Primero registra un producto. Sin productos no se puede mover el inventario.
        </FormError>
      ) : (
        <Form onSubmit={handleSubmit}>
          <FormGrid>
            <FormFull>
              <Select
                label="Producto"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                required
              >
                {state.products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.sku}
                  </option>
                ))}
              </Select>
            </FormFull>

            <Select
              label="Tipo"
              value={type}
              onChange={(event) => setType(event.target.value as StockMovementType)}
            >
              <option value="in">Entrada</option>
              <option value="out">Salida</option>
            </Select>

            <TextField
              label="Cantidad"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />

            <TextField
              label="Costo unitario"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(event) => setUnitCost(event.target.value)}
              placeholder={product ? String(product.cost) : '0.00'}
              hint={type === 'in' ? 'Si se deja vacío, se usa el costo del producto.' : 'Opcional.'}
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
                label="Motivo"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Ej. Compra a proveedor, ajuste de conteo, venta…"
              />
            </FormFull>
          </FormGrid>

          <FormHint>
            Existencia actual de {product?.name ?? 'el producto'}: {stock} {product?.unit ?? 'u'}.
          </FormHint>

          {error ? <FormError>{error}</FormError> : null}

          <FormActions>
            <Button variant="secondary" onClick={onDismiss}>
              Cancelar
            </Button>
            <Button type="submit">Guardar movimiento</Button>
          </FormActions>
        </Form>
      )}
    </Dialog>
  );
}
