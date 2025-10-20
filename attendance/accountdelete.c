<!DOCTYPE html>
<html lang="en">
<head>
  <!-- ✅ Meta basics -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>Cloudy Login</title>

  <!-- ✅ UI Styles -->
  <link rel="stylesheet" href="style.css" />

  <!-- ✅ We mark the page so script.js knows which initializer to run -->
  <meta name="page" content="login" />
</head>
<body class="login-body" data-page="login">
  <div class="login-container">
    <!-- ✅ Left: actual login form -->
    <div class="login-left">
      <h2>Hello!</h2>
      <p>Sign in to your account</p>

      <!-- ✅ Toast for small messages on login page -->
      <div id="loginToast" class="toast hidden"></div>

      <!-- ✅ Login Form -->
      <form id="loginForm" autocomplete="off">
        <div class="input-group">
          <span class="icon">📧</span>
          <input type="email" id="email" placeholder="E-mail" required />
        </div>

        <div class="input-group">
          <span class="icon">🔒</span>
          <input type="password" id="password" placeholder="Password" required />
          <span class="toggle" id="togglePassword" title="Show/Hide">👁️</span>
        </div>

        <div class="options">
          <label><input type="checkbox" id="rememberMe" /> Remember me</label>
          <a href="#" id="forgotPassword">Forgot password?</a>
        </div>

        <button type="submit" class="btn">SIGN IN</button>
        <p class="create">Don’t have an account? <a href="#" id="openRegister">Create</a></p>
      </form>
    </div>

    <!-- ✅ Right: cloud decoration + welcome text -->
    <div class="login-right">
      <svg class="cloud-shape" viewBox="0 0 600 500" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,100 C120,50 180,150 300,100 C420,50 480,180 600,100 L600,400 C480,450 420,320 300,400 C180,480 120,350 0,400 Z" fill="white"/>
      </svg>

      <div class="welcome-text">
        <h2>Welcome Back!</h2>
        <p>Login to access the Student Attendance Dashboard.</p>
      </div>
    </div>
  </div>

  <!-- ✅ Register Modal -->
  <div id="registerModal" class="modal hidden" aria-hidden="true">
    <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="registerTitle">
      <h3 id="registerTitle">Create Account</h3>

      <form id="registerForm" autocomplete="off">
        <div class="input-group">
          <span class="icon">📧</span>
          <input type="email" id="regEmail" placeholder="E-mail" required />
        </div>

        <div class="input-group">
          <span class="icon">🔒</span>
          <input type="password" id="regPassword" placeholder="Password" required minlength="6" />
          <span class="toggle" id="toggleRegPassword">👁️</span>
        </div>

        <div class="input-group">
          <span class="icon">🔒</span>
          <input type="password" id="regPassword2" placeholder="Confirm Password" required minlength="6" />
          <span class="toggle" id="toggleRegPassword2">👁️</span>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-outline" id="closeRegister">Cancel</button>
          <button type="submit" class="btn">Create</button>
        </div>
      </form>

      <p class="small text-muted mt-2">
        Demo note: Accounts are stored in your browser’s localStorage.
      </p>
    </div>
  </div>

  <!-- ✅ App logic -->
  <script src="script.js"></script>
</body>
</html>


///dashboard

<!DOCTYPE html>
<html lang="en">
<head>
  <!-- ✅ Meta basics -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>Student Attendance Dashboard</title>

  <!-- ✅ Tailwind (utility classes for layout only, optional) -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />

  <!-- ✅ Our styles -->
  <link rel="stylesheet" href="style.css" />

  <!-- ✅ Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <!-- ✅ Page marker -->
  <meta name="page" content="dashboard" />
</head>

