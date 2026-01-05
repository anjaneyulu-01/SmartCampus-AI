import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Filter } from 'lucide-react'
import { axiosApi } from '../../stores'
import toast from 'react-hot-toast'

export default function TeacherStudents() {
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')

  useEffect(() => {
    fetchStudents()
  }, [classFilter])

  const fetchStudents = async () => {
    try {
      const res = await axiosApi.get(`/teacher/students?class=${classFilter}`)
      setStudents(res.data || [])
    } catch (error) {
      toast.error('Failed to load students')
    }
  }

  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Students</h1>
        <p className="text-gray-400">View and manage student information</p>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Classes</option>
            <option value="CSE-A">CSE-A</option>
            <option value="CSE-B">CSE-B</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase">Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <img
                      src={student.avatar_url || '/avatars/default.jpg'}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">{student.id}</td>
                  <td className="px-6 py-4 text-sm text-white">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{student.class}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      (student.attendance_percentage || 0) >= 75
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {student.attendance_percentage || 0}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-green-300 hover:text-green-200 font-medium">
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
