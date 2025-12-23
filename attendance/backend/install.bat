@echo off
echo Installing Node.js dependencies for PresenceAI Backend...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo Installing npm packages...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo To start the server:
echo   npm start
echo.
echo For development with auto-reload:
echo   npm run dev
echo.
echo Don't forget to:
echo   1. Create .env file from .env.example
echo   2. Configure MySQL database credentials
echo   3. Start MySQL server
echo.
pause

