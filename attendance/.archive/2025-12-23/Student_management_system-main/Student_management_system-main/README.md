# 🎓 Student Management System (SMS)

A modern, feature-rich Student Management System built with **Java Swing** and **MySQL**, designed to manage student records, view analytics, and provide a secure authentication system.

---

## ✨ Features

- **Secure Authentication**: SHA-256 hashed password security with user roles
- **Add Students**: Create new student records with name, course, and semester
- **View Students**: Display all students in a sortable, searchable table
- **Delete Students**: Remove student records from the database
- **Search Functionality**: Filter students by name or course
- **Analytics Dashboard**: Visual charts showing student statistics by course and semester
- **Dark/Light Theme Toggle**: Switch between themes dynamically
- **Modern UI**: FlatLaf look and feel for a professional appearance
- **Responsive Design**: Works with different screen resolutions

---

## 📋 System Requirements

- **Java**: JDK 11 or higher
- **MySQL**: Version 5.7 or higher (with root user access)
- **RAM**: Minimum 2GB

---

## 🔧 Installation & Setup

### Step 1: Database Setup

1. Open MySQL Command Line or MySQL Workbench
2. Create the database:
   ```sql
   CREATE DATABASE studentdb;
   ```

3. The application will auto-create tables when you first run it (thanks to `DBConnection.ensureSchema()`)

### Step 2: Update Database Credentials

Edit `/src/db/DBConnection.java` and update these lines with your MySQL password:

```java
private static final String PASSWORD  = "laddu@8483"; // ← Change this to your MySQL root password
```

Also update in `/src/TestConnection.java`:

```java
String pass = "laddu@8483"; // ← Change this to your MySQL root password
```

### Step 3: Add Required Dependencies

Add these JAR files to your project's classpath:

1. **MySQL JDBC Driver**: `mysql-connector-java-8.0.33.jar`
2. **FlatLaf UI**: `flatlaf-3.0.jar` 
3. **JFreeChart**: `jfreechart-1.0.19.jar`
4. **JCommon**: `jcommon-1.0.23.jar` (dependency for JFreeChart)

#### Using Maven (Recommended)

If using Maven, add to `pom.xml`:

```xml
<dependencies>
    <!-- MySQL JDBC Driver -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>

    <!-- FlatLaf Look and Feel -->
    <dependency>
        <groupId>com.formdev</groupId>
        <artifactId>flatlaf</artifactId>
        <version>3.0</version>
    </dependency>

    <!-- JFreeChart for Analytics -->
    <dependency>
        <groupId>org.jfree</groupId>
        <artifactId>jfreechart</artifactId>
        <version>1.0.19</version>
    </dependency>

    <dependency>
        <groupId>org.jfree</groupId>
        <artifactId>jcommon</artifactId>
        <version>1.0.23</version>
    </dependency>
</dependencies>
```

### Step 4: Test Database Connection

Run the test connection utility:

```bash
javac -cp "path/to/mysql-connector-java.jar" src/TestConnection.java
java -cp ".:path/to/mysql-connector-java.jar" TestConnection
```

Expected output:
```
✅ JDBC Driver loaded successfully!
✅ Database Connected Successfully!
✅ Connection URL: jdbc:mysql://localhost:3306/studentdb?allowPublicKeyRetrieval=true&useSSL=false
✅ Connected as user: root
✅ Connection closed successfully!
```

---

## 🚀 Running the Application

### Option 1: From Command Line

```bash
# Compile all Java files
javac -cp "lib/*" src/**/*.java

# Run the application
java -cp "lib/*:src" Main
```

### Option 2: Using IDE

1. Open the project in IntelliJ IDEA, Eclipse, or NetBeans
2. Add the JAR files to the project's library path
3. Run the `Main` class

### Option 3: Using Gradle (if configured)

```bash
gradle run
```

---

## 🔐 Default Login Credentials

When you first run the application, a default admin account is created:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change these credentials on first login!**

---

## 📂 Project Structure

