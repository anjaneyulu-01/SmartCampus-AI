# Face Recognition Attendance System - Quick Start Guide

## System Overview

The system consists of 3 servers:
1. **Python DeepFace Service** (Port 5000) - AI face recognition using ArcFace + RetinaFace
2. **Backend API Server** (Port 8000) - Node.js/Express API
3. **Frontend** (Port 5173) - React + Vite development server

## Starting the System

### Method 1: Automated Restart (Windows)
```bash
cd attendance\backend
restart.bat
```

### Method 2: Manual Start (Recommended for Debugging)

Open 3 separate terminals:

**Terminal 1 - Python Service:**
```bash
cd attendance\backend
python deepface_scan.py
```
Wait for: `Serving on http://127.0.0.1:5000`

**Terminal 2 - Backend Server:**
```bash
cd attendance\backend
npm start
```
Wait for: `Server running on http://0.0.0.0:8000`

**Terminal 3 - Frontend:**
```bash
cd attendance\frontend
npm run dev
```
Wait for: `Local: http://localhost:5173/`

## Using Face Recognition

1. Open browser: http://localhost:5173/scan
2. Allow camera access when prompted
3. Position your face in the camera view
4. Wait 10-15 seconds for first scan (models loading)
5. Subsequent scans: 3-5 seconds

## Performance Notes

### First Scan (10-15 seconds)
- TensorFlow model loading
- Face representation building
- Slower but only happens once

### Subsequent Scans (3-5 seconds)
- Uses cached representations
- Much faster processing

## Troubleshooting

### "Signal is aborted" Error
**Cause:** Python service taking too long OR backend not updated with timeout fix
**Solution:** 
1. Stop all servers (Ctrl+C in each terminal)
2. Restart using Method 2 above
3. Ensure you wait for each service to fully start before moving to next

### "ECONNRESET" Error  
**Cause:** Backend calling Python service before it's ready
**Solution:**
- Make sure Python service shows "Serving on http://127.0.0.1:5000"
- Restart backend AFTER Python service is ready

### "Face not recognized"
**Possible Causes:**
1. Poor lighting - ensure face is well-lit
2. Face at wrong angle - look directly at camera
3. Your face not in dataset - check `attendance/backend/dataset/` folder

### Adding New Faces to Dataset

1. Create folder: `attendance/backend/dataset/YourName/`
2. Add 5-7 photos of your face (different angles, lighting)
3. Photos should be:
   - JPG or PNG format
   - Clear face visibility
   - Good lighting
   - Different expressions/angles
4. Restart Python service to rebuild representations

## Configuration

### Increase Recognition Threshold (More Strict)
Edit `attendance/backend/deepface_scan.py`:
```python
COSINE_THRESHOLD = 0.65  # Lower = stricter (try 0.55)
```

### Decrease Recognition Threshold (More Lenient)
```python
COSINE_THRESHOLD = 0.75  # Higher = more lenient
```

### Change Timeout Duration
Edit `attendance/backend/src/services/faceRecognition.js`:
```javascript
timeout: 60000  // 60 seconds (try 90000 for 90s)
```

Edit `attendance/frontend/src/pages/ScanDevicePage.jsx`:
```javascript
setTimeout(() => controller.abort(), 30000)  // 30 seconds
```

## System Requirements

- **Python:** 3.8+
- **Node.js:** 16+
- **RAM:** 4GB minimum (8GB recommended for DeepFace)
- **Camera:** Any webcam
- **MySQL:** 5.7+ or 8.0+

## Dataset Structure
```
attendance/backend/dataset/
├── Anjaneyulu/
│   ├── 1.jpg
│   ├── anji2.jpeg
│   └── ...
├── Rahul/
│   └── ...
├── Sai/
│   └── ...
└── [Your Name]/
    ├── photo1.jpg
    ├── photo2.jpg
    └── ...
```

## Access Points

- **Face Scan Page:** http://localhost:5173/scan
- **Dashboard:** http://localhost:5173
- **Login:** http://localhost:5173/login
- **Python API:** http://127.0.0.1:5000/match
- **Backend API:** http://127.0.0.1:8000/api

## Default Credentials

Check `attendance/backend/src/database/init.sql` for seeded users.

## Support

If issues persist:
1. Check all 3 terminals for error messages
2. Ensure MySQL is running
3. Verify dataset has at least one person with photos
4. Check browser console (F12) for frontend errors
5. Try with good lighting and direct face angle

---

**Note:** First-time face recognition will be slow (10-15s) due to model loading. This is normal.
