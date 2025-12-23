# 🚀 Student Management System - Modern Web App (v2.0)

A complete **full-stack web application** with Spring Boot backend, responsive HTML/CSS/JavaScript frontend, and MySQL database.

---

## 🎯 Features

### Backend (Spring Boot)
- ✅ RESTful API endpoints for CRUD operations
- ✅ JWT authentication & security
- ✅ MySQL database with JPA/Hibernate
- ✅ CORS enabled for frontend communication
- ✅ Analytics and reporting endpoints

### Frontend (Responsive Web)
- ✅ Modern, clean UI with responsive design
- ✅ Works on desktop, tablet, and mobile
- ✅ Dashboard with statistics cards
- ✅ Student list with search functionality
- ✅ Add/Edit/Delete students
- ✅ Beautiful charts (pie & bar charts)
- ✅ Interactive navigation
- ✅ Authentication system

### Technologies Used
- **Backend**: Spring Boot 3.1.5, Java 11+, Spring Data JPA, MySQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: MySQL 8.0+
- **Charts**: Chart.js
- **HTTP Client**: Axios
- **Authentication**: JWT Tokens

---

## 📋 System Requirements

- Java JDK 11 or higher
- MySQL 8.0 or higher
- Node.js 16+ (optional, for frontend dev tools)
- 2GB RAM minimum

---

## 🔧 Installation Guide

### Step 1: Database Setup

```sql
-- Create database
CREATE DATABASE studentdb;

-- The application will auto-create tables on startup
```

### Step 2: Backend Setup

**2.1 Update Database Credentials**

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/studentdb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=laddu@8483  # Change if needed
```

**2.2 Build & Run Backend**

```bash
# Using Maven
mvn clean install
mvn spring-boot:run

# Or compile manually
javac -cp "lib/*" src/main/java/com/sms/**/*.java -d out
java -cp "lib/*;out" com.sms.SmsApplication
```

The backend will start on `http://localhost:8080`

### Step 3: Frontend Setup

**3.1 Simple Method (No Build Tools)**

```bash
cd frontend

# Option 1: Use Python's built-in server (Python 3+)
python -m http.server 3000

# Option 2: Use Node's http-server
npx http-server -p 3000

# Option 3: Use any static server you prefer
```

Visit: `http://localhost:3000`

**3.2 With Development Tools (Optional)**

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 🏃 Running the Application

### Quick Start (All-in-One)

**Terminal 1 - Start Backend:**
```bash
cd /path/to/SMS
mvn clean install
mvn spring-boot:run
```

**Terminal 2 - Start Frontend:**
```bash
cd /path/to/SMS/frontend
python -m http.server 3000
```

