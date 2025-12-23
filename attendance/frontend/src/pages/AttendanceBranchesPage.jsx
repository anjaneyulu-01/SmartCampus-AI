import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { axiosApi } from '../stores'

export default function AttendanceBranchesPage() {
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await axiosApi.get('/departments')
        if (!active) return
        setBranches(res.data || [])
      } catch (e) {
        console.error(e)
        toast.error(e.response?.data?.error || 'Failed to load branches')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Attendance</h1>
        <p className="text-gray-400 mt-2">Select a branch to choose a section and mark attendance</p>
      </div>

      {loading ? (
        <div className="card p-6 text-gray-300">Loading branches...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => navigate(`/attendance/${b.id}`)}
              className="card p-6 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-white">{b.name}</div>
                  <div className="text-sm text-gray-400">Code: {b.code}</div>
                </div>
                <div className="text-sm text-gray-300">{b.total_sections ?? 0} sections</div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-300">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400">Students</div>
                  <div className="text-white font-semibold">{b.total_students ?? 0}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400">Faculty</div>
                  <div className="text-white font-semibold">{b.total_faculty ?? 0}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400">Staff</div>
                  <div className="text-white font-semibold">{b.total_workers ?? 0}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
