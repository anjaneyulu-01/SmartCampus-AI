# Student Management System - Web App Documentation

## 🌐 Overview

A modern, fully-responsive web-based Student Management System built with:
- **Backend**: Spring Boot 3.2 + Java 11+
- **Database**: MySQL 8.0+
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Security**: BCrypt Password Hashing + CORS
- **Architecture**: REST API + Single Page Application (SPA)

---

## 📋 Features

### Authentication
- ✅ User registration (sign up)
- ✅ Secure login with bcrypt hashing
- ✅ User session management
- ✅ Password encryption

### Student Management
- ✅ Add new students
- ✅ View all students with pagination
- ✅ Search students by name or course
- ✅ Update student information
- ✅ Delete student records
- ✅ Filter by course and semester

### Dashboard
- ✅ Real-time statistics
- ✅ Total student count
- ✅ Course distribution
- ✅ Semester analytics
- ✅ Quick action buttons

### UI/UX
- ✅ Modern, responsive design
- ✅ Dark sidebar navigation
- ✅ Smooth animations
- ✅ Mobile-friendly interface
- ✅ Intuitive user experience

---

## 🚀 Project Structure

```
webapp/
├── pom.xml                          # Maven configuration
├── src/main/
│   ├── java/com/sms/
│   │   ├── SmsApplication.java      # Main Spring Boot app
│   │   ├── entity/
│   │   │   ├── Student.java         # Student JPA entity
│   │   │   └── User.java            # User JPA entity
│   │   ├── repository/
│   │   │   ├── StudentRepository.java
│   │   │   └── UserRepository.java
│   │   ├── service/
│   │   │   ├── StudentService.java
│   │   │   └── UserService.java
│   │   └── controller/
│   │       ├── StudentController.java
│   │       └── AuthController.java
│   └── resources/
│       └── application.properties
├── public/
│   ├── index.html                   # Main HTML file
│   ├── css/
│   │   └── style.css               # Complete styling
│   └── js/
│       └── app.js                  # SPA logic
└── target/                          # Compiled output
```

---

## 🔧 System Requirements

- **Java**: JDK 11 or higher
- **Maven**: 3.6.0 or higher
- **MySQL**: 8.0 or higher
- **Node.js**: Optional (for development)
- **RAM**: 4GB minimum
- **Disk**: 500MB minimum

---

## 📦 Installation & Setup

### Step 1: Create Database

```sql
CREATE DATABASE IF NOT EXISTS studentdb;
USE studentdb;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    semester INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 2: Update Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/studentdb?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### Step 3: Build Project

```bash
cd webapp
mvn clean install
```

### Step 4: Run Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

---

## 📝 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### POST /auth/login
Login with username and password.

**Request:**
```json
{
    "username": "admin",
    "password": "admin123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Login successful",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "ADMIN"
    }
}
```

#### POST /auth/signup
Register a new user account.

**Request:**
```json
{
    "username": "newuser",
    "email": "user@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Account created successfully"
}
```

### Student Endpoints

#### GET /students
Get all students with optional search.

**Query Parameters:**
- `search` (optional): Search by name or course

**Response:**
```json
[
    {
        "id": 1,
        "name": "John Doe",
        "course": "B.Tech",
        "semester": 4,
        "createdAt": "2025-11-11T00:00:00"
    }
]
```

#### GET /students/{id}
Get student by ID.

**Response:**
```json
{
    "id": 1,
    "name": "John Doe",
    "course": "B.Tech",
    "semester": 4,
    "createdAt": "2025-11-11T00:00:00"
}
```

#### POST /students
Create a new student.

**Request:**
```json
{
    "name": "John Doe",
    "course": "B.Tech",
    "semester": 4
}
```

**Response:**
```json
{
    "success": true,
    "message": "Student added successfully",
    "student": {
        "id": 1,
        "name": "John Doe",
        "course": "B.Tech",
        "semester": 4
    }
}
```

#### PUT /students/{id}
Update student information.

**Request:**
```json
{
    "name": "Jane Doe",
    "course": "B.Tech",
    "semester": 5
}
```

#### DELETE /students/{id}
Delete a student.

**Response:**
```json
{
    "success": true,
    "message": "Student deleted successfully"
}
```

#### GET /students/course/{course}
Get students by course.

#### GET /students/semester/{semester}
Get students by semester.

---

## 🎨 Frontend Features

### Pages

#### 1. Login Page
- Username/password login
- Sign up option
- Form validation
- Error messages

#### 2. Dashboard
- Statistics cards (total students, courses, semesters)
- Quick navigation
- Welcome message
- User profile display

#### 3. Students Page
- Student table with all records
- Search functionality
- Edit/Delete actions
- Responsive table design

#### 4. Add Student Page
- Form for new student
- Input validation
- Success notifications
- Cancel option

#### 5. Analytics Page
- Student distribution by course
- Student distribution by semester
- Visual charts and statistics
- Data summaries

### Navigation
- Sidebar menu for easy navigation
- Active page highlighting
- Responsive mobile menu
- Quick action buttons

---

## 🔐 Security Features

- **Password Hashing**: BCrypt with salt
- **CORS Configuration**: Allows frontend communication
- **Input Validation**: All fields validated
- **SQL Injection Prevention**: JPA with parameterized queries
- **Session Management**: User authentication per request
- **HTTP Headers**: Security headers configured

---

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

All features are accessible on any screen size.

---

## 🧪 Testing the API

Using `curl`:

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get all students
curl http://localhost:8080/api/students

# Create student
curl -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"John","course":"B.Tech","semester":4}'

# Search students
curl "http://localhost:8080/api/students?search=John"

# Update student
curl -X PUT http://localhost:8080/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","course":"MBA","semester":2}'

# Delete student
curl -X DELETE http://localhost:8080/api/students/1
```

