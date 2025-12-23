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

  fetchAttendance: async (classId, date) => {
    set({ loading: true })
    try {
      const response = await axiosInstance.get('/attendance', {
        params: { class_id: classId, date },
      })
      set({ attendance: response.data, loading: false })
    } catch (err) {
      console.error('Failed to fetch attendance:', err)
      set({ loading: false })
    }
  },

  fetchStudents: async (classId) => {
    set({ loading: true })
    try {
      const response = await axiosInstance.get('/students', {
        params: { class_id: classId },
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
