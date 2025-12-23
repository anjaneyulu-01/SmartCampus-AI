import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Search } from 'lucide-react'
import { axiosApi } from '../stores'
import { getAvatarColor, getInitials } from '../utils'

export default function WorkersPage() {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        setLoading(true)
        const res = await axiosApi.get('/workers')
        if (mounted) setWorkers(Array.isArray(res.data) ? res.data : [])
      } catch {
        if (mounted) setWorkers([])
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
    const base = workers
    const q = searchTerm.trim().toLowerCase()
    if (!q) return base
    return base.filter((w) => {
      const name = (w.name || '').toString().toLowerCase()
      const email = (w.email || '').toString().toLowerCase()
      const type = (w.worker_type || w.workerType || '').toString().toLowerCase()
      return name.includes(q) || email.includes(q) || type.includes(q)
    })
  }, [workers, searchTerm])

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Workers</h1>
          <p className="text-gray-400 mt-1">View staff and workers</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or type..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-300">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No workers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((w) => (
            <div key={w.id || w.email || w.name} className="card-hover p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(
                      w.name || 'Worker',
                    )}`}
                  >
                    {getInitials(w.name || 'Worker')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-white truncate">{w.name || 'Worker'}</p>
                    <p className="text-sm text-gray-400 mt-1 truncate">{w.email || ''}</p>
                  </div>
                </div>
                <Briefcase className="text-emerald-400 opacity-60" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-glass rounded-lg p-3">
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="font-semibold text-gray-200 mt-1">
                    {(w.worker_type || w.workerType || '—').toString()}
                  </p>
                </div>
                <div className="bg-glass rounded-lg p-3">
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="font-semibold text-gray-200 mt-1">
                    {w.department_name || w.department_id || '—'}
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
