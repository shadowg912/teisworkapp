import { IonApp, IonPage } from '@ionic/react';
import { BrowserRouter } from 'react-router-dom';

import { AppShell } from '../shared/components/AppShell/AppShell';
import { ThemeProvider } from './providers/ThemeProvider';
import { AppRoutes } from './router/AppRoutes';

export function App() {
  return (
    <IonApp>
      <IonPage>
        <ThemeProvider>
          <BrowserRouter>
            <AppShell>
              <AppRoutes />
            </AppShell>
          </BrowserRouter>
        </ThemeProvider>
      </IonPage>
    </IonApp>
  );
}
