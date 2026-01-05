import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'
import TeacherDashboardLayout from './layouts/TeacherDashboardLayout'
import DashboardPage from './pages/DashboardPage'
import HODDashboardPage from './pages/HODDashboardPage'
import ScanDevicePage from './pages/ScanDevicePage'
import FacultyPage from './pages/FacultyPage'
import WorkersPage from './pages/WorkersPage'
import LibraryPage from './pages/LibraryPage'
import StudentsPage from './pages/StudentsPage'
import InsightsPage from './pages/InsightsPage'
import AttendanceBranchesPage from './pages/AttendanceBranchesPage'
import AttendanceSectionsPage from './pages/AttendanceSectionsPage'
import AttendanceMarkPage from './pages/AttendanceMarkPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherClasses from './pages/teacher/TeacherClasses'
import TeacherStudents from './pages/teacher/TeacherStudents'
import TeacherAttendance from './pages/teacher/TeacherAttendance'
import TeacherAssignments from './pages/teacher/TeacherAssignments'
import TeacherExams from './pages/teacher/TeacherExams'
import TeacherMessages from './pages/teacher/TeacherMessages'
import TeacherResources from './pages/teacher/TeacherResources'
import TeacherTimetable from './pages/teacher/TeacherTimetable'
import TeacherProfile from './pages/teacher/TeacherProfile'
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
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/scan" element={<ScanDevicePage />} />
          <Route path="/face-scan" element={<Navigate to="/scan" replace />} />
          <Route path="/scanner" element={<Navigate to="/scan" replace />} />
          
          {/* Teacher Dashboard Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute>
                <TeacherDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="exams" element={<TeacherExams />} />
            <Route path="analytics" element={<div className="text-white">Analytics Page</div>} />
            <Route path="messages" element={<TeacherMessages />} />
            <Route path="resources" element={<TeacherResources />} />
            <Route path="timetable" element={<TeacherTimetable />} />
            <Route path="profile" element={<TeacherProfile />} />
          </Route>

          {/* HOD/Admin Dashboard Routes */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={(() => {
                const role = (user?.role || '').toLowerCase()
                if (role === 'teacher') return <Navigate to="/teacher" replace />
                if (role === 'hod') return <HODDashboardPage />
                return <DashboardPage />
              })()}
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
          <Route path="*" element={<Navigate to="/login" replace />} />
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
