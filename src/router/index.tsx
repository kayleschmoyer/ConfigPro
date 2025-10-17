import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages/free-starter-templates/configpro/LoginPage';
import { FeatureConstructionDashboardPage } from '../pages/free-starter-templates/configpro/FeatureConstructionDashboardPage';
import { PointOfSalePage } from '../pages/additional-paid-features/configpro/PointOfSalePage';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/pos" element={<PointOfSalePage />} />
    <Route path="/dashboard" element={<FeatureConstructionDashboardPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
