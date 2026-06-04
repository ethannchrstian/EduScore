import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./shared/context/AuthContext";
import { ToastProvider } from "./shared/context/ToastContext";
import { RefreshProvider } from "./shared/context/RefreshContext";
import AppShell from "./shared/components/layout/AppShell";
import ProtectedRoute from "./shared/components/layout/ProtectedRoute";
import AuthPage from "./features/auth/pages/AuthPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import CoursesPage from "./features/courses/pages/CoursesPage";
import CourseDetailPage from "./features/course-detail/pages/CourseDetailPage";
import TrackerPage from "./features/tracker/pages/TrackerPage";
import ProfilePage from "./features/profile/pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RefreshProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/tracker" element={<TrackerPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        </RefreshProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
