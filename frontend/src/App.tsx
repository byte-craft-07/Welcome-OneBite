import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicBusinessPage } from './pages/PublicBusinessPage';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProfile } from './pages/admin/AdminProfile';
import { AdminLinks } from './pages/admin/AdminLinks';
import { AdminHours } from './pages/admin/AdminHours';
import { AdminAppearance } from './pages/admin/AdminAppearance';
import { AdminQR } from './pages/admin/AdminQR';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminLogin } from './pages/admin/AdminLogin';
import { useAuth } from './context/AuthContext';

// Protected Route Wrapper for Admin Area
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Root opens primary/default business */}
      <Route path="/" element={<PublicBusinessPage />} />

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="links" element={<AdminLinks />} />
        <Route path="hours" element={<AdminHours />} />
        <Route path="appearance" element={<AdminAppearance />} />
        <Route path="qr" element={<AdminQR />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* Dynamic Public Business Profile by Slug */}
      <Route path="/:slug" element={<PublicBusinessPage />} />

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
