import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, CheckCircle2, Users, BarChart3, CalendarDays, ChevronDown } from 'lucide-react'
import { axiosApi, useAuthStore } from '../../stores'
import toast from 'react-hot-toast'

export default function TeacherAttendance() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState(null)
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [statsRes, classesRes] = await Promise.all([
        axiosApi.get('/teacher/stats'),
        axiosApi.get('/teacher/classes'),
      ])
      setStats(statsRes.data)
      setClasses(classesRes.data || [])
      
      // Auto-select first class if available
      if (classesRes.data?.length > 0 && !selectedClass) {
        setSelectedClass(classesRes.data[0].id)
        loadStudents(classesRes.data[0].id)
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async (classId) => {
    try {
      const res = await axiosApi.get(`/teacher/students?class=${classId}`)
      setStudents(res.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load students')
      setStudents([])
    }
  }

  const handleClassChange = (classId) => {
    setSelectedClass(classId)
    loadStudents(classId)
  }

  const markAttendance = async (studentId, status) => {
    try {
      await axiosApi.post('/attendance/mark', {
        student_id: studentId,
        status,
      })
      toast.success(`Marked as ${status}`)
      loadStudents(selectedClass)
    } catch (e) {
      console.error(e)
      toast.error('Failed to mark attendance')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const statCards = [
    {
      label: 'Total Classes',
      value: stats?.total_classes ?? 0,
      icon: Users,
    },
    {
      label: 'Total Students',
      value: stats?.total_students ?? 0,
      icon: Users,
    },
    {
      label: 'Present Today',
      value: stats?.present_today ?? 0,
      icon: CheckCircle2,
    },
    {
      label: 'Attendance Rate',
      value: `${stats?.attendance_rate ?? 0}%`,
      icon: BarChart3,
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Mark Attendance</h1>
          <p className="text-gray-300">Mark attendance for your assigned classes</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <s.icon size={20} className="text-green-400" />
              <span className="text-sm text-gray-300">{s.label}</span>
            </div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Class Selector */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={20} className="text-green-400" />
          <h2 className="text-xl font-bold text-white">Select Class</h2>
        </div>
        <div className="relative">
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full appearance-none cursor-pointer pr-10 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:border-white/40 transition-colors"
          >
            <option value="" className="bg-slate-900 text-white">Choose a class...</option>
            {(classes || []).map((cls) => (
              <option key={cls.id} value={cls.id} className="bg-slate-900 text-white">
                {cls.name} ({cls.students_count} students)
              </option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Students List */}
      {selectedClass && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Students in Selected Class</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {(students || []).length > 0 ? (
              students.map((student) => (
                <div key={student.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={student.avatar_url || '/avatars/default.jpg'}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-white font-semibold">{student.name}</div>
                      <div className="text-xs text-gray-400">{student.id}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAttendance(student.id, 'present')}
                      className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => markAttendance(student.id, 'absent')}
                      className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                {selectedClass ? 'No students in this class' : 'Select a class to view students'}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

