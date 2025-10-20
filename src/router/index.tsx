import { Navigate, Route, Routes } from 'react-router-dom';

import { DaycareDashboardPage } from '../pages/free-starter-templates/daycare/DaycareDashboardPage';
import { FeatureConstructionDashboardPage } from '../pages/free-starter-templates/configpro/FeatureConstructionDashboardPage';
import { LoginPage } from '../pages/free-starter-templates/configpro/LoginPage';
import { PointOfSalePage } from '../pages/additional-paid-features/configpro/PointOfSalePage';
import { ThemePlaygroundPage } from '../pages/additional-paid-features/configpro/ThemePlaygroundPage';
import {
  DocumentsAndBrandingPage,
  OrgAndLocationsPage,
  OrderWorkflowPage,
  PaymentProvidersPage,
  PricingRulesPage,
  ReportingPage,
  SharedFeaturesPage,
  TaxRulesPage,
  TimeIntelligenceHubPage,
  UsersAndRolesPage,
} from '../pages/shared/features';
import { ForecastingLayout, DemandStudio, ScenarioWorkbench } from '../routes/forecasting';
import { SchedulingLayout, ManagerConsole, EmployeePortal } from '../routes/scheduling';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/daycare" element={<DaycareDashboardPage />} />
    <Route path="/pos" element={<PointOfSalePage />} />
    <Route path="/theme-lab" element={<ThemePlaygroundPage />} />
    <Route path="/dashboard" element={<FeatureConstructionDashboardPage />} />
    <Route path="/shared/features" element={<SharedFeaturesPage />} />
    <Route path="/shared/org-and-locations" element={<OrgAndLocationsPage />} />
    <Route path="/shared/time-intelligence-hub" element={<TimeIntelligenceHubPage />} />
    <Route path="/shared/reporting" element={<ReportingPage />} />
    <Route path="/shared/payment-providers" element={<PaymentProvidersPage />} />
    <Route path="/shared/pricing-rules" element={<PricingRulesPage />} />
    <Route path="/shared/users-and-roles" element={<UsersAndRolesPage />} />
    <Route path="/shared/order-workflows" element={<OrderWorkflowPage />} />
    <Route path="/shared/documents-and-branding" element={<DocumentsAndBrandingPage />} />
    <Route path="/shared/tax-rules" element={<TaxRulesPage />} />
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
