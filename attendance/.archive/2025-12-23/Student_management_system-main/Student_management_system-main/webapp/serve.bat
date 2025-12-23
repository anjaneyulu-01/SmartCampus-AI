@echo off
REM Simple HTTP Server using Python (if available) or Node.js

cls
echo.
echo ========================================
echo    Web App Server
echo ========================================
echo.

REM Try Python first
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting HTTP server on http://localhost:8000
    echo Serving from: %CD%\public
    echo Press Ctrl+C to stop...
    echo.
    python -m http.server 8000 --directory public
    exit /b
)

REM Try Node.js http-server
where http-server >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting HTTP server on http://localhost:8000
    echo Serving from: %CD%\public
    echo Press Ctrl+C to stop...
    echo.
    http-server ./public -p 8000
    exit /b
)

REM If neither available, suggest alternatives
echo ERROR: No HTTP server available
echo.
echo Please install one of the following:
echo  1. Python: https://www.python.org/downloads/
echo  2. Node.js: https://nodejs.org/
echo  3. Install VS Code Live Server extension
echo.
echo Alternatively, open the HTML file directly:
explorer public\index.html
