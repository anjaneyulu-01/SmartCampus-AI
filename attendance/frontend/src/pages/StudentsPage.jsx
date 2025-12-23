import { useEffect, useState } from 'react'
import { useAttendanceStore } from '../stores'
import { motion } from 'framer-motion'
import { Users, Search, MoreVertical, UserPlus, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentsPage() {
  const fetchStudents = useAttendanceStore((state) => state.fetchStudents)
  const students = useAttendanceStore((state) => state.students)
  const [selectedClass, setSelectedClass] = useState('10a')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchStudents(selectedClass)
  }, [selectedClass, fetchStudents])

  // Demo data
  const demoStudents = [
    {
      id: 1,
      name: 'Aarav Singh',
      student_id: 'STU001',
      email: 'aarav@example.com',
      avatar: '👨‍🎓',
      attendance_rate: 95,
      status: 'present',
    },
    {
      id: 2,
      name: 'Ananya Sharma',
      student_id: 'STU002',
      email: 'ananya@example.com',
      avatar: '👩‍🎓',
      attendance_rate: 88,
      status: 'present',
    },
    {
      id: 3,
      name: 'Arjun Patel',
      student_id: 'STU003',
      email: 'arjun@example.com',
      avatar: '👨‍🎓',
      attendance_rate: 92,
      status: 'present',
    },
    {
      id: 4,
      name: 'Diya Gupta',
      student_id: 'STU004',
      email: 'diya@example.com',
      avatar: '👩‍🎓',
      attendance_rate: 85,
      status: 'absent',
    },
    {
      id: 5,
      name: 'Ravi Kumar',
      student_id: 'STU005',
      email: 'ravi@example.com',
      avatar: '👨‍🎓',
      attendance_rate: 78,
      status: 'suspicious',
    },
  ]

  const filteredStudents = (students.length > 0 ? students : demoStudents).filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Students</h1>
            <p className="text-gray-400 mt-1">Manage student records and attendance</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus size={20} />
            Add Student
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-gray-500"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or student ID..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="input-field max-w-xs"
          >
            <option className="bg-slate-900 text-white" value="10a">Class 10-A</option>
            <option className="bg-slate-900 text-white" value="10b">Class 10-B</option>
            <option className="bg-slate-900 text-white" value="11a">Class 11-A</option>
            <option className="bg-slate-900 text-white" value="11b">Class 11-B</option>
          </select>
        </div>
      </motion.div>

      {/* Students Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {filteredStudents.map((student) => (
          <motion.div
            key={student.id}
            variants={itemVariants}
            className="card-hover p-6 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl">{student.avatar || '👤'}</div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-glass-light rounded-lg">
                <MoreVertical size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-lg font-bold text-white">{student.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-glass rounded-lg p-3">
                  <p className="text-xs text-gray-400">Student ID</p>
                  <p className="font-bold text-sm text-cyan-400 mt-1">
                    {student.student_id}
                  </p>
                </div>
                <div className="bg-glass rounded-lg p-3">
                  <p className="text-xs text-gray-400">Attendance</p>
                  <p className="font-bold text-sm text-green-400 mt-1">
                    {student.attendance_rate}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    student.status === 'present'
                      ? 'bg-green-500'
                      : student.status === 'absent'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`}
                />
                <span className="text-sm text-gray-300 capitalize">
                  {student.status || 'Present'}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10">
                <button className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                  <Edit2 size={16} />
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <motion.div variants={itemVariants} className="card p-12 text-center">
          <Users size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No students found</p>
          <p className="text-gray-500 text-sm mt-1">
            Try adjusting your search filters
          </p>
        </motion.div>
      )}

      {/* Statistics Footer */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-gray-400 text-sm">Total Students</p>
          <p className="text-2xl font-bold text-white mt-2">
            {filteredStudents.length}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-gray-400 text-sm">Present</p>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {filteredStudents.filter((s) => s.status === 'present').length}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-gray-400 text-sm">Absent</p>
          <p className="text-2xl font-bold text-red-400 mt-2">
            {filteredStudents.filter((s) => s.status === 'absent').length}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-gray-400 text-sm">Suspicious</p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">
            {filteredStudents.filter((s) => s.status === 'suspicious').length}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
