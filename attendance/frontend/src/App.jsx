import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import ScannerPage from './pages/ScannerPage'
import StudentsPage from './pages/StudentsPage'
import InsightsPage from './pages/InsightsPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const token = useAuthStore((state) => state.token)
  const fetchUser = useAuthStore((state) => state.fetchUser)

  useEffect(() => {
    if (token) {
      fetchUser()
    }
  }, [token, fetchUser])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="scanner" element={<ScannerPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="insights" element={<InsightsPage />} />
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
