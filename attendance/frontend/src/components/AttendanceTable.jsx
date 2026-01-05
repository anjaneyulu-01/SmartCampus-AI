import { motion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AttendanceTable({ records = [] }) {
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState(null)
  const getStatusBadge = (status) => {
    const badges = {
      present: { color: 'bg-green-500/20 text-green-300 border-green-500/30', label: '✓ Present' },
      late: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: '⏱ Late' },
      absent: { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: '✕ Absent' },
      suspicious: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: '⚠ Suspicious' },
    }
    const badge = badges[status] || badges.absent
    return badge
  }

  const safeRecords = Array.isArray(records) ? records : []

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-4 px-4 font-semibold text-gray-400 text-sm">
              Student
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-400 text-sm">
              ID
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-400 text-sm">
              Time
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-400 text-sm">
              Status
            </th>
            <th className="text-right py-4 px-4 font-semibold text-gray-400 text-sm">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {safeRecords.map((record, index) => {
            const badge = getStatusBadge((record.status || 'absent').toLowerCase())
            const timeLabel = record.timestamp ? new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
            return (
              <motion.tr
                key={`${record.student_id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-glass-light transition-colors group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {record.avatarUrl ? (
                      <img
                        src={record.avatarUrl}
                        alt={record.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                    <div>
                      <p className="font-medium text-white">
                        {record.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.student_id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <code className="text-sm font-mono text-cyan-400 bg-glass px-3 py-1 rounded">
                    {record.student_id}
                  </code>
                </td>
                <td className="py-4 px-4">
                  <p className="text-white font-medium">{timeLabel}</p>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </td>
                <td className="py-4 px-4 text-right relative">
                  <button
                    className="p-2 hover:bg-glass rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    onClick={() => setOpenMenu(openMenu === index ? null : index)}
                    aria-label="Actions"
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                  {openMenu === index && (
                    <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-white/10 rounded shadow-lg z-10">
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-slate-700 text-sm text-white"
                        onClick={() => { setOpenMenu(null); navigate(`/portal/students/${record.student_id}`) }}
                      >
                        View Student
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-slate-700 text-sm text-white"
                        onClick={() => { setOpenMenu(null); navigate(`/portal/attendance/timeline/${record.student_id}`) }}
                      >
                        Attendance Timeline
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-slate-700 text-sm text-red-400"
                        onClick={() => { setOpenMenu(null); alert('Feature coming soon!') }}
                      >
                        Flag as Suspicious
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>

      {safeRecords.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          No attendance records for this date.
        </div>
      )}
    </div>
  )
}
