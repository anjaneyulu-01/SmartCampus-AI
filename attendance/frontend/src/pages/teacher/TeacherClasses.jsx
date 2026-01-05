import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Users, Plus, Search } from 'lucide-react'
import { axiosApi } from '../../stores'
import toast from 'react-hot-toast'

export default function TeacherClasses() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const res = await axiosApi.get('/teacher/classes')
      setClasses(res.data || [])
    } catch (error) {
      toast.error('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  const filteredClasses = classes.filter((cls) =>
    cls.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Classes</h1>
          <p className="text-gray-400">Manage your classes and students</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Class
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <GraduationCap className="text-green-500" size={24} />
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                {cls.section}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{cls.name}</h3>
            <div className="flex items-center gap-2 text-gray-300 mb-4">
              <Users size={16} />
              <span className="text-sm">{cls.students_count} Students</span>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 btn-primary text-sm py-2"
                onClick={() => navigate('/teacher/attendance', { state: { classId: cls.id } })}
              >
                View Details
              </button>
              <button
                className="flex-1 btn-secondary text-sm py-2"
                onClick={() => navigate('/teacher/attendance', { state: { classId: cls.id } })}
              >
                Attendance
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="card p-12 text-center">
          <GraduationCap className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-500 text-lg">No classes found</p>
        </div>
      )}
    </motion.div>
  )
}
