import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import JobsPage from './pages/JobsPage'
import FramesPage from './pages/FramesPage'
import IncidentsPage from './pages/IncidentsPage'
import IncidentDetailsPage from './pages/IncidentDetailsPage'
import ReportsPage from './pages/ReportsPage'
import ReportViewerPage from './pages/ReportViewerPage'

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:id/frames" element={<FramesPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="incidents/:id" element={<IncidentDetailsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:jobId" element={<ReportViewerPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
