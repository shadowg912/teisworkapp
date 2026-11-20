import { useState } from 'react';

import { Amount } from '../../shared/components/Amount/Amount';
import { Badge } from '../../shared/components/Badge/Badge';
import type { BadgeTone } from '../../shared/components/Badge/Badge';
import { Button } from '../../shared/components/Button/Button';
import { Card } from '../../shared/components/Card/Card';
import { DataTable } from '../../shared/components/DataTable/DataTable';
import type { Column } from '../../shared/components/DataTable/DataTable';
import { MetricList } from '../../shared/components/MetricList/MetricList';
import { PageHeader } from '../../shared/components/PageHeader/PageHeader';
import { EmptyState } from '../../shared/components/States/States';
import { TextField } from '../../shared/components/TextField/TextField';
import { formatQuantity } from '../../shared/utils/format';
import { useLocalStore } from '../../services/local/useLocalStore';
import { ProductForm } from './ProductForm';
import { StockMovementForm } from './StockMovementForm';
import { buildInventory } from './model';
import type { ProductStock, StockState } from './model';
import styles from './InventoryPage.module.css';

const stockPresentation: Record<StockState, { label: string; tone: BadgeTone }> = {
  available: { label: 'Disponible', tone: 'success' },
  low: { label: 'Bajo', tone: 'warning' },
  out: { label: 'Agotado', tone: 'danger' },
};

const columns: Column<ProductStock>[] = [
  {
    key: 'product',
    header: 'Producto',
    render: (row) => (
      <span className={styles.product}>
        <span className={styles.productName}>{row.name}</span>
        <span className={styles.sku}>{row.sku}</span>
      </span>
    ),
  },
  {
    key: 'stock',
    header: 'Existencias',
    render: (row) => (
      <span className={styles.stock}>
        <span className={styles.stockValue}>
          {formatQuantity(row.stock)} {row.unit}
        </span>
        <span className={styles.stockMeta}>
          mínimo {formatQuantity(row.minStock)}
        </span>
      </span>
    ),
  },
  {
    key: 'cost',
    header: 'Costo',
    align: 'right',
    render: (row) => <Amount value={row.cost} />,
  },
  {
    key: 'price',
    header: 'Precio',
    align: 'right',
    render: (row) => <Amount value={row.price} />,
  },
  {
    key: 'state',
    header: 'Estado',
    align: 'right',
    render: (row) => {
      const presentation = stockPresentation[row.state];
      return <Badge tone={presentation.tone}>{presentation.label}</Badge>;
    },
  },
];

export function InventoryPage() {
  const state = useLocalStore();
  const [query, setQuery] = useState('');
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [movementFormOpen, setMovementFormOpen] = useState(false);

  const inventory = buildInventory(state.products, state.stockMovements);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = inventory.filter(
    (product) =>
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.sku.toLowerCase().includes(normalizedQuery),
  );
  const totalUnits = inventory.reduce((total, product) => total + product.stock, 0);
  const attentionCount = inventory.filter(
    (product) => product.state !== 'available',
  ).length;

  return (
    <>
      <PageHeader
        title="Inventario"
        description="Productos y existencias calculadas a partir de las entradas y salidas. Los movimientos de inventario son la fuente de verdad."
        actions={
          <>
            <Button variant="secondary" onClick={() => setProductFormOpen(true)}>
              Nuevo producto
            </Button>
            <Button onClick={() => setMovementFormOpen(true)}>
              Registrar movimiento
            </Button>
          </>
        }
      />

      <section className={styles.summary}>
        <MetricList
          metrics={[
            { label: 'Productos registrados', value: formatQuantity(inventory.length) },
            { label: 'Unidades en existencia', value: formatQuantity(totalUnits) },
            { label: 'Requieren atención', value: formatQuantity(attentionCount) },
          ]}
        />
      </section>

      <div className={styles.toolbar}>
        <TextField
          label="Buscar producto"
          type="search"
          placeholder="Nombre o SKU"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
      </div>

      {inventory.length === 0 ? (
        <Card>
          <EmptyState
            title="Aún no hay productos"
            description="Registra el primer producto para empezar a controlar existencias y movimientos."
            action={
              <Button size="sm" onClick={() => setProductFormOpen(true)}>
                Registrar producto
              </Button>
            }
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No hay productos que coincidan"
            description={`Ningún producto coincide con "${query.trim()}".`}
            action={
              <Button variant="secondary" size="sm" onClick={() => setQuery('')}>
                Limpiar búsqueda
              </Button>
            }
          />
        </Card>
      ) : (
        <Card padding="none">
          <DataTable
            caption="Productos y existencias"
            columns={columns}
            rows={filtered}
            getRowKey={(row) => row.id}
          />
        </Card>
      )}

      <ProductForm open={productFormOpen} onDismiss={() => setProductFormOpen(false)} />
      <StockMovementForm
        open={movementFormOpen}
        onDismiss={() => setMovementFormOpen(false)}
      />
    </>
  );
}
