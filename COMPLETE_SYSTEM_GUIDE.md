# PresenceAI - Complete System Guide

## 🎯 Project Overview

PresenceAI is a **Smart Face Recognition Attendance System** with:
- **Backend**: Node.js/Express with MySQL
- **Frontend**: Modern React with Tailwind CSS
- **Features**: Real-time attendance, face recognition, analytics

## 📋 System Requirements

### Minimum Requirements
- Node.js 16+ (https://nodejs.org/)
- npm or yarn
- MySQL 5.7+ (for database)
- Python 3.7+ (for face recognition)
- Webcam or camera device

### Recommended
- Node.js 18+
- 8GB RAM
- SSD storage
- Good internet connection

## 🚀 Getting Started

### Step 1: Backend Setup

```bash
cd attendance/backend

# Install dependencies
npm install

# Setup environment (if needed)
# Create .env file or configure MySQL

# Start backend server
npm start
# or for development
npm run dev
```

Backend will run on `http://localhost:8000`

### Step 2: Frontend Setup

```bash
cd attendance/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### Step 3: Open Browser

Visit `http://localhost:5173` and login with demo credentials:
- **Username**: teacher
- **Password**: pass123

## 📁 Project Structure

```
Face-recognition-attendance-system/
├── attendance/
│   ├── backend/               # Node.js/Express backend
│   │   ├── src/
│   │   │   ├── routes/        # API endpoints
│   │   │   ├── services/      # Business logic
│   │   │   ├── database/      # DB schemas
│   │   │   ├── middleware/    # Auth/validation
│   │   │   └── websocket/     # Real-time
│   │   ├── package.json
│   │   ├── server.js
│   │   └── README.md
│   │
│   └── frontend/              # React frontend
│       ├── src/
│       │   ├── pages/         # Page components
│       │   ├── components/    # UI components
│       │   ├── stores/        # State management
│       │   └── utils/         # Helpers
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
│
└── Documentation/
    ├── README.md              # Project readme
    ├── SETUP.md               # Setup guide
    ├── DEPLOYMENT.md          # Deployment guide
    └── REACT_FRONTEND_SETUP.md
```

## 🛠️ Backend Stack

### Core
- **Node.js** - Runtime
- **Express** - Web framework
- **MySQL** - Database
- **WebSocket** - Real-time updates

### Libraries
- **face-api.js** - Face detection
- **tensorflow.js** - ML framework
- **multer** - File uploads
- **bcrypt** - Password hashing
- **jsonwebtoken** - Authentication

### API Endpoints

```
Authentication:
POST   /api/login              Login user
GET    /api/me                 Get current user
POST   /api/logout             Logout user

Attendance:
GET    /api/attendance         Get attendance records
POST   /api/attendance/mark    Mark attendance
GET    /api/attendance/stats   Get statistics

Students:
GET    /api/students           Get all students
GET    /api/students/:id       Get student details
POST   /api/students           Create student
PUT    /api/students/:id       Update student
DELETE /api/students/:id       Delete student

Analytics:
GET    /api/insights           Get insights
GET    /api/trust              Get trust scores

Utilities:
POST   /api/upload             Upload files
GET    /api/health             Health check
```

## 🎨 Frontend Stack

### Core
- **React 18** - UI framework
- **React Router** - Navigation
- **Vite** - Build tool

### Libraries
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Data visualization

### Key Features

1. **Authentication**
   - Login page with credentials
   - JWT token storage
   - Protected routes
   - Session management

2. **Dashboard**
   - Real-time statistics
   - Attendance overview
   - System status
   - Quick actions

3. **Scanner**
   - Live camera feed
   - Face detection
   - Real-time recognition
   - Attendance marking

4. **Students**
   - Student list
   - Search & filter
   - Student cards
   - Status management

5. **Insights**
   - Attendance trends
   - Performance metrics
   - Analytics charts
   - Reports

## 🔄 Workflow

### Daily Attendance Process

1. **Morning**
   - Teacher/Student opens app
   - Logs in with credentials
   - Uses Scanner to capture faces
   - System marks attendance automatically

2. **Throughout Day**
   - Real-time attendance updates
   - Live statistics on dashboard
   - Notifications for lateness

3. **End of Day**
   - View attendance summary
   - Check analytics
   - Generate reports
   - Export data

### Admin Tasks

1. **Student Management**
   - Add new students
   - Update information
   - View history
   - Delete records

2. **Analytics**
   - View trends
   - Check performance
   - Identify patterns
   - Generate insights

## 📊 Database Schema

### Key Tables
- **users** - Teachers/administrators
- **students** - Student information
- **attendance_events** - Attendance records
- **trust_scores** - Behavioral tracking
- **classes** - Class information

## 🔐 Security Features

1. **Authentication**
   - JWT tokens
   - Password hashing (bcrypt)
   - Secure cookies

2. **Authorization**
   - Role-based access (teacher/hod)
   - Protected endpoints
   - CORS configuration

3. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection

## 🎬 Running the System

### Development Mode

**Terminal 1 - Backend:**
```bash
cd attendance/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd attendance/frontend
npm run dev
```

**Terminal 3 - Database (if needed):**
```bash
# Start MySQL server
# Windows: net start MySQL80
# Mac: brew services start mysql
# Linux: sudo service mysql start
```

### Production Mode

**Backend:**
```bash
cd attendance/backend
npm start
```

**Frontend:**
```bash
cd attendance/frontend
npm run build
# Serve dist/ folder
```

## 📱 Accessing the System

### Development
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`

### Production
- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com/api`

## 🧪 Testing

### Test Login Credentials
- **Username**: teacher
- **Password**: pass123
- **Role**: Teacher

### Test Data
- All pages have demo data
- Sample students: 125
- Sample attendance records: Pre-populated
- Sample analytics: Generated

## 🚀 Deployment

### Frontend Deployment
```bash
# Build
npm run build

# Output: dist/ folder
# Deploy to: Static hosting (Vercel, Netlify, AWS S3)
```

### Backend Deployment
```bash
# Requires:
# - Node.js server
# - MySQL database
# - Environment variables configured
# - SSL certificate (HTTPS)

# Recommended:
# - Docker containerization
# - Cloud platforms (AWS, Azure, Heroku)
```

## 📈 Performance Optimization

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Minification

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Caching (Redis)
- Rate limiting

## 🔍 Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
# Kill process: lsof -ti:8000 | xargs kill -9
# Or use different port: PORT=3000 npm start
```

### Frontend Port Error
```bash
# If 5173 is in use:
npm run dev -- --port 3000
```

### Database Connection Error
```bash
# Check MySQL is running
# Verify credentials in .env
# Check database exists
```

### Camera Permission Denied
```bash
# Check browser camera permissions
# Must use HTTPS in production
# Whitelist localhost in development
```

## 📚 Documentation Files

1. **README.md** - Project overview
2. **SETUP.md** - Initial setup
3. **DEPLOYMENT.md** - Production deployment
4. **MYSQL_SETUP.md** - Database setup
5. **REACT_FRONTEND_SETUP.md** - React frontend guide
6. **FRONTEND_STATUS.md** - Frontend implementation status
7. **FRONTEND_MIGRATION_SUMMARY.md** - Migration details

## 🎓 Learning Path

1. **Understand the System**
   - Read README.md
   - Check project structure
   - Review database schema

2. **Setup Development**
   - Install Node.js
   - Clone repository
   - Install dependencies
   - Setup database

3. **Run Locally**
   - Start backend
   - Start frontend
   - Login with credentials
   - Explore features

4. **Customize**
   - Modify UI components
   - Add new pages
   - Enhance features
   - Deploy

## 🤝 Contributing

To contribute:
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Code review

## 📞 Support

For issues:
1. Check documentation
2. Review code comments
3. Check error logs
4. Search issues
5. Create new issue

## ✨ Features Highlights

✅ **Real-time Attendance** - Instant marking
✅ **Face Recognition** - Automated detection
✅ **Live Dashboard** - Real-time stats
✅ **Analytics** - Performance insights
✅ **Responsive UI** - Works on all devices
✅ **Modern Design** - Beautiful interface
✅ **Secure Auth** - JWT authentication
✅ **WebSocket** - Real-time updates
✅ **Data Export** - Generate reports
✅ **Student Mgmt** - Complete CRUD

## 🎉 Success Checklist

- [x] Backend API running
- [x] Frontend React app running
- [x] Database connected
- [x] Can login successfully
- [x] Dashboard loads correctly
- [x] Camera works
- [x] Attendance marks properly
- [x] Analytics show data
- [x] Responsive on mobile
- [x] Ready for production

## 📝 Quick Reference

```bash
# Backend
cd attendance/backend
npm install          # Install deps
npm start           # Run production
npm run dev         # Run development

# Frontend
cd attendance/frontend
npm install         # Install deps
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview build

# Database
mysql -u root -p    # Connect to MySQL
```

## 🎊 Final Notes

- Keep dependencies updated
- Regular database backups
- Monitor performance
- Collect user feedback
- Iterate and improve

**Happy coding! 🚀**

For detailed information, check the respective README files in each folder.
