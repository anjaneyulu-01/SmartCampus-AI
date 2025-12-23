import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const attendanceChartData = [
  { name: 'Mon', present: 120, absent: 5, suspicious: 1 },
  { name: 'Tue', present: 118, absent: 7, suspicious: 2 },
  { name: 'Wed', present: 122, absent: 3, suspicious: 0 },
  { name: 'Thu', present: 115, absent: 10, suspicious: 2 },
  { name: 'Fri', present: 125, absent: 0, suspicious: 1 },
]

const punctualityData = [
  { name: 'On Time', value: 92 },
  { name: 'Late', value: 8 },
]

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6']

export default function InsightsPage() {
  const [dateRange, setDateRange] = useState('week')

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
            <h1 className="text-3xl font-bold text-white">Analytics & Insights</h1>
            <p className="text-gray-400 mt-1">Attendance trends and performance metrics</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="semester">This Semester</option>
            </select>
            <button className="btn-primary flex items-center gap-2">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {[
          {
            label: 'Avg Attendance Rate',
            value: '91.2%',
            change: '+2.4%',
            icon: BarChart3,
            color: 'text-green-400',
          },
          {
            label: 'Avg Punctuality',
            value: '92.8%',
            change: '+1.2%',
            icon: TrendingUp,
            color: 'text-blue-400',
          },
          {
            label: 'Week Present',
            value: '120',
            change: '+5 students',
            icon: Filter,
            color: 'text-purple-400',
          },
          {
            label: 'Week Absent',
            value: '5',
            change: '-3 students',
            icon: Calendar,
            color: 'text-red-400',
          },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div key={index} variants={itemVariants} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-2`}>
                    {stat.value}
                  </p>
                </div>
                <Icon size={32} className={`${stat.color} opacity-50`} />
              </div>
              <p className="text-xs text-green-400">{stat.change}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {/* Attendance Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-2 card p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Attendance Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgb(156,163,175)" />
              <YAxis stroke="rgb(156,163,175)" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="present" fill="#22c55e" name="Present" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              <Bar dataKey="suspicious" fill="#f59e0b" name="Suspicious" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Punctuality */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Punctuality Rate
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={punctualityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {punctualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">On Time</span>
              <span className="text-green-400 font-bold">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Late</span>
              <span className="text-red-400 font-bold">8%</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Performance Tables */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {/* Top Performers */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            🏆 Top Performers
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Aarav Singh', rate: '98%' },
              { name: 'Priya Sharma', rate: '96%' },
              { name: 'Amit Kumar', rate: '95%' },
              { name: 'Neha Patel', rate: '94%' },
              { name: 'Rahul Singh', rate: '92%' },
            ].map((student, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-glass rounded-lg hover:bg-glass-light transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center font-bold text-sm text-white">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{student.name}</span>
                </div>
                <span className="text-green-400 font-bold">{student.rate}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Need Improvement */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            ⚠️ Need Improvement
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Ravi Kumar', rate: '72%' },
              { name: 'Vikram Singh', rate: '68%' },
              { name: 'Sanjay Patel', rate: '65%' },
              { name: 'Akshay Sharma', rate: '62%' },
              { name: 'Arjun Verma', rate: '58%' },
            ].map((student, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-glass rounded-lg hover:bg-glass-light transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center font-bold text-sm text-white">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{student.name}</span>
                </div>
                <span className="text-orange-400 font-bold">{student.rate}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="card p-6 border-l-4 border-green-500">
        <h2 className="text-xl font-bold text-white mb-4">📊 Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-gray-400 text-sm">Total Classes</p>
            <p className="text-3xl font-bold text-white mt-2">4</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Students</p>
            <p className="text-3xl font-bold text-white mt-2">500</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Avg Class Attendance</p>
            <p className="text-3xl font-bold text-green-400 mt-2">91.2%</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Suspicious Cases</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">12</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
