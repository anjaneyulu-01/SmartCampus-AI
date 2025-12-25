# PresenceAI Backend - Node.js/Express

A fast, modern Node.js/Express backend for the PresenceAI Face Recognition Attendance System.

## Features

- ✅ Fast REST API with Express.js
- ✅ MySQL database integration
- ✅ JWT-based authentication
- ✅ WebSocket support for real-time events
- ✅ Face recognition using face-api.js
- ✅ File upload handling (avatars, face images)
- ✅ Comprehensive API endpoints
- ✅ CORS enabled
- ✅ Error handling and logging

## Installation

1. **Install Node.js** (v18 or higher recommended)

2. **Install dependencies:**
```bash
npm install
```

3. **Configure database** - Create `.env` file:

- Copy `.env.example` → `.env` and fill in `DB_PASSWORD`.
- On Windows you can also run `start.bat` to prompt for your MySQL password and generate `.env`.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=attendance_db
PORT=8000
```

4. **Download face-api.js models** (optional, for face recognition):
```bash
# Create models directory
mkdir -p src/models

# Download models from:
# https://github.com/justadudewhohacks/face-api.js-models
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:8000` by default.

## API Endpoints

### Authentication
- `POST /api/login` - Login
- `GET /api/me` - Get current user (requires auth)

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Register student (HOD only)
- `DELETE /api/students/:id` - Delete student (HOD only)

### Attendance
- `POST /api/attendance/mark` - Manually mark attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/checkin` - Face recognition checkin
- `POST /api/simulate-checkin` - Simulate checkin (demo)
- `GET /api/timeline/:student_id` - Get student timeline

### Trust & Leaderboard
- `GET /api/trust/:student_id` - Get trust score
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/seats` - Get seat map

### Insights
- `GET /api/insights` - Get insights

### WebSocket
- `WS /ws/events` - Real-time events

## Database

The backend uses MySQL database. See `MYSQL_SETUP.md` for setup instructions.

## Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── src/
│   ├── config/           # Configuration
│   ├── database/         # Database layer
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── websocket/        # WebSocket server
├── avatars/              # Avatar images
└── known_faces/          # Face recognition images
```

## Default Users

- `hod` / `hodpass` (HOD role)
- `teacher1` / `teacher1pass` (Teacher role)
- `sai` / `92460118732` (Parent role)

## Troubleshooting

1. **Database connection errors**: Check MySQL credentials in `.env`
2. **Face recognition not working**: Ensure models are downloaded
3. **Port already in use**: Change PORT in `.env`

See `MYSQL_SETUP.md` for detailed database setup instructions.

