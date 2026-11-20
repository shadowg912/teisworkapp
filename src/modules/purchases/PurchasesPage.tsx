import { Card } from '../../shared/components/Card/Card';
import { PageHeader } from '../../shared/components/PageHeader/PageHeader';
import { EmptyState } from '../../shared/components/States/States';

export function PurchasesPage() {
  return (
    <>
      <PageHeader
        title="Compras"
        description="El registro de compras se habilitará cuando estén aprobadas las reglas de inventario y finanzas."
      />

      <Card>
        <EmptyState
          title="Aún no hay compras registradas"
          description="Las compras reales deberán registrar artículos, inventario y movimientos financieros en la misma transacción."
        />
      </Card>
    </>
  );
}
