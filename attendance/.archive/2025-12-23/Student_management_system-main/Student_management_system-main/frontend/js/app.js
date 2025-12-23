// ================================================
// STUDENT MANAGEMENT SYSTEM - JAVASCRIPT APP
// Modern, Responsive Web Application
// ================================================

const API_BASE_URL = 'http://localhost:8080/api';

// Global state
let appState = {
    currentPage: 'dashboard',
    students: [],
    currentUser: null,
    authToken: null,
    isLoggedIn: false
};

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    checkAuthStatus();
    renderHeader();
    loadDashboard();
}

// ====== AUTHENTICATION ======
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        appState.isLoggedIn = true;
        appState.authToken = token;
        appState.currentUser = JSON.parse(user);
    }
}

function login(username, password) {
    console.log('Login attempt:', username);
    // For demo, accept any non-empty credentials
    if (username && password) {
        appState.isLoggedIn = true;
        appState.currentUser = { username, fullName: username };
        appState.authToken = 'demo-token-' + Date.now();
        localStorage.setItem('authToken', appState.authToken);
        localStorage.setItem('currentUser', JSON.stringify(appState.currentUser));
        renderHeader();
        loadDashboard();
        return true;
    }
    return false;
}

function logout() {
    appState.isLoggedIn = false;
    appState.authToken = null;
    appState.currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    location.reload();
}

// ====== HEADER & NAVIGATION ======
function renderHeader() {
    const root = document.getElementById('root');
    
    if (!appState.isLoggedIn) {
        // Show login page
        root.innerHTML = createLoginPage();
        document.querySelector('.login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (login(username, password)) {
                initializeApp();
            } else {
                showAlert('Invalid credentials', 'danger');
            }
        });
    } else {
        // Show main app
        root.innerHTML = createMainLayout();
        setupNavigation();
    }
}

function setupNavigation() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateTo(page);
        });
    });

    document.querySelector('.logout-btn').addEventListener('click', logout);
}

function navigateTo(page) {
    appState.currentPage = page;
    updateActiveNav();
    hideAllPages();

    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'students':
            loadStudents();
            break;
        case 'add':
            loadAddStudent();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

function updateActiveNav() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === appState.currentPage) {
            link.classList.add('active');
        }
    });
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
}

// ====== DASHBOARD PAGE ======
function loadDashboard() {
    const page = document.getElementById('dashboard-page');
    page.innerHTML = `
        <div class="container">
            <h1 style="margin-bottom: 30px;">📊 Dashboard</h1>
            
            <div class="stats-grid">
                <div class="stat-card success">
                    <div class="stat-icon">👥</div>
                    <div class="stat-value" id="total-students">0</div>
                    <div class="stat-label">Total Students</div>
                </div>
                
                <div class="stat-card warning">
                    <div class="stat-icon">📚</div>
                    <div class="stat-value" id="total-courses">0</div>
                    <div class="stat-label">Active Courses</div>
                </div>
                
                <div class="stat-card info">
                    <div class="stat-icon">🎓</div>
                    <div class="stat-value" id="max-semester">0</div>
                    <div class="stat-label">Max Semester</div>
                </div>
            </div>

            <div class="charts-grid" id="charts-container">
                <div class="chart-card">
                    <h3 class="chart-title">Students by Course</h3>
                    <div class="chart-container">
                        <canvas id="courseChart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <h3 class="chart-title">Students by Semester</h3>
                    <div class="chart-container">
                        <canvas id="semesterChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    page.classList.add('active');
    fetchDashboardData();
}

function fetchDashboardData() {
    // Demo data
    const stats = {
        totalStudents: 45,
        totalCourses: 5,
        maxSemester: 8,
        studentsByCourse: {
            'Computer Science': 15,
            'Electronics': 12,
            'Mechanical': 10,
            'Civil': 8
        },
        studentsBySemester: {
            1: 8,
            2: 9,
            3: 7,
            4: 6,
            5: 5,
            6: 4
        }
    };

    updateDashboardUI(stats);
    createCharts(stats);
}

function updateDashboardUI(stats) {
    document.getElementById('total-students').textContent = stats.totalStudents;
    document.getElementById('total-courses').textContent = stats.totalCourses;
    document.getElementById('max-semester').textContent = stats.maxSemester;
}

function createCharts(stats) {
    // Course Chart
    const courseCtx = document.getElementById('courseChart');
    if (courseCtx) {
        new Chart(courseCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(stats.studentsByCourse),
                datasets: [{
                    data: Object.values(stats.studentsByCourse),
                    backgroundColor: [
                        '#2563eb',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Semester Chart
    const semesterCtx = document.getElementById('semesterChart');
    if (semesterCtx) {
        new Chart(semesterCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(stats.studentsBySemester),
                datasets: [{
                    label: 'Students',
                    data: Object.values(stats.studentsBySemester),
                    backgroundColor: '#2563eb',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
    }
}

// ====== STUDENTS PAGE ======
function loadStudents() {
    const page = document.getElementById('students-page');
    page.innerHTML = `
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h1>📋 Student List</h1>
                <button class="btn btn-primary" onclick="navigateTo('add')">
                    <i class="fas fa-plus"></i> Add New Student
                </button>
            </div>

            <div class="search-bar">
                <input type="text" id="search-input" placeholder="Search students by name or course...">
                <button class="btn btn-secondary" onclick="searchStudents()">
                    <i class="fas fa-search"></i> Search
                </button>
            </div>

            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Course</th>
                            <th>Semester</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="students-tbody">
                        <tr>
                            <td colspan="6" class="text-center">Loading students...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    page.classList.add('active');
    fetchStudents();
}

