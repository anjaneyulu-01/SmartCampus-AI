import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Search } from 'lucide-react'
import { axiosApi } from '../stores'

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        setLoading(true)
        const res = await axiosApi.get('/faculty')
        if (mounted) setFaculty(Array.isArray(res.data) ? res.data : [])
      } catch {
        if (mounted) setFaculty([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const base = faculty
    const q = searchTerm.trim().toLowerCase()
    if (!q) return base
    return base.filter((f) => {
      const name = (f.name || '').toString().toLowerCase()
      const email = (f.email || '').toString().toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [faculty, searchTerm])

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Faculty</h1>
          <p className="text-gray-400 mt-1">View faculty members</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-300">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <GraduationCap size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No faculty found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((f) => (
            <div key={f.id || f.email || f.name} className="card-hover p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-white">{f.name || 'Faculty'}</p>
                  <p className="text-sm text-gray-400 mt-1">{f.email || ''}</p>
                </div>
                <GraduationCap className="text-green-400 opacity-60" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-glass rounded-lg p-3">
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="font-semibold text-gray-200 mt-1">
                    {f.department_name || f.department_id || '—'}
                  </p>
                </div>
                <div className="bg-glass rounded-lg p-3">
                  <p className="text-xs text-gray-400">Designation</p>
                  <p className="font-semibold text-gray-200 mt-1">
                    {f.designation || '—'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
