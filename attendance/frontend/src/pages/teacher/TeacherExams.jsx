import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'

const sample = [
  { subject: 'Data Structures', class: 'CSE-A', date: '2024-10-05', status: 'Scheduled' },
  { subject: 'DBMS', class: 'CSE-B', date: '2024-10-08', status: 'Scheduled' },
]

export default function TeacherExams() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="text-green-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Exams & Marks</h1>
          <p className="text-gray-300">Upcoming exams overview</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sample.map((row) => (
            <div key={row.subject + row.class} className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-white font-semibold">{row.subject}</div>
              <div className="text-sm text-gray-300">Class: {row.class}</div>
              <div className="text-sm text-gray-300">Date: {row.date}</div>
              <div className="text-xs text-gray-400 mt-1">Status: {row.status}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
