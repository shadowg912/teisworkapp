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
import { formatDate, formatPercent } from '../../shared/utils/format';
import { useLocalStore } from '../../services/local/useLocalStore';
import { GoalEntryForm } from './GoalEntryForm';
import { GoalForm } from './GoalForm';
import { calculateGoal } from './model';
import type { GoalEntry, GoalEntryType } from './model';
import styles from './GoalPage.module.css';

const typePresentation: Record<GoalEntryType, { label: string; tone: BadgeTone }> = {
  contribution: { label: 'Aporte', tone: 'success' },
  investment_withdrawal: { label: 'Retiro para inversión', tone: 'warning' },
};

const columns: Column<GoalEntry>[] = [
  {
    key: 'date',
    header: 'Fecha',
    render: (row) => formatDate(row.date),
  },
  {
    key: 'type',
    header: 'Tipo',
    render: (row) => {
      const presentation = typePresentation[row.type];
      return <Badge tone={presentation.tone}>{presentation.label}</Badge>;
    },
  },
  {
    key: 'account',
    header: 'Cuenta',
    render: (row) => row.account,
  },
  {
    key: 'note',
    header: 'Nota',
    render: (row) => <span className={styles.note}>{row.note || '—'}</span>,
  },
  {
    key: 'amount',
    header: 'Importe',
    align: 'right',
    render: (row) => (
      <Amount
        value={row.type === 'contribution' ? row.amount : -row.amount}
        currency={row.currency}
        signed
      />
    ),
  },
];

export function GoalPage() {
  const state = useLocalStore();
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [goalFormMode, setGoalFormMode] = useState<'create' | 'edit'>('create');
  const [entryFormOpen, setEntryFormOpen] = useState(false);

  const goal = state.goal?.status === 'active' ? state.goal : null;
  const summary = calculateGoal(goal, state.goalEntries);
  const entries = [...state.goalEntries].sort(
    (left, right) =>
      right.date.localeCompare(left.date) ||
      right.createdAt.localeCompare(left.createdAt),
  );
  const progressPercent = Math.round(summary.progress * 100);

  function openCreateGoal() {
    setGoalFormMode('create');
    setGoalFormOpen(true);
  }

  function openEditGoal() {
    setGoalFormMode('edit');
    setGoalFormOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Objetivo de utilidad"
        description="Una sola meta activa. El avance se mide por el capital guardado, no por las ventas ni por el resultado del mes."
        actions={
          goal ? (
            <>
              <Button variant="secondary" onClick={openEditGoal}>
                Actualizar meta
              </Button>
              <Button onClick={() => setEntryFormOpen(true)}>
                Registrar aporte o retiro
              </Button>
            </>
          ) : (
            <Button onClick={openCreateGoal}>Crear objetivo</Button>
          )
        }
      />

      {!goal ? (
        <Card>
          <EmptyState
            title="Sin objetivo activo"
            description="Crea la meta de utilidad para empezar a guardar capital. El avance se calcula como aportes menos retiros."
            action={
              <Button size="sm" onClick={openCreateGoal}>
                Crear objetivo
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <section className={styles.progressCard} aria-labelledby="goal-progress-title">
            <div className={styles.progressHeader}>
              <div>
                <p className={styles.eyebrow}>{goal.name}</p>
                <h2 id="goal-progress-title" className={styles.progressTitle}>
                  Capital guardado
                </h2>
                <p className={styles.progressValue}>
                  <Amount value={summary.saved} currency={goal.currency} />
                </p>
                <p className={styles.progressMeta}>
                  de <Amount value={goal.target} currency={goal.currency} /> ·{' '}
                  {formatPercent(summary.progress)} completado
                </p>
              </div>
              <Badge tone="info">En curso</Badge>
            </div>

            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="Avance del objetivo de utilidad"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
            >
              <span
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className={styles.progressHint}>
              Faltan <Amount value={summary.remaining} currency={goal.currency} /> para
              alcanzar la meta.
            </p>
          </section>

          <section className={styles.summary}>
            <MetricList
              metrics={[
                {
                  label: 'Capital aportado',
                  value: <Amount value={summary.contributed} currency={goal.currency} />,
                },
                {
                  label: 'Retirado para inversión',
                  value: <Amount value={summary.withdrawn} currency={goal.currency} />,
                },
                {
                  label: 'Capital guardado',
                  value: <Amount value={summary.saved} currency={goal.currency} />,
                  hint: 'Aportes menos retiros',
                },
                {
                  label: 'Restante',
                  value: <Amount value={summary.remaining} currency={goal.currency} />,
                },
              ]}
            />
          </section>

          <div className={styles.callout} role="note">
            <p className={styles.calloutTitle}>Los retiros deben registrarse</p>
            <p className={styles.calloutText}>
              El capital del objetivo puede retirarse para usarse como inversión, pero cada
              retiro debe quedar registrado como un movimiento explícito. Un retiro reduce
              el capital guardado y no se considera un gasto.
            </p>
          </div>

          <Card title="Movimientos del objetivo" padding="none">
            {entries.length === 0 ? (
              <div className={styles.empty}>
                <EmptyState
                  title="Aún no hay aportes ni retiros"
                  description="Registra el primer aporte para empezar a acumular capital guardado."
                  action={
                    <Button size="sm" onClick={() => setEntryFormOpen(true)}>
                      Registrar movimiento
                    </Button>
                  }
                />
              </div>
            ) : (
              <DataTable
                caption="Aportes y retiros del objetivo"
                columns={columns}
                rows={entries}
                getRowKey={(row) => row.id}
              />
            )}
          </Card>
        </>
      )}

      <GoalForm
        open={goalFormOpen}
        mode={goalFormMode}
        goal={goal}
        onDismiss={() => setGoalFormOpen(false)}
      />
      <GoalEntryForm open={entryFormOpen} onDismiss={() => setEntryFormOpen(false)} />
    </>
  );
}
