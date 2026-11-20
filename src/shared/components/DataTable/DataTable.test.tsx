import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataTable } from './DataTable';
import type { Column } from './DataTable';

type Row = { id: string; name: string; total: number };

const columns: Column<Row>[] = [
  { key: 'name', header: 'Producto', render: (row) => row.name },
  { key: 'total', header: 'Total', align: 'right', render: (row) => row.total },
];

describe('DataTable', () => {
  it('muestra encabezados, filas y etiquetas para la vista móvil', () => {
    render(
      <DataTable
        caption="Productos de prueba"
        columns={columns}
        rows={[
          { id: '1', name: 'Café', total: 550 },
          { id: '2', name: 'Filtro', total: 690 },
        ]}
        getRowKey={(row) => row.id}
      />,
    );

    expect(screen.getByRole('table', { name: 'Productos de prueba' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Producto' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Café' })).toHaveAttribute(
      'data-label',
      'Producto',
    );
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });
});
