import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, subtitle, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="card p-6 cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <div className="flex items-baseline gap-2 mt-3">
            <h3 className="text-3xl md:text-4xl font-bold text-white">
              {value}
            </h3>
            {subtitle && (
              <span className="text-sm text-green-400 font-medium">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 h-1 bg-glass rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: '85%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}
