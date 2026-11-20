import type { Account } from '../../shared/types/accounts';
import type { Currency } from '../../shared/utils/format';
import type {
  CorrectionDirection,
  FinanceMovement,
  MovementType,
} from '../../modules/finance/model';
import {
  defaultCategory,
  isGoalMovement,
  movementEffect,
} from '../../modules/finance/model';
import type {
  Product,
  StockMovement,
  StockMovementType,
} from '../../modules/inventory/model';
import { calculateStock } from '../../modules/inventory/model';
import type { Goal, GoalEntry, GoalEntryType } from '../../modules/goal/model';
import { calculateGoal } from '../../modules/goal/model';

const STORAGE_KEY = 'teis.workapp.local.v1';

export type PendingOperationKind =
  | 'finance.movement.create'
  | 'goal.create'
  | 'goal.update'
  | 'goal.entry.create'
  | 'inventory.product.create'
  | 'inventory.movement.create';

export type PendingOperation = {
  id: string;
  kind: PendingOperationKind;
  entityId: string;
  createdAt: string;
};

export type LocalState = {
  version: 1;
  movements: FinanceMovement[];
  products: Product[];
  stockMovements: StockMovement[];
  goal: Goal | null;
  goalEntries: GoalEntry[];
  outbox: PendingOperation[];
};

export type StoreResult = { ok: true } | { ok: false; error: string };

export type NewMovementInput = {
  type: MovementType;
  date: string;
  description: string;
  category: string;
  account: Account;
  counterpart?: Account;
  amount: number;
  currency: Currency;
  note?: string;
  correctionDirection?: CorrectionDirection;
};

export type NewProductInput = {
  name: string;
  sku: string;
  unit: string;
  minStock: number;
  cost: number;
  price: number;
};

export type NewStockMovementInput = {
  productId: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number;
  reason?: string;
  date: string;
};

export type NewGoalInput = {
  name: string;
  target: number;
  currency: Currency;
};

export type NewGoalEntryInput = {
  type: GoalEntryType;
  account: Account;
  amount: number;
  currency: Currency;
  date: string;
  note: string;
};

