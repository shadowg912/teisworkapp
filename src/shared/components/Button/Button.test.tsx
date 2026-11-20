import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('ejecuta la acción al pulsarlo', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Guardar</Button>);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('se deshabilita y anuncia la carga', () => {
    render(<Button loading>Sincronizar</Button>);

    const button = screen.getByRole('button', { name: 'Sincronizar' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('respeta el estado deshabilitado explícito', () => {
    render(<Button disabled>Eliminar</Button>);

    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeDisabled();
  });
});
