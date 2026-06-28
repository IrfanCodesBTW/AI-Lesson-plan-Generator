import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { RequireAuth } from './components/RequireAuth';
import { SidebarLayout } from './components/SidebarLayout';
import { CurriculumPlannerPage } from './pages/CurriculumPlannerPage';
import { MaterialChecklistPage } from './pages/MaterialChecklistPage';
import { ManagementPage } from './pages/ManagementPage';
function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected Dashboard/App Pages (Wrapped with Sidebar Layout) */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <SidebarLayout>
              <DashboardPage />
            </SidebarLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/curriculum"
        element={
          <RequireAuth>
            <SidebarLayout>
              <CurriculumPlannerPage />
            </SidebarLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/materials"
        element={
          <RequireAuth>
            <SidebarLayout>
              <MaterialChecklistPage />
            </SidebarLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/management"
        element={
          <RequireAuth>
            <SidebarLayout>
              <ManagementPage />
            </SidebarLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/lessons/:id"
        element={
          <RequireAuth>
            <SidebarLayout>
              <LessonDetailPage />
            </SidebarLayout>
          </RequireAuth>
        }
      />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App;
