import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores'
import {
  LayoutDashboard,
  Scan,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../utils'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Scanner', icon: Scan, path: '/scanner' },
  { label: 'Students', icon: Users, path: '/students' },
  { label: 'Insights', icon: BarChart3, path: '/insights' },
]

export default function DashboardLayout() {
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
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/10 bg-glass backdrop-blur-md flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            PresenceAI
          </h1>
          <p className="text-sm text-gray-400 mt-1">Smart Attendance</p>
        </div>

        <nav className="flex-1 space-y-2">
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
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                    : 'text-gray-300 hover:bg-glass-light hover:text-white',
                )}
              >
                <Icon size={20} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/10 pt-4">
          {user && (
            <div className="mb-4 p-3 rounded-lg bg-glass-light">
              <p className="text-sm font-semibold text-white">
                {user.display_name || user.username}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-300 font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-glass border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            PresenceAI
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-glass-light rounded-lg transition-all"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-glass border-b border-white/10 px-4 py-4 space-y-2 backdrop-blur-md">
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
                    'w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'text-gray-300 hover:bg-glass-light hover:text-white',
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-300 font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
