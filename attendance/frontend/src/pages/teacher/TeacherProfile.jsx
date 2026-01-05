import { useAuthStore } from '../../stores'
import { motion } from 'framer-motion'
import { UserCircle } from 'lucide-react'

export default function TeacherProfile() {
  const user = useAuthStore((s) => s.user)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCircle className="text-green-400" size={28} />
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-gray-300">Your account details</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <div className="text-sm text-gray-400">Name</div>
          <div className="text-lg font-semibold text-white">{user?.display_name || user?.username}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Role</div>
          <div className="text-white">{user?.role || 'teacher'}</div>
        </div>
        {user?.department_name && (
          <div>
            <div className="text-sm text-gray-400">Department</div>
            <div className="text-white">{user.department_name}</div>
          </div>
        )}
        {user?.assigned_classes && (
          <div>
            <div className="text-sm text-gray-400">Assigned Classes</div>
            <div className="text-white">{user.assigned_classes}</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