<body class="bg-gray-100" data-page="dashboard">
  <!-- ✅ Sidebar Toggle Arrow (small screens) -->
  <div id="sidebarToggleArrow" class="sidebar-toggle-arrow" title="Toggle Sidebar">▶</div>

  <!-- ✅ Sidebar -->
  <aside class="sidebar" id="sidebar">
    <div class="logo px-4">
      <span class="logo-text">SECURE-ATT</span>
    </div>

    <nav>
      <ul>
        <li data-page="dashboard" class="active">📊 Dashboard</li>
        <li data-page="students">👨‍🎓 Students</li>
        <li data-page="attendance">📝 Attendance</li>
        <li data-page="settings">⚙️ Settings</li>
      </ul>
    </nav>

    <div class="footer">
      Game Play<br />
      <span class="email">gameplayapp007@gmail.com</span>
      <div class="mt-3">
        <button id="logoutBtn" class="logout-btn">Logout</button>
      </div>
    </div>
  </aside>

  <!-- ✅ Main content area -->
  <main class="main-content">
    <!-- ✅ Top header -->
    <header class="header">
      <button class="menu-btn" onclick="toggleSidebar()">☰</button>
      <h1 id="pageTitle">Dashboard</h1>

      <!-- ✅ Dashboard controls -->
      <div class="flex items-center gap-2">
        <select id="viewSelect" class="border p-2 rounded" title="Select number of days">
          <option value="30" selected>Last 30 Days</option>
          <option value="7">Last 7 Days</option>
          <option value="1">Today</option>
        </select>

        <select id="classSelector" class="border p-2 rounded" title="Select Class">
          <option value="all" selected>All Classes</option>
        </select>
      </div>
    </header>

    <!-- ============ DASHBOARD PAGE ============ -->
    <section id="dashboardSection">
      <!-- ✅ KPI Cards -->
      <section class="cards">
        <div class="card">
          <p>Total Students</p>
          <h2 id="totalStudentsCard">0</h2>
        </div>
        <div class="card">
          <p>Total Present</p>
          <h2 id="presentPercent">0%</h2>
        </div>
        <div class="card">
          <p>Total Absent</p>
          <h2 id="absentPercent">0%</h2>
        </div>
      </section>

      <!-- ✅ Charts -->
      <section class="charts">
        <div class="chart-box">
          <h2 class="font-semibold mb-2">Attendance (Day-wise)</h2>
          <div class="h-64">
            <canvas id="barChart"></canvas>
          </div>
        </div>

        <div class="chart-box">
          <h2 class="font-semibold mb-2">Monthly Attendance</h2>
          <div class="h-64">
            <canvas id="doughnutChart"></canvas>
          </div>
        </div>
      </section>
    </section>

    <!-- ============ STUDENTS PAGE ============ -->
    <section id="studentsSection" class="hidden students">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Students</h2>
        <button onclick="openStudentModal()" class="bg-blue-600 text-white px-4 py-2 rounded">+ Add New Student</button>
      </div>

      <input
        type="text"
        id="searchInput"
        placeholder="Search on anything..."
        class="w-full border p-2 rounded mb-4"
      />

      <div class="bg-white shadow-md rounded overflow-hidden">
        <table class="w-full border-collapse">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 border">Roll</th>
              <th class="p-2 border">Name</th>
              <th class="p-2 border">Class</th>
              <th class="p-2 border">Section</th>
              <th class="p-2 border">Mobile</th>
              <th class="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody id="studentTable"></tbody>
        </table>
      </div>
    </section>

    <!-- ============ ATTENDANCE PAGE ============ -->
    <section id="attendanceSection" class="hidden">
      <div class="flex flex-wrap gap-3 items-end mb-4">
        <div>
          <label class="text-sm text-gray-600 block mb-1">Month</label>
          <select id="monthSelect" class="border p-2 rounded"></select>
        </div>

        <div>
          <label class="text-sm text-gray-600 block mb-1">Year</label>
          <select id="yearSelect" class="border p-2 rounded"></select>
        </div>

        <div>
          <label class="text-sm text-gray-600 block mb-1">Class</label>
          <select id="classFilter" class="border p-2 rounded">
            <option value="all" selected>All Classes</option>
          </select>
        </div>

        <button id="applyFilterBtn" class="bg-blue-600 text-white px-4 py-2 rounded">Apply</button>
      </div>

      <div class="w-full overflow-x-auto bg-white shadow-md rounded">
        <table class="min-w-max border-collapse">
          <thead class="bg-gray-100">
            <tr id="attendanceHeader"></tr>
          </thead>
          <tbody id="attendanceTable"></tbody>
        </table>
      </div>
    </section>

    <!-- ============ SETTINGS PAGE (Profile Management) ============ -->
    <section id="settingsSection" class="hidden">
      <h2 class="text-xl font-bold mb-4">Settings</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- ✅ Change Password -->
        <div class="bg-white rounded shadow p-4">
          <h3 class="font-semibold mb-3">Change Password</h3>
          <form id="changePasswordForm">
            <input type="password" id="currentPassword" class="w-full border p-2 rounded mb-2" placeholder="Current Password" required />
            <input type="password" id="newPassword" class="w-full border p-2 rounded mb-2" placeholder="New Password (min 6 chars)" minlength="6" required />
            <input type="password" id="newPassword2" class="w-full border p-2 rounded mb-2" placeholder="Confirm New Password" minlength="6" required />
            <button class="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Update Password</button>
          </form>
        </div>

        <!-- ✅ Change Email -->
        <div class="bg-white rounded shadow p-4">
          <h3 class="font-semibold mb-3">Change Email</h3>
          <form id="changeEmailForm">
            <input type="email" id="newEmail" class="w-full border p-2 rounded mb-2" placeholder="New E-mail" required />
            <button class="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Update Email</button>
          </form>
          <p class="text-sm text-gray-500 mt-2">You will stay logged in after a successful email change.</p>
        </div>
      </div>

      <!-- ✅ Delete Account -->
      <div class="bg-white rounded shadow p-4 mt-6">
        <h3 class="font-semibold mb-3 text-red-600">Danger Zone</h3>
        <button id="deleteAccountBtn" class="bg-red-600 text-white px-4 py-2 rounded">Delete My Account</button>
        <p class="text-sm text-gray-500 mt-2">This removes your account from this browser and logs you out.</p>
      </div>
    </section>
  </main>

  <!-- ✅ Student Modal -->
  <div id="studentModal" class="hidden fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-3">
    <div class="bg-white p-6 rounded w-full max-w-md">
      <h2 class="text-lg font-bold mb-4">Add Student</h2>

      <form id="studentForm">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" id="name" placeholder="Name" class="w-full p-2 border rounded" required />
          <input type="number" id="roll" placeholder="Roll Number" class="w-full p-2 border rounded" required />
          <input type="text" id="class" placeholder="Class" class="w-full p-2 border rounded" required />
          <input type="text" id="section" placeholder="Section (e.g., A)" class="w-full p-2 border rounded" required />
          <input type="text" id="mobile" placeholder="Mobile Number" class="w-full p-2 border rounded sm:col-span-2" required />
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button type="button" onclick="closeStudentModal()" class="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ✅ App Toast (shared) -->
  <div id="toast" class="toast hidden"></div>

  <!-- ✅ App logic -->
  <script src="script.js"></script>
