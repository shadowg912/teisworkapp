import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';

import '@fontsource-variable/inter';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './shared/styles/tokens.css';
import './shared/styles/global.css';

import { App } from './app/App';

setupIonicReact({ mode: 'md' });

const container = document.getElementById('root');

if (!container) {
  throw new Error('No se encontró el contenedor #root.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
