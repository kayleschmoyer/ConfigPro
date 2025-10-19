import { Navigate, Route, Routes } from 'react-router-dom';
import { DaycareDashboardPage } from '../pages/free-starter-templates/daycare/DaycareDashboardPage';
import { LoginPage } from '../pages/free-starter-templates/configpro/LoginPage';
import { FeatureConstructionDashboardPage } from '../pages/free-starter-templates/configpro/FeatureConstructionDashboardPage';
import { PointOfSalePage } from '../pages/additional-paid-features/configpro/PointOfSalePage';
import { ThemePlaygroundPage } from '../pages/additional-paid-features/configpro/ThemePlaygroundPage';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/daycare" element={<DaycareDashboardPage />} />
    <Route path="/pos" element={<PointOfSalePage />} />
    <Route path="/theme-lab" element={<ThemePlaygroundPage />} />
    <Route path="/dashboard" element={<FeatureConstructionDashboardPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
