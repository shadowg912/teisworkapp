import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline, menuOutline } from 'ionicons/icons';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { navigationItems } from '../../../app/config/navigation';
import { SyncStatus } from '../SyncStatus/SyncStatus';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import styles from './AppShell.module.css';

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Saltar al contenido
      </a>

      <aside
        id="app-navigation"
        className={styles.sidebar}
        data-open={menuOpen ? 'true' : 'false'}
        aria-label="Navegación principal"
      >
        <div className={styles.brandRow}>
          <Link className={styles.brand} to="/" aria-label="TEIS workapp, ir al dashboard">
            <span className={styles.brandName}>TEIS</span>
            <span className={styles.brandProduct}>workapp</span>
          </Link>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar navegación"
          >
            <IonIcon icon={closeOutline} aria-hidden="true" />
          </button>
        </div>

        <nav className={styles.nav}>
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
              }
            >
              <IonIcon className={styles.navIcon} icon={item.icon} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <SyncStatus />
          <ThemeToggle />
        </div>
      </aside>

      {menuOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar navegación"
        />
      ) : null}

      <div className={styles.stage}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir navegación"
            aria-expanded={menuOpen}
            aria-controls="app-navigation"
          >
            <IonIcon icon={menuOutline} aria-hidden="true" />
          </button>
          <Link className={styles.topbarBrand} to="/">
            TEIS <span>workapp</span>
          </Link>
          <ThemeToggle compact />
        </header>

        <main id="main-content" className={styles.content} tabIndex={-1}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
}
