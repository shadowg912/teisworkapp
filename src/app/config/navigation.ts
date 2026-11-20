import { gridOutline, walletOutline, flagOutline, cubeOutline, cartOutline, receiptOutline, flaskOutline } from 'ionicons/icons';

export type NavigationItem = {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
};

export const navigationItems: NavigationItem[] = [
  { to: '/', label: 'Dashboard', icon: gridOutline, end: true },
  { to: '/finance', label: 'Finanzas', icon: walletOutline },
  { to: '/goal', label: 'Objetivo', icon: flagOutline },
  { to: '/inventory', label: 'Inventario', icon: cubeOutline },
  { to: '/purchases', label: 'Compras', icon: cartOutline },
  { to: '/sales', label: 'Ventas', icon: receiptOutline },
  { to: '/experiments', label: 'Experimentos', icon: flaskOutline },
];
