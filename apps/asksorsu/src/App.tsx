import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import FAQsPage from './pages/FAQsPage'
import TrackPage from './pages/TrackPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="faqs" element={<FAQsPage />} />
        <Route path="track" element={<TrackPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}