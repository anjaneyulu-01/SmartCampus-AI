import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Briefcase, BookOpenText, Building2 } from 'lucide-react';
import { useAuthStore } from '../stores';
import StatCard from '../components/StatCard';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const HODDashboardPage = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch branches list (university-wide)
      const branchesRes = await axios.get('/api/departments', { headers });
      setBranches(branchesRes.data || []);

      // Fetch department stats only if we know department id
      if (user?.department_id) {
        const deptRes = await axios.get(`/api/departments/${user.department_id}/stats`, { headers });
        setStats(deptRes.data);
      }

      // Fetch faculty (teachers)
      const facultyUrl = user?.department_id
      ? `/api/faculty?department_id=${user.department_id}`
      : '/api/faculty';
      const facultyRes = await axios.get(facultyUrl, { headers });
      setFaculty(facultyRes.data || []);

      // Fetch workers/staff
      const workerUrl = user?.department_id
      ? `/api/workers?department_id=${user.department_id}`
      : '/api/workers';
      const workerRes = await axios.get(workerUrl, { headers });
      setWorkers(workerRes.data || []);

      // Fetch students
      const studentsRes = await axios.get('/api/students', { headers });
      setStudents(studentsRes.data || []);

      // Fetch attendance summary
      const attendanceRes = await axios.get('/api/attendance/summary?days=7', { headers });
      setAttendance(attendanceRes.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-xl text-gray-300">Loading department data...</div>
      </div>
    );
  }

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">HOD Dashboard</h1>
          <p className="text-gray-400 mt-2">Department: {user?.department_name || 'Loading...'}</p>
        </div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <StatCard icon={Building2} label="Branches" value={branches.length} subtitle={`${branches.reduce((acc, b) => acc + (b.total_sections || 0), 0) || branches.length * 10} sections`} color="bg-slate-600" />
          <StatCard icon={Users} label="Faculty" value={stats?.total_faculty ?? faculty.length} color="bg-blue-500" />
          <StatCard icon={Briefcase} label="Staff" value={stats?.total_workers ?? workers.length} color="bg-emerald-500" />
          <StatCard icon={GraduationCap} label="Students" value={stats?.total_students ?? students.length} color="bg-purple-500" />
          <StatCard icon={BookOpenText} label="Classes" value={stats?.active_classes ?? stats?.total_classes ?? 0} subtitle={`${attendance?.[0]?.count || 0} today`} color="bg-orange-500" />
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/10">
          {['overview', 'branches', 'faculty', 'staff', 'students', 'attendance', 'announcements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          key={activeTab}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Attendance Trend */}
              {attendance.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Attendance Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.35)" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <YAxis stroke="rgba(255,255,255,0.35)" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }}
                        labelStyle={{ color: '#e2e8f0' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Total Present" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Department Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Faculty Utilization</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Assigned Classes</span>
                        <span className="text-sm font-semibold text-white">{stats?.avg_classes_per_faculty || 0}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Courses Taught</span>
                        <span className="text-sm font-semibold text-white">{stats?.total_courses || 0}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Department Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Avg Attendance Rate</span>
                      <span className="text-lg font-semibold text-green-400">
                        {stats?.avg_attendance_rate ? `${Math.round(stats.avg_attendance_rate)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Active Classes</span>
                      <span className="text-lg font-semibold text-blue-400">{stats?.active_classes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Active Announcements</span>
                      <span className="text-lg font-semibold text-purple-400">{stats?.active_announcements || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div className="card overflow-hidden">
              <div className="sticky top-0 z-20 bg-slate-950/40 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">University Branches</h3>
                <div className="text-sm text-gray-400">10 sections seeded per branch</div>
              </div>
              <div className="max-h-[70vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-slate-950/50 backdrop-blur-md border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Branch</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Code</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Sections</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Faculty</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Staff</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Students</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {branches.map((branch) => (
                      <tr key={branch.id || branch.code} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-white">{branch.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{branch.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{branch.total_sections ?? 10}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{branch.total_faculty ?? 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{branch.total_workers ?? 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{branch.total_students ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'faculty' && (
            <div className="card overflow-hidden">
              <div className="sticky top-0 z-20 bg-slate-950/40 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Faculty Members</h3>
                <button className="btn-primary px-4 py-2" onClick={() => navigate('/faculty')}>
                  Add Faculty
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-slate-950/50 backdrop-blur-md border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Designation</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Specialization</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {faculty.map((member) => (
                      <tr key={member.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-white">{member.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{member.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{member.designation}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{member.specialization || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="badge-success">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Attendance</h3>
                  <p className="text-sm text-gray-400 mt-1">Open branches → sections → mark attendance</p>
                </div>
                <button className="btn-primary px-4 py-2" onClick={() => navigate('/attendance')}>
                  Open Attendance
                </button>
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold text-white mb-3">Quick Branches</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(branches || []).slice(0, 6).map((b) => (
                    <button
                      key={b.id || b.code}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-colors"
                      onClick={() => navigate(`/attendance/${b.id}`)}
                    >
                      <div className="text-white font-semibold">{b.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{b.code} • {b.total_sections ?? 0} sections</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Announcements</h3>
                  <p className="text-sm text-gray-400 mt-1">Create and view announcements</p>
                </div>
                <button className="btn-primary px-4 py-2" onClick={() => navigate('/announcements')}>
                  Open Announcements
                </button>
              </div>
              <div className="mt-6 text-sm text-gray-300">
                Use the Announcements page to post new announcements.
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="card overflow-hidden">
              <div className="sticky top-0 z-20 bg-slate-950/40 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Staff & Workers</h3>
                <button className="btn-primary px-4 py-2" onClick={() => navigate('/workers')}>
                  Add Staff
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-slate-950/50 backdrop-blur-md border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Department</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {workers.map((worker) => (
                      <tr key={worker.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-white">{worker.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{worker.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{user?.department_name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="badge-info">{worker.worker_type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="badge-success">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="card overflow-hidden">
              <div className="sticky top-0 z-20 bg-slate-950/40 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Students</h3>
                <button className="btn-primary px-4 py-2" onClick={() => navigate('/students')}>
                  Add Student
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-slate-950/50 backdrop-blur-md border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Class</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-white">{s.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{s.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{s.class || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          {s.status === 'present' ? (
                            <span className="badge-success">present</span>
                          ) : s.status === 'absent' ? (
                            <span className="badge-danger">absent</span>
                          ) : (
                            <span className="badge">{s.status || 'unknown'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">{s.attendancePct ? `${s.attendancePct}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Attendance Records</h3>
              <div className="text-center text-gray-400 py-8">
                <p>Attendance records and analytics will be displayed here</p>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="card overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Department Announcements</h3>
                <button className="btn-primary px-4 py-2" onClick={() => toast('Announcements editor coming next')}> 
                  New Announcement
                </button>
              </div>
              <div className="p-6">
                <div className="text-center text-gray-400 py-8">
                  <p>No announcements yet. Create one to get started!</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
  );
};

export default HODDashboardPage;
