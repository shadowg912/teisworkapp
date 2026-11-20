import { IonIcon } from '@ionic/react';
import { moonOutline, sunnyOutline } from 'ionicons/icons';

import { useTheme } from '../../../app/providers/ThemeProvider';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'claro' : 'oscuro';
  const label = `Cambiar a tema ${nextTheme}`;
  const icon = theme === 'dark' ? sunnyOutline : moonOutline;

  if (compact) {
    return (
      <IconButton label={label} onClick={toggleTheme}>
        <IonIcon icon={icon} aria-hidden="true" />
      </IconButton>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme} icon={<IonIcon icon={icon} />}>
      Tema {nextTheme}
    </Button>
  );
}
