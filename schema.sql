-- ActionFlow AI - MySQL Database Schema Export
-- Generated for Traction Shastra Assignment
-- Database: MySQL 8.x

DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `messages`;

-- 1. Messages Table
CREATE TABLE `messages` (
  `id` VARCHAR(50) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `sender_name` VARCHAR(100) NOT NULL,
  `sender_email` VARCHAR(150) NOT NULL,
  `recipient` VARCHAR(150) NOT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `date` DATETIME NOT NULL,
  `content` TEXT NOT NULL,
  `is_analyzed` TINYINT(1) NOT NULL DEFAULT 0,
  `summary` TEXT,
  `category` VARCHAR(50) DEFAULT NULL,
  `priority` VARCHAR(20) DEFAULT NULL,
  `response_required` TINYINT(1) DEFAULT NULL,
  `suggested_reply` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_messages_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tasks Table
CREATE TABLE `tasks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `message_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `priority` VARCHAR(20) NOT NULL,
  `due_date` DATETIME DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_tasks_id` (`id`),
  KEY `ix_tasks_message_id` (`message_id`),
  CONSTRAINT `fk_tasks_message_id` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;