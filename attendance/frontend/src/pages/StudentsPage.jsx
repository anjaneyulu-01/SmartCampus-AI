import { useEffect, useMemo, useState } from 'react'
import { useAttendanceStore, useAuthStore, axiosApi } from '../stores'
import { motion } from 'framer-motion'
import { Users, Search, MoreVertical, UserPlus, Edit2, X, Loader, Clock, ShieldAlert, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentsPage() {
  const fetchStudents = useAttendanceStore((state) => state.fetchStudents)
  const students = useAttendanceStore((state) => state.students)
  const markAttendance = useAttendanceStore((state) => state.markAttendance)
  const user = useAuthStore((state) => state.user)

  const [selectedClass, setSelectedClass] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    student_id: '',
    name: '',
    class_name: '',
    mobile: '',
    seat_row: '',
    seat_col: '',
    avatar: null,
    face: null,
  })

  useEffect(() => {
    fetchStudents(selectedClass)
  }, [selectedClass, fetchStudents])

  // Live refresh on presence events so the page updates without manual reload.
  useEffect(() => {
    let timer = 0
    const onPresence = () => {
      // Debounce refetch to batch bursts of events.
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        fetchStudents(selectedClass)
      }, 700)
    }
    window.addEventListener('presence_event', onPresence)
    return () => {
      window.removeEventListener('presence_event', onPresence)
      if (timer) window.clearTimeout(timer)
    }
  }, [fetchStudents, selectedClass])

  const classOptions = useMemo(() => {
    const unique = new Set()
    ;(students || []).forEach((s) => {
      if (s.class) unique.add(String(s.class))
    })
    return ['all', ...Array.from(unique).sort()]
  }, [students])

  const filteredStudents = (students || []).filter((student) => {
    const q = searchTerm.toLowerCase()
    return (
      String(student?.name || '').toLowerCase().includes(q) ||
      String(student?.id || '').toLowerCase().includes(q)
    )
  })

  const canManageStudents = (user?.role || '').toLowerCase() === 'hod' || (user?.role || '').toLowerCase() === 'admin'

  const handleDeleteStudent = async () => {
    if (!selectedStudent?.id) return
    if (!canManageStudents) {
      toast.error('Insufficient permissions')
      return
    }

    const ok = window.confirm(`Delete student ${selectedStudent.name} (${selectedStudent.id})? This cannot be undone.`)
    if (!ok) return

    try {
      setDeleting(true)
      await axiosApi.delete(`/students/${selectedStudent.id}`)
      toast.success('Student deleted')
      setSelectedStudent(null)
      setTimeline([])
      await fetchStudents(selectedClass)
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Failed to delete student')
    } finally {
      setDeleting(false)
    }
  }

  const openStudentDetails = async (student) => {
    setSelectedStudent(student)
    setTimeline([])
    setTimelineLoading(true)
    try {
      const res = await axiosApi.get(`/attendance/timeline/${student.id}`)
      setTimeline(res.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load timeline')
    } finally {
      setTimelineLoading(false)
    }
  }

  const handleSaveStudent = async (e) => {
    e.preventDefault()
    if (!form.student_id || !form.name) {
      toast.error('Student ID and Name are required')
      return
    }

    try {
      setSaving(true)
      const fd = new FormData()
      fd.append('student_id', form.student_id)
      fd.append('name', form.name)
      if (form.class_name) fd.append('class_name', form.class_name)
      if (form.mobile) fd.append('mobile', form.mobile)
      if (form.seat_row) fd.append('seat_row', form.seat_row)
      if (form.seat_col) fd.append('seat_col', form.seat_col)
      if (form.avatar) fd.append('avatar', form.avatar)
      if (form.face) fd.append('face', form.face)

      await axiosApi.post('/students', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Student saved to database')
      setShowAddModal(false)
      setForm({
        student_id: '',
        name: '',
        class_name: '',
        mobile: '',
        seat_row: '',
        seat_col: '',
        avatar: null,
        face: null,
      })
      await fetchStudents(selectedClass)
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Failed to save student')
    } finally {
      setSaving(false)
    }
  }

  const handleMark = async (studentId, status) => {
    const ok = await markAttendance(studentId, status)
    if (ok) {
      toast.success(`Marked ${status}`)
      await fetchStudents(selectedClass)
      if (selectedStudent?.id === studentId) {
        try {
          setTimelineLoading(true)
          const res = await axiosApi.get(`/attendance/timeline/${studentId}`)
          setTimeline(res.data || [])
        } finally {
          setTimelineLoading(false)
        }
      }
    } else {
      toast.error('Failed to mark attendance')
    }
  }

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
          {canManageStudents && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus size={20} />
              Add Student
            </button>
          )}
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
            {classOptions.map((c) => (
              <option key={c} className="bg-slate-900 text-white" value={c}>
                {c === 'all' ? 'All Classes' : c}
              </option>
            ))}
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
            onClick={() => openStudentDetails(student)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="w-14 h-14 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  '👤'
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openStudentDetails(student)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-glass-light rounded-lg"
              >
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
                    {student.id}
                  </p>
                </div>
                <div className="bg-glass rounded-lg p-3">
                  <p className="text-xs text-gray-400">Attendance</p>
                  <p className="font-bold text-sm text-green-400 mt-1">
                    {student.attendancePct}%
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
                {student.class && (
                  <span className="ml-auto text-xs text-gray-400 bg-glass px-3 py-1 rounded-full">
                    {student.class}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openStudentDetails(student)
                  }}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                >
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

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => !saving && setShowAddModal(false)}
          />
          <div className="relative card w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Add Student</h2>
              <button
                onClick={() => !saving && setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-glass-light"
              >
                <X size={18} className="text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Student ID</label>
                  <input
                    value={form.student_id}
                    onChange={(e) => setForm((p) => ({ ...p, student_id: e.target.value }))}
                    className="input-field mt-2"
                    placeholder="e.g. CSE-A-02"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="input-field mt-2"
                    placeholder="Student name"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Class</label>
                  <input
                    value={form.class_name}
                    onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))}
                    className="input-field mt-2"
                    placeholder="e.g. CSE-A"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Mobile</label>
                  <input
                    value={form.mobile}
                    onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                    className="input-field mt-2"
                    placeholder="Phone"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Seat Row</label>
                  <input
                    value={form.seat_row}
                    onChange={(e) => setForm((p) => ({ ...p, seat_row: e.target.value }))}
                    className="input-field mt-2"
                    placeholder="e.g. 1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Seat Col</label>
                  <input
                    value={form.seat_col}
                    onChange={(e) => setForm((p) => ({ ...p, seat_col: e.target.value }))}
                    className="input-field mt-2"
                    placeholder="e.g. 2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Avatar (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.files?.[0] || null }))}
                    className="input-field mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Face Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm((p) => ({ ...p, face: e.target.files?.[0] || null }))}
                    className="input-field mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => !saving && setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader size={18} className="animate-spin" /> : null}
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => !timelineLoading && setSelectedStudent(null)} />
          <div className="relative card w-full max-w-3xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedStudent.name}</h2>
                <p className="text-gray-400 text-sm">{selectedStudent.id}{selectedStudent.class ? ` • ${selectedStudent.class}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {canManageStudents && (
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDeleteStudent}
                    className="btn-danger"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
                <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-lg hover:bg-glass-light">
                  <X size={18} className="text-gray-300" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 space-y-3">
                <div className="bg-glass rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white font-bold mt-1 capitalize">{selectedStudent.status || 'unknown'}</p>
                </div>
                <div className="bg-glass rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Trust Score</p>
                  <p className="text-white font-bold mt-1">{selectedStudent.trustScore ?? 100}</p>
                </div>
                <div className="bg-glass rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Attendance (30d)</p>
                  <p className="text-white font-bold mt-1">{selectedStudent.attendancePct}%</p>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    className="btn-primary flex items-center justify-center gap-2"
                    onClick={() => handleMark(selectedStudent.id, 'Present')}
                  >
                    <CheckCircle size={18} /> Mark Present
                  </button>
                  <button
                    className="btn-danger flex items-center justify-center gap-2"
                    onClick={() => handleMark(selectedStudent.id, 'Suspicious')}
                  >
                    <ShieldAlert size={18} /> Mark Suspicious
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold">Recent Timeline</h3>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock size={16} /> last 50
                    </div>
                  </div>

                  {timelineLoading ? (
                    <div className="py-8 flex items-center justify-center text-gray-300 gap-2">
                      <Loader size={18} className="animate-spin" /> Loading...
                    </div>
                  ) : timeline.length === 0 ? (
                    <div className="py-8 text-center text-gray-400">No events yet</div>
                  ) : (
                    <div className="max-h-[45vh] overflow-auto divide-y divide-white/10">
                      {timeline.map((e) => (
                        <div key={e.id} className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="text-white font-semibold capitalize">{e.type}</div>
                            <div className="text-gray-400 text-sm">{e.ts ? new Date(e.ts).toLocaleString() : ''}</div>
                          </div>
                          {e.label ? <div className="text-gray-300 text-sm mt-1">{e.label}</div> : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
