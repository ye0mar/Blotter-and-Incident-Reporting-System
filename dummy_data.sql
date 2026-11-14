-- ==============================================================================
-- BARANGAY STA. ANA, PATEROS - BLOTTER AND INCIDENT REPORTING SYSTEM (BIRS)
-- DUMMY SAMPLE DATA SCRIPT (dummy_data.sql)
-- Compatible with data.sql (MySQL 8.0+ / MariaDB 10.5+ / phpMyAdmin / Cloud SQL)
-- Instructions: Run data.sql first, then paste and execute this entire script.
-- ==============================================================================

USE `barangay_sta_ana_birs`;

-- Resolve official user IDs from data.sql safely
SET @admin_id   = (SELECT `id` FROM `users` WHERE `user_id` = 'U001' LIMIT 1);
SET @captain_id = (SELECT `id` FROM `users` WHERE `user_id` = 'U002' LIMIT 1);
SET @kagawad_id = (SELECT `id` FROM `users` WHERE `user_id` = 'U003' LIMIT 1);
SET @staff_id   = (SELECT `id` FROM `users` WHERE `user_id` = 'U004' LIMIT 1);

-- ------------------------------------------------------------------------------
-- 1. DUMMY BLOTTER INCIDENTS (blotters)
-- ------------------------------------------------------------------------------
INSERT INTO `blotters` (
    `blotter_id`,
    `complainant_id`,
    `complainant_name`,
    `complainant_phone`,
    `complainant_address`,
    `complainant_relation`,
    `respondent_name`,
    `respondent_phone`,
    `respondent_address`,
    `incident_type`,
    `incident_types`,
    `incident_location`,
    `incident_datetime`,
    `incident_description`,
    `status`,
    `assigned_to_id`,
    `assigned_to_name`,
    `updated_by_id`,
    `updated_by_name`,
    `official_name`,
    `actions`,
    `resolution_notes`,
    `resolved_at`,
    `reported_at`
) VALUES
(
    'BLT-2026-0001',
    NULL,
    'Juan Dela Cruz',
    '0917-555-0101',
    '123 P. Rosales St., Purok 1, Sta. Ana, Pateros',
    'Complainant',
    'Pedro Penduko',
    '0918-555-0201',
    '125 P. Rosales St., Purok 1, Sta. Ana, Pateros',
    'Ingay sa Komunidad',
    JSON_ARRAY('Ingay sa Komunidad'),
    'Purok 1, Sta. Ana, Pateros',
    '2026-11-01 22:30:00',
    'Nagreklamo ang nag-uulat hinggil sa malakas na videoke at inuman sa tapat ng kanilang tahanan lampas alas-10:00 ng gabi.',
    'pending',
    NULL,
    NULL,
    @staff_id,
    'Duty Desk Officer',
    'Duty Desk Officer',
    JSON_ARRAY('Iskedyul ng Mediasyon', 'Pagpapadala ng Patawag (Summons)'),
    NULL,
    NULL,
    '2026-11-02 08:45:00'
),
(
    'BLT-2026-0002',
    NULL,
    'Maria Santos',
    '0919-555-0102',
    '45 M. Almeda St., Purok 3, Sta. Ana, Pateros',
    'Property Owner',
    'Ana Reyes',
    '0920-555-0202',
    '47 M. Almeda St., Purok 3, Sta. Ana, Pateros',
    'Alitan sa Kapitbahay',
    JSON_ARRAY('Alitan sa Kapitbahay'),
    'Purok 3, Sta. Ana, Pateros',
    '2026-11-03 09:15:00',
    'Pagtatalo tungkol sa itinayong bakod na umano ay lumagpas sa hangganan ng lupa ng nag-uulat.',
    'investigating',
    @kagawad_id,
    'Kagawad on Peace & Order',
    @kagawad_id,
    'Kagawad on Peace & Order',
    'Kagawad on Peace & Order',
    JSON_ARRAY('Ocular Inspection', 'Unang Pagdinig ng Lupon'),
    NULL,
    NULL,
    '2026-11-03 10:30:00'
),
(
    'BLT-2026-0003',
    NULL,
    'Roberto Gomez',
    '0917-555-0103',
    '88 B. Morcilla St., Sta. Ana, Pateros',
    'Complainant',
    'Hindi Kilala (Unknown)',
    NULL,
    'Sta. Ana, Pateros',
    'Pagnanakaw',
    JSON_ARRAY('Pagnanakaw'),
    'Barangay Plaza, Sta. Ana, Pateros',
    '2026-10-28 14:20:00',
    'Naiwan ang bisikleta malapit sa entrada ng plaza at nadiskubreng nawawala pagkalipas ng dalawampung minuto. Narekober ito sa tulong ng CCTV review.',
    'resolved',
    @kagawad_id,
    'Kagawad on Peace & Order',
    @captain_id,
    'Hon. Barangay Captain',
    'Hon. Barangay Captain',
    JSON_ARRAY('CCTV Review', 'Pagbabalik ng Ari-arian', 'Kasunduan'),
    'Naibalik ang bisikleta sa may-ari matapos ang imbestigasyon at nakipagkasundo sa himpilan ng barangay.',
    '2026-10-30 16:00:00',
    '2026-10-28 15:45:00'
),
(
    'BLT-2026-0004',
    NULL,
    'Elena Villanueva',
    '0921-555-0104',
    '19 Alley 4, Purok 2, Sta. Ana, Pateros',
    'Complainant',
    'Marco Bautista',
    '0922-555-0204',
    '22 Alley 4, Purok 2, Sta. Ana, Pateros',
    'Utang / Panloloko',
    JSON_ARRAY('Utang / Panloloko'),
    'Purok 2, Sta. Ana, Pateros',
    '2026-11-04 11:00:00',
    'Hindi pagbabayad ng napagkasunduang halaga na Php 8,500.00 na lampas na sa takdang petsa ng pagbabayad.',
    'investigating',
    @kagawad_id,
    'Kagawad on Peace & Order',
    @staff_id,
    'Duty Desk Officer',
    'Duty Desk Officer',
    JSON_ARRAY('Pagpapadala ng Patawag (Summons)', 'Iskedyul ng Mediasyon'),
    NULL,
    NULL,
    '2026-11-04 13:10:00'
),
(
    'BLT-2026-0005',
    NULL,
    'Carlos Mendoza',
    '0918-555-0105',
    '71 F. Imson St., Sta. Ana, Pateros',
    'Victim',
    'Ramon Navarro',
    '0919-555-0205',
    '75 F. Imson St., Sta. Ana, Pateros',
    'Paninirang Puri',
    JSON_ARRAY('Paninirang Puri', 'Pagbabanta'),
    'F. Imson St., Sta. Ana, Pateros',
    '2026-10-20 17:30:00',
    'Pagbibitaw ng masasakit na salita at pananakot sa harap ng mga kapitbahay. Nagkaayos ang magkabilang panig sa harap ng Punong Barangay.',
    'archived',
    @kagawad_id,
    'Kagawad on Peace & Order',
    @captain_id,
    'Hon. Barangay Captain',
    'Hon. Barangay Captain',
    JSON_ARRAY('Mediasyon ng Lupon', 'Amicable Settlement'),
    'Nilagdaan ng magkabilang panig ang Kasunduang Pag-aayos noong Oktubre 25, 2026.',
    '2026-10-25 11:00:00',
    '2026-10-20 18:15:00'
);

