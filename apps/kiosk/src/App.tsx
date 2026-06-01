import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CheckinPage from './pages/CheckinPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/checkin" element={<CheckinPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}