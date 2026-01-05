import { motion } from 'framer-motion'
import { FolderOpen } from 'lucide-react'

const sample = [
  { title: 'Syllabus PDF', type: 'PDF', size: '1.2 MB' },
  { title: 'Lab Manual', type: 'DOCX', size: '800 KB' },
]

export default function TeacherResources() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderOpen className="text-green-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Resources</h1>
          <p className="text-gray-300">Course files and materials</p>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        {sample.map((r, idx) => (
          <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-white font-semibold">{r.title}</div>
              <div className="text-sm text-gray-300">{r.type}</div>
            </div>
            <div className="text-xs text-gray-400">{r.size}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
