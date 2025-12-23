# MySQL Setup Guide

## Quick Setup

### 1. Install MySQL

**Windows:**
- Download MySQL Installer from https://dev.mysql.com/downloads/installer/
- Run installer and follow instructions
- Remember your root password

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

### 2. Create Database User (Optional)

```sql
CREATE USER 'attendance_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON attendance_db.* TO 'attendance_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure Backend

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=attendance_db
PORT=8000
NODE_ENV=development
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Server

The database and tables will be created automatically on first run:

```bash
npm start
```

## Manual Database Setup (Optional)

If you prefer to create the database manually:

1. **Login to MySQL:**
```bash
mysql -u root -p
```

2. **Create database:**
```sql
CREATE DATABASE attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **Run initialization script:**
```bash
mysql -u root -p attendance_db < src/database/init.sql
```

## Verification

### Test Database Connection

```bash
mysql -u root -p -e "USE attendance_db; SHOW TABLES;"
```

You should see:
- students
- attendance_events
- trust_scores
- users
- insights

### Test API

```bash
curl http://localhost:8000/api/healthz
```

## Common Issues

### 1. Connection Refused

**Problem:** `ER_CONNECTION_REFUSED`

**Solution:**
- Ensure MySQL server is running: `sudo systemctl status mysql` (Linux) or check Services (Windows)
- Verify host and port in `.env`
- Check firewall settings

### 2. Access Denied

**Problem:** `ER_ACCESS_DENIED_ERROR`

**Solution:**
- Verify username and password in `.env`
- Check user permissions:
  ```sql
  SHOW GRANTS FOR 'your_user'@'localhost';
  ```
- Grant permissions if needed:
  ```sql
  GRANT ALL PRIVILEGES ON attendance_db.* TO 'your_user'@'localhost';
  FLUSH PRIVILEGES;
  ```

### 3. Database Doesn't Exist

**Problem:** `ER_BAD_DB_ERROR`

**Solution:**
- Database will be created automatically on first run
- Or create manually:
  ```sql
  CREATE DATABASE attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

## Production Recommendations

1. **Use dedicated database user** (not root)
2. **Set strong passwords**
3. **Enable SSL connections**
4. **Configure connection pooling**
5. **Set up regular backups**
6. **Monitor query performance**

