# ⚡ Quick Start Guide - Student Management System

Get your SMS running in 5 minutes!

---

## 🎯 Step-by-Step Setup

### **1️⃣ Database Setup (2 minutes)**

Open MySQL and run:
```sql
CREATE DATABASE studentdb;
```

### **2️⃣ Update Credentials (30 seconds)**

Edit these two files and replace `laddu@8483` with your MySQL root password:

- **File 1**: `src/db/DBConnection.java` (Line 16)
- **File 2**: `src/TestConnection.java` (Line 8)

### **3️⃣ Add Dependencies (1 minute)**

Copy these JAR files to the `lib/` folder:
- `mysql-connector-java-8.0.33.jar`
- `flatlaf-3.0.jar`
- `jfreechart-1.0.19.jar`
- `jcommon-1.0.23.jar`

### **4️⃣ Test Connection (1 minute)**

```bash
# Windows PowerShell
javac -cp "lib/*" src/TestConnection.java
java -cp "lib/*;src" TestConnection
```

**Expected Output**:
```
✅ JDBC Driver loaded successfully!
✅ Database Connected Successfully!
```

### **5️⃣ Run Application (30 seconds)**

```bash
# Compile
javac -cp "lib/*" src/**/*.java

# Run
java -cp "lib/*;src" Main
```

---

## 🔐 Default Credentials

After the app starts:

```
Username: admin
Password: admin123
```

⚠️ **Change these immediately after first login!**

---

## 📱 What You Can Do

✅ **Add Students** - Name, Course, Semester  
✅ **View Students** - See all records in a table  
✅ **Search** - Find by name or course  
✅ **Delete** - Remove student records  
✅ **Analytics** - View charts and statistics  
✅ **Toggle Theme** - Switch dark/light mode  

---

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| "Connection refused" | Start MySQL: `net start MySQL80` (Windows) |
| "No suitable driver" | Check if mysql-connector JAR is in lib/ folder |
| "Unknown database" | Run: `CREATE DATABASE studentdb;` |
| "Access denied" | Update password in DBConnection.java |

---

## 📂 Project Structure

```
SMS/
├── src/
│   ├── Main.java                 ← START HERE
│   ├── db/DBConnection.java      ← Update credentials here
│   ├── ui/
│   │   ├── LoginScreen.java
│   │   ├── Dashboard.java
│   │   ├── StudentForm.java
│   │   ├── StudentTable.java
│   │   └── AnalyticsPanel.java
│   └── utils/
│       ├── ThemeManager.java
│       ├── SecurityUtil.java
│       └── ChartUtils.java
├── lib/                          ← Put JAR files here
├── README.md                     ← Full documentation
└── CODE_REVIEW.md              ← Detailed fixes
```

---

## 🚀 IDE Setup (5 minutes)

### **IntelliJ IDEA**
1. File → Open → Select SMS folder
2. Right-click `lib/` → Mark Directory as → Library Root
3. Run → Run Main.java

### **Eclipse**
1. File → Import → Existing Projects → SMS folder
2. Project → Properties → Java Build Path
3. Add JAR files from `lib/` folder
4. Right-click Main.java → Run As → Java Application

### **NetBeans**
1. File → Open Project → SMS
2. Right-click project → Properties → Libraries
3. Add JAR files from `lib/` folder
4. Run → Run Project

---

## ✅ Verification Checklist

After running the app:

- [ ] Login screen appears
- [ ] Can login with admin/admin123
- [ ] Dashboard loads with sidebar menu
- [ ] Can add a test student
- [ ] Can view students in table
- [ ] Analytics shows charts (if students exist)
- [ ] Theme toggle works
- [ ] Can search for students
- [ ] Can delete a student

---

## 📚 Additional Resources

- **README.md** - Full documentation with features and advanced usage
- **CODE_REVIEW.md** - Detailed code quality improvements and fixes
- **Each Java file** - Has javadoc comments explaining the code

---

## 🎓 Troubleshooting Commands

```powershell
# Test if MySQL is running
sc query MySQL80

# Check Java version
java -version

# Compile with verbose output
javac -cp "lib/*" src/**/*.java -verbose

# Run with debug output
java -cp "lib/*;src" -Ddebug=true Main
```

---

## 💡 Pro Tips

1. **Add Multiple Students** → Try different courses to see Analytics work better
2. **Use Search** → Type partial names to test search functionality  
3. **Toggle Theme** → Test dark/light mode switching
4. **Change Password** → Use Sign Up button in login to create new users
5. **Export Data** → Use Analytics to understand your data before exporting

---

## 🎉 You're All Set!

Your Student Management System is ready to use. Start adding students and enjoy the analytics dashboard!

---

**Need Help?**
1. Check README.md for detailed feature guide
2. Look at CODE_REVIEW.md for technical details
3. Read the javadoc comments in each Java file
4. Check error messages - they provide helpful hints

**Happy Learning!** 🚀

