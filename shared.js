// Shared Data, Authentication, Storage, and UI Utilities for Blotter and Incident Reporting System

export const INITIAL_OFFICIAL_PASSWORDS = {
  'admin@staana.gov.ph': 'Admin#StaAna2026!',
  'captain@staana.gov.ph': 'Captain#StaAna2026!',
  'kagawad@staana.gov.ph': 'Kagawad#StaAna2026!',
  'staff@staana.gov.ph': 'Staff#StaAna2026!'
};

export const INITIAL_USERS = [
  { id: 1, user_id: 'U001', full_name: 'System Administrator', email: 'admin@staana.gov.ph', role: 'admin', status: 'active', phone: '0917-000-0001', address: 'Barangay Hall, Sta. Ana, Pateros', created_at: '2026-01-01 08:00:00' },
  { id: 2, user_id: 'U002', full_name: 'Hon. Barangay Captain', email: 'captain@staana.gov.ph', role: 'captain', status: 'active', phone: '0917-000-0002', address: 'Office of the Punong Barangay, Sta. Ana, Pateros', created_at: '2026-01-02 08:00:00' },
  { id: 3, user_id: 'U003', full_name: 'Kagawad on Peace & Order', email: 'kagawad@staana.gov.ph', role: 'kagawad', status: 'active', phone: '0917-000-0003', address: 'Katarungang Pambarangay Office, Sta. Ana, Pateros', created_at: '2026-01-03 08:00:00' },
  { id: 4, user_id: 'U004', full_name: 'Duty Desk Officer', email: 'staff@staana.gov.ph', role: 'staff', status: 'active', phone: '0917-000-0004', address: 'Intake & Records Desk, Sta. Ana, Pateros', created_at: '2026-01-04 08:00:00' }
];

export const INITIAL_BLOTTERS = [];
export const INITIAL_SCHEDULES = [];

const STORAGE_VERSION_KEY = 'ba_schema_v2';

