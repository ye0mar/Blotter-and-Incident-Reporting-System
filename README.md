# Barangay Sta. Ana, Pateros — Blotter and Incident Reporting System (BIRS)

An automated, modern web-based incident intake, blotter docketing, and Katarungang Pambarangay hearing management system designed for **Barangay Sta. Ana, Municipality of Pateros, Metro Manila**.

---

## 🏛️ System Overview

The **Blotter and Incident Reporting System (BIRS)** transitions Barangay Sta. Ana from manual, paper-based blotter notebooks to a secure, organized, and auditable digital platform. It streamlines incident intake, facilitates mediation scheduling for the Lupong Tagapamayapa, automates official affidavit and dossier drafting, and provides real-time transparency for barangay officials and residents alike.

### Key Objectives:
- **Fast Incident Intake:** Streamlined multi-step wizards for resident reporting and staff blotter recording.
- **Katarungang Pambarangay Workflow:** Centralized scheduling and tracking of mediation, conciliation, and arbitration proceedings.
- **Official Documentation:** One-click generation of printable Barangay Blotter Dossiers, Microsoft Word (`.doc`) affidavits, and high-resolution PDF printouts featuring the official Barangay Sta. Ana and Municipality of Pateros seals.
- **Accountability & Audit Trails:** Real-time logging of user actions, case updates, system health metrics, and IT troubleshooting.

---

## 📁 Codebase Architecture & File Organization

The source code is organized into dedicated, role-specific directories so that every user role's features, layouts, and logic reside in their respective folders:

```
├── database.sql                  # Complete SQL schema & initial seed data
├── index.html                    # Application entry point with Santa Ana favicon & typography
├── package.json                  # Dependencies and build scripts
├── public/                       # Static public assets
│   ├── favicon.ico               # Official Barangay Sta. Ana seal favicon
│   ├── santa-ana-logo.png        # Official Barangay Sta. Ana seal
│   ├── pateros-logo.png          # Official Municipality of Pateros seal
│   └── assets/                   # Additional system media
└── src/
    ├── admin/                    # System Administration Module
    │   ├── AdminPortal.tsx       # User management, system config, database tools, audit logs
    │   ├── admin.html            # Standalone Admin Portal HTML
    │   ├── admin.css             # Dedicated Admin styles
    │   ├── admin.js              # Dedicated Admin logic & handlers
    │   └── index.ts              # Module barrel export
    ├── captain/                  # Punong Barangay Module
    │   ├── CaptainPortal.tsx     # High-level analytics, incident trends, executive reports
    │   ├── captain.html          # Standalone Captain Portal HTML
    │   ├── captain.css           # Dedicated Captain styles
    │   ├── captain.js            # Dedicated Captain logic & handlers
    │   └── index.ts              # Module barrel export
    ├── kagawad/                  # Peace & Order / Lupon Member Module
    │   ├── KagawadPortal.tsx     # Case investigation desk, schedule review, case updates
    │   ├── kagawad.html          # Standalone Kagawad Portal HTML
    │   ├── kagawad.css           # Dedicated Kagawad styles
    │   ├── kagawad.js            # Dedicated Kagawad logic & handlers
    │   └── index.ts              # Module barrel export
    ├── staff/                    # Barangay Desk Intake Module
    │   ├── StaffPortal.tsx       # Blotter entry wizard, hearing scheduler, intake docket
    │   ├── staff.html            # Standalone Staff Portal HTML
    │   ├── staff.css             # Dedicated Staff styles
    │   ├── staff.js              # Dedicated Staff logic & handlers
    │   └── index.ts              # Module barrel export
    ├── resident/                 # Citizen Self-Service Module
    │   ├── ResidentPortal.tsx    # Online incident filing, personal complaint history, schedules
    │   ├── resident.html         # Standalone Resident Portal HTML
    │   ├── resident.css          # Dedicated Resident styles
    │   ├── resident.js           # Dedicated Resident logic & handlers
    │   └── index.ts              # Module barrel export
    ├── components/               # Shared Global Components
    │   ├── Header.tsx            # Navigation bar, user role badge, and profile menu
    │   └── PrintDossierModal.tsx # Printable official blotter dossier, .doc download, & PDF print
    ├── context/                  # Reactive State Management
    │   └── AppContext.tsx        # Centralized application store & session state
    ├── data/                     # Baseline mock datasets & mock stores
    │   └── mockData.ts
    ├── types/                    # TypeScript interfaces and data models
    │   └── index.ts
    ├── utils/                    # Utility functions & report exporters
    │   └── reportExporter.ts     # HTML documentation and legal dossier formatting engine
    ├── views/                    # Shared views & authentication
    │   ├── LoginView.tsx         # Unified authentication portal
    │   ├── ProfileView.tsx       # User profile details and password security
    │   ├── PreferencesView.tsx   # Notification and delivery channels configuration
    │   ├── ReportIssueView.tsx   # System bug/feature issue report submission
    │   └── PendingApprovalView.tsx # Gatekeeper screen for pending official accounts
    ├── App.tsx                   # Main route coordinator and role dispatcher
    ├── main.tsx                  # React DOM initialization
    └── index.css                 # Global styling, Tailwind directives, Fredoka heading typography
```

---

## 👥 User Roles & Operational Scope

The platform strictly isolates features based on the logged-in user's role:

