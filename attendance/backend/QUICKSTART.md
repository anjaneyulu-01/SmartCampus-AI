# Quick Start Guide - Node.js/Express Backend

## Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)
- MySQL 8.0 or higher (installed and running)

## Installation

1. **Install and start MySQL:**
   - Ensure MySQL server is running
   - Create a database user (or use root)

2. **Navigate to backend directory:**
```bash
cd backend
```

3. **Configure database** - Create `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=attendance_db
PORT=8000
```

4. **Install dependencies:**
```bash
npm install
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:8000`

## Testing the API

### 1. Health Check
```bash
curl http://localhost:8000/api/healthz
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"hod","password":"hodpass"}'
```

### 3. Get Students (with token)
```bash
curl http://localhost:8000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Default Users

- **HOD**: `hod` / `hodpass`
- **Teacher**: `teacher1` / `teacher1pass`
- **Parent**: `sai` / `92460118732`

## Face Recognition Setup (Optional)

For full face recognition functionality:

1. Download face-api.js models:
   - Visit: https://github.com/justadudewhohacks/face-api.js-models
   - Download the model files

2. Create models directory:
```bash
mkdir -p src/models
```

3. Place model files in `src/models/`:
   - ssd_mobilenetv1_model-weights_manifest.json
   - ssd_mobilenetv1_model-shard1
   - face_landmark_68_model-weights_manifest.json
   - face_landmark_68_model-shard1
   - face_recognition_model-weights_manifest.json
   - face_recognition_model-shard1

**Note:** The server will run without face recognition models, but face recognition features will be limited.

## API Endpoints

All endpoints are prefixed with `/api`

- `GET /healthz` - Health check
- `POST /login` - Login
- `GET /me` - Get current user
- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `POST /students` - Register student (HOD only)
- `DELETE /students/:id` - Delete student (HOD only)
- `POST /attendance/mark` - Mark attendance
- `GET /attendance` - Get attendance records
- `POST /checkin` - Face recognition checkin
- `GET /timeline/:student_id` - Get student timeline
- `GET /trust/:student_id` - Get trust score
- `GET /leaderboard` - Get leaderboard
- `GET /seats` - Get seat map
- `GET /insights` - Get insights

## Troubleshooting

1. **Port 8000 already in use:**
   - Change PORT in `.env` file or set environment variable: `PORT=3000 npm start`

2. **Database connection errors:**
   - Ensure MySQL server is running: `mysql -u root -p`
   - Check database credentials in `.env` file
   - Verify database exists or allow auto-creation
   - Test connection: `mysql -h localhost -u root -p`

3. **MySQL authentication errors:**
   - Ensure MySQL user has proper permissions
   - Create user if needed: `CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';`
   - Grant permissions: `GRANT ALL PRIVILEGES ON attendance_db.* TO 'user'@'localhost';`

4. **Face recognition not working:**
   - Check if models are downloaded and placed correctly
   - Check console logs for errors
   - Server will still run without models, but face recognition will be limited

5. **Module not found errors:**
   - Run `npm install` again
   - Delete `node_modules` and `package-lock.json`, then run `npm install`

## Next Steps

- Configure environment variables in `.env` file
- Set up production environment
- Configure HTTPS
- Set up Redis for token storage (optional)

