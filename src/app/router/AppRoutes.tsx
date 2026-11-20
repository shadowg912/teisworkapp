import { Route, Routes } from 'react-router-dom';

import { DashboardPage } from '../../modules/dashboard/DashboardPage';
import { ExperimentsPage } from '../../modules/experiments/ExperimentsPage';
import { FinancePage } from '../../modules/finance/FinancePage';
import { GoalPage } from '../../modules/goal/GoalPage';
import { InventoryPage } from '../../modules/inventory/InventoryPage';
import { LoginPage } from '../../modules/auth/LoginPage';
import { NotFoundPage } from '../../modules/not-found/NotFoundPage';
import { PurchasesPage } from '../../modules/purchases/PurchasesPage';
import { SalesPage } from '../../modules/sales/SalesPage';
import { RequireAuth } from '../../shared/components/RequireAuth/RequireAuth';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/goal" element={<GoalPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/experiments" element={<ExperimentsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