### 1. Administrator (`admin`)
- **User Accounts Management:** Create new user accounts, review and approve newly registered staff or officials, change user roles, and reset forgotten passwords.
- **System Settings:** Configure barangay contact info, operating hours, session timeouts, and data retention policies.
- **Database Tools:** Trigger database backups, schema verifications, and data restoration routines.
- **Live Monitoring & System Health:** Track server uptime, database latency, active sessions, and memory consumption.
- **Troubleshooting Knowledge Base:** Document, categorize, and review technical resolutions for system issues.
- **Activity Audit Logs:** Inspect timestamped records of all administrative actions and sensitive data access.
- **Issue Reports Review:** Review user-submitted feature requests or technical bug reports with uploaded screenshots.

### 2. Punong Barangay / Captain (`captain`)
- **Executive Analytics:** 7-day incident volume trends, category breakdowns, and case status distributions (Pending vs. Investigating vs. Resolved).
- **Key Performance Indicators (KPIs):** Instant calculation of case resolution rates and active mediation workloads.
- **Incident Dossier Review:** Complete access to view all filed blotters and inspect full incident narratives.
- **Official Report Generation:** Generate printable monthly, quarterly, and annual incident summary reports for municipal submission.

### 3. Barangay Kagawad (`kagawad`)
- **Case Investigation:** Search and filter active blotter records assigned for investigation.
- **Mediation Calendar:** View scheduled Lupong Tagapamayapa conciliation hearings.
- **Status Updates:** Update case progression, record investigation findings, and mark disputes as resolved.

### 4. Barangay Desk Staff (`staff`)
- **Walk-in Incident Intake:** File official blotter complaints using a structured step-by-step wizard (Complainant info, Respondent info, Incident details & narrative, and Actions taken).
- **Katarungang Pambarangay Scheduling:** Assign mediation, investigation, or hearing dates linked directly to blotter case numbers.
- **Official Dossier Printing:** Generate official printable records with letterhead and dual seals, download editable Word (`.doc`) affidavits, or trigger direct browser print.

### 5. Resident (`resident`)
- **Citizen Incident Reporting:** Submit incident complaints directly from home with multiple category tags, incident description, date/time, and supporting evidence files.
- **Personal Case Tracker:** Check the real-time status (Pending Review, Under Investigation, or Resolved) of submitted complaints.
- **Hearing Schedule:** View assigned conciliation hearing dates and room assignments at the Barangay Hall.

---

## 🗄️ Database Schema & SQL Setup

The file `database.sql` located at the root of this project contains the complete relational schema and initial seed data.

### Core Tables:
1. `users`: Authentication records, role definitions (`admin`, `captain`, `kagawad`, `staff`, `resident`), profile information, and account status (`approved`, `pending`, `rejected`).
2. `incident_types`: Categorized list of standardized offenses (Pagnanakaw, Pananakit, Alitan sa Kapitbahay, Paninirang Puri, etc.).
3. `blotters`: Primary blotter case table storing complainant data, respondent data, incident narrative, status, assigned officer, actions taken, and evidence files.
4. `schedules`: Hearing, conciliation, and mediation dates linked to blotter records.
5. `system_issue_reports`: User-submitted issue tickets and bug reports with optional screenshot data.
6. `troubleshooting_logs`: Technical resolutions and system IT maintenance logs.
7. `activity_audit_logs`: Immutable security audit trail recording user operations and record modifications.
8. `system_settings`: Key-value configuration parameters for barangay policies and system parameters.

### Importing the Database:
To import the schema and seed data into your MySQL, MariaDB, or PostgreSQL instance:

```bash
# Log in to MySQL / MariaDB and execute:
mysql -u root -p < database.sql
```

Or via graphical tools (e.g., phpMyAdmin, DBeaver, MySQL Workbench):
1. Open your database management tool.
2. Create a new database or select `barangay_sta_ana_birs`.
3. Open the `database.sql` file and execute the script.

---

## 🖨️ Dossier & Legal Document Printing

The system includes a dedicated **Print & Export Engine** (`src/components/PrintDossierModal.tsx` and `src/utils/reportExporter.ts`):
- **Barangay Sta. Ana Letterhead:** Renders the Republic of the Philippines header with the official Barangay Sta. Ana seal on the left and Municipality of Pateros seal on the right.
- **Download (.doc):** Generates a formatted Microsoft Word document containing all case details, complainant narrative, official actions taken, and legal signature lines for both the Complainant and Duty Desk Officer / Punong Barangay.
- **Print / PDF:** Uses CSS `@media print` rules to hide UI chrome (navigation bars, buttons, banners) and print a clean, standard document page or export directly to PDF via the browser's print dialog.

---

## 🚀 Getting Started

### Prerequisites:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation:
1. Clone or extract the project files to your local workstation.
2. Navigate into the application root directory:
   ```bash
   cd barangay-sta-ana-birs
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the Development Server:
Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Production Build:
To compile and bundle the application for production deployment:
```bash
npm run build
```
The optimized static production assets will be generated in the `dist/` directory.

---

## 🔒 Security & Privacy Policy

- **Role Gatekeeping:** Staff, Kagawad, and Captain accounts require explicit administrative verification and approval before access is granted.
- **Privacy Protection:** Sensitive personal details (contact numbers, home addresses, and confidential incident statements) are restricted to authorized desk officers and administrators.
- **Audit Compliance:** All case modifications, user approvals, and record print events are recorded in the system audit logs.