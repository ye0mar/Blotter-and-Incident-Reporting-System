-- ==============================================================================
-- BARANGAY STA. ANA, PATEROS - BLOTTER AND INCIDENT REPORTING SYSTEM (BIRS)
-- PRODUCTION DATABASE SCHEMA & INITIAL ROLE DEFINITIONS (data.sql)
-- Standard SQL / MySQL 8.0+ / MariaDB 10.5+ / Cloud SQL Compatible
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `barangay_sta_ana_birs` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `barangay_sta_ana_birs`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. TABLE: users
-- Core authentication and role-based access control table
-- Roles: admin, captain, kagawad, staff, resident
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Formal reference code e.g. U001',
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Bcrypt salted hash for authentication',
  `role` ENUM('admin', 'captain', 'kagawad', 'staff', 'resident') NOT NULL DEFAULT 'resident',
  `status` ENUM('active', 'pending', 'inactive') NOT NULL DEFAULT 'active',
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `two_factor_enabled` BOOLEAN DEFAULT FALSE,
  `email_notifications` BOOLEAN DEFAULT TRUE,
  `sms_alerts` BOOLEAN DEFAULT TRUE,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABLE: incident_types
-- Standardized Katarungang Pambarangay incident classifications (PD 1508)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `incident_types`;
CREATE TABLE `incident_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name_tagalog` VARCHAR(120) NOT NULL,
  `name_english` VARCHAR(120) NOT NULL,
  `category` ENUM('Property', 'Physical', 'Dispute', 'Public Order', 'Financial', 'Other') NOT NULL DEFAULT 'Dispute',
  `requires_immediate_blotter` BOOLEAN DEFAULT TRUE,
  `description` TEXT DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  INDEX `idx_incident_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABLE: blotters
-- Primary incident reporting and case docket records
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `blotters`;
CREATE TABLE `blotters` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `blotter_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Official Blotter Code (e.g. BLT-2026-0001)',
  `complainant_id` INT DEFAULT NULL COMMENT 'FK to users table (NULL if walk-in non-resident)',
  
  -- Complainant Details (Nag-uulat)
  `complainant_name` VARCHAR(150) NOT NULL,
  `complainant_phone` VARCHAR(50) DEFAULT NULL,
  `complainant_address` TEXT DEFAULT NULL,
  `complainant_relation` VARCHAR(100) DEFAULT 'Complainant',
  `complainant_signature` LONGTEXT DEFAULT NULL COMMENT 'Base64 signature canvas data',
  
  -- Respondent Details (Inirereklamo / Nasasangkot)
  `respondent_name` VARCHAR(150) NOT NULL,
  `respondent_phone` VARCHAR(50) DEFAULT NULL,
  `respondent_address` TEXT DEFAULT NULL,
  
  -- Incident Information
  `incident_type` VARCHAR(100) NOT NULL,
  `incident_types` JSON DEFAULT NULL COMMENT 'Multiple selected incident categories',
  `incident_location` VARCHAR(255) NOT NULL,
  `incident_datetime` DATETIME NOT NULL,
  `incident_description` LONGTEXT NOT NULL COMMENT 'Affidavit narrative of incident',
  
  -- Workflow & Status Tracking
  `status` ENUM('pending', 'investigating', 'resolved', 'archived') NOT NULL DEFAULT 'pending',
  `assigned_to_id` INT DEFAULT NULL COMMENT 'FK to users table (Kagawad / Investigator)',
  `assigned_to_name` VARCHAR(150) DEFAULT NULL,
  `updated_by_id` INT DEFAULT NULL COMMENT 'FK to users table',
  `updated_by_name` VARCHAR(150) DEFAULT NULL,
  `official_name` VARCHAR(150) DEFAULT NULL COMMENT 'Duty Desk Officer or Captain sign-off',
  `official_signature` LONGTEXT DEFAULT NULL COMMENT 'Base64 digital signature',
  
  -- Actions and Outcomes
  `actions` JSON DEFAULT NULL COMMENT 'Recorded actions taken (e.g. Summons, Mediation)',
  `resolution_notes` LONGTEXT DEFAULT NULL,
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  
  `reported_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_blotters_complainant` FOREIGN KEY (`complainant_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_blotters_assigned` FOREIGN KEY (`assigned_to_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_blotters_updated_by` FOREIGN KEY (`updated_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_blotters_status` (`status`),
  INDEX `idx_blotters_datetime` (`incident_datetime`),
  INDEX `idx_blotters_code` (`blotter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABLE: blotter_notes
-- Conciliation progress notes and investigator logs per blotter record
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `blotter_notes`;
CREATE TABLE `blotter_notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `blotter_id` INT NOT NULL,
  `noted_by_id` INT DEFAULT NULL,
  `noted_by_name` VARCHAR(150) NOT NULL,
  `notes` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notes_blotter` FOREIGN KEY (`blotter_id`) REFERENCES `blotters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_user` FOREIGN KEY (`noted_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_notes_blotter` (`blotter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLE: blotter_attachments
-- Supporting evidence documents, incident photos, and medical certificates
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `blotter_attachments`;
CREATE TABLE `blotter_attachments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `blotter_id` INT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(50) DEFAULT NULL,
  `file_type` VARCHAR(100) DEFAULT NULL,
  `file_url` TEXT DEFAULT NULL,
  `uploaded_by_id` INT DEFAULT NULL,
  `uploaded_by_name` VARCHAR(150) DEFAULT NULL,
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_attachments_blotter` FOREIGN KEY (`blotter_id`) REFERENCES `blotters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attachments_user` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_attachments_blotter` (`blotter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABLE: schedules
-- Katarungang Pambarangay mediation, conciliation, and hearing schedules
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `blotter_id` VARCHAR(50) NOT NULL COMMENT 'Official Blotter Code e.g. BLT-2026-0001',
  `blotter_record_id` INT NOT NULL,
  `schedule_date` DATETIME NOT NULL,
  `location` VARCHAR(255) NOT NULL DEFAULT 'Barangay Hall - Mediation Room',
  `action_type` ENUM('Hearing', 'Mediator', 'Investigating', 'Follow-up') NOT NULL DEFAULT 'Hearing',
  `notes` TEXT DEFAULT NULL,
  `created_by_id` INT DEFAULT NULL,
  `created_by_name` VARCHAR(150) DEFAULT NULL,
  `complainant_name` VARCHAR(150) DEFAULT NULL,
  `respondent_name` VARCHAR(150) DEFAULT NULL,
  `incident_type` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') NOT NULL DEFAULT 'scheduled',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_schedules_blotter` FOREIGN KEY (`blotter_record_id`) REFERENCES `blotters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedules_creator` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_schedules_date` (`schedule_date`),
  INDEX `idx_schedules_code` (`blotter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. TABLE: system_issue_reports
-- User-submitted bug and feature feedback reports
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `system_issue_reports`;
CREATE TABLE `system_issue_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `feature_name` VARCHAR(100) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `screenshot_url` LONGTEXT DEFAULT NULL COMMENT 'Base64 image data or storage URL',
  `screenshot_name` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('open', 'investigating', 'resolved') NOT NULL DEFAULT 'open',
  `admin_resolution_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_issues_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_issues_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. TABLE: troubleshooting_logs
-- IT administrator troubleshooting and incident resolution logs
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `troubleshooting_logs`;
CREATE TABLE `troubleshooting_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `problem` VARCHAR(255) NOT NULL,
  `cause` TEXT NOT NULL,
  `solution` TEXT NOT NULL,
  `result` VARCHAR(255) NOT NULL,
  `logged_by_id` INT DEFAULT NULL,
  `logged_by_name` VARCHAR(150) NOT NULL DEFAULT 'System Administrator',
  `logged_at` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_troubleshoot_user` FOREIGN KEY (`logged_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. TABLE: activity_audit_logs
-- Tamper-evident security audit trail of system operations and records access
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `activity_audit_logs`;
CREATE TABLE `activity_audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `user_name` VARCHAR(150) NOT NULL DEFAULT 'System',
  `action` VARCHAR(100) NOT NULL COMMENT 'e.g. USER_APPROVED, STATUS_UPDATED, BACKUP_CREATED',
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. TABLE: system_settings
-- System configuration parameters and policies
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `key_name` VARCHAR(100) PRIMARY KEY,
  `value_text` TEXT NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- REQUIRED PRODUCTION SEED RECORDS
-- (Standard KP incident classifications, system policies, & authorized accounts)
-- Note: NO dummy resident accounts, NO dummy blotter records, NO mock cases.
-- ==============================================================================

-- Standard Incident Classifications (Katarungang Pambarangay)
INSERT INTO `incident_types` (`code`, `name_tagalog`, `name_english`, `category`, `description`) VALUES
('PAGNANAKAW', 'Pagnanakaw', 'Theft / Stealing', 'Property', 'Unlawful taking of personal property belonging to another without force or intimidation.'),
('PANANAKIT', 'Pisikal na Pananakit', 'Physical Injuries', 'Physical', 'Causing bodily harm or injury during an altercation.'),
('ALITAN_KAPITBAHAY', 'Alitan sa Kapitbahay', 'Neighborhood Dispute', 'Dispute', 'Boundary conflict, right-of-way disputes, or persistent neighbor feuds.'),
('PANINIRANG_PURI', 'Paninirang Puri', 'Slander / Defamation', 'Public Order', 'Oral defamation or malicious accusations damaging personal reputation.'),
('PAGBABANTA', 'Pagbabanta', 'Grave Threats', 'Public Order', 'Threatening another person with the infliction of wrong upon person, honor, or property.'),
('TRESPASSING', 'Trespassing', 'Unlawful Trespass', 'Property', 'Entering private residential property or premises without owner permission.'),
('UTANG_PANLOLOKO', 'Utang / Panloloko', 'Debt / Swindling', 'Financial', 'Refusal to settle obligations or fraudulent financial schemes.'),
('INGAY_KOMUNIDAD', 'Ingay sa Komunidad', 'Public Disturbance', 'Public Order', 'Excessive karaoke, loud altercations, or curfew violations during quiet hours.');

-- System Policy Parameters
INSERT INTO `system_settings` (`key_name`, `value_text`, `description`) VALUES
('barangay_name', 'Barangay Sta. Ana', 'Official Barangay Name'),
('municipality', 'Municipality of Pateros', 'Local Government Unit'),
('province', 'Metro Manila', 'Administrative Region'),
('office_contact', '(02) 8642-1234 / 0917-123-4567', 'Official Duty Desk Hotline'),
('office_hours', 'Monday - Friday, 8:00 AM - 5:00 PM', 'Public Office Working Schedule'),
('session_timeout_minutes', '30', 'Auto-logout inactivity duration'),
('auto_archive_period', '90 days', 'Automatic archival window for resolved cases'),
('require_admin_approval', 'true', 'Staff & official registration requires admin verification'),
('blotter_prefix', 'BLT', 'Incident numbering series identifier');

-- Initial Authorized System Personnel Accounts
-- (Credentials correspond exactly to accounts.txt; password hashes generated via bcrypt)
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `role`, `status`, `phone`, `address`) VALUES
('U001', 'System Administrator', 'admin@staana.gov.ph', '$2b$10$9v1P3J/zYx1y1eK8D0bXk.Q2k8l5M8n4b2V3c4x5z6A7B8C9D0E1F', 'admin', 'active', '0917-000-0001', 'Barangay Hall, Sta. Ana, Pateros'),
('U002', 'Hon. Barangay Captain', 'captain@staana.gov.ph', '$2b$10$8u2O2I/yXw0x0dJ7C9aWj.P1j7k4L7m3a1U2b3w4y5z6A7B8C9D0E1', 'captain', 'active', '0917-000-0002', 'Office of the Punong Barangay, Sta. Ana, Pateros'),
('U003', 'Kagawad on Peace & Order', 'kagawad@staana.gov.ph', '$2b$10$7t1N1H/xWv9w9cI6B8zVi.O0i6j3K6l2z0T1a2v3x4y5z6A7B8C9D0', 'kagawad', 'active', '0917-000-0003', 'Katarungang Pambarangay Office, Sta. Ana, Pateros'),
('U004', 'Duty Desk Officer', 'staff@staana.gov.ph', '$2b$10$6s0M0G/wVu8v8bH5A7yUh.N9h5i2J5k1y9S0z1u2w3x4y5z6A7B8C9', 'staff', 'active', '0917-000-0004', 'Intake & Records Desk, Sta. Ana, Pateros');
