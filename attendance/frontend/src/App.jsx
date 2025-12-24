import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import HODDashboardPage from './pages/HODDashboardPage'
import FaceScanPage from './pages/FaceScanPage'
import FacultyPage from './pages/FacultyPage'
import WorkersPage from './pages/WorkersPage'
import LibraryPage from './pages/LibraryPage'
import StudentsPage from './pages/StudentsPage'
import InsightsPage from './pages/InsightsPage'
import AttendanceBranchesPage from './pages/AttendanceBranchesPage'
import AttendanceSectionsPage from './pages/AttendanceSectionsPage'
import AttendanceMarkPage from './pages/AttendanceMarkPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const fetchUser = useAuthStore((state) => state.fetchUser)

  useEffect(() => {
    if (token) {
      fetchUser()
    }
  }, [token, fetchUser])

  // Prevent rendering the wrong dashboard briefly (or a blank nested layout)
  // while the user profile is still loading after refresh.
  if (token && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-gray-300">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/face-scan" element={<FaceScanPage />} />
          <Route path="/scanner" element={<Navigate to="/face-scan" replace />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={(user?.role || '').toLowerCase() === 'hod' ? <HODDashboardPage /> : <DashboardPage />}
            />
            <Route path="students" element={<StudentsPage />} />
            <Route path="faculty" element={<FacultyPage />} />
            <Route path="workers" element={<WorkersPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="attendance" element={<AttendanceBranchesPage />} />
            <Route path="attendance/:departmentId" element={<AttendanceSectionsPage />} />
            <Route path="attendance/:departmentId/:classCode" element={<AttendanceMarkPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            backdrop: 'blur(10px)',
          },
        }}
      />
    </>
  )
}

export default App
