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
import { formatDate } from '../../shared/utils/format';
import { useLocalStore } from '../../services/local/useLocalStore';
import { MovementForm } from './MovementForm';
import { calculateFinance, movementTypeLabels } from './model';
import type { FinanceMovement, MovementType } from './model';
import styles from './FinancePage.module.css';

type Filter = 'all' | 'income' | 'expense' | 'capital';

const filterOptions: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'expense', label: 'Gastos' },
  { value: 'capital', label: 'Capital' },
];

const capitalTypes: MovementType[] = [
  'capital_contribution',
  'transfer',
  'saved_capital',
  'investment_withdrawal',
  'correction',
];

const typeTones: Record<MovementType, BadgeTone> = {
  capital_contribution: 'info',
  income: 'success',
  expense: 'danger',
  transfer: 'neutral',
  saved_capital: 'info',
  investment_withdrawal: 'warning',
  correction: 'neutral',
};

const columns: Column<FinanceMovement>[] = [
  {
    key: 'date',
    header: 'Fecha',
    render: (row) => formatDate(row.date),
  },
  {
    key: 'description',
    header: 'Movimiento',
    render: (row) => (
      <span className={styles.movement}>
        <span className={styles.movementName}>{row.description}</span>
        <span className={styles.movementCategory}>{row.category}</span>
      </span>
    ),
  },
  {
    key: 'type',
    header: 'Tipo',
    render: (row) => <Badge tone={typeTones[row.type]}>{movementTypeLabels[row.type]}</Badge>,
  },
  {
    key: 'account',
    header: 'Cuenta',
    render: (row) =>
      row.counterpart ? `${row.account} → ${row.counterpart}` : row.account,
  },
  {
    key: 'amount',
    header: 'Importe',
    align: 'right',
    render: (row) => {
      if (row.effect === 'neutral') {
        return <Amount value={row.amount} currency={row.currency} />;
      }

      return (
        <Amount
          value={row.effect === 'in' ? row.amount : -row.amount}
          currency={row.currency}
          signed
        />
      );
    },
  },
];

function matchesFilter(row: FinanceMovement, filter: Filter): boolean {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'income' || filter === 'expense') {
    return row.type === filter;
  }

  return capitalTypes.includes(row.type);
}

export function FinancePage() {
  const state = useLocalStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [formOpen, setFormOpen] = useState(false);

  const movements = [...state.movements].sort(
    (left, right) =>
      right.date.localeCompare(left.date) ||
      right.createdAt.localeCompare(left.createdAt),
  );
  const summary = calculateFinance(movements);
  const rows = movements.filter((row) => matchesFilter(row, filter));

  return (
    <>
      <PageHeader
        title="Finanzas"
        description="Movimientos de las cuentas Caja y Banco. Los movimientos confirmados no se editan; las correcciones se registran como un movimiento nuevo."
        actions={<Button onClick={() => setFormOpen(true)}>Registrar movimiento</Button>}
      />

      <section className={styles.summary}>
        <MetricList
          metrics={[
            { label: 'Caja', value: <Amount value={summary.caja} /> },
            { label: 'Banco', value: <Amount value={summary.banco} /> },
            {
              label: 'Capital disponible',
              value: <Amount value={summary.available} />,
              hint: 'Caja + Banco',
            },
            {
              label: 'Capital guardado',
              value: <Amount value={summary.saved} />,
              hint: 'Objetivo de utilidad',
            },
          ]}
        />
      </section>

      <Card padding="none">
        <div className={styles.toolbar}>
          <div className={styles.filters} role="group" aria-label="Filtrar movimientos">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={[
                  styles.filter,
                  filter === option.value ? styles.filterActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {movements.length === 0 ? (
          <div className={styles.empty}>
            <EmptyState
              title="Aún no hay movimientos"
              description="Registra el primer movimiento de Caja o Banco. Se guardará en este dispositivo y quedará pendiente de sincronizar."
              action={
                <Button size="sm" onClick={() => setFormOpen(true)}>
                  Registrar movimiento
                </Button>
              }
            />
          </div>
        ) : rows.length === 0 ? (
          <div className={styles.empty}>
            <EmptyState
              title="No hay movimientos con este filtro"
              description="Prueba con otro filtro para ver los movimientos registrados."
              action={
                <Button variant="secondary" size="sm" onClick={() => setFilter('all')}>
                  Ver todos
                </Button>
              }
            />
          </div>
        ) : (
          <DataTable
            caption="Movimientos financieros"
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
          />
        )}
      </Card>

      <MovementForm open={formOpen} onDismiss={() => setFormOpen(false)} />
    </>
  );
}
