import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  ClipboardList,
  BarChart3,
  MessageSquare,
  FolderOpen,
  Calendar,
  UserCircle,
  LogOut,
  Menu,
  X,
  GraduationCap,
  BookOpen,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../utils'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
  { label: 'Classes', icon: GraduationCap, path: '/teacher/classes' },
  { label: 'Students', icon: Users, path: '/teacher/students' },
  { label: 'Attendance', icon: UserCheck, path: '/teacher/attendance' },
  { label: 'Assignments', icon: FileText, path: '/teacher/assignments' },
  { label: 'Exams & Marks', icon: ClipboardList, path: '/teacher/exams' },
  { label: 'Analytics', icon: BarChart3, path: '/teacher/analytics' },
  { label: 'Messages', icon: MessageSquare, path: '/teacher/messages' },
  { label: 'Resources', icon: FolderOpen, path: '/teacher/resources' },
  { label: 'Timetable', icon: Calendar, path: '/teacher/timetable' },
  { label: 'Profile', icon: UserCircle, path: '/teacher/profile' },
]

export default function TeacherDashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#0f1729]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/10 bg-glass backdrop-blur-md flex-col p-6">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <BookOpen className="text-green-500" size={32} />
            <div>
              <h1 className="text-xl font-bold text-white">
                Teacher Portal
              </h1>
              <p className="text-sm text-gray-400">PresenceAI</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300',
                  isActive
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-glass-light hover:text-white',
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="pt-4 border-t border-white/10">
          <div className="mb-4 p-3 bg-glass-light rounded-lg">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-semibold text-white">{user?.display_name || 'Teacher'}</p>
            <p className="text-xs text-gray-500">{user?.email || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f1729] border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="text-green-500" size={28} />
          <h1 className="text-lg font-bold text-white">Teacher Portal</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#0f1729] pt-20 px-4 overflow-y-auto">
          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setMobileMenuOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300',
                    isActive
                      ? 'bg-green-500 text-white'
                      : 'text-gray-300 hover:bg-glass-light hover:text-white',
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-20">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
