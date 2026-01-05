import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { useAttendanceStore } from '../stores'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  BookOpenText,
  Building2,
  BarChart3,
  ShieldAlert,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../utils'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/portal' },
  { label: 'Attendance', icon: Building2, path: '/portal/attendance' },
  { label: 'Students', icon: Users, path: '/portal/students' },
  { label: 'Faculty', icon: GraduationCap, path: '/portal/faculty' },
  { label: 'Workers', icon: Briefcase, path: '/portal/workers' },
  { label: 'Library', icon: BookOpenText, path: '/portal/library' },
  { label: 'Insights', icon: BarChart3, path: '/portal/insights' },
  { label: 'Announcements', icon: ShieldAlert, path: '/portal/announcements' },
]

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Keep portal data fresh: listen for backend presence events and refresh stores.
  const wsRef = useRef(null)
  const wsReconnectTimerRef = useRef(0)
  const wsDebouncedRefreshTimerRef = useRef(0)
  const wsPingTimerRef = useRef(0)
  const bcRef = useRef(null)
  const lastEventKeyRef = useRef('')

  const handlePresencePayload = (payload) => {
    if (!payload?.student_id) return
    const key = `${payload.student_id}|${payload.timestamp || ''}|${payload.status || ''}`
    if (key && key === lastEventKeyRef.current) return
    lastEventKeyRef.current = key

    console.log('[Portal] Applying presence update:', payload.student_id, payload.status)
    window.dispatchEvent(new CustomEvent('presence_event', { detail: payload }))
    useAttendanceStore.getState().applyPresenceEvent(payload)

    if (wsDebouncedRefreshTimerRef.current) {
      window.clearTimeout(wsDebouncedRefreshTimerRef.current)
    }
    wsDebouncedRefreshTimerRef.current = window.setTimeout(() => {
      useAttendanceStore.getState().refreshStats()
      useAttendanceStore.getState().refreshAttendance()
    }, 900)
  }

  useEffect(() => {
    let closed = false

    const connect = () => {
      try {
        if (closed) return
        if (wsRef.current && (wsRef.current.readyState === 0 || wsRef.current.readyState === 1)) return

        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'

        // In dev, connect directly to the backend WS to avoid proxy flakiness.
        // In prod (served by backend), same-origin works.
        const wsUrl = import.meta?.env?.DEV
          ? `${proto}://${window.location.hostname}:8000/ws/events`
          : `${proto}://${window.location.host}/ws/events`

        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('[Portal WS] Connected to', wsUrl)
          if (wsPingTimerRef.current) window.clearInterval(wsPingTimerRef.current)
          wsPingTimerRef.current = window.setInterval(() => {
            try {
              if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'ping' }))
            } catch {
              // ignore
            }
          }, 20000)
        }

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data)
            if (data?.type === 'presence' && data?.payload) {
              console.log('[Portal WS] Received presence:', data.payload)
              handlePresencePayload(data.payload)
            }
          } catch {
            // ignore
          }
        }

        ws.onclose = () => {
          if (closed) return
          if (wsPingTimerRef.current) {
            window.clearInterval(wsPingTimerRef.current)
            wsPingTimerRef.current = 0
          }
          // Reconnect quickly.
          wsReconnectTimerRef.current = window.setTimeout(connect, 800)
        }

        ws.onerror = () => {
          try {
            ws.close()
          } catch {
            // ignore
          }
        }
      } catch {
        wsReconnectTimerRef.current = window.setTimeout(connect, 1000)
      }
    }

    connect()
    return () => {
      closed = true
      if (wsReconnectTimerRef.current) window.clearTimeout(wsReconnectTimerRef.current)
      if (wsDebouncedRefreshTimerRef.current) window.clearTimeout(wsDebouncedRefreshTimerRef.current)
      if (wsPingTimerRef.current) window.clearInterval(wsPingTimerRef.current)
      try {
        wsRef.current?.close()
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    // Fastest cross-tab update when portal + scan are on the same origin (5173):
    // Scan tab broadcasts presence via BroadcastChannel.
    try {
      const bc = new BroadcastChannel('presenceai_presence')
      bcRef.current = bc
      bc.onmessage = (ev) => {
        const msg = ev?.data
        console.log('[Portal BC] Received from BroadcastChannel:', msg?.payload)
        if (msg?.type === 'presence' && msg?.payload) {
          handlePresencePayload(msg.payload)
        }
      }
    } catch {
      // ignore
    }

    return () => {
      try {
        bcRef.current?.close();
      } catch {
        // ignore
      }
    }
  }, [])

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-glass-light rounded-lg transition-all"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
