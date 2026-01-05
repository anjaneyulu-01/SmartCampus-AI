import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { axiosApi } from '../stores'

export default function AttendanceSectionsPage() {
  const navigate = useNavigate()
  const { departmentId } = useParams()
  const deptId = useMemo(() => Number(departmentId), [departmentId])

  const [department, setDepartment] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const [deptRes, sectionsRes] = await Promise.all([
          axiosApi.get(`/departments/${deptId}`),
          axiosApi.get(`/departments/${deptId}/classes`),
        ])
        if (!active) return
        setDepartment(deptRes.data)
        setSections(sectionsRes.data || [])
      } catch (e) {
        console.error(e)
        toast.error(e.response?.data?.error || 'Failed to load sections')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [deptId])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Select Section</h1>
          <p className="text-gray-400 mt-2">
            Branch: <span className="text-gray-200">{department?.name || '...'}</span>
          </p>
        </div>
        <button className="btn-secondary px-4 py-2" onClick={() => navigate('/portal/attendance')}>
          Back to Branches
        </button>
      </div>

      {loading ? (
        <div className="card p-6 text-gray-300">Loading sections...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="sticky top-0 z-20 bg-slate-950/40 backdrop-blur-md p-6 border-b border-white/10">
            <div className="text-lg font-semibold text-white">Sections</div>
            <div className="text-sm text-gray-400">Click a section to mark attendance</div>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-slate-950/50 backdrop-blur-md border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Section</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Year</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Students</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Mentor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sections.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/portal/attendance/${deptId}/${encodeURIComponent(s.code)}`)}
                  >
                    <td className="px-6 py-4 text-sm text-white">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{s.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{s.academic_year || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{s.enrolled_students ?? s.total_students ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{s.class_mentor || '-'}</td>
                  </tr>
                ))}
                {sections.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-sm text-gray-400" colSpan={5}>
                      No sections found for this branch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
