import { Link } from 'react-router-dom';

import { Amount } from '../../shared/components/Amount/Amount';
import { Badge } from '../../shared/components/Badge/Badge';
import { Card } from '../../shared/components/Card/Card';
import { DataTable } from '../../shared/components/DataTable/DataTable';
import type { Column } from '../../shared/components/DataTable/DataTable';
import { MetricList } from '../../shared/components/MetricList/MetricList';
import { PageHeader } from '../../shared/components/PageHeader/PageHeader';
import { EmptyState } from '../../shared/components/States/States';
import { formatDate, formatPercent, formatQuantity } from '../../shared/utils/format';
import { useLocalStore } from '../../services/local/useLocalStore';
import { calculateFinance, getMonthKey } from '../finance/model';
import type { FinanceMovement } from '../finance/model';
import { calculateGoal } from '../goal/model';
import { buildInventory } from '../inventory/model';
import styles from './DashboardPage.module.css';

const activityColumns: Column<FinanceMovement>[] = [
  {
    key: 'date',
    header: 'Fecha',
    render: (row) => formatDate(row.date),
  },
  {
    key: 'kind',
    header: 'Tipo',
    render: (row) => (
      <Badge tone={row.type === 'income' ? 'success' : 'danger'}>
        {row.type === 'income' ? 'Ingreso' : 'Gasto'}
      </Badge>
    ),
  },
  {
    key: 'detail',
    header: 'Detalle',
    render: (row) => <span className={styles.activityDetail}>{row.description}</span>,
  },
  {
    key: 'amount',
    header: 'Importe',
    align: 'right',
    render: (row) => (
      <Amount
        value={row.type === 'income' ? row.amount : -row.amount}
        currency={row.currency}
        signed
      />
    ),
  },
];

export function DashboardPage() {
  const state = useLocalStore();
  const goal = state.goal?.status === 'active' ? state.goal : null;
  const summary = calculateFinance(state.movements, { month: getMonthKey() });
  const goalSummary = calculateGoal(goal, state.goalEntries);
  const inventory = buildInventory(state.products, state.stockMovements);
  const recentActivity = [...state.movements]
    .filter((movement) => movement.type === 'income' || movement.type === 'expense')
    .sort(
      (left, right) =>
        right.date.localeCompare(left.date) ||
        right.createdAt.localeCompare(left.createdAt),
    )
    .slice(0, 4);
  const attention = inventory
    .filter((product) => product.state !== 'available')
    .sort((left, right) => left.stock - right.stock)
    .slice(0, 4);
  const progressPercent = Math.round(goalSummary.progress * 100);
  const currency = goal?.currency ?? 'DOP';

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Estado general de la operación con los datos guardados en este dispositivo."
      />

      <section className={styles.hero} aria-labelledby="capital-title">
        <div className={styles.heroMain}>
          <h2 id="capital-title" className={styles.heroLabel}>
            Capital disponible
          </h2>
          <p className={styles.heroValue}>
            <Amount value={summary.available} />
          </p>
          <p className={styles.heroMeta}>
            Saldo de Caja y Banco. Capital total con el objetivo:{' '}
            <Amount value={summary.total} />.
          </p>
        </div>

        <MetricList
          metrics={[
            {
              label: 'Ingresos del mes',
              value: <Amount value={summary.income} signed />,
            },
            {
              label: 'Gastos del mes',
              value: <Amount value={-summary.expenses} signed />,
            },
            {
              label: 'Resultado del mes',
              value: <Amount value={summary.result} signed />,
            },
          ]}
        />
      </section>

      <Card
        className={styles.goal}
        title="Objetivo de utilidad"
        action={
          <Link className={styles.link} to="/goal">
            Ver objetivo
          </Link>
        }
      >
        {!goal ? (
          <EmptyState
            title="Sin objetivo activo"
            description="Crea una meta para empezar a guardar capital y seguir su avance."
            action={
              <Link className={styles.link} to="/goal">
                Crear objetivo
              </Link>
            }
          />
        ) : (
          <div className={styles.goalBody}>
            <div>
              <p className={styles.goalLabel}>Capital guardado</p>
              <p className={styles.goalValue}>
                <Amount value={goalSummary.saved} currency={currency} />
              </p>
              <p className={styles.goalMeta}>
                Meta <Amount value={goal.target} currency={currency} /> ·{' '}
                {formatPercent(goalSummary.progress)} completado
              </p>
            </div>

            <div>
              <div
                className={styles.goalTrack}
                role="progressbar"
                aria-label="Avance del objetivo de utilidad"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
              >
                <span
                  className={styles.goalFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className={styles.goalHint}>
                Restan <Amount value={goalSummary.remaining} currency={currency} />.
                Retirado para inversión:{' '}
                <Amount value={goalSummary.withdrawn} currency={currency} />.
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className={styles.panels}>
        <Card
          title="Actividad reciente"
          action={
            <Link className={styles.link} to="/finance">
              Ver finanzas
            </Link>
          }
          padding="none"
        >
          {recentActivity.length === 0 ? (
            <div className={styles.empty}>
              <EmptyState
                title="Sin actividad reciente"
                description="Los ingresos y gastos registrados aparecerán aquí."
              />
            </div>
          ) : (
            <DataTable
              caption="Movimientos financieros recientes"
              columns={activityColumns}
              rows={recentActivity}
              getRowKey={(row) => row.id}
            />
          )}
        </Card>

        <Card title="Requiere atención">
          {inventory.length === 0 ? (
            <EmptyState
              title="Sin productos registrados"
              description="Registra productos para ver aquí las existencias bajas o agotadas."
            />
          ) : attention.length === 0 ? (
            <EmptyState
              title="Sin alertas de inventario"
              description="Todos los productos están por encima de su mínimo."
            />
          ) : (
            <ul className={styles.alertList}>
              {attention.map((item) => (
                <li key={item.id} className={styles.alert}>
                  <div>
                    <p className={styles.alertTitle}>{item.name}</p>
                    <p className={styles.alertMeta}>
                      {item.state === 'out'
                        ? `Agotado · mínimo ${formatQuantity(item.minStock)} ${item.unit}`
                        : `Inventario bajo · ${formatQuantity(item.stock)} de ${formatQuantity(item.minStock)} ${item.unit}`}
                    </p>
                  </div>
                  <Badge tone={item.state === 'out' ? 'danger' : 'warning'}>
                    {item.state === 'out' ? 'Agotado' : 'Bajo'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        className={styles.experiments}
        title="Experimentos en curso"
        action={
          <Link className={styles.link} to="/experiments">
            Ver experimentos
          </Link>
        }
      >
        <EmptyState
          title="Sin experimentos registrados"
          description="El módulo de experimentos todavía no tiene datos. Se habilitará en una próxima etapa."
        />
      </Card>
    </>
  );
}
