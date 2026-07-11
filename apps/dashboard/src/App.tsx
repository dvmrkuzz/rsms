import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/auth/LoginPage'
import OverviewPage from './pages/dashboard/OverviewPage'
import CounterPage from './pages/dashboard/CounterPage'
import ServiceRequestsPage from './pages/dashboard/ServiceRequestsPage'
import VisitorsPage from './pages/dashboard/VisitorsPage'
import UsersPage from './pages/dashboard/UsersPage'
import AnnouncementsPage from './pages/dashboard/AnnouncementsPage'
import AuditLogsPage from './pages/dashboard/AuditLogsPage'
import FAQsPage from './pages/dashboard/FAQsPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="counter" element={<CounterPage />} />
        <Route path="requests" element={<ServiceRequestsPage />} />
        <Route path="visitors" element={<VisitorsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="faqs" element={<FAQsPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}