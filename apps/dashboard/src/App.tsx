import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { rehydrateAuth } from './store/auth.store'
import ProtectedRoute from './components/layout/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/auth/LoginPage'
import OverviewPage from './pages/dashboard/OverviewPage'

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
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}