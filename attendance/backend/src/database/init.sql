-- MySQL Database Initialization Script
-- Run this script to manually create the database and tables

CREATE DATABASE IF NOT EXISTS attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE attendance_db;

-- Departments/Faculties table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  hod_username VARCHAR(255),
  building VARCHAR(255),
  contact_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Classes/Batches table
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  department_id INT NOT NULL,
  academic_year VARCHAR(20),
  semester INT,
  total_students INT,
  class_mentor VARCHAR(255),
  room_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_class (code, department_id),
  INDEX idx_department_id (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  department_id INT NOT NULL,
  designation VARCHAR(100),
  specialization TEXT,
  avatar_url TEXT,
  office_room VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE,
  INDEX idx_department_id (department_id),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Workers/Staff table
CREATE TABLE IF NOT EXISTS workers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  department_id INT,
  designation VARCHAR(100),
  worker_type ENUM('administrative', 'maintenance', 'security', 'support', 'other') DEFAULT 'support',
  avatar_url TEXT,
  office_room VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_department_id (department_id),
  INDEX idx_worker_type (worker_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  avatar_url TEXT,
  department_id INT NOT NULL,
  class_id INT NOT NULL,
  enrollment_number VARCHAR(50) UNIQUE,
  seat_row INT,
  seat_col INT,
  academic_year VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
  INDEX idx_department_id (department_id),
  INDEX idx_class_id (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance events table
CREATE TABLE IF NOT EXISTS attendance_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_id VARCHAR(255) NOT NULL,
  entity_type ENUM('student', 'faculty', 'worker') DEFAULT 'student',
  type VARCHAR(50) NOT NULL,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  label TEXT,
  subject VARCHAR(255),
  room VARCHAR(255),
  note TEXT,
  confidence_score FLOAT,
  INDEX idx_entity_id (entity_id),
  INDEX idx_entity_type (entity_type),
  INDEX idx_ts (ts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trust scores table
CREATE TABLE IF NOT EXISTS trust_scores (
  entity_id VARCHAR(255) PRIMARY KEY,
  entity_type ENUM('student', 'faculty', 'worker') DEFAULT 'student',
  score INT DEFAULT 100,
  punctuality INT DEFAULT 100,
  consistency INT DEFAULT 100,
  streak INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_entity_type (entity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(255) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(255) NOT NULL,
  role ENUM('admin', 'hod', 'teacher', 'faculty', 'worker', 'student') NOT NULL,
  display_name VARCHAR(255),
  department_id INT,
  entity_id VARCHAR(255),
  entity_type ENUM('student', 'faculty', 'worker') DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_role (role),
  INDEX idx_department_id (department_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  faculty_id VARCHAR(255),
  class_id INT,
  credits INT,
  semester INT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY(faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE SET NULL,
  INDEX idx_department_id (department_id),
  INDEX idx_faculty_id (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kind VARCHAR(50),
  text TEXT,
  entity_id VARCHAR(255),
  entity_type ENUM('student', 'faculty', 'worker') DEFAULT 'student',
  severity ENUM('low', 'medium', 'high') DEFAULT 'low',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  impact INT DEFAULT 0,
  INDEX idx_created_at (created_at),
  INDEX idx_entity_id (entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by VARCHAR(255),
  department_id INT,
  target_role ENUM('all', 'admin', 'hod', 'faculty', 'worker', 'student') DEFAULT 'all',
  priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_created_at (created_at),
  INDEX idx_target_role (target_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

