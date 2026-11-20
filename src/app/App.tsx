import { useEffect, useState } from 'react';
import { IonApp, IonPage } from '@ionic/react';
import { BrowserRouter } from 'react-router-dom';

import { AppShell } from '../shared/components/AppShell/AppShell';
import { ThemeProvider } from './providers/ThemeProvider';
import { AppRoutes } from './router/AppRoutes';
import { PowerSyncProvider } from '../services/sync/PowerSyncProvider';
import { fetchSession } from '../services/auth/authService';

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        await fetchSession();
      } catch {
        // Sesión no activa: el usuario verá la pantalla de login
      }

      if (mounted) {
        setReady(true);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <IonApp>
        <IonPage />
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonPage>
        <PowerSyncProvider>
          <ThemeProvider>
            <BrowserRouter>
              <AppShell>
                <AppRoutes />
              </AppShell>
            </BrowserRouter>
          </ThemeProvider>
        </PowerSyncProvider>
      </IonPage>
    </IonApp>
  );
}