-- ------------------------------------------------------------------------------
-- 2. DUMMY INVESTIGATION NOTES (blotter_notes)
-- ------------------------------------------------------------------------------
INSERT INTO `blotter_notes` (
    `blotter_id`,
    `noted_by_id`,
    `noted_by_name`,
    `notes`,
    `created_at`
) VALUES
(
    (SELECT `id` FROM `blotters` WHERE `blotter_id` = 'BLT-2026-0002' LIMIT 1),
    @kagawad_id,
    'Kagawad on Peace & Order',
    'Nagsagawa ng paunang pagbisita sa lugar. Hiniling sa magkabilang panig na dalhin ang kopya ng titulo o sketch plan sa susunod na pagdinig.',
    '2026-11-03 15:20:00'
),
(
    (SELECT `id` FROM `blotters` WHERE `blotter_id` = 'BLT-2026-0003' LIMIT 1),
    @kagawad_id,
    'Kagawad on Peace & Order',
    'Sinuri ang barangay CCTV footage sa Plaza at natukoy ang kinaroroonan ng bisikleta. Naibalik nang maayos sa nag-uulat.',
    '2026-10-30 15:30:00'
),
(
    (SELECT `id` FROM `blotters` WHERE `blotter_id` = 'BLT-2026-0004' LIMIT 1),
    @kagawad_id,
    'Kagawad on Peace & Order',
    'Naipadala na ang unang patawag (Summons) sa inirereklamo para sa nakatakdang mediasyon.',
    '2026-11-05 09:40:00'
);