**Terminal 3 - Optional: Monitor Database**
```bash
mysql -u root -p
USE studentdb;
SELECT * FROM students;
SELECT * FROM users;
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Database**: localhost:3306/studentdb

---

## 📝 Default Credentials

**Demo Mode** (Frontend works in demo mode without backend):
- Username: `admin`
- Password: `admin123` (or any non-empty password)

---

## 📂 Project Structure

```
SMS/
├── src/
│   ├── main/
│   │   ├── java/com/sms/
│   │   │   ├── SmsApplication.java          # Main Spring Boot app
│   │   │   ├── controller/                  # REST endpoints
│   │   │   │   ├── StudentController.java
│   │   │   │   ├── AnalyticsController.java
│   │   │   │   └── AuthController.java
│   │   │   ├── entity/                      # JPA entities
│   │   │   │   ├── Student.java
│   │   │   │   └── User.java
│   │   │   ├── repository/                  # Data access layer
│   │   │   │   ├── StudentRepository.java
│   │   │   │   └── UserRepository.java
│   │   │   ├── service/                     # Business logic
│   │   │   │   ├── StudentService.java
│   │   │   │   └── AuthService.java
│   │   │   ├── config/                      # Configuration
│   │   │   │   └── WebConfig.java
│   │   │   └── security/                    # Security filters
│   │   └── resources/
│   │       ├── application.properties        # DB config
│   │       └── static/                       # Static files (if needed)
│   └── test/                                 # Unit tests
│
├── frontend/
│   ├── index.html                           # Main HTML
│   ├── js/
│   │   └── app.js                           # Main JavaScript app
│   ├── styles/
│   │   └── main.css                         # All styles (responsive)
│   └── package.json                         # Node dependencies
│
├── pom.xml                                   # Maven dependencies
├── README.md                                 # This file
└── docker-compose.yml                       # Docker setup (optional)
```

---

## 🌐 API Endpoints

### Student Management
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student
- `GET /api/students?search=keyword` - Search students
- `GET /api/students/course/{course}` - Get by course
- `GET /api/students/semester/{semester}` - Get by semester

### Analytics
- `GET /api/analytics` - Get dashboard analytics

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

---

## 🎨 Responsive Design Breakpoints

- **Desktop**: 1024px+ (full features)
- **Tablet**: 768px - 1024px (optimized layout)
- **Mobile**: < 768px (touch-friendly, single column)

The CSS automatically adapts to screen size for the best user experience.

---

## 🔐 Security Features

- ✅ Password hashing (SHA-256 / bcrypt)
- ✅ CORS configuration
- ✅ JWT token-based auth
- ✅ SQL injection prevention (JPA prepared statements)
- ✅ Input validation
- ✅ Secure database connection

---

## 🐛 Troubleshooting

### Backend Won't Start
```
ERROR: Port 8080 already in use
SOLUTION: Kill process on port 8080 or change port in application.properties
```

### Frontend Can't Connect to Backend
```
ERROR: CORS error in browser console
SOLUTION: Ensure backend is running on port 8080
- Check http://localhost:8080/api/students
- Verify CORS in WebConfig.java includes your frontend URL
```

### Database Connection Failed
```
ERROR: "Access denied for user 'root'@'localhost'"
SOLUTION: 
1. Check MySQL is running: net start MySQL80 (Windows)
2. Verify password in application.properties
3. Test: mysql -u root -p
```

### Tables Not Created
```
SOLUTION: 
1. Check application.properties: spring.jpa.hibernate.ddl-auto=update
2. Restart backend
3. Verify database: USE studentdb; SHOW TABLES;
```

---

## 📱 Feature Guide

### 🏠 Dashboard
- View key statistics (total students, courses, semesters)
- See visual charts of data distribution
- Quick overview of system status

### 📋 Student List
- View all students in a table
- Search by name or course
- Edit student details (click Edit button)
- Delete students (with confirmation)

### ➕ Add Student
- Form to add new students
- Fields: Name, Email, Course, Semester, Phone, Address
- Validation before submission
- Success notification on completion

### 📊 Analytics
- Advanced statistics and metrics
- Student distribution by course
- Enrollment trends
- Export-ready data

---

## 🚀 Deployment Options

### Option 1: Local Machine
```bash
# Follow the "Quick Start" section above
```

### Option 2: Docker (if configured)
```bash
docker-compose up
```

### Option 3: Cloud Deployment (Heroku, AWS, Azure)
```bash
# Build JAR
mvn clean package

# Deploy JAR
java -jar target/student-management-system-2.0.0.jar
```

---

## 📈 Performance Tips

- Use pagination for large student lists
- Implement caching for analytics
- Optimize database queries with indexes
- Minify CSS/JS for production
- Use CDN for static assets

---

## 🔄 Future Enhancements

- [ ] User roles (Admin, Teacher, Student)
- [ ] Student grades management
- [ ] Attendance tracking
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Mobile app (React Native / Flutter)
- [ ] Real-time notifications
- [ ] File upload (profile pictures)
- [ ] Data import/export (CSV, Excel)
- [ ] Advanced search filters

---

## 📞 Support & Contribution

For issues or suggestions:
1. Check existing documentation
2. Review troubleshooting section
3. Check browser console for errors
4. Enable debug logging in application.properties

---

## 📜 License

This project is for educational purposes.

---

## ✨ Credits

Built with modern web technologies and best practices.

---

**Last Updated**: November 11, 2025  
**Status**: ✅ Ready for Production  
**Version**: 2.0.0 - Full Stack Edition

Enjoy your Student Management System! 🎓