```
SMS/
├── src/
│   ├── Main.java                    # Application entry point
│   ├── TestConnection.java          # Database connection test utility
│   ├── db/
│   │   └── DBConnection.java        # Singleton database connection manager
│   ├── model/
│   │   └── Student.java             # Student data model
│   ├── ui/
│   │   ├── LoginScreen.java         # Login authentication screen
│   │   ├── Dashboard.java           # Main dashboard with navigation
│   │   ├── StudentForm.java         # Form to add new students
│   │   ├── StudentTable.java        # Table view of all students
│   │   └── AnalyticsPanel.java      # Analytics and charts
│   └── utils/
│       ├── ThemeManager.java        # Dark/Light theme manager
│       ├── SecurityUtil.java        # Password hashing utilities
│       └── ChartUtils.java          # Chart creation utilities
├── lib/                             # External JAR files
├── README.md                        # This file
└── pom.xml                          # Maven configuration (if using Maven)
```

---

## 🎯 Usage Guide

### 1. Login
- Start the application and enter credentials
- Default: `admin` / `admin123`

### 2. Add a Student
- Click "➕ Add Student" from the sidebar
- Fill in Name, Course, and Semester
- Click "Add Student" button
- Confirm the success message

### 3. View Students
- Click "📋 View Students" to see all records
- Use the search box to filter by name or course
- Click "🔄 Refresh" to reload data

### 4. Delete a Student
- Go to View Students
- Select a student from the table
- Click "🗑 Delete" and confirm

### 5. View Analytics
- Click "📊 Analytics" to see visual charts
- View student count by course (pie chart)
- View student count by semester (bar chart)
- Statistics card shows total students, courses, and max semester

### 6. Toggle Theme
- Click "🌓 Toggle Theme" to switch between dark and light modes

### 7. Logout
- Click "🚪 Logout" to return to login screen

---

## 🐛 Troubleshooting

### "Connection Failed: No suitable driver found"
- Ensure `mysql-connector-java.jar` is in your classpath
- Check that the JAR file is properly added to the IDE's library

### "Unknown database 'studentdb'"
- Run the test connection utility to verify the database was created
- If not, manually create it in MySQL: `CREATE DATABASE studentdb;`

### "Access denied for user 'root'@'localhost'"
- Update the password in `DBConnection.java` to match your MySQL password
- Ensure MySQL server is running

### Charts not displaying in Analytics
- Ensure JFreeChart JAR files are in the classpath
- Check that there is student data in the database

### Application won't compile
- Verify all Java files are in the correct packages (matching folder structure)
- Ensure JDK 11+ is installed: `javac -version`

---

## 📝 Database Schema

The application automatically creates the required tables:

### `users` table (for authentication)
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    pass_hash CHAR(64) NOT NULL
);
```

### `students` table (for student records)
```sql
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    semester INT NOT NULL
);
```

---

## 🔐 Security Considerations

1. **Password Hashing**: All passwords are hashed using SHA-256 before storage
2. **SQL Injection Prevention**: Using PreparedStatements throughout
3. **Change Default Credentials**: Always change the default admin password
4. **Database Access**: Restrict MySQL access to localhost only for security

---

## 🚀 Future Enhancements

- [ ] Export reports to PDF/Excel
- [ ] Student photo upload feature
- [ ] Email notifications for records
- [ ] Role-based access control (Student, Teacher, Admin)
- [ ] Attendance tracking
- [ ] Grade management system
- [ ] Database backup/restore functionality
- [ ] User audit logging

---

## 📄 License

This project is for educational purposes. Feel free to modify and extend it as needed.

---

## 👨‍💻 Author

**Jayanth**

For questions or support, please review the code comments and documentation in each class.

---

## 🙏 Acknowledgments

- **FlatLaf**: Modern look and feel for Java Swing
- **JFreeChart**: Professional charting library
- **MySQL**: Reliable relational database
- **Java Swing**: Robust GUI framework

---

**Last Updated**: November 11, 2025

Happy coding! 🎉
#   S t u d e n t _ m a n a g e m e n t _ s y s t e m  
 