function emptyState(): LocalState {
  return {
    version: 1,
    movements: [],
    products: [],
    stockMovements: [],
    goal: null,
    goalEntries: [],
    outbox: [],
  };
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function normalizeMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeQuantity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00`));
}

function loadState(): LocalState {
  if (typeof window === 'undefined') {
    return emptyState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyState();
    }

    const parsed = JSON.parse(raw) as Partial<LocalState>;
    if (parsed.version !== 1) {
      return emptyState();
    }

    return {
      version: 1,
      movements: Array.isArray(parsed.movements) ? parsed.movements : [],
      products: Array.isArray(parsed.products) ? parsed.products : [],
      stockMovements: Array.isArray(parsed.stockMovements) ? parsed.stockMovements : [],
      goal: parsed.goal ?? null,
      goalEntries: Array.isArray(parsed.goalEntries) ? parsed.goalEntries : [],
      outbox: Array.isArray(parsed.outbox) ? parsed.outbox : [],
    };
  } catch {
    return emptyState();
  }
}

let state = loadState();
const listeners = new Set<() => void>();

function persist(next: LocalState): void {
  state = next;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // La sesión sigue funcionando en memoria si el almacenamiento no está disponible.
    }
  }

  for (const listener of listeners) {
    listener();
  }
}

function enqueue(
  kind: PendingOperationKind,
  entityId: string,
  createdAt: string,
): PendingOperation {
  return { id: createId(), kind, entityId, createdAt };
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): LocalState {
  return state;
}

function activeGoal(): Goal | null {
  return state.goal?.status === 'active' ? state.goal : null;
}

function savedCapital(): number {
  return calculateGoal(activeGoal(), state.goalEntries).saved;
}

function buildGoalEntryAndMovement(params: {
  goal: Goal;
  entryType: GoalEntryType;
  account: Account;
  amount: number;
  currency: Currency;
  date: string;
  note: string;
  description?: string;
  category?: string;
}): { entry: GoalEntry; movement: FinanceMovement } {
  const createdAt = new Date().toISOString();
  const entryId = createId();
  const movementId = createId();
  const isContribution = params.entryType === 'contribution';

  const entry: GoalEntry = {
    id: entryId,
    operationId: createId(),
    goalId: params.goal.id,
    date: params.date,
    type: params.entryType,
    account: params.account,
    amount: params.amount,
    currency: params.currency,
    note: params.note,
    createdAt,
  };

  const movement: FinanceMovement = {
    id: movementId,
    operationId: createId(),
    date: params.date,
    description:
      params.description ??
      (isContribution ? 'Aporte al objetivo' : 'Retiro para inversión'),
    category: params.category ?? 'Objetivo',
    type: isContribution ? 'saved_capital' : 'investment_withdrawal',
    effect: isContribution ? 'out' : 'in',
    account: params.account,
    amount: params.amount,
    currency: params.currency,
    note: params.note,
    goalEntryId: entry.id,
    createdAt,
  };

  return { entry, movement };
}

export function createFinanceMovement(input: NewMovementInput): StoreResult {
  const amount = normalizeMoney(input.amount);
  const description = input.description.trim();
  const note = input.note?.trim() ?? '';

  if (!isValidDate(input.date)) {
    return { ok: false, error: 'Indica una fecha válida.' };
  }

  if (!description) {
    return { ok: false, error: 'La descripción es obligatoria.' };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'El importe debe ser mayor que cero.' };
  }

  if (input.type === 'transfer') {
    if (!input.counterpart) {
      return { ok: false, error: 'Selecciona la cuenta de destino.' };
    }

    if (input.counterpart === input.account) {
      return { ok: false, error: 'La cuenta de destino debe ser distinta.' };
    }
  }

  let goal: Goal | null = null;

  if (isGoalMovement(input.type)) {
    goal = activeGoal();

    if (!goal) {
      return {
        ok: false,
        error: 'Primero crea un objetivo activo para guardar capital o registrar retiros.',
      };
    }

    if (input.type === 'investment_withdrawal' && amount > savedCapital()) {
      return {
        ok: false,
        error: `El retiro supera el capital guardado disponible (${savedCapital().toFixed(2)}).`,
      };
    }
  }

  const createdAt = new Date().toISOString();
  const movementId = createId();
  const movement: FinanceMovement = {
    id: movementId,
    operationId: createId(),
    date: input.date,
    description,
    category: input.category.trim() || defaultCategory(input.type),
    type: input.type,
    effect: movementEffect(input.type, input.correctionDirection),
    account: input.account,
    counterpart: input.type === 'transfer' ? input.counterpart : undefined,
    amount,
    currency: input.currency,
    note: note || undefined,
    createdAt,
  };

  let outbox: PendingOperation[] = [
    enqueue('finance.movement.create', movement.id, createdAt),
  ];
  let goalEntries = state.goalEntries;

  if (goal && isGoalMovement(input.type)) {
    const linked = buildGoalEntryAndMovement({
      goal,
      entryType: input.type === 'saved_capital' ? 'contribution' : 'investment_withdrawal',
      account: input.account,
      amount,
      currency: input.currency,
      date: input.date,
      note: note || description,
      description,
      category: movement.category,
    });

    movement.goalEntryId = linked.entry.id;
    goalEntries = [linked.entry, ...goalEntries];
    outbox = [
      enqueue('goal.entry.create', linked.entry.id, createdAt),
      ...outbox,
    ];
  }

  persist({
    ...state,
    movements: [movement, ...state.movements],
    goalEntries,
    outbox: [...state.outbox, ...outbox],
  });

  return { ok: true };
}

export function createGoal(input: NewGoalInput): StoreResult {
  const name = input.name.trim();
  const target = normalizeMoney(input.target);

  if (!name) {
    return { ok: false, error: 'El nombre del objetivo es obligatorio.' };
  }

  if (!Number.isFinite(target) || target <= 0) {
    return { ok: false, error: 'La meta debe ser mayor que cero.' };
  }

  if (activeGoal()) {
    return {
      ok: false,
      error: 'Ya existe un objetivo activo. Actualiza su meta antes de crear otro.',
    };
  }

  const createdAt = new Date().toISOString();
  const goal: Goal = {
    id: createId(),
    name,
    target,
    currency: input.currency,
    status: 'active',
    createdAt,
    updatedAt: createdAt,
    version: 1,
  };

  persist({
    ...state,
    goal,
    outbox: [...state.outbox, enqueue('goal.create', goal.id, createdAt)],
  });

  return { ok: true };
}

export function updateGoal(input: NewGoalInput): StoreResult {
  const goal = activeGoal();

  if (!goal) {
    return { ok: false, error: 'No hay un objetivo activo para actualizar.' };
  }

  const name = input.name.trim();
  const target = normalizeMoney(input.target);

  if (!name) {
    return { ok: false, error: 'El nombre del objetivo es obligatorio.' };
  }

  if (!Number.isFinite(target) || target <= 0) {
    return { ok: false, error: 'La meta debe ser mayor que cero.' };
  }

  const updatedAt = new Date().toISOString();
  const nextGoal: Goal = {
    ...goal,
    name,
    target,
    currency: input.currency,
    updatedAt,
    version: goal.version + 1,
  };

  persist({
    ...state,
    goal: nextGoal,
    outbox: [...state.outbox, enqueue('goal.update', nextGoal.id, updatedAt)],
  });

  return { ok: true };
}

export function createGoalEntry(input: NewGoalEntryInput): StoreResult {
  const goal = activeGoal();
  const amount = normalizeMoney(input.amount);
  const note = input.note.trim();

  if (!goal) {
    return { ok: false, error: 'Primero crea un objetivo activo.' };
  }

  if (!isValidDate(input.date)) {
    return { ok: false, error: 'Indica una fecha válida.' };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'El importe debe ser mayor que cero.' };
  }

  if (input.type === 'investment_withdrawal') {
    if (!note) {
      return { ok: false, error: 'El retiro debe tener una nota que explique su destino.' };
    }

    if (amount > savedCapital()) {
      return {
        ok: false,
        error: `El retiro supera el capital guardado disponible (${savedCapital().toFixed(2)}).`,
      };
    }
  }

  const linked = buildGoalEntryAndMovement({
    goal,
    entryType: input.type,
    account: input.account,
    amount,
    currency: input.currency,
    date: input.date,
    note,
  });
  const createdAt = new Date().toISOString();

  persist({
    ...state,
    goalEntries: [linked.entry, ...state.goalEntries],
    movements: [linked.movement, ...state.movements],
    outbox: [
      ...state.outbox,
      enqueue('goal.entry.create', linked.entry.id, createdAt),
      enqueue('finance.movement.create', linked.movement.id, createdAt),
    ],
  });

  return { ok: true };
}

export function createProduct(input: NewProductInput): StoreResult {
  const name = input.name.trim();
  const sku = input.sku.trim();
  const unit = input.unit.trim() || 'u';
  const minStock = normalizeQuantity(input.minStock);
  const cost = normalizeMoney(input.cost);
  const price = normalizeMoney(input.price);

  if (!name) {
    return { ok: false, error: 'El nombre del producto es obligatorio.' };
  }

  if (!sku) {
    return { ok: false, error: 'El SKU es obligatorio.' };
  }

  if (state.products.some((product) => product.sku.toLowerCase() === sku.toLowerCase())) {
    return { ok: false, error: 'Ya existe un producto con ese SKU.' };
  }

  if (
    !Number.isFinite(minStock) ||
    !Number.isFinite(cost) ||
    !Number.isFinite(price) ||
    minStock < 0 ||
    cost < 0 ||
    price < 0
  ) {
    return { ok: false, error: 'Las cantidades y los importes no pueden ser negativos.' };
  }

  const createdAt = new Date().toISOString();
  const product: Product = {
    id: createId(),
    sku,
    name,
    unit,
    minStock,
    cost,
    price,
    createdAt,
    updatedAt: createdAt,
  };

  persist({
    ...state,
    products: [product, ...state.products],
    outbox: [...state.outbox, enqueue('inventory.product.create', product.id, createdAt)],
  });

  return { ok: true };
}

export function createStockMovement(input: NewStockMovementInput): StoreResult {
  const product = state.products.find((item) => item.id === input.productId);
  const quantity = normalizeQuantity(input.quantity);

  if (!product) {
    return { ok: false, error: 'Selecciona un producto válido.' };
  }

  if (!isValidDate(input.date)) {
    return { ok: false, error: 'Indica una fecha válida.' };
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, error: 'La cantidad debe ser mayor que cero.' };
  }

  if (input.type === 'out') {
    const stock = calculateStock(product.id, state.stockMovements);
    if (quantity > stock) {
      return {
        ok: false,
        error: `Solo hay ${stock} ${product.unit} disponibles de ${product.name}.`,
      };
    }
  }

  const unitCost =
    input.unitCost === undefined ? undefined : normalizeMoney(input.unitCost);

  if (unitCost !== undefined && (!Number.isFinite(unitCost) || unitCost < 0)) {
    return { ok: false, error: 'El costo unitario no puede ser negativo.' };
  }

  const createdAt = new Date().toISOString();
  const movement: StockMovement = {
    id: createId(),
    operationId: createId(),
    productId: product.id,
    type: input.type,
    quantity,
    unitCost: unitCost ?? (input.type === 'in' ? product.cost : undefined),
    reason: input.reason?.trim() || undefined,
    date: input.date,
    createdAt,
  };

  persist({
    ...state,
    stockMovements: [movement, ...state.stockMovements],
    outbox: [
      ...state.outbox,
      enqueue('inventory.movement.create', movement.id, createdAt),
    ],
  });

  return { ok: true };
}

export function resetLocalState(): void {
  persist(emptyState());
}