function fetchStudents() {
    // Demo data
    const students = [
        { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Computer Science', semester: 3 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'Electronics', semester: 2 },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', course: 'Computer Science', semester: 4 }
    ];
    
    renderStudentTable(students);
    appState.students = students;
}

function renderStudentTable(students) {
    const tbody = document.getElementById('students-tbody');
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No students found</td></tr>';
        return;
    }

    tbody.innerHTML = students.map(student => `
        <tr>
            <td>#${student.id}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td>${student.semester}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editStudent(${student.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent(${student.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function searchStudents() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const filtered = appState.students.filter(s => 
        s.name.toLowerCase().includes(keyword) || 
        s.course.toLowerCase().includes(keyword)
    );
    renderStudentTable(filtered);
}

function editStudent(id) {
    const student = appState.students.find(s => s.id === id);
    if (student) {
        alert('Edit: ' + student.name + '\n\nThis would open an edit form.');
    }
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        appState.students = appState.students.filter(s => s.id !== id);
        renderStudentTable(appState.students);
        showAlert('Student deleted successfully', 'success');
    }
}

// ====== ADD STUDENT PAGE ======
function loadAddStudent() {
    const page = document.getElementById('add-page');
    page.innerHTML = `
        <div class="container">
            <div style="max-width: 600px;">
                <h1 style="margin-bottom: 30px;">➕ Add New Student</h1>

                <div class="card">
                    <form id="add-student-form" onsubmit="handleAddStudent(event)">
                        <div class="form-group">
                            <label for="name">Full Name *</label>
                            <input type="text" id="name" name="name" required>
                        </div>

                        <div class="form-group">
                            <label for="email">Email *</label>
                            <input type="email" id="email" name="email" required>
                        </div>

                        <div class="form-group">
                            <label for="course">Course *</label>
                            <select id="course" name="course" required>
                                <option value="">Select a course</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Mechanical">Mechanical Engineering</option>
                                <option value="Civil">Civil Engineering</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="semester">Semester *</label>
                            <select id="semester" name="semester" required>
                                <option value="">Select semester</option>
                                ${Array.from({length: 8}, (_, i) => `<option value="${i+1}">${i+1}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="tel" id="phone" name="phone">
                        </div>

                        <div class="form-group">
                            <label for="address">Address</label>
                            <textarea id="address" name="address" rows="3"></textarea>
                        </div>

                        <div style="display: flex; gap: 10px;">
                            <button type="submit" class="btn btn-primary btn-block">
                                <i class="fas fa-save"></i> Save Student
                            </button>
                            <button type="button" class="btn btn-secondary btn-block" onclick="navigateTo('students')">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    page.classList.add('active');
}

function handleAddStudent(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newStudent = {
        id: appState.students.length + 1,
        name: formData.get('name'),
        email: formData.get('email'),
        course: formData.get('course'),
        semester: parseInt(formData.get('semester')),
        phone: formData.get('phone'),
        address: formData.get('address')
    };
    
    appState.students.push(newStudent);
    showAlert('Student added successfully!', 'success');
    navigateTo('students');
}

// ====== ANALYTICS PAGE ======
function loadAnalytics() {
    const page = document.getElementById('analytics-page');
    page.innerHTML = `
        <div class="container">
            <h1 style="margin-bottom: 30px;">📈 Analytics</h1>
            
            <div class="stats-grid">
                <div class="stat-card success">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">12</div>
                    <div class="stat-label">Avg Students per Course</div>
                </div>
                
                <div class="stat-card warning">
                    <div class="stat-icon">📈</div>
                    <div class="stat-value">87%</div>
                    <div class="stat-label">Enrollment Rate</div>
                </div>
                
                <div class="stat-card info">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value">92%</div>
                    <div class="stat-label">Attendance Rate</div>
                </div>
            </div>
        </div>
    `;
    page.classList.add('active');
}

// ====== UTILITY FUNCTIONS ======
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alert, container.firstChild);
    
    setTimeout(() => alert.remove(), 4000);
}

// ====== HTML TEMPLATES ======
function createLoginPage() {
    return `
        <div class="login-container">
            <div class="login-box">
                <div class="login-title">
                    <i class="fas fa-graduation-cap"></i>
                    <span>SMS</span>
                </div>
                <h2 style="text-align: center; margin-bottom: 30px; font-size: 1.3rem;">Student Management System</h2>
                
                <form class="login-form">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="username" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="password" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </form>
                
                <p style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    <small>Demo: Use any username/password</small>
                </p>
            </div>
        </div>
    `;
}

function createMainLayout() {
    return `
        <header class="header">
            <nav class="container navbar">
                <div class="logo">
                    <i class="fas fa-graduation-cap"></i> SMS
                </div>
                <ul class="nav-links">
                    <li><a href="#" data-page="dashboard" class="active">Dashboard</a></li>
                    <li><a href="#" data-page="students">Students</a></li>
                    <li><a href="#" data-page="add">Add Student</a></li>
                    <li><a href="#" data-page="analytics">Analytics</a></li>
                </ul>
                <div class="user-info">
                    <span>👤 ${appState.currentUser.fullName}</span>
                    <button class="logout-btn">Logout</button>
                </div>
            </nav>
        </header>

        <main class="main-content">
            <div id="dashboard-page" class="page"></div>
            <div id="students-page" class="page"></div>
            <div id="add-page" class="page"></div>
            <div id="analytics-page" class="page"></div>
        </main>

        <footer style="text-align: center; padding: 20px; color: var(--text-secondary); border-top: 1px solid var(--border-color); margin-top: 40px;">
            <p>&copy; 2025 Student Management System. All rights reserved.</p>
        </footer>
    `;
}
