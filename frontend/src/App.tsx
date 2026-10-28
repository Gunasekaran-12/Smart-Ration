import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import SplashIntroPage from './pages/SplashIntroPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DistributionPage from './pages/DistributionPage';
import RationCardsPage from './pages/RationCardsPage';
import StockManagementPage from './pages/StockManagementPage';
import EntitlementsPage from './pages/EntitlementsPage';
import ReportsPage from './pages/ReportsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import UsersShopsPage from './pages/UsersShopsPage';
import AuditLogsPage from './pages/AuditLogsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Splash Screen Intro: 5s Rising Sun animation */}
          <Route path="/" element={<SplashIntroPage />} />

          {/* 2. Login Page with Snow Falling Animation */}
          <Route path="/login" element={<LoginPage />} />

          {/* 3. Protected Dashboard Layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/distribution" element={<DistributionPage />} />
            <Route path="/cards" element={<RationCardsPage />} />
            <Route path="/stock" element={<StockManagementPage />} />
            <Route path="/entitlements" element={<EntitlementsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/users-shops" element={<UsersShopsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
