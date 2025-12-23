# ⚡ Quick Reference Card

## 🏃 **One-Minute Start**

### Desktop App (NOW)
```
java -cp "lib/*;out" Main
```

### Web App (After Maven Install)
```
cd webapp
mvn clean install
mvn spring-boot:run
```
Open: http://localhost:8080

---

## 📂 **Key Files**

| Purpose | File |
|---------|------|
| Main Desktop App | `src/Main.java` |
| Web App Config | `webapp/pom.xml` |
| Web API Endpoints | `webapp/src/main/java/com/sms/controller/*.java` |
| Frontend App | `webapp/public/js/app.js` |
| Frontend Styling | `webapp/public/css/style.css` |

---

## 🔐 **Default Credentials**

| User | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

---

## 🗄️ **Database**

```
Name: studentdb
User: root
Password: laddu@8483
Port: 3306
```

---

## 📡 **API Endpoints** (When Backend Running)

```
POST   /api/auth/login              Login
POST   /api/auth/signup             Signup
GET    /api/students                All students
POST   /api/students                Add student
GET    /api/students/:id            Get by ID
PUT    /api/students/:id            Update
DELETE /api/students/:id            Delete
```

---

## 🧠 **Ports**

- Desktop: Direct (no port)
- Web Backend: **8080**
- Web Frontend: Same (8080) when deployed

---

## 🛠️ **Common Commands**

```bash
# Check Java
java -version

# Compile Desktop App
javac -cp "lib/*" -d out src/**/*.java

# Build Web App
cd webapp && mvn clean install

# Run Web App
mvn spring-boot:run

# Test API
curl http://localhost:8080/api/students

# Check Maven
mvn --version
```

---

## 📱 **Responsive Breakpoints**

Frontend supports:
- Mobile: < 480px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🔍 **File Count**

- Java Files: 12 (Desktop) + 8 (Web) = **20**
- Configuration: 2
- Frontend: 3 files (HTML/CSS/JS)
- Documentation: 12+ markdown files
- Total: **50+** project files

---

## ✅ **Status Indicators**

| Component | Status |
|-----------|--------|
| Desktop App | ✅ READY |
| Web App Code | ✅ COMPLETE |
| Web App Build | ⏳ NEEDS MAVEN |
| Documentation | ✅ COMPLETE |
| Database | ✅ READY |
| Git Repository | ✅ READY |

---

## 🎯 **Next Action**

1. **Run Desktop**: `java -cp "lib/*;out" Main`
2. **Install Maven**: https://maven.apache.org/download.cgi
3. **Build Web**: `mvn clean install` in `/webapp`
4. **Run Web**: `mvn spring-boot:run`
5. **Open Browser**: http://localhost:8080

---

## 📚 **Documentation Map**

- **Overview**: `README.md`
- **Desktop Setup**: `QUICK_START.md`
- **Web Setup**: `WEBAPP_QUICK_START.md`
- **Full Summary**: `FINAL_SUMMARY.md`
- **Code Review**: `CODE_REVIEW.md`
- **Manual Setup**: `WEBAPP_SETUP_MANUAL.md`

---

## 🔥 **Hot Keys**

In Web App Frontend:
- `F12` - Open Developer Console
- `Ctrl+Shift+I` - Inspect Element
- `Ctrl+F5` - Hard Refresh

---

**Everything is ready. Go build something amazing! 🚀**
