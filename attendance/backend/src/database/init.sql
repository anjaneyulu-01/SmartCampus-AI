-- MySQL Database Initialization Script
-- Run this script to manually create the database and tables

CREATE DATABASE IF NOT EXISTS attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE attendance_db;

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  seat_row INT,
  seat_col INT,
  mobile VARCHAR(50),
  class VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance events table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trust scores table
CREATE TABLE IF NOT EXISTS trust_scores (
  student_id VARCHAR(255) PRIMARY KEY,
  score INT DEFAULT 100,
  punctuality INT DEFAULT 100,
  consistency INT DEFAULT 100,
  streak INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(255) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  display_name VARCHAR(255),
  student_id VARCHAR(255),
  assigned_classes VARCHAR(255),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kind VARCHAR(50),
  text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  impact INT DEFAULT 0,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