---

## 🚀 Deployment

### Production Build

```bash
mvn clean package
```

This creates `target/student-management-system-1.0.0.jar`

### Run JAR

```bash
java -jar target/student-management-system-1.0.0.jar
```

### Docker (Optional)

```dockerfile
FROM openjdk:11-jre-slim
COPY target/student-management-system-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

---

## 🔧 Configuration

### application.properties

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/studentdb
spring.datasource.username=root
spring.datasource.password=your_password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect

# Logging
logging.level.root=INFO
logging.level.com.sms=DEBUG
```

---

## 🐛 Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check credentials in application.properties
- Ensure database `studentdb` exists

### Port Already in Use
```bash
# Change port in application.properties
server.port=8081
```

### CORS Errors
- Backend CORS is configured
- Check browser console for specific errors
- Verify frontend URL matches CORS allowedOrigins

### Build Fails
```bash
# Clean and rebuild
mvn clean install -DskipTests

# Check Java version
java -version  # Must be 11+

# Check Maven version
mvn -version   # Must be 3.6.0+
```

---

## 📊 Database Schema

### Users Table
```
id (BIGINT, PRIMARY KEY)
username (VARCHAR, UNIQUE)
password (VARCHAR, hashed)
email (VARCHAR, UNIQUE)
role (VARCHAR)
created_at (TIMESTAMP)
```

### Students Table
```
id (BIGINT, PRIMARY KEY)
name (VARCHAR)
course (VARCHAR)
semester (INT)
created_at (TIMESTAMP)
```

---

## 🎯 Performance Tips

1. **Database Indexing**: Add indexes on frequently searched columns
```sql
CREATE INDEX idx_student_name ON students(name);
CREATE INDEX idx_student_course ON students(course);
CREATE INDEX idx_user_username ON users(username);
```

2. **Caching**: Consider adding Redis for session caching
3. **Connection Pooling**: Configured by default with HikariCP
4. **Frontend Optimization**: Minify CSS/JS for production

---

## 📚 Dependencies

- **Spring Boot**: 3.2.0
- **Spring Data JPA**: Included with Spring Boot
- **MySQL Connector**: 9.5.0
- **Lombok**: 1.18.30
- **JJWT**: 0.12.3 (for JWT tokens)

---

## 🤝 Contributing

To add features:

1. Create new Controller in `src/main/java/com/sms/controller/`
2. Create Service layer in `src/main/java/com/sms/service/`
3. Add Repository in `src/main/java/com/sms/repository/`
4. Update frontend `public/js/app.js`

---

## 📄 License

Educational project - Free to use and modify.

---

## 🎉 Next Steps

- Add JWT authentication for better security
- Implement file upload for student photos
- Add email notifications
- Create admin dashboard for user management
- Add role-based access control (RBAC)
- Implement data export (PDF/Excel)
- Add real-time notifications

---

**Last Updated**: November 11, 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready for Development

