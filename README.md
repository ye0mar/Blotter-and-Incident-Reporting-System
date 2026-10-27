# Barangay Sta. Ana – Blotter & Incident Reporting System

A web-based digital blotter, incident reporting, and hearing schedule management system for Barangay Sta. Ana, Pateros.

---

## 🔑 Default User Accounts & Credentials

| Role | Name | Email | Password | Approval Status |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | System Admin | `admin@gmail.com` | `Admin@123` | Active |
| **Barangay Captain** | Barangay Captain | `captain@gmail.com` | `Captain@123` | Active |
| **Kagawad** | Kagawad Juan | `kagawad@gmail.com` | `Kagawad@123` | Active |
| **Barangay Staff** | Barangay Staff Maria | `staff@gmail.com` | `Staff@123` | Active |
| **Resident** | Juan Dela Cruz | `juandelacruz@gmail.com` | `Resident@123` | Active |
| **Pending Applicant** | Ricardo Santos | `ricardo.kagawad@gmail.com` | `Kagawad@123` | **Pending** (Needs Admin Approval) |

---

## 📝 User Registration & Role Approval Workflow

1. **Resident Registration**:
   - Residents can register directly on the login page by selecting the **Resident** role.
   - Resident accounts are **automatically approved and activated immediately**.
   - Residents can sign in right away to submit incident reports, track complaints, and view hearing schedules.

2. **Official / Staff Registration (Captain, Kagawad, Staff)**:
   - Anyone registering for an official role (**Staff**, **Kagawad**, or **Captain**) is placed in a **`pending` status**.
   - An administrator must review and click **Approve** in the **Admin Panel** under *User Accounts → Pending Approvals* before these accounts can log in.
   - If a pending user attempts to log in, the system alerts them that their registration is awaiting administrator approval.

---

## 🧭 Navigation & Role Access Architecture

All interfaces use a **single, unified dark navy top navigation bar** (`#0d3461`) with no sidebars:

- **Resident Portal (`Resident.html`)**:
  - `Report Incident`: Multi-step formal blotter complaint submission.
  - `My Complaints`: Personal complaint tracking with status badges and full blotter details modal.
  - `My Schedule`: Scheduled mediation and hearing dates with location details.
  - `Profile` / `Account`: View current resident profile information.
  - `Logout`: Clears current session and returns to login.

- **Kagawad / Captain Blotter Portal (`kagawad.html`)**:
  - **KPI Metrics Header**: `Total Incidents`, `Pending`, `Investigating`, `Resolved`, and `Resolution Rate`.
  - **Overview Tab**: 7-day incident trend chart, status breakdown, and recent records.
  - **Analytics Tab**: Incident distribution by category and key performance indicators.
  - **Reports Tab**: Generate official Blotter Summaries, Statistical Reports, and Detailed Logs.
  - `Investigate`: Investigation queue, complaint filter, notes, and evidence review.
  - `My Schedule`: Calendar and list of mediation & hearing schedules.
  - `Account` & `Logout`.

- **Admin Panel (`admin.html`)**:
  - `Pending Approvals`: Review and approve/reject pending registrations for Staff, Kagawad, and Captain.
  - `User Accounts`: Manage existing accounts, toggle active/inactive status, and delete users.
  - `All Incidents`: Full incident registry and audit logs.
  - `Schedules`: Master barangay hearing timetable.
  - `Account` & `Logout`.

---

## 🎨 Typography & Design Constitution

This application strictly implements the requested typography palette:
- Primary Fonts: **Poppins**, **Urbanist**, **Circular**, **GT Walsheim**, **Okta Neue**, **Century Gothic**.
- Google Fonts web imports: `Poppins` and `Urbanist` with system font fallbacks.
- Single unified top navigation bar with clean text links.
- No sidebars anywhere; strictly blotter-focused operational modules.

---

## 🚀 Running the Application

```bash
# Start server on http://localhost:3000
npm start
```