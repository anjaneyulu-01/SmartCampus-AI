@echo off
echo =========================================
echo MySQL Password Configuration for PresenceAI
echo =========================================
echo.
echo Please enter your MySQL root password.
echo If you don't have a password, just press ENTER.
echo.
set /p MYSQL_PASSWORD="MySQL root password: "

echo.
echo Testing MySQL connection...
mysql -u root -p"%MYSQL_PASSWORD%" -e "SELECT 1" >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: MySQL connection successful!
    echo.
    echo Updating .env file...
    
    (
        echo DB_HOST=localhost
        echo DB_PORT=3306
        echo DB_USER=root
        echo DB_PASSWORD=%MYSQL_PASSWORD%
        echo DB_NAME=attendance_db
        echo PORT=8001
    ) > .env
    
    echo .env file updated successfully!
    echo.
    echo Starting backend server...
    echo.
    node server.js
) else (
    echo ERROR: MySQL connection failed!
    echo Please check your MySQL installation and password.
    echo.
    pause
)
