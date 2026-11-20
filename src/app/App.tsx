import { IonApp, IonPage } from '@ionic/react';
import { BrowserRouter } from 'react-router-dom';

import { AppShell } from '../shared/components/AppShell/AppShell';
import { ThemeProvider } from './providers/ThemeProvider';
import { AppRoutes } from './router/AppRoutes';
import { PowerSyncProvider } from '../services/sync/PowerSyncProvider';

export function App() {
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
