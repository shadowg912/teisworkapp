import { Card } from '../../shared/components/Card/Card';
import { PageHeader } from '../../shared/components/PageHeader/PageHeader';
import { EmptyState } from '../../shared/components/States/States';

export function ExperimentsPage() {
  return (
    <>
      <PageHeader
        title="Experimentos"
        description="Comparación entre lo esperado y lo obtenido en cada experimento comercial."
      />

      <Card>
        <EmptyState
          title="Sin experimentos registrados"
          description="El módulo de experimentos todavía no tiene datos. Se habilitará en una próxima etapa."
        />
      </Card>
    </>
  );
}
