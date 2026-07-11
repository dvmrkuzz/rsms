import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import AssistantPage from './pages/AssistantPage'
import TrackPage from './pages/TrackPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="faqs" element={<Navigate to="/assistant" replace />} />
        <Route path="track" element={<TrackPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}