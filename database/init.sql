-- database/init.sql
-- Run this on your MySQL server to create the base schema

CREATE DATABASE IF NOT EXISTS intelligent_community DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE intelligent_community;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('resident','property','admin') NOT NULL DEFAULT 'resident',
  real_name VARCHAR(200),
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Houses
CREATE TABLE IF NOT EXISTS houses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  building VARCHAR(50),
  unit VARCHAR(50),
  room VARCHAR(50),
  owner_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Repair orders / work orders
CREATE TABLE IF NOT EXISTS repair_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  house_id BIGINT UNSIGNED NULL,
  title VARCHAR(200),
  description TEXT,
  images JSON NULL,
  status ENUM('open','in_progress','completed','cancelled') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payments (basic)
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  house_id BIGINT UNSIGNED NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  paid_at TIMESTAMP NULL,
  status ENUM('pending','paid','overdue') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Visitors / appointments
CREATE TABLE IF NOT EXISTS visitors (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  visitor_name VARCHAR(200),
  phone VARCHAR(50),
  user_id BIGINT UNSIGNED NULL, -- resident who invited
  visit_time DATETIME,
  qr_code VARCHAR(500) NULL,
  status ENUM('pending','approved','denied','used') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for common queries
CREATE INDEX idx_repair_user ON repair_orders(user_id);
CREATE INDEX idx_payment_user ON payments(user_id);