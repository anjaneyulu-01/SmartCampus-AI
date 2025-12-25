@echo off
echo Restarting Face Recognition Attendance System
echo.
echo [1/3] Starting Python DeepFace Service (port 5000)...
start "Python DeepFace" cmd /k "python deepface_scan.py"
timeout /t 5
echo.
echo [2/3] Starting Backend Server (port 8000)...
start "Backend Server" cmd /k "npm start"
timeout /t 3
echo.
echo [3/3] Starting Frontend Server (port 5173)...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"
echo.
echo ===================================
echo All servers started!
echo ===================================
echo.
echo Python DeepFace:  http://127.0.0.1:5000
echo Backend Server:   http://0.0.0.0:8000
echo Frontend:         http://localhost:5173
echo.
echo Navigate to: http://localhost:5173/scan
echo.
pause
