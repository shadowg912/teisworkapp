import { describe, expect, it } from 'vitest';

import { confirmedPurchasesTotal, purchaseTotal } from './model';
import type { Purchase } from './model';

const purchases: Purchase[] = [
  {
    id: 'C-001',
    date: '2026-11-18',
    supplier: 'Proveedor A',
    status: 'pending',
    items: [
      { product: 'Artículo 1', quantity: 2, unitCost: 10, subtotal: 20 },
      { product: 'Artículo 2', quantity: 3, unitCost: 5, subtotal: 15 },
    ],
  },
  {
    id: 'C-002',
    date: '2026-11-16',
    supplier: 'Proveedor B',
    status: 'confirmed',
    items: [{ product: 'Artículo 3', quantity: 4, unitCost: 25, subtotal: 100 }],
  },
];

describe('compras', () => {
  it('calcula el total de cada compra a partir de sus artículos', () => {
    expect(purchaseTotal(purchases[0])).toBe(35);
    expect(purchaseTotal(purchases[1])).toBe(100);
  });

  it('suma solo las compras confirmadas', () => {
    expect(confirmedPurchasesTotal(purchases)).toBe(100);
  });

  it('mantiene subtotales coherentes con cantidad y costo unitario', () => {
    const inconsistent = purchases
      .flatMap((purchase) => purchase.items)
      .filter((item) => Math.abs(item.quantity * item.unitCost - item.subtotal) > 0.001);

    expect(inconsistent).toEqual([]);
  });
});
