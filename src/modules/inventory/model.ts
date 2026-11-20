export type StockState = 'available' | 'low' | 'out';

export type StockMovementType = 'in' | 'out';

export type Product = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  minStock: number;
  cost: number;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export type StockMovement = {
  id: string;
  operationId: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number;
  reason?: string;
  date: string;
  createdAt: string;
};

export type ProductStock = Product & {
  stock: number;
  state: StockState;
};

export function calculateStock(productId: string, movements: StockMovement[]): number {
  return movements
    .filter((movement) => movement.productId === productId)
    .reduce(
      (total, movement) =>
        total + (movement.type === 'in' ? movement.quantity : -movement.quantity),
      0,
    );
}

export function getStockState(product: Product, stock: number): StockState {
  if (stock <= 0) {
    return 'out';
  }

  if (stock < product.minStock) {
    return 'low';
  }

  return 'available';
}

export function buildInventory(
  products: Product[],
  movements: StockMovement[],
): ProductStock[] {
  return products.map((product) => {
    const stock = calculateStock(product.id, movements);
    return {
      ...product,
      stock,
      state: getStockState(product, stock),
    };
  });
}
