# Quick Start Guide - PresenceAI

## 🚀 System is Running!

Both frontend and backend servers are currently active.

---

## 🌐 Access the Application

### Login Page
**URL**: http://localhost:3000/login.html

Try these demo credentials:

| Role | Username | Password |
|------|----------|----------|
| HOD | hod | hodpass |
| Teacher | teacher1 | teacher1pass |
| Parent/Student | sai | 92460118732 |

### Dashboard
**URL**: http://localhost:3000/index.html
(Redirects here after successful login for HOD/Teacher)

### WebScan (Face Recognition)
**URL**: http://localhost:3000/webscan.html
(Redirects here after successful login for Student/Parent)

---

## 🎯 What You Can Do

### As HOD
- ✅ Add/Edit/Delete students
- ✅ Mark attendance
- ✅ View all analytics
- ✅ Manage trust scores
- ✅ Access all features

### As Teacher
- ✅ Mark attendance
- ✅ View students
- ✅ See analytics
- ✅ View trust scores

### As Student/Parent
- ✅ Check-in via face recognition (WebScan)
- ✅ View own attendance
- ✅ See trust score

---

## 💡 Quick Actions

### Mark Attendance Manually
1. Login as HOD or Teacher
2. Go to Attendance page
3. Click "Mark Present" or "Mark Suspicious" on any student card

### Add New Student
1. Login as HOD
2. Click "Add Student" button
3. Fill in details (ID, Name, Class)
4. Upload avatar and face photo (optional)
5. Click Save

### View Analytics
1. Login as HOD or Teacher
2. Go to Insights page
3. Click on any analytics card to see detailed charts

---

## 🔄 Restart Servers

If you need to restart:

### Backend (in PowerShell)
```powershell
cd d:\Face-recognition-attendance-system\attendance\backend
node server.js
```

### Frontend (in PowerShell)
```powershell
cd d:\Face-recognition-attendance-system\attendance\frontend
python -m http.server 3000
```

---

## 📊 System Status

- ✅ Backend: Running on http://localhost:8000
- ✅ Frontend: Running on http://localhost:3000
- ✅ Database: MySQL connected (attendance_db)
- ✅ WebSocket: Active for real-time updates

---

## 🎨 Features Highlights

- **Real-time Updates**: See attendance changes instantly via WebSocket
- **Google Meet Style**: Modern card-based student layout
- **Trust Scores**: Gamified attendance tracking
- **Role-based Access**: Different features for different roles
- **Responsive Design**: Works on desktop and mobile
- **Dark Theme**: Beautiful dark mode interface

---

## ⚠️ Note

Face recognition is currently in fallback mode. To enable full face recognition:

```bash
cd attendance\backend
npm install face-api.js canvas @tensorflow/tfjs-node
```

Then restart the backend server.

---

**Enjoy using PresenceAI!** 🎓
