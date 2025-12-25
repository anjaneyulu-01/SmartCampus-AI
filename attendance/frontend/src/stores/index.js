import { create } from 'zustand'
import axios from 'axios'

const API_BASE = '/api'

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      const response = await axiosInstance.post('/login', { username, password })
      const { token, ...userInfo } = response.data
      const normalizedRole = (userInfo.role || '').toString().trim().toLowerCase()
      localStorage.setItem('token', token)
      set({ user: { ...userInfo, role: normalizedRole }, token, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.error || 'Login failed', loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  fetchUser: async () => {
    try {
      const response = await axiosInstance.get('/me')
      const normalizedRole = (response.data?.role || '').toString().trim().toLowerCase()
      set({ user: { ...response.data, role: normalizedRole } })
    } catch (err) {
      set({ user: null, token: null })
      localStorage.removeItem('token')
    }
  },
}))

export const useAttendanceStore = create((set, get) => ({
  attendance: [],
  students: [],
  stats: null,
  loading: false,

  // Remember last query so we can auto-refresh on WebSocket events.
  lastAttendanceQuery: { classId: 'all', date: null },

  fetchAttendance: async (classId, date) => {
    set({ loading: true })
    try {
      set({ lastAttendanceQuery: { classId, date } })
      const response = await axiosInstance.get('/attendance', {
        params: { class: classId, date },
      })
      set({ attendance: response.data, loading: false })
    } catch (err) {
      console.error('Failed to fetch attendance:', err)
      set({ loading: false })
    }
  },

  refreshAttendance: async () => {
    const q = get().lastAttendanceQuery
    const today = new Date().toISOString().slice(0, 10)
    const date = q?.date || today
    const classId = q?.classId || 'all'
    return get().fetchAttendance(classId, date)
  },

  refreshStats: async () => {
    return get().fetchStats()
  },

  applyPresenceEvent: (payload) => {
    if (!payload || !payload.student_id) return

    const today = new Date().toISOString().slice(0, 10)
    const eventDate = String(payload.timestamp || '').slice(0, 10) || today
    const viewingDate = get().lastAttendanceQuery?.date || today
    if (eventDate !== viewingDate) return

    const nextStatus = String(payload.status || 'present').toLowerCase()

    set((state) => {
      const attendance = Array.isArray(state.attendance) ? [...state.attendance] : []
      const idx = attendance.findIndex((r) => r?.student_id === payload.student_id)

      let prevStatus = null
      if (idx >= 0) {
        // Update existing record
        prevStatus = String(attendance[idx]?.status || '').toLowerCase()
        attendance[idx] = {
          ...attendance[idx],
          status: nextStatus,
          timestamp: payload.timestamp || attendance[idx]?.timestamp || new Date().toISOString(),
          avatarUrl: payload.avatarUrl || attendance[idx]?.avatarUrl,
        }
      } else {
        // Add new record if student not in list yet
        prevStatus = 'absent'
        attendance.push({
          student_id: payload.student_id,
          name: payload.name || payload.student_id,
          class: payload.class || '',
          status: nextStatus,
          timestamp: payload.timestamp || new Date().toISOString(),
          avatarUrl: payload.avatarUrl || '/avatars/default.jpg',
        })
      }

      // Optimistically adjust stats if present.
      let stats = state.stats
      if (stats && typeof stats === 'object') {
        const total = Number(stats.total_students || 0)
        const isPresentPrev = prevStatus === 'present' || prevStatus === 'checkin'
        const isPresentNext = nextStatus === 'present' || nextStatus === 'checkin'

        if (isPresentPrev !== isPresentNext) {
          const present = Math.max(0, Number(stats.present_today || 0) + (isPresentNext ? 1 : -1))
          const absent = Math.max(0, total - present)
          const attendance_rate = total > 0 ? Math.round((present / total) * 1000) / 10 : 0
          stats = {
            ...stats,
            present_today: present,
            absent_today: absent,
            attendance_rate,
            avg_punctuality: attendance_rate,
          }
        }
      }

      return { attendance, stats }
    })
  },

  fetchStudents: async (classId) => {
    set({ loading: true })
    try {
      const response = await axiosInstance.get('/students', {
        params: { class: classId },
      })
      set({ students: response.data, loading: false })
    } catch (err) {
      console.error('Failed to fetch students:', err)
      set({ loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const response = await axiosInstance.get('/attendance/stats')
      set({ stats: response.data })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  },

  markAttendance: async (studentId, status) => {
    try {
      await axiosInstance.post('/attendance/mark', {
        student_id: studentId,
        status,
      })
      return true
    } catch (err) {
      console.error('Failed to mark attendance:', err)
      return false
    }
  },
}))

export const axiosApi = axiosInstance
