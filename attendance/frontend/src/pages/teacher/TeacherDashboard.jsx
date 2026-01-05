import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  GraduationCap,
  UserCheck,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  FileText,
  ClipboardList,
  MessageSquare,
} from 'lucide-react'
import { axiosApi } from '../../stores'
import toast from 'react-hot-toast'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total_classes: 0,
    total_students: 0,
    present_today: 0,
    attendance_rate: 0,
  })
  const [upcomingClasses, setUpcomingClasses] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, classesRes, notifRes] = await Promise.all([
        axiosApi.get('/teacher/stats'),
        axiosApi.get('/teacher/upcoming-classes'),
        axiosApi.get('/teacher/notifications'),
      ])
      setStats(statsRes.data || stats)
      setUpcomingClasses(classesRes.data || [])
      setNotifications(notifRes.data || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Classes',
      value: stats.total_classes,
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Students',
      value: stats.total_students,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Present Today',
      value: stats.present_today,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendance_rate}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-0"
    >
      {/* Sticky Header and Stats */}
      <div className="sticky top-0 z-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-6">
        <div className="pt-6 px-0">
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
          <p className="text-gray-300">Welcome back! Here's your overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-gray-300 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="space-y-6 pt-6">
        {/* Upcoming Classes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-green-500" size={24} />
            <h2 className="text-xl font-bold text-white">Upcoming Classes</h2>
          </div>
          <div className="space-y-3">
            {upcomingClasses.length > 0 ? (
              upcomingClasses.map((cls, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-white">{cls.name}</p>
                    <p className="text-sm text-gray-300">{cls.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-200">{cls.room}</p>
                    <p className="text-xs text-gray-400">{cls.students} students</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto text-gray-500 mb-2" size={48} />
                <p className="text-gray-300">No upcoming classes today</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="text-orange-500" size={24} />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{notif.title}</p>
                    <p className="text-sm text-gray-300">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="mx-auto text-gray-500 mb-2" size={48} />
                <p className="text-gray-300">No new notifications</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn-primary p-4 text-center" onClick={() => navigate('/teacher/attendance')}>
            <UserCheck className="mx-auto mb-2" size={24} />
            <span className="text-sm">Mark Attendance</span>
          </button>
          <button className="btn-secondary p-4 text-center" onClick={() => navigate('/teacher/assignments')}>
            <FileText className="mx-auto mb-2" size={24} />
            <span className="text-sm">Create Assignment</span>
          </button>
          <button className="btn-secondary p-4 text-center" onClick={() => navigate('/teacher/exams')}>
            <ClipboardList className="mx-auto mb-2" size={24} />
            <span className="text-sm">Enter Marks</span>
          </button>
          <button className="btn-secondary p-4 text-center" onClick={() => navigate('/teacher/messages')}>
            <MessageSquare className="mx-auto mb-2" size={24} />
            <span className="text-sm">Send Message</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
