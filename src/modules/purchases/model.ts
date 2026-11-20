export type PurchaseStatus = 'confirmed' | 'pending';

export type PurchaseItem = {
  product: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
};

export type Purchase = {
  id: string;
  date: string;
  supplier: string;
  items: PurchaseItem[];
  status: PurchaseStatus;
};

export function purchaseTotal(purchase: Purchase): number {
  return purchase.items.reduce((total, item) => total + item.subtotal, 0);
}

export function confirmedPurchasesTotal(purchases: Purchase[]): number {
  return purchases
    .filter((purchase) => purchase.status === 'confirmed')
    .reduce((total, purchase) => total + purchaseTotal(purchase), 0);
}
