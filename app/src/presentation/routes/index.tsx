/**
 * Router Configuration
 * React Router 라우트 설정
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { useAuth } from '../hooks/useAuth';

// Layouts (to be implemented)
import { MainLayout } from '../layouts/MainLayout';
import { SoulDetailLayout } from '../layouts/SoulDetailLayout';

// Pages (to be implemented)
import { DashboardPage } from '../pages/DashboardPage';
import { SoulsListPage } from '../pages/SoulsListPage';
import { SoulOverviewPage } from '../pages/SoulOverviewPage';
import { SoulGridPage } from '../pages/SoulGridPage';
import { SoulCarePage } from '../pages/SoulCarePage';
import { SoulTimelinePage } from '../pages/SoulTimelinePage';
import { InsightsPage } from '../pages/InsightsPage';
import { SettingsPage } from '../pages/SettingsPage';

// 컴포넌트를 외부로 분리하여 렌더링 중 생성 문제 해결
const RedirectIfAuthenticated = ({
  children,
  user,
  loading
}: {
  children: React.ReactNode;
  user: unknown;
  loading: boolean;
}) => {
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const AppRouter = () => {
  const { user, loading } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated user={user} loading={loading}>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthenticated user={user} loading={loading}>
              <SignupPage />
            </RedirectIfAuthenticated>
          }
        />

        {/* Protected Routes with MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* Souls List */}
          <Route path="souls" element={<SoulsListPage />} />

          {/* Soul Detail with nested routes */}
          <Route path="souls/:soulId" element={<SoulDetailLayout />}>
            <Route index element={<SoulOverviewPage />} />
            <Route path="grid" element={<SoulGridPage />} />
            <Route path="care" element={<SoulCarePage />} />
            <Route path="timeline" element={<SoulTimelinePage />} />
          </Route>

          {/* Insights */}
          <Route path="insights" element={<InsightsPage />} />

          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
