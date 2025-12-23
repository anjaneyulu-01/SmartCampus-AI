import { motion } from 'framer-motion'
import { ChevronRight, MoreVertical } from 'lucide-react'

const demoAttendance = [
  {
    id: 1,
    student_name: 'Aarav Singh',
    student_id: 'STU001',
    time: '08:45 AM',
    status: 'present',
    avatar: '👨‍🎓',
  },
  {
    id: 2,
    student_name: 'Ananya Sharma',
    student_id: 'STU002',
    time: '08:50 AM',
    status: 'present',
    avatar: '👩‍🎓',
  },
  {
    id: 3,
    student_name: 'Arjun Patel',
    student_id: 'STU003',
    time: '09:15 AM',
    status: 'late',
    avatar: '👨‍🎓',
  },
  {
    id: 4,
    student_name: 'Diya Gupta',
    student_id: 'STU004',
    time: '-',
    status: 'absent',
    avatar: '👩‍🎓',
  },
  {
    id: 5,
    student_name: 'Ravi Kumar',
    student_id: 'STU005',
    time: '08:42 AM',
    status: 'suspicious',
    avatar: '👨‍🎓',
  },
]

export default function AttendanceTable() {
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
          {demoAttendance.map((record, index) => {
            const badge = getStatusBadge(record.status)
            return (
              <motion.tr
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-glass-light transition-colors group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{record.avatar}</span>
                    <div>
                      <p className="font-medium text-white">
                        {record.student_name}
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
                  <p className="text-white font-medium">{record.time}</p>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="p-2 hover:bg-glass rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>

      {/* Footer with pagination */}
      <div className="flex items-center justify-between p-4 border-t border-white/10 mt-4">
        <p className="text-sm text-gray-400">
          Showing <span className="font-bold text-white">5</span> of{' '}
          <span className="font-bold text-white">125</span> records
        </p>
        <div className="flex gap-2">
          <button className="btn-secondary px-4 py-2 text-sm">Previous</button>
          <button className="btn-primary px-4 py-2 text-sm flex items-center gap-1">
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
