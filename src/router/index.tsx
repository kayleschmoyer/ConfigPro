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
  SchedulerLayout,
  Schedule as SchedulerSchedule,
  Availability as SchedulerAvailability,
  Rules as SchedulerRules,
  AutoScheduler as SchedulerAuto,
  Swaps as SchedulerSwaps,
  Publishing as SchedulerPublishing,
  Reports as SchedulerReports,
  Settings as SchedulerSettings,
} from '../features/shared/scheduler';
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
  TimeClockLayout,
  TimeClockHome,
  Clock,
  Breaks,
  Timesheets,
  Approvals,
  Exceptions,
  Policies,
  Devices,
  Reports,
  Settings,
  Scheduling,
} from '../features/shared/timeclock';
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
    <Route path="/scheduler" element={<SchedulerLayout />}>
      <Route index element={<SchedulerSchedule />} />
      <Route path="availability" element={<SchedulerAvailability />} />
      <Route path="rules" element={<SchedulerRules />} />
      <Route path="auto" element={<SchedulerAuto />} />
      <Route path="swaps" element={<SchedulerSwaps />} />
      <Route path="publishing" element={<SchedulerPublishing />} />
      <Route path="reports" element={<SchedulerReports />} />
      <Route path="settings" element={<SchedulerSettings />} />
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
    <Route path="/time-clock" element={<TimeClockLayout />}>
      <Route index element={<TimeClockHome />} />
      <Route path="clock" element={<Clock />} />
      <Route path="breaks" element={<Breaks />} />
      <Route path="timesheets" element={<Timesheets />} />
      <Route path="scheduling" element={<Scheduling />} />
      <Route path="approvals" element={<Approvals />} />
      <Route path="exceptions" element={<Exceptions />} />
      <Route path="policies" element={<Policies />} />
      <Route path="devices" element={<Devices />} />
      <Route path="reports" element={<Reports />} />
      <Route path="settings" element={<Settings />} />
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
