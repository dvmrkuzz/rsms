import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { rehydrateAuth } from './store/auth.store'
import ProtectedRoute from './components/layout/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/auth/LoginPage'
import OverviewPage from './pages/dashboard/OverviewPage'
import ServiceRequestsPage from './pages/dashboard/ServiceRequestsPage'
import VisitorsPage from './pages/dashboard/VisitorsPage'
import UsersPage from './pages/dashboard/UsersPage'
import AnnouncementsPage from './pages/dashboard/AnnouncementsPage'
import AuditLogsPage from './pages/dashboard/AuditLogsPage'

export default function App() {
  useEffect(() => {
    rehydrateAuth()
  }, [])

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
        <Route path="requests" element={<ServiceRequestsPage />} />
        <Route path="visitors" element={<VisitorsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="audit" element={<AuditLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}