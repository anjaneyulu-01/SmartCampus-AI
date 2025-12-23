import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpenText, Users } from 'lucide-react'

export default function LibraryPage() {
  const books = useMemo(
    () => [
      { id: 'BK-001', title: 'Database Systems', author: 'Silberschatz', category: 'CSE', available: true },
      { id: 'BK-002', title: 'Operating Systems', author: 'Tanenbaum', category: 'CSE', available: false },
      { id: 'BK-003', title: 'Engineering Mathematics', author: 'Kreyszig', category: 'Common', available: true },
      { id: 'BK-004', title: 'Digital Electronics', author: 'Morris Mano', category: 'ECE', available: true },
      { id: 'BK-005', title: 'Software Engineering', author: 'Pressman', category: 'CSE', available: true },
    ],
    [],
  )

  const visits = useMemo(
    () => [
      { id: 'V-001', name: 'Sai', student_id: 'sai', date: '2025-12-22', checkIn: '10:05', checkOut: '12:20' },
      { id: 'V-002', name: 'Image Person', student_id: 'image_person', date: '2025-12-22', checkIn: '14:10', checkOut: '15:05' },
      { id: 'V-003', name: 'Aarav Singh', student_id: 'STU001', date: '2025-12-23', checkIn: '09:30', checkOut: '11:00' },
      { id: 'V-004', name: 'Priya Sharma', student_id: 'STU002', date: '2025-12-23', checkIn: '12:15', checkOut: '13:45' },
    ],
    [],
  )

  const withHours = useMemo(() => {
    const toMinutes = (hhmm) => {
      const [h, m] = (hhmm || '00:00').split(':').map((x) => Number(x))
      return h * 60 + m
    }
    return visits.map((v) => {
      const mins = Math.max(0, toMinutes(v.checkOut) - toMinutes(v.checkIn))
      const hours = Math.round((mins / 60) * 10) / 10
      return { ...v, hours }
    })
  }, [visits])

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Library</h1>
        <p className="text-gray-400 mt-1">Books and student library-hours</p>
      </div>

      {/* Books */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpenText size={20} />
            Books
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-400">
              <tr className="border-b border-white/10">
                <th className="py-3 text-left font-semibold">Book ID</th>
                <th className="py-3 text-left font-semibold">Title</th>
                <th className="py-3 text-left font-semibold">Author</th>
                <th className="py-3 text-left font-semibold">Category</th>
                <th className="py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {books.map((b) => (
                <tr key={b.id} className="text-gray-200">
                  <td className="py-3">{b.id}</td>
                  <td className="py-3 font-medium text-white">{b.title}</td>
                  <td className="py-3">{b.author}</td>
                  <td className="py-3">{b.category}</td>
                  <td className="py-3">
                    {b.available ? (
                      <span className="badge-success">Available</span>
                    ) : (
                      <span className="badge-warning">Issued</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student stay records */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} />
            Student Library Hours
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-400">
              <tr className="border-b border-white/10">
                <th className="py-3 text-left font-semibold">Date</th>
                <th className="py-3 text-left font-semibold">Student</th>
                <th className="py-3 text-left font-semibold">Student ID</th>
                <th className="py-3 text-left font-semibold">Check-in</th>
                <th className="py-3 text-left font-semibold">Check-out</th>
                <th className="py-3 text-left font-semibold">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {withHours.map((v) => (
                <tr key={v.id} className="text-gray-200">
                  <td className="py-3">{v.date}</td>
                  <td className="py-3 font-medium text-white">{v.name}</td>
                  <td className="py-3">{v.student_id}</td>
                  <td className="py-3">{v.checkIn}</td>
                  <td className="py-3">{v.checkOut}</td>
                  <td className="py-3">
                    <span className="badge-info">{v.hours}h</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
