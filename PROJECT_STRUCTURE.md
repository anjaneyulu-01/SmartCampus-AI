# Project Structure - Clean & Deployment Ready

## Final Structure

```
Face-recognition-attendance-system/
│
├── attendance/
│   │
│   ├── backend/                      # Node.js/Express Backend API
│   │   ├── server.js                 # Main server entry point
│   │   ├── package.json              # Node.js dependencies
│   │   ├── .env.example              # Environment variables template
│   │   ├── .gitignore                # Git ignore rules
│   │   ├── install.bat               # Windows installation script
│   │   ├── README.md                 # Backend documentation
│   │   ├── QUICKSTART.md             # Quick start guide
│   │   ├── MYSQL_SETUP.md            # MySQL setup guide
│   │   │
│   │   ├── src/                      # Source code
│   │   │   ├── config/
│   │   │   │   └── database.js       # MySQL configuration
│   │   │   │
│   │   │   ├── database/
│   │   │   │   ├── db.js             # Database connection & queries
│   │   │   │   └── init.sql          # SQL initialization script
│   │   │   │
│   │   │   ├── routes/               # API routes
│   │   │   │   ├── auth.js           # Authentication routes
│   │   │   │   ├── students.js       # Student management routes
│   │   │   │   ├── attendance.js     # Attendance routes
│   │   │   │   ├── trust.js          # Trust scores & leaderboard
│   │   │   │   └── insights.js       # Insights routes
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   └── auth.js           # Authentication middleware
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── faceRecognition.js # Face recognition service
│   │   │   │
│   │   │   ├── utils/                # Utility functions
│   │   │   │   ├── password.js       # Password hashing
│   │   │   │   ├── token.js          # Token management
│   │   │   │   └── helpers.js        # Helper functions
│   │   │   │
│   │   │   └── websocket/
│   │   │       └── websocket.js      # WebSocket server
│   │   │
│   │   ├── avatars/                  # Student avatar images
│   │   ├── known_faces/              # Face recognition training images
│   │   └── temp/                     # Temporary files
│   │
│   └── frontend/                     # Frontend Application
│       ├── index.html                # Main dashboard page
│       ├── login.html                # Login page
│       ├── webscan.html              # Face scan page
│       ├── main.css                  # Main stylesheet
│       ├── app.js                    # Frontend JavaScript
│       ├── README.md                 # Frontend documentation
│       │
│       └── static/                   # Static assets
│           └── avatars/              # Avatar images (if needed)
│
├── README.md                         # Main project README
├── PROJECT_STRUCTURE.md              # This file
├── DEPLOYMENT.md                     # Deployment guide
└── .gitignore                        # Git ignore rules
```

## Key Points

### ✅ Clean Structure
- **ONE** `attendance/` folder containing everything
- **ONE** `backend/` subfolder with all backend files
- **ONE** `frontend/` subfolder with all frontend files
- No duplicate folders
- No old Python files
- Properly organized for deployment

### ✅ Backend Organization
- Modular structure (routes, middleware, services, utils)
- Clear separation of concerns
- Easy to maintain and extend
- Production-ready configuration

### ✅ Frontend Organization
- All HTML files in root of frontend/
- Single CSS file (main.css)
- Single JS file (app.js)
- Static assets in static/ folder

### ✅ Deployment Ready
- Environment variables configured
- Database setup documented
- Deployment guide included
- Clear separation of frontend/backend

## Files to Keep

✅ **Keep:**
- `backend/` - Complete Node.js backend
- `frontend/` - Complete frontend application
- `README.md` - Main documentation
- `DEPLOYMENT.md` - Deployment instructions
- `PROJECT_STRUCTURE.md` - This file

❌ **Can Delete:**
- `attendance/` folder (old structure)
- Any duplicate backend/frontend folders
- Old Python files (*.py)
- Old C files (*.c)
- Archive folders

## Quick Start

### Backend
```bash
cd attendance/backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm start
```

### Frontend
```bash
cd attendance/frontend
# Open index.html in browser or use a web server
python -m http.server 3000
```

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.