</body>
</html>


///css

/* =========================================================
   BASE
========================================================= */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
}

:root{
  --brand-1: #7b2ff7;
  --brand-2: #3bbcff;
  --brand-3: maroon;
  --ink-1: #111827;
  --ink-2: #374151;
  --muted: #6b7280;
  --bg: #f2f5ff;
  --white: #fff;
  --shadow: 0 8px 25px rgba(0,0,0,0.15);
}

/* Small utility */
.hidden { display: none !important; }
.text-muted { color: #6b7280; }
.small { font-size: .85rem; }
.mt-2{ margin-top: .5rem; }

/* =========================================================
   LOGIN PAGE
========================================================= */
.login-body {
  background: var(--bg);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Container */
.login-container {
  display: flex;
  flex-wrap: wrap;
  width: 90%;
  max-width: 1000px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow);
  background: var(--white);
}

/* Left Side (form) */
.login-left {
  flex: 1;
  min-width: 300px;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;
}
.login-left h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
  color: var(--ink-1);
}
.login-left p {
  color: #777;
  margin-bottom: 25px;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background: #f5f5f5;
  border-radius: 50px;
  padding: 12px 18px;
  box-shadow:
    inset 2px 2px 6px rgba(0,0,0,0.08),
    inset -2px -2px 6px rgba(255,255,255,0.9);
}
.input-group input {
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  font-size: 14px;
  margin-left: 10px;
}
.input-group .icon { font-size: 16px; }
.input-group .toggle {
  cursor: pointer;
  font-size: 16px;
  margin-left: 8px;
  user-select: none;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 25px;
}
.options a { text-decoration: none; color: var(--brand-1); }

.btn {
  width: 100%;
  padding: 14px;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, var(--brand-3), var(--brand-1), var(--brand-2));
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 15px;
  transition: transform 0.2s ease, box-shadow .2s ease;
  box-shadow: 0 6px 14px rgba(123,47,247,0.25);
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(123,47,247,0.28);
}

.btn-outline{
  width: auto;
  padding: 10px 16px;
  border-radius: 50px;
  border: 2px solid #ddd;
  background: #fff;
  color: #111827;
  font-weight: 600;
  cursor: pointer;
}
.btn-outline:hover{ background:#f9fafb; }

.create { text-align: center; font-size: 13px; }
.create a { color: var(--brand-1); text-decoration: none; }

/* Right Side (cloud) */
.login-right {
  flex: 1;
  min-width: 300px;
  background: linear-gradient(135deg, var(--brand-3), var(--brand-1), violet);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  overflow: hidden;
}
.cloud-shape {
  position: absolute;
  left: -80px;
  top: 0;
  width: 120%;
  height: 100%;
}
.welcome-text {
  position: relative;
  z-index: 2;
  max-width: 350px;
  text-align: left;
  color: #000;
}
.welcome-text h2 { font-size: 30px; margin-bottom: 15px; }
.welcome-text p { color: #222; font-size: 15px; line-height: 1.6; }

/* Register modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.modal-content{
  background: #fff;
  width: 92%;
  max-width: 420px;
  border-radius: 16px;
  padding: 22px 20px;
  box-shadow: var(--shadow);
}
.modal-content h3{
  font-weight: 800;
  font-size: 1.25rem;
  margin-bottom: .75rem;
}
.modal-actions{
  display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px;
}

/* =========================================================
   DASHBOARD
========================================================= */
.sidebar {
  width: 220px;
  background: #fff;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  transition: transform 0.3s ease;
  z-index: 100;
}
.sidebar.hidden { transform: translateX(-100%); }
.sidebar.show { transform: translateX(0); }
.sidebar .logo {
  font-size: 1.2rem;
  font-weight: bold;
  color: #4f46e5;
  margin-bottom: 24px;
}
.sidebar nav ul { list-style: none; padding: 0; }
.sidebar nav ul li {
  padding: 10px;
  margin: 6px 0;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}
.sidebar nav ul li:hover,
.sidebar nav ul li.active {
  background: #e0e7ff;
  color: #4f46e5;
  font-weight: bold;
}
.sidebar .footer {
  position: absolute;
  bottom: 16px;
  font-size: 0.8rem;
  color: #555;
}
.sidebar .footer .email { font-size: 0.75rem; color: gray; }
.logout-btn{
  background:#ef4444; color:#fff; border:none; padding:8px 12px; border-radius:8px;
}

/* Sidebar toggle (only on small screens) */
.sidebar-toggle-arrow {
  position: fixed;
  top: 50%;
  left: 0;
  transform: translate(-100%, -50%);
  background-color: #4f46e5;
  color: white;
  padding: 10px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 18px;
  z-index: 150;
  display: none;
  user-select: none;
}

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.show { transform: translateX(0); }
  .main-content {
    margin-left: 0 !important;
    transition: margin-left 0.3s ease;
  }
  .sidebar-toggle-arrow { display: block; }
}

.main-content {
  margin-left: 220px;
  padding: 16px;
  transition: margin-left 0.3s ease;
}
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.header h1 { font-size: 1.5rem; font-weight: bold; }
.header .menu-btn { display: none; font-size: 1.3rem; background: none; cursor: pointer; }

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.card {
  background: #dbeafe;
  padding: 14px;
  border-radius: 10px;
  text-align: center;
}
.card p { color: gray; font-size: 0.85rem; }
.card h2 { font-size: 1.4rem; font-weight: bold; }

/* Charts */
.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.chart-box {
  background: white;
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.chart-box h2 { font-size: 1rem; margin-bottom: 8px; }
canvas { max-width: 100%; height: auto !important; }

/* Students */
.students { margin-top: 20px; }
.students table th { font-weight: 600; text-align: left; }
.students table td, .students table th {
  font-size: 0.9rem; padding: 6px; border: 1px solid #ddd;
}
.students table tbody tr:hover { background-color: #f3f4f6; }

/* Modal (dashboard) */
#studentModal { animation: fadeIn 0.2s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Toast (shared) */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4f46e5;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  z-index: 200;
  pointer-events: none;
}
.toast.show { opacity: 1; transform: translateY(0); pointer-events: auto; }

/* Responsive */
@media (max-width: 1024px){ .charts { grid-template-columns: 1fr; } }
@media (max-width: 768px){ .login-right { min-height: 250px; } }


///js

/* =========================================================
   SIMPLE AUTH + APP STATE (LocalStorage)
   ⚠️ Demo only (not secure for real production)
   - Users:       [{ email, password, createdAt }]
   - Session:     { email, createdAt, expiresAt }
   - Students:    [{ id, name, roll, studentClass, section, mobile }]
   - Attendance:  { [studentId]: { "YYYY-MM": { [dayNumber]: true|false } } }
========================================================= */

/* ---------- Storage Keys (single source of truth) ---------- */
const STORAGE_KEYS = {
  users: "users",
  session: "sessionUser",
  students: "students",
  attendance: "attendance",
};

/* =========================================================
   USERS HELPERS
========================================================= */
function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || []; }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

/* =========================================================
   SESSION HELPERS  (20-min expiry, auto-extends on activity)
========================================================= */
function setSession(email, remember = false) {
  const now = Date.now();
  const sessionData = {
    email,
    createdAt: now,
    expiresAt: now + 20 * 60 * 1000, // 20 minutes from now
    remember,
  };
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionData));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.session)); }
  catch { return null; }
}

