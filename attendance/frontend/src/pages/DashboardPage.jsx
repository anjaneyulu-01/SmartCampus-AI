import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendanceStore } from '../stores'
import { useAuthStore } from '../stores'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import AttendanceTable from '../components/AttendanceTable'

export default function DashboardPage() {
  const stats = useAttendanceStore((state) => state.stats)
  const fetchStats = useAttendanceStore((state) => state.fetchStats)
  const attendance = useAttendanceStore((state) => state.attendance)
  const fetchAttendance = useAttendanceStore((state) => state.fetchAttendance)
  const students = useAttendanceStore((state) => state.students)
  const fetchStudents = useAttendanceStore((state) => state.fetchStudents)
  const user = useAuthStore((state) => state.user)
  const [selectedClass, setSelectedClass] = useState('all')
  const navigate = useNavigate()
  // Export today's attendance as CSV
  const handleExportReport = () => {
    if (!attendance || attendance.length === 0) {
      alert('No attendance data to export.')
      return
    }
    const headers = Object.keys(attendance[0])
    const csvRows = [headers.join(',')]
    attendance.forEach(row => {
      csvRows.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    })
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchStats()
    fetchStudents('all')
  }, [fetchStats])

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    fetchAttendance(selectedClass, today)
  }, [fetchAttendance, selectedClass])

  const classOptions = (() => {
    const unique = new Set()
    ;(students || []).forEach((s) => {
      if (s.class) unique.add(String(s.class))
    })
    return ['all', ...Array.from(unique).sort()]
  })()

  const demoStats = {
    total_students: 125,
    present_today: 112,
    absent_today: 13,
    attendance_rate: 89.6,
    avg_punctuality: 92,
    suspicious_count: 2,
  }

  const displayStats = stats || demoStats

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Welcome back, {user?.display_name || 'User'}
            </h1>
            <p className="text-gray-400 mt-2">
              Here's your attendance overview for today
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="card p-4 text-center">
              <p className="text-gray-400 text-sm">Current Time</p>
              <p className="text-2xl font-bold text-white mt-1">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <StatCard
            icon={Users}
            label="Total Students"
            value={displayStats.total_students}
            color="bg-blue-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={CheckCircle}
            label="Present Today"
            value={displayStats.present_today}
            color="bg-green-500"
            subtitle={`${displayStats.attendance_rate}% rate`}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={Clock}
            label="Absent Today"
            value={displayStats.absent_today}
            color="bg-red-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={TrendingUp}
            label="Avg Punctuality"
            value={`${displayStats.avg_punctuality}%`}
            color="bg-purple-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={BarChart3}
            label="Attendance Rate"
            value={`${displayStats.attendance_rate}%`}
            color="bg-cyan-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={Users}
            label="Suspicious Activity"
            value={displayStats.suspicious_count}
            color="bg-orange-500"
          />
        </motion.div>
      </motion.div>

      {/* Attendance Table Section */}
      <motion.div variants={itemVariants}>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Today's Attendance</h2>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field max-w-xs"
            >
              {classOptions.map((c) => (
                <option key={c} className="bg-slate-900 text-white" value={c}>
                  {c === 'all' ? 'All Classes' : c}
                </option>
              ))}
            </select>
          </div>
          <AttendanceTable records={attendance} />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-white mb-2">
              ✅ Quick Actions
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Access frequent operations quickly
            </p>
            <button
              className="btn-primary w-full mb-3"
              onClick={() => navigate('/portal/attendance')}
            >
              Mark Attendance
            </button>
            <button
              className="btn-secondary w-full"
              onClick={handleExportReport}
            >
              Export Report
            </button>
          </div>
          <div className="card p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-white mb-2">
              📊 System Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Face Recognition</span>
                <span className="badge-success">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Database</span>
                <span className="badge-success">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">WebSocket</span>
                <span className="badge-success">Running</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
