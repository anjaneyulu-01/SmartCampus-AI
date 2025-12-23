# Complete Setup Guide

## Project Structure

```
Face-recognition-attendance-system/
├── backend/          # Node.js/Express Backend (ONE folder)
└── frontend/          # HTML/CSS/JS Frontend (ONE folder)
```

## Quick Setup

### 1. Backend Setup

```bash
cd attendance/backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm start
```

Backend runs on: `http://localhost:8000`

### 2. Frontend Setup

```bash
cd attendance/frontend
# Option 1: Open index.html directly in browser
# Option 2: Use a web server
python -m http.server 3000
```

Frontend runs on: `http://localhost:3000`

## Configuration

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=attendance_db
PORT=8000
NODE_ENV=development
```

### Frontend (app.js)
Update API URL if backend is on different port:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## Default Login Credentials

- **HOD**: `hod` / `hodpass`
- **Teacher**: `teacher1` / `teacher1pass`
- **Parent**: `sai` / `92460118732`

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

## Documentation

- **Backend**: `attendance/backend/README.md`
- **Frontend**: `attendance/frontend/README.md`
- **MySQL Setup**: `attendance/backend/MYSQL_SETUP.md`
- **Deployment**: `DEPLOYMENT.md`
- **Structure**: `PROJECT_STRUCTURE.md`

