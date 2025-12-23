import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { axiosApi, useAuthStore } from '../stores'

export default function AnnouncementsPage() {
  const user = useAuthStore((s) => s.user)
  const canCreate = useMemo(() => ['admin', 'hod'].includes((user?.role || '').toLowerCase()), [user])

  const [branches, setBranches] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [departmentId, setDepartmentId] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const [branchesRes, annRes] = await Promise.all([
        axiosApi.get('/departments'),
        axiosApi.get('/announcements'),
      ])
      setBranches(branchesRes.data || [])
      setAnnouncements(annRes.data || [])
    } catch (e) {
      console.error(e)
      toast.error(e.response?.data?.error || 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const createAnnouncement = async (e) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required')
      return
    }

    try {
      setCreating(true)
      const res = await axiosApi.post('/announcements', {
        title: title.trim(),
        message: message.trim(),
        department_id: departmentId || null,
      })
      setAnnouncements((prev) => [res.data, ...prev])
      setTitle('')
      setMessage('')
      setDepartmentId('')
      toast.success('Announcement created')
    } catch (e2) {
      console.error(e2)
      toast.error(e2.response?.data?.error || 'Failed to create announcement')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Announcements</h1>
        <p className="text-gray-400 mt-2">Create and view announcements</p>
      </div>

      {canCreate && (
        <form onSubmit={createAnnouncement} className="card p-6 space-y-4">
          <div className="text-lg font-semibold text-white">New Announcement</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Title</label>
              <input
                className="input-field w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Midterm schedule update"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Branch (optional)</label>
              <select
                className="input-field w-full"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="" className="bg-slate-900 text-white">All branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Message</label>
            <textarea
              className="input-field w-full min-h-[120px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the announcement..."
            />
          </div>
          <div className="flex justify-end">
            <button className="btn-primary px-5 py-2" type="submit" disabled={creating}>
              {creating ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="sticky top-0 z-20 bg-slate-950/40 backdrop-blur-md p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Recent Announcements</div>
            <div className="text-sm text-gray-400">Latest 200 announcements</div>
          </div>
          <button className="btn-secondary px-4 py-2" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-slate-950/50 backdrop-blur-md border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Branch</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Posted By</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-gray-300" colSpan={4}>
                    Loading announcements...
                  </td>
                </tr>
              ) : (
                announcements.map((a) => (
                  <tr key={a.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-white">{a.title}</div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">{a.message}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {a.department_name ? `${a.department_name} (${a.department_code})` : 'All'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{a.created_by || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {a.created_at ? new Date(a.created_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              )}

              {!loading && announcements.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-sm text-gray-400" colSpan={4}>
                    No announcements yet.
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
