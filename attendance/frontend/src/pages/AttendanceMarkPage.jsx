import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { axiosApi } from '../stores'

function badgeClass(status) {
  const s = (status || '').toLowerCase()
  if (s === 'present') return 'bg-green-500/20 text-green-300 border border-green-500/30'
  if (s === 'suspicious') return 'bg-red-500/20 text-red-300 border border-red-500/30'
  if (s === 'late') return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
  if (s === 'absent') return 'bg-slate-500/20 text-slate-200 border border-slate-400/20'
  return 'bg-white/10 text-gray-200 border border-white/10'
}

export default function AttendanceMarkPage() {
  const navigate = useNavigate()
  const { departmentId, classCode } = useParams()

  const deptId = useMemo(() => Number(departmentId), [departmentId])
  const cls = useMemo(() => decodeURIComponent(classCode || ''), [classCode])

  const [department, setDepartment] = useState(null)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [pendingDate, setPendingDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      const [deptRes, attRes] = await Promise.all([
        axiosApi.get(`/departments/${deptId}`),
        axiosApi.get('/attendance', { params: { class: cls, date } }),
      ])
      setDepartment(deptRes.data)
      setRecords(attRes.data || [])
    } catch (e) {
      console.error(e)
      toast.error(e.response?.data?.error || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptId, cls, date])

  const mark = async (studentId, status) => {
    try {
      setMarking(studentId)
      await axiosApi.post('/attendance/mark', {
        student_id: studentId,
        status,
      })
      toast.success(`Marked ${status}`)
      await load()
    } catch (e) {
      console.error(e)
      toast.error(e.response?.data?.error || 'Failed to mark attendance')
    } finally {
      setMarking(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
            <input
              type="date"
              value={pendingDate}
              onChange={(e) => setPendingDate(e.target.value)}
              className="input-field"
            />
            <button className="btn-secondary px-4 py-2" onClick={() => setDate(pendingDate)}>
              Check
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white">Mark Attendance</h1>
          <p className="text-gray-400 mt-2">
            Branch: <span className="text-gray-200">{department?.name || '...'}</span> • Section:{' '}
            <span className="text-gray-200">{cls}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <button className="btn-secondary px-4 py-2" onClick={() => navigate(`/attendance/${deptId}`)}>
            Back to Sections
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="sticky top-0 z-20 bg-slate-950/40 backdrop-blur-md p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-white">Students</div>
              <div className="text-sm text-gray-400">Click a button to mark attendance</div>
            </div>
            <div className="text-sm text-gray-300">{records.length} students</div>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-slate-950/50 backdrop-blur-md border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Student</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-gray-300" colSpan={4}>
                    Loading attendance...
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.student_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.avatarUrl || '/avatars/default.jpg'}
                          alt={r.name}
                          className="h-9 w-9 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <div className="text-sm font-semibold text-white">{r.name}</div>
                          <div className="text-xs text-gray-400">{r.student_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(r.status)}`}>
                        {(r.status || 'absent').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="btn-primary px-3 py-2"
                          disabled={marking === r.student_id}
                          onClick={() => mark(r.student_id, 'present')}
                        >
                          Present
                        </button>
                        <button
                          className="btn-secondary px-3 py-2"
                          disabled={marking === r.student_id}
                          onClick={() => mark(r.student_id, 'absent')}
                        >
                          Absent
                        </button>
                        <button
                          className="btn-secondary px-3 py-2"
                          disabled={marking === r.student_id}
                          onClick={() => mark(r.student_id, 'suspicious')}
                        >
                          Suspicious
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && records.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-sm text-gray-400" colSpan={4}>
                    No students found for this section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
