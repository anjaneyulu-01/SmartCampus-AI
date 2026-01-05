import mysql from 'mysql2/promise';
import { dbConfig } from '../config/database.js';
import { hashPassword } from '../utils/password.js';

let pool = null;

/**
 * Get database connection pool
 */
export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('[INFO] MySQL connection pool created');
  }
  return pool;
}

/**
 * Close database connection pool
 */
export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[INFO] Database connection pool closed');
  }
}

/**
 * Initialize database - create database and tables if they don't exist
 */
export async function initDb() {
  try {
    // First, create database if it doesn't exist
    const adminPool = mysql.createPool({
      ...dbConfig,
      database: undefined // Connect without database first
    });
    
    await adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`[INFO] Database '${dbConfig.database}' ready`);
    await adminPool.end();
    
    // Now connect to the database and create tables
    const db = getPool();
    
    // Create departments table (branches)
    await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        code VARCHAR(50) NOT NULL UNIQUE,
        hod_username VARCHAR(255),
        building VARCHAR(255),
        contact_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create classes/sections table
    await db.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        department_id INT NOT NULL,
        academic_year VARCHAR(20),
        semester INT,
        total_students INT,
        class_mentor VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE,
        INDEX idx_department_id (department_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create announcements table
    await db.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        department_id INT NULL,
        created_by VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL,
        INDEX idx_department_id (department_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create faculty table
    await db.query(`
      CREATE TABLE IF NOT EXISTS faculty (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        department_id INT NOT NULL,
        designation VARCHAR(100),
        specialization TEXT,
        office_room VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE,
        INDEX idx_department_id (department_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create workers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS workers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        department_id INT,
        designation VARCHAR(100),
        worker_type ENUM('administrative', 'maintenance', 'security', 'support', 'other') DEFAULT 'support',
        office_room VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL,
        INDEX idx_department_id (department_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create students table
    await db.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        seat_row INT,
        seat_col INT,
        mobile VARCHAR(50),
        class VARCHAR(50),
        department_id INT,
        class_id INT,
        enrollment_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE SET NULL,
        INDEX idx_department_id (department_id),
        INDEX idx_class_id (class_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create attendance_events table
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(255),
        entity_id VARCHAR(255),
        entity_type ENUM('student', 'faculty', 'worker') DEFAULT 'student',
        type VARCHAR(50) NOT NULL,
        ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        label TEXT,
        subject VARCHAR(255),
        room VARCHAR(255),
        note TEXT,
        confidence_score FLOAT,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        INDEX idx_student_id (student_id),
        INDEX idx_entity (entity_id, entity_type),
        INDEX idx_ts (ts)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create trust_scores table
    await db.query(`
      CREATE TABLE IF NOT EXISTS trust_scores (
        student_id VARCHAR(255) PRIMARY KEY,
        score INT DEFAULT 100,
        punctuality INT DEFAULT 100,
        consistency INT DEFAULT 100,
        streak INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create messages table (teacher & hod inbox/sent)
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender VARCHAR(255) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        body TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_recipient (recipient, is_read),
        INDEX idx_sender (sender)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create leave requests table
    await db.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_username VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        approver VARCHAR(255),
        resolution_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_teacher (teacher_username),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(255) PRIMARY KEY,
        password_hash VARCHAR(255) NOT NULL,
        salt VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        display_name VARCHAR(255),
        student_id VARCHAR(255),
        assigned_classes VARCHAR(255),
        department_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        INDEX idx_role (role),
        INDEX idx_department_id (department_id),
        FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create insights table
    await db.query(`
      CREATE TABLE IF NOT EXISTS insights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kind VARCHAR(50),
        text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        impact INT DEFAULT 0,
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Store face encodings per student (JSON array of floats).
    // This is used by the standalone biometric scan pipeline.
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_face_encodings (
        student_id VARCHAR(255) PRIMARY KEY,
        encoding_json MEDIUMTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Ensure schema upgrades on existing tables (ignore duplicates gracefully)
    const safeAlter = async (sql) => {
      try {
        await db.query(sql);
      } catch (err) {
        if (err && (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060 || err.code === 'ER_DUP_KEYNAME')) {
          return;
        }
        throw err;
      }
    };

    await safeAlter(`ALTER TABLE students ADD COLUMN department_id INT NULL`);
    await safeAlter(`ALTER TABLE students ADD COLUMN class_id INT NULL`);
    await safeAlter(`ALTER TABLE students ADD COLUMN enrollment_number VARCHAR(50) NULL`);
    await safeAlter(`ALTER TABLE students ADD INDEX idx_department_id (department_id)`);
    await safeAlter(`ALTER TABLE students ADD INDEX idx_class_id (class_id)`);
    await safeAlter(`ALTER TABLE attendance_events ADD COLUMN entity_id VARCHAR(255)`);
    await safeAlter(`ALTER TABLE attendance_events ADD COLUMN entity_type ENUM('student','faculty','worker') DEFAULT 'student'`);
    await safeAlter(`ALTER TABLE attendance_events ADD INDEX idx_entity (entity_id, entity_type)`);
    await safeAlter(`ALTER TABLE attendance_events ADD COLUMN confidence_score FLOAT NULL`);
    await safeAlter(`ALTER TABLE users ADD COLUMN department_id INT NULL`);
    await safeAlter(`ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE`);
    await safeAlter(`ALTER TABLE users ADD INDEX idx_department_id (department_id)`);

    // For older databases: ensure the face encodings table exists.
    // (CREATE TABLE IF NOT EXISTS above handles fresh installs.)

    // Seed branches (departments), classes, faculty, workers, and demo students
    const branches = [
      { name: 'Computer Science & Engineering', code: 'CSE', building: 'Tech Block', contact_email: 'cse@university.edu', hod_username: 'hod' },
      { name: 'Information Technology', code: 'IT', building: 'Innovation Center', contact_email: 'it@university.edu' },
      { name: 'Electronics & Communication', code: 'ECE', building: 'Electro Hub', contact_email: 'ece@university.edu' },
      { name: 'Mechanical Engineering', code: 'ME', building: 'Workshop Block', contact_email: 'me@university.edu' },
      { name: 'Civil Engineering', code: 'CE', building: 'Structures Block', contact_email: 'ce@university.edu' },
      { name: 'Law', code: 'LAW', building: 'Justice Block', contact_email: 'law@university.edu' },
      { name: 'Pharmacy', code: 'PHAR', building: 'Health Sciences', contact_email: 'phar@university.edu' },
      { name: 'Management (MBA)', code: 'MBA', building: 'Biz Block', contact_email: 'mba@university.edu' },
      { name: 'Business Administration (BBA)', code: 'BBA', building: 'Biz Block 2', contact_email: 'bba@university.edu' },
      { name: 'Architecture', code: 'ARCH', building: 'Design Block', contact_email: 'arch@university.edu' }
    ];

    const sections = ['A','B','C','D','E','F','G','H','I','J'];

    for (const branch of branches) {
      await db.query(`
        INSERT INTO departments (name, code, hod_username, building, contact_email)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          hod_username = VALUES(hod_username),
          building = VALUES(building),
          contact_email = VALUES(contact_email)
      `, [branch.name, branch.code, branch.hod_username || null, branch.building || null, branch.contact_email || null]);

      const [deptRows] = await db.query('SELECT id FROM departments WHERE code = ?', [branch.code]);
      const deptId = deptRows?.[0]?.id;
      if (!deptId) continue;

      for (const sec of sections) {
        const className = `${branch.code} Section ${sec}`;
        const classCode = `${branch.code}-${sec}`;
        await db.query(`
          INSERT INTO classes (name, code, department_id, academic_year, semester, total_students, class_mentor)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            department_id = VALUES(department_id),
            academic_year = VALUES(academic_year),
            semester = VALUES(semester),
            class_mentor = VALUES(class_mentor)
        `, [className, classCode, deptId, '2024-2025', 1, 0, branch.hod_username || null]);

        const [classRows] = await db.query('SELECT id FROM classes WHERE code = ?', [classCode]);
        const classId = classRows?.[0]?.id;

        // Seed a sample student per section
        const studentId = `${branch.code}-${sec}-01`;
        await db.query(`
          INSERT INTO students (id, name, avatar_url, seat_row, seat_col, mobile, class, department_id, class_id, enrollment_number)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            avatar_url = VALUES(avatar_url),
            seat_row = VALUES(seat_row),
            seat_col = VALUES(seat_col),
            mobile = VALUES(mobile),
            class = VALUES(class),
            department_id = VALUES(department_id),
            class_id = VALUES(class_id),
            enrollment_number = VALUES(enrollment_number)
        `, [
          studentId,
          `Student ${branch.code} ${sec}`,
          '/avatars/default.jpg',
          1,
          1,
          null,
          classCode,
          deptId,
          classId || null,
          `${branch.code}${sec}001`
        ]);

        await db.query(`
          INSERT INTO trust_scores (student_id, score, punctuality, consistency, streak)
          VALUES (?, 100, 100, 100, 0)
          ON DUPLICATE KEY UPDATE
            student_id = VALUES(student_id)
        `, [studentId]);
      }

      // Seed a couple of faculty members per department
      const facultySeed = [
        { id: `${branch.code}-FAC1`, name: `${branch.code} Lead`, designation: 'Professor', specialization: branch.name, office_room: '101' },
        { id: `${branch.code}-FAC2`, name: `${branch.code} Lecturer`, designation: 'Assistant Professor', specialization: branch.name, office_room: '102' }
      ];

      for (const f of facultySeed) {
        await db.query(`
          INSERT INTO faculty (id, name, email, phone, department_id, designation, specialization, office_room)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            email = VALUES(email),
            phone = VALUES(phone),
            department_id = VALUES(department_id),
            designation = VALUES(designation),
            specialization = VALUES(specialization),
            office_room = VALUES(office_room)
        `, [
          f.id,
          f.name,
          `${f.id.toLowerCase()}@university.edu`,
          null,
          deptId,
          f.designation,
          f.specialization,
          f.office_room
        ]);
      }

      // Seed a worker/staff member per department
      await db.query(`
        INSERT INTO workers (id, name, email, phone, department_id, designation, worker_type, office_room)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          email = VALUES(email),
          phone = VALUES(phone),
          department_id = VALUES(department_id),
          designation = VALUES(designation),
          worker_type = VALUES(worker_type),
          office_room = VALUES(office_room)
      `, [
        `${branch.code}-WRK1`,
        `${branch.code} Admin`,
        `${branch.code.toLowerCase()}-worker@university.edu`,
        null,
        deptId,
        'Department Office',
        'administrative',
        'Admin-1'
      ]);
    }

    // Seed demo data (safe to re-run)
    const students = [];
    
    for (const [sid, name, avatar, r, c, mobile, cls] of students) {
      await db.query(`
        INSERT INTO students (id, name, avatar_url, seat_row, seat_col, mobile, class)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          avatar_url = VALUES(avatar_url),
          seat_row = VALUES(seat_row),
          seat_col = VALUES(seat_col),
          mobile = VALUES(mobile),
          class = VALUES(class)
      `, [sid, name, avatar, r, c, mobile, cls]);
      
      // Ensure trust score exists
      await db.query(`
        INSERT INTO trust_scores (student_id, score, punctuality, consistency, streak)
        VALUES (?, 100, 100, 100, 0)
        ON DUPLICATE KEY UPDATE
          student_id = VALUES(student_id)
      `, [sid]);
    }

    // Ensure dataset folder names are registered as students so face matches do not 400
    const datasetStudents = ['Anjaneyulu', 'Rahul', 'Santhosh'];
    for (const sid of datasetStudents) {
      await db.query(`
        INSERT IGNORE INTO students (id, name)
        VALUES (?, ?)
      `, [sid, sid]);

      await db.query(`
        INSERT IGNORE INTO trust_scores (student_id, score, punctuality, consistency, streak)
        VALUES (?, 100, 100, 100, 0)
      `, [sid]);
    }
    
    // Seed users
    const [userRows] = await db.query('SELECT COUNT(*) as count FROM users');
    const [cseDept] = await db.query('SELECT id FROM departments WHERE code = ?', ['CSE']);
    const cseDeptId = cseDept?.[0]?.id || null;

    if (userRows[0].count === 0) {
      // Default HOD (CSE)
      const { salt: salt1, hash: hash1 } = hashPassword('hodpass');
      await db.query(`
        INSERT INTO users (username, password_hash, salt, role, display_name, department_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['hod', hash1, salt1, 'hod', 'Head of Department', cseDeptId]);
      
      // Default Teacher (demo: teacher / pass123)
      const { salt: salt2, hash: hash2 } = hashPassword('pass123');
      await db.query(`
        INSERT INTO users (username, password_hash, salt, role, display_name, assigned_classes, department_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['teacher', hash2, salt2, 'teacher', 'Demo Teacher', 'A,B', cseDeptId]);

    }

    // Ensure demo teacher exists even if table already had users
    const { salt: demoSalt, hash: demoHash } = hashPassword('pass123');
    await db.query(`
      INSERT INTO users (username, password_hash, salt, role, display_name, assigned_classes, department_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        salt = VALUES(salt),
        role = VALUES(role),
        display_name = VALUES(display_name),
        assigned_classes = VALUES(assigned_classes),
        department_id = VALUES(department_id)
    `, ['teacher', demoHash, demoSalt, 'teacher', 'Demo Teacher', 'A,B', cseDeptId]);
    
    console.log('[INFO] DB initialized / seeded');
  } catch (error) {
    console.error('[ERROR] Database initialization failed:', error);
    throw error;
  }
}

/**
 * Execute a query (INSERT, UPDATE, DELETE)
 */
export async function dbRun(query, params = []) {
  try {
    const db = getPool();
    const [result] = await db.execute(query, params);
    return {
      lastID: result.insertId,
      changes: result.affectedRows
    };
  } catch (error) {
    console.error('[ERROR] dbRun error:', error);
    throw error;
  }
}

/**
 * Get a single row
 */
export async function dbGet(query, params = []) {
  try {
    const db = getPool();
    const [rows] = await db.execute(query, params);
    return rows[0] || null;
  } catch (error) {
    console.error('[ERROR] dbGet error:', error);
    throw error;
  }
}

/**
 * Get all rows
 */
export async function dbAll(query, params = []) {
  try {
    const db = getPool();
    const [rows] = await db.execute(query, params);
    return rows || [];
  } catch (error) {
    console.error('[ERROR] dbAll error:', error);
    throw error;
  }
}

