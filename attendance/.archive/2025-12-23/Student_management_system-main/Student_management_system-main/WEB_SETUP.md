# 🌐 Web Application Setup Guide

## 🚀 Quick Start

This is a modern, responsive web-based Student Management System built with:
- **Backend**: Spring Boot (Java)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: MySQL
- **Charts**: Chart.js

## 📋 Prerequisites

1. **Java JDK 17+** - [Download](https://www.oracle.com/java/technologies/downloads/)
2. **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
3. **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/)
4. **Modern Web Browser** (Chrome, Firefox, Edge, Safari)

## 🔧 Installation Steps

### 1. Database Setup

Make sure MySQL is running and create the database:

```sql
CREATE DATABASE IF NOT EXISTS studentdb;
```

Or the application will auto-create it on first run.

### 2. Update Database Credentials

Edit `src/main/java/com/sms/db/DBConnection.java` and update:
```java
private static final String USER = "root";
private static final String PASSWORD = "laddu@8483"; // Change this
```

### 3. Build and Run

#### Option A: Using Maven (Recommended)

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

#### Option B: Using IDE

1. Import the project into IntelliJ IDEA or Eclipse
2. Wait for Maven to download dependencies
3. Run `SmsApplication.java`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:8080
```

## 🔐 Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## ✨ Features

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes
- **Smooth Animations**: CSS animations and transitions
- **Gradient Backgrounds**: Modern visual design
- **Interactive Elements**: Hover effects and transitions

### 📊 Features
- ✅ Secure Authentication (SHA-256 password hashing)
- ✅ Add/View/Delete Students
- ✅ Search Functionality
- ✅ Real-time Analytics with Charts
- ✅ Responsive Tables
- ✅ Modern Dashboard

### 🎯 Pages

1. **Login Page** (`/index.html`)
   - Secure login with validation
   - Sign up functionality
   - Error handling

2. **Dashboard** (`/dashboard.html`)
   - Overview statistics
   - Quick navigation
   - Theme toggle

3. **Add Student**
   - Form with validation
   - Real-time feedback

4. **View Students**
   - Searchable table
   - Delete functionality
   - Responsive design

5. **Analytics**
   - Pie chart (Students by Course)
   - Bar chart (Students by Semester)
   - Interactive charts

## 🛠️ Technology Stack

### Backend
- Spring Boot 3.1.5
- Spring Web MVC
- MySQL Connector
- Jackson (JSON)

### Frontend
- HTML5
- CSS3 (Custom Properties, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Chart.js (for analytics)

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (Full sidebar)
- **Tablet**: 481px - 768px (Collapsible sidebar)
- **Mobile**: < 480px (Mobile-optimized layout)

## 🎨 Customization

### Change Colors

Edit `src/main/resources/static/css/style.css` and modify CSS variables:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* ... */
}
```

### Change Port

Edit `src/main/resources/static/application.properties`:

```properties
server.port=8080
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in application.properties or kill process
netstat -ano | findstr :8080
```

### Database Connection Error
- Check MySQL is running
- Verify credentials in `DBConnection.java`
- Ensure database exists

### Maven Build Fails
```bash
# Clean and rebuild
mvn clean install -U
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Sign up

### Students
- `GET /api/students` - Get all students
- `GET /api/students?search=query` - Search students
- `POST /api/students` - Add student
- `DELETE /api/students/{id}` - Delete student

### Analytics
- `GET /api/analytics` - Get analytics data

## 🚀 Deployment

### Build JAR
```bash
mvn clean package
```

### Run JAR
```bash
java -jar target/student-management-system-1.0.0.jar
```

## 📄 License

This project is open source and available for educational purposes.

---

**Enjoy your modern Student Management System! 🎓**

