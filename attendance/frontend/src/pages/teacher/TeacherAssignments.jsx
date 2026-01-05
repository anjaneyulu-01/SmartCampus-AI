import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, CalendarClock, Plus, Loader2 } from 'lucide-react'
import { axiosApi } from '../../stores'
import toast from 'react-hot-toast'

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    class_id: '',
    due_date: '',
    total_marks: 100,
  })

  const load = async () => {
    try {
      setLoading(true)
      const [listRes, classRes] = await Promise.all([
        axiosApi.get('/teacher/assignments'),
        axiosApi.get('/teacher/classes'),
      ])
      setAssignments(listRes.data || [])
      setClasses(classRes.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title) return toast.error('Title is required')
    try {
      setLoading(true)
      await axiosApi.post('/teacher/assignments', {
        ...form,
        total_marks: Number(form.total_marks) || 100,
      })
      toast.success('Assignment created')
      setForm({ title: '', description: '', class_id: '', due_date: '', total_marks: 100 })
      await load()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Assignments</h1>
          <p className="text-gray-300">Create and track your assignments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={submit} className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-green-400" />
            <h2 className="text-lg font-semibold text-white">New Assignment</h2>
          </div>
          <input
            className="input-field"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="input-field min-h-[100px]"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            className="input-field"
            value={form.class_id}
            onChange={(e) => setForm({ ...form, class_id: e.target.value })}
          >
            <option value="">Select Class (optional)</option>
            {(classes || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            className="input-field"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
          <input
            type="number"
            className="input-field"
            min="1"
            value={form.total_marks}
            onChange={(e) => setForm({ ...form, total_marks: e.target.value })}
            placeholder="Total Marks"
          />
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {loading ? 'Saving...' : 'Create Assignment'}
          </button>
        </form>

        {/* List */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-green-400" />
            <h2 className="text-lg font-semibold text-white">Recent Assignments</h2>
          </div>
          <div className="space-y-3 max-h-[460px] overflow-auto">
            {(assignments || []).map((a) => (
              <div key={a.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-semibold">{a.title}</div>
                    <div className="text-sm text-gray-300">{a.description || 'No description'}</div>
                    {a.class_id ? (
                      <div className="text-xs text-gray-400 mt-1">Class: {a.class_id}</div>
                    ) : null}
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    {a.due_date ? <div>Due: {new Date(a.due_date).toLocaleString()}</div> : null}
                    <div>Total: {a.total_marks || 100}</div>
                  </div>
                </div>
              </div>
            ))}
            {(assignments || []).length === 0 && (
              <div className="text-gray-400">No assignments yet.</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
