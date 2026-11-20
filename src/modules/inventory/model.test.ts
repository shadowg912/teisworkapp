import { describe, expect, it } from 'vitest';

import { buildInventory, calculateStock, getStockState } from './model';
import type { Product, StockMovement } from './model';

const product: Product = {
  id: 'product-1',
  sku: 'SKU-1',
  name: 'Producto',
  unit: 'u',
  minStock: 5,
  cost: 10,
  price: 20,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

let sequence = 0;

function movement(
  type: 'in' | 'out',
  quantity: number,
  productId = product.id,
): StockMovement {
  sequence += 1;
  return {
    id: `movement-${sequence}`,
    operationId: `operation-${sequence}`,
    productId,
    type,
    quantity,
    date: '2026-11-20',
    createdAt: '2026-11-20T12:00:00.000Z',
  };
}

describe('inventario', () => {
  it('calcula la existencia a partir de entradas y salidas', () => {
    const movements = [movement('in', 10), movement('out', 4), movement('in', 2)];

    expect(calculateStock(product.id, movements)).toBe(8);
  });

  it('clasifica existencias agotadas, bajas y disponibles', () => {
    expect(getStockState(product, 0)).toBe('out');
    expect(getStockState(product, 4)).toBe('low');
    expect(getStockState(product, 5)).toBe('available');
  });

  it('construye el inventario con existencia y estado', () => {
    const inventory = buildInventory([product], [movement('in', 3)]);

    expect(inventory).toHaveLength(1);
    expect(inventory[0].stock).toBe(3);
    expect(inventory[0].state).toBe('low');
  });
});
