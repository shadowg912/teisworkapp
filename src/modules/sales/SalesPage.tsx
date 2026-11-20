import { Card } from '../../shared/components/Card/Card';
import { PageHeader } from '../../shared/components/PageHeader/PageHeader';
import { EmptyState } from '../../shared/components/States/States';

export function SalesPage() {
  return (
    <>
      <PageHeader
        title="Ventas"
        description="El registro de ventas se habilitará cuando estén aprobadas las reglas de inventario, finanzas y sincronización offline."
      />

      <Card>
        <EmptyState
          title="Aún no hay ventas registradas"
          description="Una venta real deberá registrar inventario y movimientos financieros en la misma transacción."
        />
      </Card>
    </>
  );
}
