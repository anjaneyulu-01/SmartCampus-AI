import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'

const sample = [
  { day: 'Monday', slots: ['10:00 - DS (CSE-A)', '2:00 - DBMS (CSE-B)'] },
  { day: 'Tuesday', slots: ['11:00 - DS (CSE-A)'] },
]

export default function TeacherTimetable() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="text-green-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Timetable</h1>
          <p className="text-gray-300">Weekly teaching schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sample.map((d) => (
          <div key={d.day} className="card p-4">
            <div className="text-white font-semibold mb-2">{d.day}</div>
            <div className="space-y-2">
              {d.slots.map((slot, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg text-gray-200">
                  {slot}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
