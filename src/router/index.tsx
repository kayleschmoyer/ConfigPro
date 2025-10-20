import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PointOfSalePage } from '../pages/additional-paid-features/configpro/PointOfSalePage';
import { ThemePlaygroundPage } from '../pages/additional-paid-features/configpro/ThemePlaygroundPage';
import { FeatureConstructionDashboardPage } from '../pages/free-starter-templates/configpro/FeatureConstructionDashboardPage';
import { LoginPage } from '../pages/free-starter-templates/configpro/LoginPage';
import { DaycareDashboardPage } from '../pages/free-starter-templates/daycare/DaycareDashboardPage';
import { ErrorBoundaryPage, SharedFeaturesPage } from '../pages/shared/features';
import { FeaturePlaygroundPage } from '../pages/dev/FeaturePlaygroundPage';
import { ForecastingLayout, DemandStudio, ScenarioWorkbench } from '../routes/forecasting';
import { SchedulingLayout, ManagerConsole, EmployeePortal } from '../routes/scheduling';
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
    <Route path="/shared/error-boundary" element={<ErrorBoundaryPage />} />
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
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
