import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { PointOfSalePage } from '../pages/PointOfSalePage';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/pos" element={<PointOfSalePage />} />
    <Route path="/dashboard" element={<Navigate to="/pos" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
