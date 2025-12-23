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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create attendance_events table
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        label TEXT,
        subject VARCHAR(255),
        room VARCHAR(255),
        note TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        INDEX idx_student_id (student_id),
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
        INDEX idx_role (role)
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
    
    // Seed demo data
    const [studentRows] = await db.query('SELECT COUNT(*) as count FROM students');
    if (studentRows[0].count === 0) {
      const students = [
        ['sai', 'Sai', '/avatars/sai.jpg', 1, 1, '92460118732', 'A'],
        ['image_person', 'Image Person', '/avatars/image_person.jpg', 1, 2, null, 'A']
      ];
      
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
        
        // Insert trust score
        await db.query(`
          INSERT INTO trust_scores (student_id, score, punctuality, consistency, streak)
          VALUES (?, 100, 100, 100, 0)
          ON DUPLICATE KEY UPDATE
            student_id = VALUES(student_id)
        `, [sid]);
      }
    }
    
    // Seed users
    const [userRows] = await db.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      const { salt: salt1, hash: hash1 } = hashPassword('hodpass');
      await db.query(`
        INSERT INTO users (username, password_hash, salt, role, display_name)
        VALUES (?, ?, ?, ?, ?)
      `, ['hod', hash1, salt1, 'hod', 'Head of Department']);
      
      const { salt: salt2, hash: hash2 } = hashPassword('teacher1pass');
      await db.query(`
        INSERT INTO users (username, password_hash, salt, role, display_name, assigned_classes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['teacher1', hash2, salt2, 'teacher', 'Mrs. Teacher', 'A,B']);
      
      const { salt: salt3, hash: hash3 } = hashPassword('92460118732');
      await db.query(`
        INSERT INTO users (username, password_hash, salt, role, display_name, student_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['sai', hash3, salt3, 'parent', 'Sai\'s Parent', 'sai']);
    }
    
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

