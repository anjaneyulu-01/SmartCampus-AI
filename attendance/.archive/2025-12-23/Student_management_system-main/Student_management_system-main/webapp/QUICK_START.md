# 🚀 Web App Quick Start Guide

Get the web app running in 10 minutes!

---

## Prerequisites

- Java 11+ installed
- Maven 3.6.0+ installed
- MySQL 8.0+ running
- Port 8080 available

Check versions:
```powershell
java -version
mvn -version
mysql --version
```

---

## ⚡ 5-Minute Setup

### 1. Create Database
```sql
CREATE DATABASE IF NOT EXISTS studentdb;
```

### 2. Update Configuration
Edit `webapp/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/studentdb?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=laddu@8483
```

### 3. Build Project
```powershell
cd webapp
mvn clean install
```

### 4. Run Application
```powershell
mvn spring-boot:run
```

### 5. Open Browser
```
http://localhost:8080
```

---

## 📋 Default Credentials

After first run, create account via Sign Up, or:
- **Username**: admin
- **Password**: admin123

---

## 🔗 Key URLs

- **Frontend**: http://localhost:8080
- **API Base**: http://localhost:8080/api
- **Students API**: http://localhost:8080/api/students
- **Auth API**: http://localhost:8080/api/auth

---

## 📁 Project Structure

```
webapp/
├── pom.xml                 ← Maven config
├── src/main/
│   ├── java/com/sms/      ← Java source code
│   └── resources/         ← application.properties
└── public/
    ├── index.html         ← Main HTML
    ├── css/style.css      ← Styling
    └── js/app.js          ← JavaScript app
```

---

## ✨ Features to Try

1. **Login/Sign Up** - Create new account
2. **Add Student** - Add name, course, semester
3. **View Students** - See all records in table
4. **Search** - Filter by name or course
5. **Delete** - Remove student records
6. **Dashboard** - View statistics

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 8080 in use | Change `server.port` in application.properties |
| Database connection error | Verify MySQL running and credentials correct |
| Build fails | Run `mvn clean install -DskipTests` |
| Page won't load | Check browser console for CORS errors |

---

## 📊 API Testing

### Test with PowerShell

```powershell
# Login
$response = Invoke-WebRequest -Uri http://localhost:8080/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'

# Get students
Invoke-WebRequest -Uri http://localhost:8080/api/students `
  -Method GET
```

---

## 🎨 Customize

### Change Colors
Edit `public/css/style.css`:
```css
:root {
    --primary-color: #4f46e5;  /* Change this */
    --secondary-color: #8b5cf6;
}
```

### Add Features
1. Edit `public/js/app.js` for frontend
2. Update controllers in `src/main/java/com/sms/controller/`

---

## 🚀 Production Deployment

```bash
# Build JAR
mvn clean package

# Run JAR
java -jar target/student-management-system-1.0.0.jar

# Or with custom port
java -jar target/student-management-system-1.0.0.jar --server.port=8080
```

---

## 📚 API Documentation

See `webapp/README.md` for complete API docs.

---

## ✅ Verification Checklist

- [ ] Maven installed correctly
- [ ] MySQL running and accessible
- [ ] Database created
- [ ] credentials updated in application.properties
- [ ] Build successful (`mvn clean install`)
- [ ] Application running on port 8080
- [ ] Can access http://localhost:8080 in browser
- [ ] Can login/create account
- [ ] Can add and view students

---

**You're ready to go!** 🎉

Need help? Check the detailed README.md in the webapp folder.