-- ------------------------------------------------------------------------------
-- 3. DUMMY HEARING & MEDIATION SCHEDULES (schedules)
-- Valid action_type ENUM: 'Hearing', 'Mediator', 'Investigating', 'Follow-up'
-- Valid status ENUM: 'scheduled', 'completed', 'cancelled', 'rescheduled'
-- ------------------------------------------------------------------------------
INSERT INTO `schedules` (
    `blotter_id`,
    `blotter_record_id`,
    `schedule_date`,
    `location`,
    `action_type`,
    `notes`,
    `created_by_id`,
    `created_by_name`,
    `complainant_name`,
    `respondent_name`,
    `incident_type`,
    `status`
) VALUES
(
    'BLT-2026-0001',
    (SELECT `id` FROM `blotters` WHERE `blotter_id` = 'BLT-2026-0001' LIMIT 1),
    '2026-11-16 09:30:00',
    'Barangay Hall - Lupong Tagapamayapa Room',
    'Mediator',
    'Unang paghaharap para sa reklamo sa ingay sa komunidad.',
    @staff_id,
    'Duty Desk Officer',
    'Juan Dela Cruz',
    'Pedro Penduko',
    'Ingay sa Komunidad',
    'scheduled'
),
(
    'BLT-2026-0002',
    (SELECT `id` FROM `blotters` WHERE `blotter_id` = 'BLT-2026-0002' LIMIT 1),
    '2026-11-17 14:00:00',
    'Purok 3 Boundary Site / Barangay Hall Conference Room',
    'Investigating',
    'Ocular inspection at pagsusuri ng dokumento ng lupa.',
    @kagawad_id,
    'Kagawad on Peace & Order',
    'Maria Santos',
    'Ana Reyes',
    'Alitan sa Kapitbahay',
    'scheduled'
),
(
    'BLT-2026-0004',
    (SELECT `id` FROM `blotters` WHERE `blotter_id` = 'BLT-2026-0004' LIMIT 1),
    '2026-11-18 10:00:00',
    'Barangay Hall - Mediation Room A',
    'Hearing',
    'Pagdinig ukol sa kasunduan sa pagbabayad ng utang.',
    @staff_id,
    'Duty Desk Officer',
    'Elena Villanueva',
    'Marco Bautista',
    'Utang / Panloloko',
    'scheduled'
),
(
    'BLT-2026-0003',
    (SELECT `id` FROM `blotters` WHERE `blotter_id` = 'BLT-2026-0003' LIMIT 1),
    '2026-10-30 15:00:00',
    'Barangay Hall - Desk Office',
    'Follow-up',
    'Pormal na pagsasara ng kaso matapos maibalik ang bisikleta.',
    @kagawad_id,
    'Kagawad on Peace & Order',
    'Roberto Gomez',
    'Hindi Kilala (Unknown)',
    'Pagnanakaw',
    'completed'
);