function getSessionUser() {
  const session = getSession();
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    clearSession();
    return null;
  }
  return session.email;
}

function extendSession() {
  const session = getSession();
  if (!session) return;
  session.expiresAt = Date.now() + 20 * 60 * 1000;
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

/* =========================================================
   APP DATA HELPERS (Students & Attendance)
========================================================= */
function loadStudents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || []; }
  catch { return []; }
}
function saveStudents(students) {
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
}

function loadAttendance() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.attendance)) || {}; }
  catch { return {}; }
}
function saveAttendance(attendance) {
  localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(attendance));
}

/* =========================================================
   PAGE BOOTSTRAP
   - Decides which initializer to run based on <meta name="page">
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector('meta[name="page"]')?.content || document.body.dataset.page;

  if (page === "login") initLoginPage();
  if (page === "dashboard") {
    requireAuthOrRedirect();
    initDashboardPage();
  }
});

/* ---------- Guard: redirect if not logged in ---------- */
function requireAuthOrRedirect() {
  if (!getSessionUser()) window.location.replace("index.html");
}

/* =========================================================
   LOGIN PAGE LOGIC
========================================================= */
function initLoginPage() {
  // Elements
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const rememberInput = document.getElementById("rememberMe");
  const togglePassword = document.getElementById("togglePassword");
  const loginToast = document.getElementById("loginToast");

  const regModal = document.getElementById("registerModal");
  const openRegister = document.getElementById("openRegister");
  const closeRegister = document.getElementById("closeRegister");
  const registerForm = document.getElementById("registerForm");
  const regEmail = document.getElementById("regEmail");
  const regPassword = document.getElementById("regPassword");
  const regPassword2 = document.getElementById("regPassword2");
  const toggleRegPassword = document.getElementById("toggleRegPassword");
  const toggleRegPassword2 = document.getElementById("toggleRegPassword2");
  const forgotPassword = document.getElementById("forgotPassword");

  // Reset fields every load
  if (emailInput) emailInput.value = "";
  if (passInput) passInput.value = "";
  if (rememberInput) rememberInput.checked = false;

  // If already logged in → go to dashboard
  if (getSessionUser()) {
    window.location.replace("dashboard.html");
    return;
  }

  // Password eye toggles
  const toggleEye = (input, el) => {
    if (!input || !el) return;
    el.addEventListener("click", () => {
      input.type = input.type === "password" ? "text" : "password";
      el.textContent = input.type === "password" ? "👁️" : "🙈";
    });
  };
  toggleEye(passInput, togglePassword);
  toggleEye(regPassword, toggleRegPassword);
  toggleEye(regPassword2, toggleRegPassword2);

  // Small toast for login page
  function showLoginToast(msg, bg = "#4f46e5") {
    loginToast.textContent = msg;
    loginToast.style.background = bg;
    loginToast.classList.remove("hidden");
    loginToast.classList.add("show");
    clearTimeout(showLoginToast._t);
    showLoginToast._t = setTimeout(() => {
      loginToast.classList.remove("show");
      loginToast.classList.add("hidden");
      loginToast.style.background = "#4f46e5";
    }, 2400);
  }

  // Forgot password (demo)
  if (forgotPassword) {
    forgotPassword.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginToast("Demo only: password reset not implemented.", "#f59e0b");
    });
  }

  // Register modal open/close
  openRegister?.addEventListener("click", (e) => {
    e.preventDefault();
    regModal.classList.remove("hidden");
  });
  closeRegister?.addEventListener("click", () => regModal.classList.add("hidden"));
  regModal?.addEventListener("click", (e) => {
    if (e.target === regModal) regModal.classList.add("hidden");
  });

  // Register submit
  registerForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = regEmail.value.trim();
    const pw1 = regPassword.value;
    const pw2 = regPassword2.value;

    if (pw1.length < 6) return showLoginToast("Password must be at least 6 chars.", "#ef4444");
    if (pw1 !== pw2) return showLoginToast("Passwords do not match.", "#ef4444");

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return showLoginToast("Account exists. Please login.", "#ef4444");
    }

    users.push({ email, password: pw1, createdAt: Date.now() });
    saveUsers(users);

    showLoginToast("Account created! You can login now.", "#10b981");
    registerForm.reset();
    regModal.classList.add("hidden");
  });

  // Login submit
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passInput.value;

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) return showLoginToast("Account not found. Create one.", "#ef4444");
    if (user.password !== password) return showLoginToast("Wrong password.", "#ef4444");

    setSession(user.email, !!rememberInput.checked);
    showLoginToast("Login successful! Redirecting...", "#10b981");
    setTimeout(() => window.location.replace("dashboard.html"), 400);
  });
}

