import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
