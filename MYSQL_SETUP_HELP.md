# PresenceAI - MySQL Setup Guide

## Issue: MySQL Connection Failed

The backend server cannot connect to MySQL because the password in the `.env` file doesn't match your MySQL root password.

## Solution

### Option 1: Use the Auto-Config Script (Recommended)

Run the provided batch file that will automatically detect your MySQL password:

```bash
cd attendance\backend
start.bat
```

The script will:
1. Prompt you for your MySQL root password
2. Test the connection
3. Update the `.env` file automatically
4. Start the backend server

### Option 2: Manual Configuration

1. **Find Your MySQL Password**
   - If you installed MySQL yourself, check your installation notes
   - If using XAMPP, the default password is usually empty
   - If using MySQL Workbench, check your saved connections

2. **Update the .env file**
   
   Open `attendance\backend\.env` and update the `DB_PASSWORD` line:
   
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_actual_password_here
   DB_NAME=attendance_db
   PORT=8000
   ```
   
   **Note:** If your password is empty, leave it blank:
   ```env
   DB_PASSWORD=
   ```

3. **Start the backend server**
   
   ```bash
   cd attendance\backend
   node server.js
   ```

### Option 3: Reset MySQL Password (Advanced)

If you forgot your MySQL password, you can reset it:

1. Stop MySQL service
2. Start MySQL in safe mode
3. Reset the password
4. Restart MySQL normally

(Detailed instructions vary by MySQL installation method)

## Common MySQL Passwords

Try these common default passwords:
- Empty (no password)
- `root`
- `password`
- `mysql`
- `admin`

## Verify MySQL is Running

Check if MySQL service is running:

```powershell
Get-Service -Name "*mysql*"
```

If it's not running, start it:

```powershell
Start-Service MySQL80
```

## Next Steps

Once MySQL is connected:
1. The backend will automatically create the database and tables
2. It will seed demo data (users, students)
3. The server will start on http://localhost:8000

Then you can access the frontend at http://localhost:3000 (or open index.html directly).
