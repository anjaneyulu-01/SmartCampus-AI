// ================================================
// Student Management System - Web App
// Modern SPA with React-like Components
// ================================================

const API_URL = 'http://localhost:8080/api';
let currentUser = null;
let appState = {
    currentPage: 'login',
    students: [],
    users: [],
    currentStudent: null
};

// ================================================
// API Service Layer
// ================================================

const api = {
    async login(username, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async signup(username, email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            return await response.json();
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async getStudents(search = '') {
        try {
            const url = search ? `${API_URL}/students?search=${encodeURIComponent(search)}` : `${API_URL}/students`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Fetch students error:', error);
            return [];
        }
    },

    async createStudent(student) {
        try {
            const response = await fetch(`${API_URL}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(student)
            });
            return await response.json();
        } catch (error) {
            console.error('Create student error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async updateStudent(id, student) {
        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(student)
            });
            return await response.json();
        } catch (error) {
            console.error('Update student error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async deleteStudent(id) {
        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Delete student error:', error);
            return { success: false, message: 'Network error' };
        }
    }
};

// ================================================
// UI Components
// ================================================

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    const mainContent = document.querySelector('.main-content') || document.getElementById('root');
    mainContent.insertBefore(alertDiv, mainContent.firstChild);
    
    setTimeout(() => alertDiv.remove(), 5000);
}

function showModal(title, content, onConfirm = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">${title}</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">${content}</div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                ${onConfirm ? '<button class="btn btn-primary" id="confirmBtn">Confirm</button>' : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close').onclick = () => modal.remove();
    if (onConfirm) {
        modal.querySelector('#confirmBtn').onclick = () => {
            onConfirm();
            modal.remove();
        };
    }
}

// ================================================
// Page Components
// ================================================

function LoginPage() {
    return `
        <div class="auth-container">
            <div class="auth-box">
                <h2 class="auth-title">
                    <i class="fas fa-graduation-cap"></i><br>
                    Student Management
                </h2>
                
                <div id="loginForm">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" id="loginUsername" class="form-input" placeholder="Enter username">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="loginPassword" class="form-input" placeholder="Enter password">
                    </div>
                    <button class="btn btn-primary" onclick="handleLogin()">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </div>
                
                <div id="signupForm" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" id="signupUsername" class="form-input" placeholder="Enter username">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" id="signupEmail" class="form-input" placeholder="Enter email">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="signupPassword" class="form-input" placeholder="Enter password">
                    </div>
                    <button class="btn btn-primary" onclick="handleSignup()">
                        <i class="fas fa-user-plus"></i> Create Account
                    </button>
                </div>
                
                <div class="auth-footer">
                    <span id="toggleText">Don't have an account? <span class="auth-link" onclick="toggleAuthForm()">Sign Up</span></span>
                </div>
            </div>
        </div>
    `;
}

function DashboardPage() {
    return `
        <div class="dashboard">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-title">SMS</div>
                    <div class="sidebar-subtitle">Student Management</div>
                </div>
                
                <ul class="nav-menu">
                    <li class="nav-item">
                        <button class="nav-link active" onclick="navigateTo('dashboard')">
                            <i class="fas fa-home"></i> Dashboard
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" onclick="navigateTo('students')">
                            <i class="fas fa-users"></i> Students
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" onclick="navigateTo('add-student')">
                            <i class="fas fa-plus"></i> Add Student
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" onclick="navigateTo('analytics')">
                            <i class="fas fa-chart-bar"></i> Analytics
                        </button>
                    </li>
                    <li class="nav-item" style="margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                        <button class="nav-link" onclick="handleLogout()">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </li>
                </ul>
            </aside>
            
            <div class="content-wrapper">
                <header>
                    <div class="container">
                        <div class="logo">
                            <i class="fas fa-book"></i>
                            Student Management System
                        </div>
                        <div class="user-info">
                            <span>${currentUser?.username || 'User'}</span>
                        </div>
                    </div>
                </header>
                
                <main class="main-content" id="pageContent">
                    <!-- Page content will be rendered here -->
                </main>
            </div>
        </div>
    `;
}

function DashboardHome() {
    return `
        <div class="page-header">
            <h1 class="page-title">
                <i class="fas fa-tachometer-alt"></i> Dashboard
            </h1>
        </div>
        
        <div class="stats-grid">
            <div class="card stat-card">
                <div class="stat-content">
                    <h3 id="totalStudents">0</h3>
                    <p>Total Students</p>
                </div>
                <div class="stat-icon primary">
                    <i class="fas fa-users"></i>
                </div>
            </div>
            
            <div class="card stat-card">
                <div class="stat-content">
                    <h3 id="totalCourses">0</h3>
                    <p>Active Courses</p>
                </div>
                <div class="stat-icon success">
                    <i class="fas fa-book"></i>
                </div>
            </div>
            
            <div class="card stat-card">
                <div class="stat-content">
                    <h3 id="totalSemesters">0</h3>
                    <p>Max Semester</p>
                </div>
                <div class="stat-icon warning">
                    <i class="fas fa-graduation-cap"></i>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3>Quick Stats</h3>
            <p style="color: #64748b; margin-top: 10px;">Welcome to the Student Management System. Use the sidebar to navigate and manage student records.</p>
        </div>
    `;
}

function StudentsPage() {
    return `
        <div class="page-header">
            <h1 class="page-title">
                <i class="fas fa-users"></i> Students
            </h1>
        </div>
        
        <div class="card">
            <div class="search-bar">
                <div class="search-input" style="flex: 1;">
                    <input type="text" id="searchInput" placeholder="Search by name or course..." onkeyup="loadStudents()">
                </div>
                <button class="btn btn-primary btn-small" onclick="loadStudents()">
                    <i class="fas fa-search"></i> Search
                </button>
            </div>
            
            <div id="studentsLoading" class="loading" style="display: none;">
                <div class="spinner"></div>
            </div>
            
            <div id="studentsContainer" class="table-container">
                <!-- Students table will be rendered here -->
            </div>
        </div>
    `;
}

function AddStudentPage() {
    return `
        <div class="page-header">
            <h1 class="page-title">
                <i class="fas fa-plus"></i> Add New Student
            </h1>
        </div>
        
        <div class="card" style="max-width: 600px;">
            <form id="addStudentForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Full Name *</label>
                        <input type="text" id="studentName" class="form-input" placeholder="Enter student name" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Course *</label>
                        <input type="text" id="studentCourse" class="form-input" placeholder="e.g., B.Tech, MBA" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Semester *</label>
                        <input type="number" id="studentSemester" class="form-input" placeholder="1-8" min="1" max="8" required>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="navigateTo('students')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Add Student
                    </button>
                </div>
            </form>
        </div>
    `;
}

function AnalyticsPage() {
    return `
        <div class="page-header">
            <h1 class="page-title">
                <i class="fas fa-chart-bar"></i> Analytics
            </h1>
        </div>
        
        <div class="chart-container">
            <h3 class="chart-title">Student Distribution by Course</h3>
            <canvas id="courseChart"></canvas>
        </div>
        
        <div class="chart-container">
            <h3 class="chart-title">Student Distribution by Semester</h3>
            <canvas id="semesterChart"></canvas>
        </div>
    `;
}

// ================================================
// Event Handlers
// ================================================

async function handleLogin() {
    const username = document.getElementById('loginUsername')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!username || !password) {
        showAlert('Please enter username and password', 'error');
        return;
    }
    
    const result = await api.login(username, password);
    if (result.success) {
        currentUser = result.user;
        navigateTo('dashboard');
        showAlert('Login successful!', 'success');
    } else {
        showAlert(result.message || 'Login failed', 'error');
    }
}

async function handleSignup() {
    const username = document.getElementById('signupUsername')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;
    
    if (!username || !email || !password) {
        showAlert('Please fill all fields', 'error');
        return;
    }
    
    const result = await api.signup(username, email, password);
    if (result.success) {
        showAlert('Account created! Please log in.', 'success');
        toggleAuthForm();
    } else {
        showAlert(result.message || 'Signup failed', 'error');
    }
}

function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleText = document.getElementById('toggleText');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        toggleText.innerHTML = "Don't have an account? <span class=\"auth-link\" onclick=\"toggleAuthForm()\">Sign Up</span>";
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        toggleText.innerHTML = "Already have an account? <span class=\"auth-link\" onclick=\"toggleAuthForm()\">Login</span>";
    }
}

function handleLogout() {
    currentUser = null;
    navigateTo('login');
    showAlert('Logged out successfully', 'success');
}

async function loadStudents() {
    const searchValue = document.getElementById('searchInput')?.value || '';
    const loading = document.getElementById('studentsLoading');
    const container = document.getElementById('studentsContainer');
    
    if (loading) loading.style.display = 'block';
    
    const students = await api.getStudents(searchValue);
    appState.students = students;
    
    if (loading) loading.style.display = 'none';
    
    if (students.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No Students Found</h3>
                <p>Start by adding a new student to the system.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    students.forEach(student => {
        html += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.course}</td>
                <td>${student.semester}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" title="Edit" onclick="editStudent(${student.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" title="Delete" onclick="deleteStudent(${student.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function addStudent(e) {
    if (e) e.preventDefault();
    
    const name = document.getElementById('studentName')?.value;
    const course = document.getElementById('studentCourse')?.value;
    const semester = parseInt(document.getElementById('studentSemester')?.value);
    
    if (!name || !course || !semester) {
        showAlert('Please fill all fields', 'error');
        return;
    }
    
    const result = await api.createStudent({ name, course, semester });
    if (result.success) {
        showAlert('Student added successfully', 'success');
        document.getElementById('addStudentForm').reset();
        setTimeout(() => navigateTo('students'), 1000);
    } else {
        showAlert(result.message || 'Failed to add student', 'error');
    }
}

async function deleteStudent(id) {
    showModal('Confirm Delete', 'Are you sure you want to delete this student?', async () => {
        const result = await api.deleteStudent(id);
        if (result.success) {
            showAlert('Student deleted successfully', 'success');
            loadStudents();
        } else {
            showAlert('Failed to delete student', 'error');
        }
    });
}

function editStudent(id) {
    showAlert('Edit feature coming soon!', 'warning');
}

// ================================================
// Navigation
// ================================================

function navigateTo(page) {
    appState.currentPage = page;
    const root = document.getElementById('root');
    
    if (!currentUser && page !== 'login') {
        root.innerHTML = LoginPage();
        return;
    }
    
    if (page === 'login') {
        root.innerHTML = LoginPage();
        return;
    }
    
    root.innerHTML = DashboardPage();
    
    const pageContent = document.getElementById('pageContent');
    
    switch (page) {
        case 'dashboard':
            pageContent.innerHTML = DashboardHome();
            loadDashboardStats();
            break;
        case 'students':
            pageContent.innerHTML = StudentsPage();
            loadStudents();
            break;
        case 'add-student':
            pageContent.innerHTML = AddStudentPage();
            document.getElementById('addStudentForm').addEventListener('submit', addStudent);
            break;
        case 'analytics':
            pageContent.innerHTML = AnalyticsPage();
            loadAnalytics();
            break;
        default:
            pageContent.innerHTML = DashboardHome();
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event?.target?.classList.add('active');
}

async function loadDashboardStats() {
    const students = await api.getStudents();
    appState.students = students;
    
    const courses = new Set(students.map(s => s.course)).size;
    const maxSemester = Math.max(...students.map(s => s.semester), 0);
    
    const totalStudentsEl = document.getElementById('totalStudents');
    const totalCoursesEl = document.getElementById('totalCourses');
    const totalSemestersEl = document.getElementById('totalSemesters');
    
    if (totalStudentsEl) totalStudentsEl.textContent = students.length;
    if (totalCoursesEl) totalCoursesEl.textContent = courses;
    if (totalSemestersEl) totalSemestersEl.textContent = maxSemester;
}

function loadAnalytics() {
    showAlert('Analytics feature coming soon!', 'warning');
}

// ================================================
// App Initialization
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    navigateTo('login');
});