/* =========================================================
   DASHBOARD PAGE LOGIC
========================================================= */
function initDashboardPage() {
  // Guard again
  const sessionUser = getSessionUser();
  if (!sessionUser) return requireAuthOrRedirect();

  /* ---------- Sidebar responsive toggle ---------- */
  const sidebar = document.getElementById("sidebar");
  const sidebarToggleArrow = document.getElementById("sidebarToggleArrow");
  window.toggleSidebar = function toggleSidebar() {
    const isShown = sidebar.classList.contains("show");
    if (window.innerWidth <= 768) {
      if (isShown) {
        sidebar.classList.remove("show");
        sidebarToggleArrow.textContent = "▶";
        document.querySelector(".main-content").style.marginLeft = "0";
      } else {
        sidebar.classList.add("show");
        sidebarToggleArrow.textContent = "◀";
        document.querySelector(".main-content").style.marginLeft = "220px";
      }
    } else {
      sidebar.classList.toggle("hidden");
      document.querySelector(".main-content").style.marginLeft =
        sidebar.classList.contains("hidden") ? "0" : "220px";
    }
  };
  function initializeSidebarToggleArrow() {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("hidden");
      sidebar.classList.remove("show");
      sidebarToggleArrow.textContent = "▶";
      document.querySelector(".main-content").style.marginLeft = "0";
      sidebarToggleArrow.style.display = "block";
    } else {
      sidebarToggleArrow.style.display = "none";
      sidebar.classList.remove("show");
      sidebar.classList.remove("hidden");
      document.querySelector(".main-content").style.marginLeft = "220px";
    }
  }
  sidebarToggleArrow?.addEventListener("click", toggleSidebar);
  window.addEventListener("resize", initializeSidebarToggleArrow);
  window.addEventListener("load", initializeSidebarToggleArrow);
  initializeSidebarToggleArrow();

  /* ---------- Shared toast helper ---------- */
  function showToast(message, bg) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    if (bg) toast.style.background = bg;
    toast.classList.remove("hidden");
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.classList.remove("show");
      toast.classList.add("hidden");
      toast.style.background = "";
    }, 2200);
  }

  /* ---------- Data store (load or seed) ---------- */
  let students = loadStudents();
  if (!students || students.length === 0) {
    students = [
      { id: "s1", name: "John Doe",  roll: 1, studentClass: "10", section: "A", mobile: "9000000001" },
      { id: "s2", name: "Jane Smith",roll: 2, studentClass: "10", section: "A", mobile: "9000000002" },
    ];
    saveStudents(students);
  }
  let attendance = loadAttendance(); // structure described at top

  /* ---------- DOM refs ---------- */
  const pageTitle = document.getElementById("pageTitle");

  // Navigation (left sidebar)
  const navItems = document.querySelectorAll(".sidebar nav ul li");
  const dashboardSection = document.getElementById("dashboardSection");
  const studentsSection = document.getElementById("studentsSection");
  const attendanceSection = document.getElementById("attendanceSection");
  const settingsSection = document.getElementById("settingsSection");

  // Header controls (dashboard)
  const viewSelect = document.getElementById("viewSelect");     // 30 / 7 / 1 (days window)
  const classSelector = document.getElementById("classSelector"); // All / specific class for charts

  // KPI cards
  const totalStudentsCard = document.getElementById("totalStudentsCard");
  const presentPercentEl = document.getElementById("presentPercent");
  const absentPercentEl = document.getElementById("absentPercent");

  // Charts
  const barCtx = document.getElementById("barChart")?.getContext("2d");
  const doughnutCtx = document.getElementById("doughnutChart")?.getContext("2d");
  let barChartInstance = null;
  let doughnutChartInstance = null;

  // Students page
  const studentTable = document.getElementById("studentTable");
  const searchInput = document.getElementById("searchInput");
  const studentModal = document.getElementById("studentModal");
  const studentForm = document.getElementById("studentForm");
  const nameInput = document.getElementById("name");
  const rollInput = document.getElementById("roll");
  const classInput = document.getElementById("class");
  const sectionInput = document.getElementById("section");
  const mobileInput = document.getElementById("mobile");

  // Attendance page
  const monthSelectEl = document.getElementById("monthSelect");
  const yearSelectEl = document.getElementById("yearSelect");
  const classFilterEl = document.getElementById("classFilter");
  const applyFilterBtn = document.getElementById("applyFilterBtn");
  const attendanceHeader = document.getElementById("attendanceHeader"); // THEAD row
  const attendanceTable = document.getElementById("attendanceTable");   // TBODY

  // Settings page
  const changePasswordForm = document.getElementById("changePasswordForm");
  const currentPassword = document.getElementById("currentPassword");
  const newPassword = document.getElementById("newPassword");
  const newPassword2 = document.getElementById("newPassword2");

  const changeEmailForm = document.getElementById("changeEmailForm");
  const newEmail = document.getElementById("newEmail");

  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  /* =========================================================
     NAVIGATION (switch center sections)
  ========================================================= */
  function showSection(section) {
    // Hide all
    [dashboardSection, studentsSection, attendanceSection, settingsSection].forEach(sec => sec.classList.add("hidden"));
    // Show requested
    section.classList.remove("hidden");
  }
  navItems.forEach(li => {
    li.addEventListener("click", () => {
      navItems.forEach(n => n.classList.remove("active"));
      li.classList.add("active");
      const page = li.getAttribute("data-page");
      if (page === "dashboard") {
        pageTitle.textContent = "Dashboard";
        showSection(dashboardSection);
      } else if (page === "students") {
        pageTitle.textContent = "Students";
        showSection(studentsSection);
      } else if (page === "attendance") {
        pageTitle.textContent = "Attendance";
        showSection(attendanceSection);
      } else if (page === "settings") {
        pageTitle.textContent = "Settings";
        showSection(settingsSection);
      }
    });
  });

  /* =========================================================
     HELPERS: Classes list (for filters)
  ========================================================= */
  function getUniqueClasses() {
    const set = new Set(students.map(s => String(s.studentClass || "").trim()).filter(Boolean));
    return Array.from(set).sort((a,b)=>a.localeCompare(b, undefined, {numeric:true}));
  }
  function populateClassSelectors() {
    // Header selector for dashboard charts
    if (classSelector) {
      const current = classSelector.value || "all";
      classSelector.innerHTML = `<option value="all">All Classes</option>`;
      getUniqueClasses().forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        classSelector.appendChild(opt);
      });
      if ([...classSelector.options].some(o => o.value === current)) classSelector.value = current;
    }
    // Attendance page filter
    if (classFilterEl) {
      const current2 = classFilterEl.value || "all";
      classFilterEl.innerHTML = `<option value="all">All Classes</option>`;
      getUniqueClasses().forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        classFilterEl.appendChild(opt);
      });
      if ([...classFilterEl.options].some(o => o.value === current2)) classFilterEl.value = current2;
    }
  }

  /* =========================================================
     STUDENTS: Render + Search + Add/Edit/Delete
  ========================================================= */
  function renderStudents(filterText = "") {
    if (!studentTable) return;
    studentTable.innerHTML = "";
    const t = filterText.trim().toLowerCase();

    const filtered = students.filter(s => {
      if (!t) return true;
      return (
        String(s.roll).toLowerCase().includes(t) ||
        (s.name || "").toLowerCase().includes(t) ||
        (s.studentClass || "").toLowerCase().includes(t) ||
        (s.section || "").toLowerCase().includes(t) ||
        (s.mobile || "").toLowerCase().includes(t)
      );
    });

    if (filtered.length === 0) {
      studentTable.innerHTML = `<tr><td colspan="6" class="p-3 text-center">No matching students.</td></tr>`;
      return;
    }

    filtered.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2 border">${s.roll}</td>
        <td class="p-2 border">${s.name}</td>
        <td class="p-2 border">${s.studentClass}</td>
        <td class="p-2 border">${s.section}</td>
        <td class="p-2 border">${s.mobile}</td>
        <td class="p-2 border">
          <button class="px-2 py-1 bg-yellow-500 text-white rounded mr-1 editBtn">Edit</button>
          <button class="px-2 py-1 bg-red-600 text-white rounded delBtn">Delete</button>
        </td>
      `;
      // Edit
      tr.querySelector(".editBtn").addEventListener("click", () => {
        const newName = prompt("Name:", s.name);
        if (newName === null) return;
        const newRoll = prompt("Roll:", s.roll);
        if (newRoll === null) return;
        const newClass = prompt("Class:", s.studentClass);
        if (newClass === null) return;
        const newSection = prompt("Section:", s.section);
        if (newSection === null) return;
        const newMobile = prompt("Mobile:", s.mobile);
        if (newMobile === null) return;

        s.name = newName.trim() || s.name;
        s.roll = Number(newRoll) || s.roll;
        s.studentClass = String(newClass).trim() || s.studentClass;
        s.section = String(newSection).trim() || s.section;
        s.mobile = String(newMobile).trim() || s.mobile;

        saveStudents(students);
        populateClassSelectors();
        renderStudents(searchInput?.value || "");
        updateDashboardMetricsAndCharts();
        showToast("Student updated", "#10b981");
      });

      // Delete
      tr.querySelector(".delBtn").addEventListener("click", () => {
        if (!confirm("Delete this student?")) return;
        // Remove attendance for this student as well (optional)
        delete attendance[s.id];
        students = students.filter(st => st.id !== s.id);
        saveStudents(students);
        saveAttendance(attendance);
        populateClassSelectors();
        renderStudents(searchInput?.value || "");
        updateDashboardMetricsAndCharts();
        showToast("Student deleted", "#ef4444");
      });

      studentTable.appendChild(tr);
    });
  }

  // Search box
  searchInput?.addEventListener("input", (e) => renderStudents(e.target.value));

  // Modal controls for Add Student (exposed for inline HTML onclick)
  window.openStudentModal = function openStudentModal() {
    studentModal.classList.remove("hidden");
  };
  window.closeStudentModal = function closeStudentModal() {
    studentModal.classList.add("hidden");
    studentForm.reset();
  };

  // Add student
  studentForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const s = {
      id,
      name: nameInput.value.trim(),
      roll: Number(rollInput.value),
      studentClass: String(classInput.value || "").trim(),
      section: String(sectionInput.value || "").trim(),
      mobile: String(mobileInput.value || "").trim(),
    };
    students.push(s);
    saveStudents(students);
    // Initialize attendance container for this student
    if (!attendance[id]) attendance[id] = {};
    saveAttendance(attendance);

    populateClassSelectors();
    renderStudents(searchInput?.value || "");
    updateDashboardMetricsAndCharts();
    showToast("Student added", "#10b981");
    closeStudentModal();
  });

  /* =========================================================
     ATTENDANCE: Month Grid + Filters
  ========================================================= */
  // Fill Month/Year selects
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function populateMonthYear() {
    // months
    monthSelectEl.innerHTML = "";
    monthNames.forEach((m, i) => {
      const opt = document.createElement("option");
      opt.value = i; opt.textContent = m;
      monthSelectEl.appendChild(opt);
    });
    // years (current-1 .. current+2)
    const currentYear = new Date().getFullYear();
    yearSelectEl.innerHTML = "";
    for (let y = currentYear - 1; y <= currentYear + 2; y++) {
      const opt = document.createElement("option");
      opt.value = y; opt.textContent = y;
      yearSelectEl.appendChild(opt);
    }
    // defaults: current month/year
    monthSelectEl.value = new Date().getMonth();
    yearSelectEl.value = currentYear;
  }

  function renderAttendance() {
    if (!attendanceTable || !attendanceHeader) return;

    // Filters
    const month = parseInt(monthSelectEl.value);
    const year = parseInt(yearSelectEl.value);
    const classFilter = classFilterEl.value || "all";
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

    // Header: Roll | Name | 1..N
    attendanceHeader.innerHTML = "";
    const headerCells = [`<th class="p-2 border">Roll</th>`, `<th class="p-2 border">Name</th>`];
    for (let d = 1; d <= daysInMonth; d++) headerCells.push(`<th class="p-2 border">${d}</th>`);
    attendanceHeader.innerHTML = headerCells.join("");

    // Body
    attendanceTable.innerHTML = "";
    const list = students.filter(s => classFilter === "all" || String(s.studentClass) === String(classFilter));

    if (list.length === 0) {
      attendanceTable.innerHTML = `<tr><td class="p-3 text-center" colspan="${2 + daysInMonth}">No students in this class.</td></tr>`;
      return;
    }

    list.forEach((s) => {
      if (!attendance[s.id]) attendance[s.id] = {};
      if (!attendance[s.id][monthKey]) attendance[s.id][monthKey] = {};

      const tr = document.createElement("tr");
      // First two columns
      let html = `<td class="p-2 border">${s.roll}</td><td class="p-2 border">${s.name}</td>`;

      for (let d = 1; d <= daysInMonth; d++) {
        const isPresent = !!attendance[s.id][monthKey][d];
        html += `<td class="p-2 border text-center cursor-pointer" data-sid="${s.id}" data-day="${d}" data-month="${monthKey}">${isPresent ? "✔️" : "❌"}</td>`;
      }
      tr.innerHTML = html;
      attendanceTable.appendChild(tr);
    });

    // Cell click → toggle
    attendanceTable.querySelectorAll("td[data-sid]").forEach(td => {
      td.addEventListener("click", () => {
        const sid = td.getAttribute("data-sid");
        const day = Number(td.getAttribute("data-day"));
        const mKey = td.getAttribute("data-month");

        if (!attendance[sid]) attendance[sid] = {};
        if (!attendance[sid][mKey]) attendance[sid][mKey] = {};
        attendance[sid][mKey][day] = !attendance[sid][mKey][day];

        td.textContent = attendance[sid][mKey][day] ? "✔️" : "❌";
        saveAttendance(attendance);

        // If toggled within current dashboard period, refresh KPIs/charts
        updateDashboardMetricsAndCharts();
      });
    });
  }

  applyFilterBtn?.addEventListener("click", renderAttendance);

  /* =========================================================
     DASHBOARD: KPIs + Charts (filters by class + time window)
  ========================================================= */
  function getFilteredStudentsForClass(classValue) {
    if (!classValue || classValue === "all") return students;
    return students.filter(s => String(s.studentClass) === String(classValue));
  }

  // Count presents for a specific date (Date obj) across given students
  function countPresentForDate(dateObj, studentsSubset) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = dateObj.getDate();
    const key = `${y}-${m}`;
    let count = 0;
    studentsSubset.forEach(s => {
      if (attendance[s.id] && attendance[s.id][key] && attendance[s.id][key][d]) count++;
    });
    return count;
  }

  function updateDashboardMetricsAndCharts() {
    const periodDays = Number(viewSelect?.value || 30); // 30/7/1
    const classVal = classSelector?.value || "all";
    const filteredStudents = getFilteredStudentsForClass(classVal);

    // KPI: Total Students
    totalStudentsCard.textContent = String(filteredStudents.length);

    // Build series for bar (last N days)
    const labels = [];
    const data = [];
    const today = new Date();
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(`${d.getDate()} ${monthNames[d.getMonth()]}`);
      data.push(countPresentForDate(d, filteredStudents));
    }

    // KPI: present/absent % for the selected period
    const totalPossible = filteredStudents.length * periodDays;
    const totalPresent = data.reduce((a, b) => a + b, 0);
    const presentPct = totalPossible ? Math.round((totalPresent / totalPossible) * 100) : 0;
    const absentPct = totalPossible ? (100 - presentPct) : 0;
    presentPercentEl.textContent = `${presentPct}%`;
    absentPercentEl.textContent = `${absentPct}%`;

    // Render/Update Bar Chart
    if (barChartInstance) barChartInstance.destroy();
    if (barCtx) {
      barChartInstance = new Chart(barCtx, {
        type: "bar",
        data: {
          labels,
          datasets: [{ label: "Present", data }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          plugins: { legend: { display: false } }
        }
      });
    }

    // Doughnut: Current month present vs absent (filtered by class)
    const cm = today.getMonth();
    const cy = today.getFullYear();
    const daysInMonth = new Date(cy, cm + 1, 0).getDate();
    let monthPresent = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(cy, cm, d);
      monthPresent += countPresentForDate(dateObj, filteredStudents);
    }
    const monthTotalPossible = filteredStudents.length * daysInMonth;
    const monthAbsent = monthTotalPossible - monthPresent;

    if (doughnutChartInstance) doughnutChartInstance.destroy();
    if (doughnutCtx) {
      doughnutChartInstance = new Chart(doughnutCtx, {
        type: "doughnut",
        data: {
          labels: ["Present", "Absent"],
          datasets: [{ data: [monthPresent, Math.max(0, monthAbsent)] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
      });
    }
  }

  // Respond to dashboard controls
  viewSelect?.addEventListener("change", updateDashboardMetricsAndCharts);
  classSelector?.addEventListener("change", updateDashboardMetricsAndCharts);

  /* =========================================================
     SETTINGS: Change Password / Email / Delete / Logout
  ========================================================= */
  changePasswordForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const users = getUsers();
    const me = users.find(u => u.email === sessionUser);
    if (!me) return showToast("User not found", "#ef4444");

    if (me.password !== currentPassword.value) {
      return showToast("Current password is incorrect.", "#ef4444");
    }
    if (newPassword.value.length < 6) {
      return showToast("New password must be ≥ 6 chars.", "#ef4444");
    }
    if (newPassword.value !== newPassword2.value) {
      return showToast("New passwords do not match.", "#ef4444");
    }

    me.password = newPassword.value;
    saveUsers(users);
    changePasswordForm.reset();
    showToast("Password updated!", "#10b981");
  });

  changeEmailForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const users = getUsers();
    const me = users.find(u => u.email === sessionUser);
    if (!me) return showToast("User not found", "#ef4444");

    const email = newEmail.value.trim();
    if (!email) return showToast("Enter a valid email.", "#ef4444");
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.email !== me.email)) {
      return showToast("That email is already in use.", "#ef4444");
    }

    me.email = email;
    saveUsers(users);

    // Keep session logged in but with updated email
    const s = getSession();
    if (s) {
      s.email = email;
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(s));
    }
    changeEmailForm.reset();
    showToast("Email updated!", "#10b981");
  });

  deleteAccountBtn?.addEventListener("click", () => {
    if (!confirm("Delete your account from this browser? This cannot be undone.")) return;
    let users = getUsers();
    users = users.filter(u => u.email !== sessionUser);
    saveUsers(users);
    clearSession();
    showToast("Account deleted!", "#ef4444");
    setTimeout(() => (window.location.href = "index.html"), 600);
  });

  logoutBtn?.addEventListener("click", () => {
    clearSession();
    showToast("Logged out!", "#ef4444");
    setTimeout(() => (window.location.href = "index.html"), 500);
  });

  /* =========================================================
     SESSION: Extend on user activity (click/move/keys)
  ========================================================= */
  ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(evt => {
    window.addEventListener(evt, () => {
      try { extendSession(); } catch {}
    }, { passive: true });
  });

  /* =========================================================
     INITIALIZE PAGE STATE
  ========================================================= */
  // Populate class filters based on current students
  populateClassSelectors();

  // Populate month/year selects and render attendance once
  populateMonthYear();
  renderAttendance();

  // Render students list
  renderStudents();

  // Initial charts + KPIs
  updateDashboardMetricsAndCharts();
}