function checkStorageVersion() {
  const version = localStorage.getItem(STORAGE_VERSION_KEY);
  if (!version) {
    // Reset any old legacy mock records
    localStorage.setItem('ba_users', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('ba_blotters', JSON.stringify(INITIAL_BLOTTERS));
    localStorage.setItem('ba_schedules', JSON.stringify(INITIAL_SCHEDULES));
    localStorage.setItem(STORAGE_VERSION_KEY, 'v2_clean');
  }
}

export function getUsers() {
  checkStorageVersion();
  const stored = localStorage.getItem('ba_users');
  if (!stored) {
    localStorage.setItem('ba_users', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('ba_users', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return parsed;
  } catch (e) {
    return INITIAL_USERS;
  }
}

export function saveUsers(users) {
  localStorage.setItem('ba_users', JSON.stringify(users));
}

export function getBlotters() {
  checkStorageVersion();
  const stored = localStorage.getItem('ba_blotters');
  if (!stored) {
    localStorage.setItem('ba_blotters', JSON.stringify(INITIAL_BLOTTERS));
    return INITIAL_BLOTTERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveBlotters(blotters) {
  localStorage.setItem('ba_blotters', JSON.stringify(blotters));
}

export function getSchedules() {
  checkStorageVersion();
  const stored = localStorage.getItem('ba_schedules');
  if (!stored) {
    localStorage.setItem('ba_schedules', JSON.stringify(INITIAL_SCHEDULES));
    return INITIAL_SCHEDULES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveSchedules(schedules) {
  localStorage.setItem('ba_schedules', JSON.stringify(schedules));
}

export function getCurrentUser() {
  const stored = localStorage.getItem('ba_current_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user) {
  localStorage.setItem('ba_current_user', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('ba_current_user');
  window.location.href = '/login.html';
}

export function downloadBlotterDocument(b) {
  if (!b) return;
  const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Official Barangay Blotter Record - ${b.blotter_id || 'Draft'}</title>
<style>
  body { font-family: 'Times New Roman', Times, Georgia, serif; color: #1e293b; padding: 40px; margin: 0 auto; max-width: 800px; line-height: 1.5; background: #fff; }
  .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
  .header p { margin: 2px 0; font-size: 12px; text-transform: uppercase; font-family: Arial, sans-serif; letter-spacing: 0.5px; }
  .header h2 { margin: 6px 0; font-size: 20px; color: #0d3461; text-transform: uppercase; font-weight: 800; font-family: Arial, sans-serif; }
  .header h1 { margin: 12px 0 4px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
  .header .sub { font-size: 12px; font-style: italic; color: #64748b; font-family: Arial, sans-serif; }
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 12px; background: #f8fafc; border: 1px solid #cbd5e1; }
  .meta-table td { padding: 8px 12px; border: 1px solid #e2e8f0; }
  .meta-label { color: #64748b; font-weight: bold; width: 25%; }
  .meta-val { color: #0f172a; font-weight: bold; }
  .section-title { font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; color: #334155; }
  .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-family: Arial, sans-serif; font-size: 12px; }
  .grid-table td { width: 50%; vertical-align: top; padding: 10px; border: 1px solid #e2e8f0; }
  .narrative-box { border: 1px solid #cbd5e1; background: #fafafa; padding: 15px; font-style: italic; line-height: 1.6; margin-bottom: 20px; white-space: pre-wrap; font-size: 13px; }
  .actions-box { font-family: Arial, sans-serif; font-size: 12px; margin-bottom: 25px; }
  .action-badge { display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 4px; margin-right: 6px; margin-bottom: 6px; }
</style>
</head>
<body>
  <div class="header">
    <p>Republic of the Philippines</p>
    <p>Metro Manila — Municipality of Pateros</p>
    <h2>BARANGAY STA. ANA</h2>
    <p style="font-size: 11px; color: #64748b;">Office of the Punong Barangay / Lupong Tagapamayapa</p>
    <h1>OFFICIAL BLOTTER AND INCIDENT REPORTING SYSTEM</h1>
    <div class="sub">Record of Incident &amp; Formal Complaint Entry</div>
  </div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Blotter Entry No:</td>
      <td class="meta-val">${b.blotter_id || 'PENDING SUBMISSION'}</td>
      <td class="meta-label">Date &amp; Time Reported:</td>
      <td class="meta-val">${b.reported_at || new Date().toLocaleString()}</td>
    </tr>
    <tr>
      <td class="meta-label">Incident Type:</td>
      <td class="meta-val">${b.incident_type || (b.incident_types?.join(', ') || 'Blotter Incident')}</td>
      <td class="meta-label">Current Status:</td>
      <td class="meta-val" style="text-transform: uppercase;">${b.status || 'Pending'}</td>
    </tr>
  </table>

  <table class="grid-table">
    <tr>
      <td>
        <div class="section-title">NAG-UULAT (COMPLAINANT)</div>
        <p><strong>Pangalan:</strong> ${b.complainant_name || 'N/A'}</p>
        <p><strong>Tirahan:</strong> ${b.complainant_address || 'Sta. Ana, Pateros'}</p>
        <p><strong>Telepono:</strong> ${b.complainant_phone || 'N/A'}</p>
        <p><strong>Ugnayan:</strong> ${b.complainant_relation || 'Complainant'}</p>
      </td>
      <td>
        <div class="section-title">IPINAGSUSUMBONG (RESPONDENT)</div>
        <p><strong>Pangalan:</strong> ${b.respondent_name || 'N/A'}</p>
        <p><strong>Tirahan:</strong> ${b.respondent_address || 'Sta. Ana, Pateros'}</p>
        <p><strong>Telepono:</strong> ${b.respondent_phone || 'N/A'}</p>
      </td>
    </tr>
  </table>

  <div class="section-title">SALAYSAY NG PANGYAYARI (NARRATIVE OF INCIDENT)</div>
  <table class="meta-table" style="margin-bottom: 8px;">
    <tr>
      <td class="meta-label">Lugar ng Pangyayari:</td>
      <td class="meta-val">${b.incident_location || 'Barangay Sta. Ana, Pateros'}</td>
      <td class="meta-label">Petsa at Oras:</td>
      <td class="meta-val">${b.incident_datetime || 'N/A'}</td>
    </tr>
  </table>
  <div class="narrative-box">
    "${b.incident_description || 'Walang ibinigay na detalyadong salaysay.'}"
  </div>

  <div class="section-title">AKSYON NG BARANGAY &amp; OPISYAL NA TALA</div>
  <div class="actions-box">
    <p style="margin-bottom: 8px;"><strong>Mga Ginawang Aksyon:</strong></p>
    ${
      b.actions && b.actions.length > 0
        ? b.actions.map(act => `<span class="action-badge">✓ ${act}</span>`).join(' ')
        : '<span style="color: #94a3b8;">Walang naitalang aksyon</span>'
    }
  </div>

  <table style="width: 100%; margin-top: 45px; font-family: Arial, sans-serif; font-size: 11px; text-align: center;">
    <tr>
      <td style="width: 50%; padding: 20px;">
        <div style="border-bottom: 1px solid #000; width: 220px; margin: 0 auto; height: 32px; line-height: 32px;">
          ${b.complainant_name || ''}
        </div>
        <div style="font-weight: bold; margin-top: 6px; text-transform: uppercase;">Lagda ng Nag-uulat</div>
        <div style="color: #64748b;">Complainant / Affiant</div>
      </td>
      <td style="width: 50%; padding: 20px;">
        <div style="border-bottom: 1px solid #000; width: 220px; margin: 0 auto; height: 32px; line-height: 32px;">
          ${b.assigned_to_name || b.official_name || 'Barangay Official'}
        </div>
        <div style="font-weight: bold; margin-top: 6px; text-transform: uppercase;">Opisyal ng Barangay</div>
        <div style="color: #64748b;">Duty Desk Officer / Punong Barangay</div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Barangay_Blotter_${b.blotter_id || 'Draft'}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
