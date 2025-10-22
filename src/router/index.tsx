import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PointOfSalePage } from '../pages/additional-paid-features/configpro/PointOfSalePage';
import { ThemePlaygroundPage } from '../pages/additional-paid-features/configpro/ThemePlaygroundPage';
import { FeatureManagementPage } from '../pages/admin/FeatureManagementPage';
import { FeatureConstructionDashboardPage } from '../pages/free-starter-templates/configpro/FeatureConstructionDashboardPage';
import { LoginPage } from '../pages/free-starter-templates/configpro/LoginPage';
import { DaycareDashboardPage } from '../pages/free-starter-templates/daycare/DaycareDashboardPage';
import { ErrorBoundaryPage, SharedFeaturesPage } from '../pages/shared/features';
import { FeaturePlaygroundPage } from '../pages/dev/FeaturePlaygroundPage';
import { ForecastingLayout, DemandStudio, ScenarioWorkbench } from '../routes/forecasting';
import { SchedulingLayout, ManagerConsole, EmployeePortal } from '../routes/scheduling';
import {
  ARLayout,
  ARHome,
  ARInvoices,
  ARPayments,
  ARCustomers,
  ARAging,
  ARDisputes,
  ARAutomation,
  ARReports,
  ARSettings
} from '../routes/accounts-receivable';
import {
  APLayout,
  APHome,
  Bills as APBills,
  Vendors as APVendors,
  PurchaseOrders as APPurchaseOrders,
  Match as APMatch,
  Approvals as APApprovals,
  Payments as APPayments,
  Exceptions as APExceptions,
  Automation as APAutomation,
  Reports as APReports,
  Settings as APSettings,
} from '../routes/ap';
import {
  BaseAutomotivePage,
  BaseConstructionPage,
  BaseDaycarePage,
  BaseRetailPage,
} from '../pages/industries';
import { sharedRoutes } from '../app/routes/sharedRoutes';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/daycare" element={<DaycareDashboardPage />} />
    <Route path="/pos" element={<PointOfSalePage />} />
    <Route path="/theme-lab" element={<ThemePlaygroundPage />} />
    <Route path="/dashboard" element={<FeatureConstructionDashboardPage />} />
    <Route path="/dev/features" element={<FeaturePlaygroundPage />} />
    <Route path="/shared/features" element={<SharedFeaturesPage />} />
    <Route path="/admin/features" element={<FeatureManagementPage />} />
    <Route path="/shared/error-boundary" element={<ErrorBoundaryPage />} />
    <Route path="/industries/retail" element={<BaseRetailPage />} />
    <Route path="/industries/daycare" element={<BaseDaycarePage />} />
    <Route path="/industries/construction" element={<BaseConstructionPage />} />
    <Route path="/industries/automotive" element={<BaseAutomotivePage />} />
    <Route element={<Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>} />}>
      {sharedRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Route>
    <Route path="/scheduling" element={<SchedulingLayout />}>
      <Route index element={<ManagerConsole />} />
      <Route path="manager" element={<ManagerConsole />} />
      <Route path="employee" element={<EmployeePortal />} />
    </Route>
    <Route path="/forecasting" element={<ForecastingLayout />}>
      <Route index element={<DemandStudio />} />
      <Route path="studio" element={<DemandStudio />} />
      <Route path="workbench" element={<ScenarioWorkbench />} />
    </Route>
    <Route path="/ap" element={<APLayout />}>
      <Route index element={<APHome />} />
      <Route path="bills" element={<APBills />} />
      <Route path="vendors" element={<APVendors />} />
      <Route path="purchase-orders" element={<APPurchaseOrders />} />
      <Route path="match" element={<APMatch />} />
      <Route path="approvals" element={<APApprovals />} />
      <Route path="payments" element={<APPayments />} />
      <Route path="exceptions" element={<APExceptions />} />
      <Route path="automation" element={<APAutomation />} />
      <Route path="reports" element={<APReports />} />
      <Route path="settings" element={<APSettings />} />
    </Route>
    <Route path="/ar" element={<ARLayout />}>
      <Route index element={<ARHome />} />
      <Route path="invoices" element={<ARInvoices />} />
      <Route path="payments" element={<ARPayments />} />
      <Route path="customers" element={<ARCustomers />} />
      <Route path="aging" element={<ARAging />} />
      <Route path="disputes" element={<ARDisputes />} />
      <Route path="automation" element={<ARAutomation />} />
      <Route path="reports" element={<ARReports />} />
      <Route path="settings" element={<ARSettings />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
