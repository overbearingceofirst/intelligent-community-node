-- 智慧社区数据库初始化脚本（已去重）

CREATE DATABASE IF NOT EXISTS intelligent_community
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE intelligent_community;

-- --- 基础表定义 ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role ENUM('resident','manager','admin') DEFAULT 'resident',
  real_name_verified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS houses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  building VARCHAR(50),
  unit VARCHAR(50),
  number VARCHAR(50),
  owner_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS repairs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  house_id INT,
  title VARCHAR(200),
  description TEXT,
  status ENUM('submitted','accepted','processing','completed','cancelled') DEFAULT 'submitted',
  assignee_id INT NULL,
  priority ENUM('low','medium','high') DEFAULT 'medium',
  scheduled_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS repair_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  repair_id INT NOT NULL,
  user_id INT NULL,
  action VARCHAR(100),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (repair_id) REFERENCES repairs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  paid TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS visitors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitor_name VARCHAR(100),
  user_id INT,
  house_id INT,
  visit_time DATETIME,
  qr_code VARCHAR(255),
  verified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  meta JSON NULL,
  `read` TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS points_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  `change` INT NOT NULL,
  type ENUM('earn','redeem','admin_adjust') NOT NULL,
  note VARCHAR(255),
  related_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cost_points INT NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS redemptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reward_id INT NOT NULL,
  status ENUM('pending','completed','cancelled') DEFAULT 'pending',
  qr_token VARCHAR(255) NULL,
  expires_at DATETIME NULL,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_redemptions_qr_token (qr_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 互助贴
CREATE TABLE IF NOT EXISTS help_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  images JSON NULL,
  anonymous TINYINT(1) DEFAULT 0,
  reward VARCHAR(255) NULL,
  status ENUM('pending','open','rejected','closed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 之后所有的 ALTER 块都只在列/索引不存在时执行 ------------------------

SET @col_points := (SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_schema=DATABASE() AND table_name='users' AND column_name='points');
SET @sql := IF(@col_points=0,'ALTER TABLE users ADD COLUMN points INT DEFAULT 0','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_email := (SELECT COUNT(*) FROM information_schema.columns
                   WHERE table_schema=DATABASE() AND table_name='users' AND column_name='email');
SET @sql := IF(@col_email=0,'ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_push := (SELECT COUNT(*) FROM information_schema.columns
                  WHERE table_schema=DATABASE() AND table_name='users' AND column_name='push_token');
SET @sql := IF(@col_push=0,'ALTER TABLE users ADD COLUMN push_token VARCHAR(255) NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_phone := (SELECT COUNT(*) FROM information_schema.columns
                   WHERE table_schema=DATABASE() AND table_name='users' AND column_name='phone');
SET @sql := IF(@col_phone=0,'ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_vphone := (SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_schema=DATABASE() AND table_name='visitors' AND column_name='visitor_phone');
SET @sql := IF(@col_vphone=0,'ALTER TABLE visitors ADD COLUMN visitor_phone VARCHAR(50) NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_qr_vis := (SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_schema=DATABASE() AND table_name='visitors' AND column_name='qr_token');
SET @sql := IF(@col_qr_vis=0,'ALTER TABLE visitors ADD COLUMN qr_token VARCHAR(255) NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exp := (SELECT COUNT(*) FROM information_schema.columns
                 WHERE table_schema=DATABASE() AND table_name='visitors' AND column_name='expires_at');
SET @sql := IF(@col_exp=0,'ALTER TABLE visitors ADD COLUMN expires_at DATETIME NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_status := (SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_schema=DATABASE() AND table_name='visitors' AND column_name='status');
SET @sql := IF(@col_status=0,
               'ALTER TABLE visitors ADD COLUMN status ENUM(''pending'',''approved'',''rejected'',''visited'',''expired'') DEFAULT ''pending''',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_actual := (SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_schema=DATABASE() AND table_name='visitors' AND column_name='actual_visit_time');
SET @sql := IF(@col_actual=0,'ALTER TABLE visitors ADD COLUMN actual_visit_time DATETIME NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_help_reward := (SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_schema=DATABASE() AND table_name='help_posts' AND column_name='reward');
SET @sql := IF(@col_help_reward=0,'ALTER TABLE help_posts ADD COLUMN reward VARCHAR(255) NULL','SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_help_status := (SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_schema=DATABASE() AND table_name='help_posts' AND column_name='status');
SET @sql := IF(@col_help_status=0,
               'ALTER TABLE help_posts ADD COLUMN status ENUM(''pending'',''open'',''rejected'',''closed'') DEFAULT ''pending''',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- redemptions 表结构已经在 CREATE TABLE 时包括 qr_token 和 expires_at，
-- 下面的 ALTER 只在缺失列时执行并不会报错。
SET @col_qr_red := (SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_schema=DATABASE()
                      AND table_name='redemptions'
                      AND column_name='qr_token');
SET @sql := IF(@col_qr_red=0,
               'ALTER TABLE redemptions ADD COLUMN qr_token VARCHAR(255) NULL',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exp_red := (SELECT COUNT(*) FROM information_schema.columns
                     WHERE table_schema=DATABASE()
                       AND table_name='redemptions'
                       AND column_name='expires_at');
SET @sql := IF(@col_exp_red=0,
               'ALTER TABLE redemptions ADD COLUMN expires_at DATETIME NULL',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ensure status enum default
SET @col_stat_red := (SELECT COUNT(*) FROM information_schema.columns
                      WHERE table_schema=DATABASE()
                        AND table_name='redemptions'
                        AND column_name='status');
-- (status already exists, just modify default if necessary)
SET @sql := 'ALTER TABLE redemptions MODIFY COLUMN status ENUM(''pending'',''completed'',''cancelled'') DEFAULT ''pending''';
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 由于我们在 CREATE TABLE 时已经加了唯一索引，下面仅检查
SET @idx_qr_red := (SELECT COUNT(*) FROM information_schema.statistics
                    WHERE table_schema=DATABASE()
                      AND table_name='redemptions'
                      AND index_name='idx_redemptions_qr_token');
SET @sql := IF(@idx_qr_red=0,
               'CREATE UNIQUE INDEX idx_redemptions_qr_token ON redemptions (qr_token)',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- END OF SCRIPT