-- ------------------------------------------------------------------------------
-- 4. DUMMY ISSUE REPORTS (system_issue_reports)
-- ------------------------------------------------------------------------------
INSERT INTO `system_issue_reports` (
    `user_id`,
    `user_name`,
    `user_email`,
    `feature_name`,
    `description`,
    `status`,
    `admin_resolution_notes`,
    `created_at`
) VALUES
(
    @staff_id,
    'Duty Desk Officer',
    'staff@staana.gov.ph',
    'Print & PDF Export',
    'Slow PDF generation when attaching multiple high-resolution evidence photos.',
    'resolved',
    'Enabled client-side image scaling prior to canvas rendering.',
    '2026-11-05 11:20:00'
),
(
    @kagawad_id,
    'Kagawad on Peace & Order',
    'kagawad@staana.gov.ph',
    'Schedule Calendar View',
    'Requesting filter option to show only upcoming hearings assigned to me.',
    'investigating',
    'Scheduled for UI enhancement review with Admin.',
    '2026-11-08 09:45:00'
);

-- ------------------------------------------------------------------------------
-- 5. DUMMY TROUBLESHOOTING LOGS (troubleshooting_logs)
-- ------------------------------------------------------------------------------
INSERT INTO `troubleshooting_logs` (
    `problem`,
    `cause`,
    `solution`,
    `result`,
    `logged_by_id`,
    `logged_by_name`,
    `logged_at`
) VALUES
(
    'High Database Query Latency during Peak Reporting Hours',
    'Unindexed search scans across blotter complainant fields',
    'Added composite indexes on status, incident_datetime, and blotter_id columns',
    'Query latency reduced from 1,200ms to 45ms (Resolved)',
    @admin_id,
    'System Administrator',
    '2026-10-25'
),
(
    'Large Photo Attachment Overhead on Mobile Field Devices',
    'Uncompressed raw photos attached to incident dossiers',
    'Implemented image resizing before base64 serialization',
    'Payload size reduced by 75% (Resolved)',
    @admin_id,
    'System Administrator',
    '2026-10-29'
);

-- ------------------------------------------------------------------------------
-- 6. DUMMY ACTIVITY & AUDIT REPORTS (activity_audit_logs)
-- ------------------------------------------------------------------------------
INSERT INTO `activity_audit_logs` (
    `user_id`,
    `user_name`,
    `action`,
    `details`,
    `ip_address`,
    `created_at`
) VALUES
(
    @admin_id,
    'System Administrator',
    'SYSTEM_INITIALIZED',
    'Initial system configuration verified and database schema deployed.',
    '127.0.0.1',
    '2026-11-01 08:00:00'
),
(
    @staff_id,
    'Duty Desk Officer',
    'BLOTTER_CREATED',
    'Recorded new incident BLT-2026-0001 (Ingay sa Komunidad).',
    '192.168.1.14',
    '2026-11-02 08:46:00'
),
(
    @kagawad_id,
    'Kagawad on Peace & Order',
    'CASE_ASSIGNED',
    'Assigned BLT-2026-0002 (Alitan sa Kapitbahay) for investigation and ocular inspection.',
    '192.168.1.18',
    '2026-11-03 10:35:00'
),
(
    @captain_id,
    'Hon. Barangay Captain',
    'CASE_ARCHIVED',
    'Approved settlement and archived BLT-2026-0005 after amicable resolution.',
    '192.168.1.10',
    '2026-10-25 11:05:00'
),
(
    @admin_id,
    'System Administrator',
    'BACKUP_CREATED',
    'Routine weekly database backup snapshot completed.',
    '127.0.0.1',
    '2026-11-10 17:00:00'
);
