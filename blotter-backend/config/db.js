const bcrypt = require('bcryptjs');
require('dotenv').config();

let realPool = null;
let useRealDb = false;

// Attempt real MySQL connection only if configured
if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
  try {
    const mysql = require('mysql2/promise');
    realPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'blotter_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+08:00',
    });
  } catch (err) {
    console.warn('MySQL pool initialization skipped:', err.message);
  }
}

// ────────────────────────────────────────────────────────────
// In-Memory Database Store (Failsafe mock for AI Studio runtime)
// ────────────────────────────────────────────────────────────
const state = {
  users: [
    {
      id: 1,
      user_id: 'U001',
      full_name: 'System Admin',
      email: 'admin@gmail.com',
      password: bcrypt.hashSync('Admin@123', 10),
      role: 'admin',
      status: 'active',
      phone: '09123456789',
      address: 'Barangay Hall, Sta. Ana, Pateros',
      created_at: '2026-01-01 08:00:00'
    },
    {
      id: 2,
      user_id: 'U002',
      full_name: 'Barangay Captain',
      email: 'captain@gmail.com',
      password: bcrypt.hashSync('Captain@123', 10),
      role: 'captain',
      status: 'active',
      phone: '09123456788',
      address: 'Barangay Sta. Ana, Pateros',
      created_at: '2026-01-02 08:00:00'
    },
    {
      id: 3,
      user_id: 'U003',
      full_name: 'Kagawad Juan',
      email: 'kagawad@gmail.com',
      password: bcrypt.hashSync('Kagawad@123', 10),
      role: 'kagawad',
      status: 'active',
      phone: '09123456787',
      address: 'Alley I, Sta. Ana, Pateros',
      created_at: '2026-01-03 08:00:00'
    },
    {
      id: 4,
      user_id: 'U004',
      full_name: 'Juan Dela Cruz',
      email: 'juandelacruz@gmail.com',
      password: bcrypt.hashSync('Resident@123', 10),
      role: 'resident',
      status: 'active',
      phone: '09123456786',
      address: 'Alley II, Sta. Ana, Pateros',
      created_at: '2026-01-04 08:00:00'
    },
    {
      id: 5,
      user_id: 'U005',
      full_name: 'Barangay Staff Maria',
      email: 'staff@gmail.com',
      password: bcrypt.hashSync('Staff@123', 10),
      role: 'staff',
      status: 'active',
      phone: '09123456785',
      address: 'Barangay Hall, Sta. Ana, Pateros',
      created_at: '2026-01-05 08:00:00'
    },
    {
      id: 6,
      user_id: 'U006',
      full_name: 'Ricardo Santos (Applicant)',
      email: 'ricardo.kagawad@gmail.com',
      password: bcrypt.hashSync('Kagawad@123', 10),
      role: 'kagawad',
      status: 'pending',
      phone: '09170001122',
      address: 'P. Rosales St., Sta. Ana, Pateros',
      created_at: '2026-04-26 14:00:00'
    }
  ],
  blotter_records: [
    {
      id: 1,
      blotter_id: 'BLT-2026-0001',
      complainant_id: 4,
      complainant_name: 'Juan Dela Cruz',
      complainant_phone: '09123456786',
      complainant_address: 'Alley II, Sta. Ana, Pateros',
      complainant_relation: 'Biktima',
      respondent_name: 'Pedro Penduko',
      respondent_phone: '09987654321',
      respondent_address: 'Alley III, Sta. Ana, Pateros',
      incident_type: 'Theft',
      incident_location: 'Alley II, Sta. Ana',
      incident_datetime: '2026-04-20 14:30:00',
      incident_description: 'Ninakaw ang bisikleta sa tapat ng bahay habang kumakain ng tanghalian.',
      status: 'investigating',
      assigned_to: 3,
      updated_by: 3,
      official_name: 'Kagawad Juan',
      official_signature: null,
      complainant_signature: null,
      reported_at: '2026-04-20 15:00:00'
    },
    {
      id: 2,
      blotter_id: 'BLT-2026-0002',
      complainant_id: 4,
      complainant_name: 'Juan Dela Cruz',
      complainant_phone: '09123456786',
      complainant_address: 'Alley II, Sta. Ana, Pateros',
      complainant_relation: 'Complainant',
      respondent_name: 'Maria Santos',
      respondent_phone: '09876543210',
      respondent_address: 'P. Herrera St., Sta. Ana',
      incident_type: 'Noise Complaint',
      incident_location: 'Alley II',
      incident_datetime: '2026-04-22 23:00:00',
      incident_description: 'Malakas na videoke dis-oras ng gabi lampas 10pm.',
      status: 'pending',
      assigned_to: null,
      updated_by: 1,
      official_name: 'System Admin',
      official_signature: null,
      complainant_signature: null,
      reported_at: '2026-04-23 08:30:00'
    },
    {
      id: 3,
      blotter_id: 'BLT-2026-0003',
      complainant_id: 4,
      complainant_name: 'Juan Dela Cruz',
      complainant_phone: '09123456786',
      complainant_address: 'Alley II, Sta. Ana, Pateros',
      complainant_relation: 'Biktima',
      respondent_name: 'Jose Rizal',
      respondent_phone: '09112223334',
      respondent_address: 'E. Hermosa St., Sta. Ana',
      incident_type: 'Physical Injury',
      incident_location: 'Barangay Basketball Court',
      incident_datetime: '2026-04-25 18:00:00',
      incident_description: 'Nagkaroon ng mainitang pagtatalo sa laro ng basketball na nauwi sa panununtok.',
      status: 'resolved',
      assigned_to: 3,
      updated_by: 3,
      official_name: 'Kagawad Juan',
      official_signature: null,
      complainant_signature: null,
      reported_at: '2026-04-25 19:15:00'
    }
  ],
  blotter_incident_types: [
    { id: 1, blotter_id: 1, type_name: 'Theft' },
    { id: 2, blotter_id: 2, type_name: 'Noise Complaint' },
    { id: 3, blotter_id: 3, type_name: 'Physical Injury' }
  ],
  barangay_actions: [
    { id: 1, blotter_id: 1, action_name: 'Summon respondent' },
    { id: 2, blotter_id: 3, action_name: 'Amicable settlement reached' }
  ],
  investigation_notes: [
    {
      id: 1,
      blotter_id: 1,
      noted_by: 3,
      notes: 'Initial interview done. CCTV footage around Alley II being reviewed.',
      created_at: '2026-04-21 10:00:00'
    }
  ],
  attachments: [],
  schedules: [
    {
      id: 1,
      blotter_id: 1,
      schedule_date: new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
      location: 'Barangay Session Hall',
      action_type: 'Hearing',
      notes: 'First conciliation meeting between parties',
      created_by: 3,
      created_at: '2026-04-21 09:00:00'
    },
    {
      id: 2,
      blotter_id: 2,
      schedule_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 19).replace('T', ' '),
      location: 'Lupon Office',
      action_type: 'Mediator',
      notes: 'Mediation regarding neighborhood disturbance',
      created_by: 3,
      created_at: '2026-04-23 10:00:00'
    }
  ],
  activity_logs: [
    {
      id: 1,
      user_id: 1,
      action: 'System started',
      details: 'Mock in-memory database initialized',
      ip_address: '127.0.0.1',
      created_at: '2026-04-26 12:00:00'
    }
  ],
  autoIds: {
    users: 7,
    blotter_records: 4,
    blotter_incident_types: 4,
    barangay_actions: 3,
    investigation_notes: 2,
    attachments: 1,
    schedules: 3,
    activity_logs: 2
  }
};

function executeMockQuery(sql, params = []) {
  const s = sql.trim();
  const lower = s.toLowerCase();

  // 1. SELECT * FROM users WHERE email = ? AND status = "active"
  if (lower.includes('from users') && lower.includes('email = ?') && lower.includes('status = "active"')) {
    const email = String(params[0] || '').toLowerCase().trim();
    const rows = state.users.filter(u => u.email.toLowerCase() === email && u.status === 'active');
    return [rows, []];
  }

  // 2. SELECT * FROM users WHERE email = ? OR SELECT id FROM users WHERE email = ?
  if (lower.includes('from users') && lower.includes('where email = ?')) {
    const email = String(params[0] || '').toLowerCase().trim();
    const rows = state.users.filter(u => u.email.toLowerCase() === email);
    return [rows, []];
  }

  // 3. SELECT user_id FROM users ORDER BY id DESC LIMIT 1
  if (lower.includes('from users') && lower.includes('order by id desc limit 1')) {
    const sorted = [...state.users].sort((a, b) => b.id - a.id);
    return [sorted.slice(0, 1), []];
  }

  // 4. SELECT ... FROM users WHERE id = ?
  if (lower.includes('from users') && lower.includes('where id = ?')) {
    const id = parseInt(params[0]);
    const user = state.users.find(u => u.id === id);
    if (!user) return [[], []];
    const safeUser = { ...user };
    if (!lower.includes('password')) delete safeUser.password;
    return [[safeUser], []];
  }

  // 5. SELECT ... FROM users ORDER BY id
  if (lower.includes('from users') && lower.includes('order by id')) {
    const rows = state.users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    return [rows, []];
  }

  // 6. COUNT queries on users / blotters
  if (lower.includes('select count(*) as total_users from users')) {
    return [[{ total_users: state.users.length }], []];
  }
  if (lower.includes('count(*) as active_users from users')) {
    const cnt = state.users.filter(u => u.status === 'active').length;
    return [[{ active_users: cnt }], []];
  }
  if (lower.includes('count(*) as total_incidents from blotter_records')) {
    return [[{ total_incidents: state.blotter_records.length }], []];
  }
  if (lower.includes('select count(*) as total from blotter_records') || lower.includes('select count(*) as cnt from blotter_records')) {
    let list = state.blotter_records;
    if (lower.includes('where b.complainant_id = ?') || lower.includes('where complainant_id = ?')) {
      const cId = parseInt(params[0]);
      list = list.filter(b => b.complainant_id === cId);
    }
    return [[{ total: list.length, cnt: list.length }], []];
  }
  if (lower.includes('count(*) as pending from blotter_records')) {
    const cnt = state.blotter_records.filter(b => b.status === 'pending').length;
    return [[{ pending: cnt }], []];
  }
  if (lower.includes('count(*) as investigating from blotter_records')) {
    const cnt = state.blotter_records.filter(b => b.status === 'investigating').length;
    return [[{ investigating: cnt }], []];
  }
  if (lower.includes('count(*) as resolved from blotter_records')) {
    const cnt = state.blotter_records.filter(b => b.status === 'resolved').length;
    return [[{ resolved: cnt }], []];
  }

  // 7. INSERT INTO users
  if (lower.startsWith('insert into users')) {
    const id = state.autoIds.users++;
    let user_id, full_name, email, password, role, status, phone, address;
    if (lower.includes('status')) {
      [user_id, full_name, email, password, role, status, phone, address] = params;
    } else {
      [user_id, full_name, email, password, role, phone, address] = params;
      status = role === 'resident' ? 'active' : 'pending';
    }
    const newUser = {
      id,
      user_id: user_id || `U${String(id).padStart(3, '0')}`,
      full_name,
      email,
      password,
      role: role || 'resident',
      status: status || (role === 'resident' ? 'active' : 'pending'),
      phone: phone || null,
      address: address || null,
      created_at: new Date().toISOString()
    };
    state.users.push(newUser);
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  // 8. UPDATE users
  if (lower.startsWith('update users')) {
    if (lower.includes('set status = ? where id = ?')) {
      const [status, id] = params;
      const user = state.users.find(u => u.id === parseInt(id));
      if (user) user.status = status;
      return [{ affectedRows: user ? 1 : 0 }, []];
    }
    if (lower.includes('set password = ? where id = ?')) {
      const [pwd, id] = params;
      const user = state.users.find(u => u.id === parseInt(id));
      if (user) user.password = pwd;
      return [{ affectedRows: user ? 1 : 0 }, []];
    }
    if (lower.includes('set full_name=?, email=?, role=?, phone=?, address=? where id=?')) {
      const [full_name, email, role, phone, address, id] = params;
      const user = state.users.find(u => u.id === parseInt(id));
      if (user) {
        user.full_name = full_name;
        user.email = email;
        user.role = role;
        user.phone = phone;
        user.address = address;
      }
      return [{ affectedRows: user ? 1 : 0 }, []];
    }
  }

  // 9. DELETE FROM users
  if (lower.startsWith('delete from users')) {
    const id = parseInt(params[0]);
    const idx = state.users.findIndex(u => u.id === id);
    if (idx !== -1) state.users.splice(idx, 1);
    return [{ affectedRows: idx !== -1 ? 1 : 0 }, []];
  }

  // 10. INSERT INTO blotter_records
  if (lower.startsWith('insert into blotter_records')) {
    const id = state.autoIds.blotter_records++;
    const [
      blotter_id, complainant_id,
      complainant_name, complainant_phone, complainant_address, complainant_relation,
      respondent_name, respondent_phone, respondent_address,
      incident_type, incident_location, incident_datetime, incident_description,
      updated_by, official_name, official_signature, complainant_signature
    ] = params;

    const newRecord = {
      id,
      blotter_id,
      complainant_id: complainant_id || null,
      complainant_name,
      complainant_phone: complainant_phone || null,
      complainant_address: complainant_address || null,
      complainant_relation: complainant_relation || null,
      respondent_name,
      respondent_phone: respondent_phone || null,
      respondent_address: respondent_address || null,
      incident_type,
      incident_location: incident_location || null,
      incident_datetime: incident_datetime || null,
      incident_description: incident_description || null,
      status: 'pending',
      assigned_to: null,
      updated_by: updated_by || null,
      official_name: official_name || null,
      official_signature: official_signature || null,
      complainant_signature: complainant_signature || null,
      reported_at: new Date().toISOString()
    };
    state.blotter_records.unshift(newRecord);
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  // 11. INSERT auxiliary blotter data
  if (lower.startsWith('insert into blotter_incident_types')) {
    const id = state.autoIds.blotter_incident_types++;
    state.blotter_incident_types.push({ id, blotter_id: parseInt(params[0]), type_name: params[1] });
    return [{ insertId: id, affectedRows: 1 }, []];
  }
  if (lower.startsWith('insert into barangay_actions')) {
    const id = state.autoIds.barangay_actions++;
    state.barangay_actions.push({ id, blotter_id: parseInt(params[0]), action_name: params[1] });
    return [{ insertId: id, affectedRows: 1 }, []];
  }
  if (lower.startsWith('insert into attachments')) {
    const id = state.autoIds.attachments++;
    state.attachments.push({
      id,
      blotter_id: parseInt(params[0]),
      uploaded_by: parseInt(params[1]),
      file_name: params[2],
      file_path: params[3],
      file_type: params[4],
      file_size: params[5],
      uploaded_at: new Date().toISOString()
    });
    return [{ insertId: id, affectedRows: 1 }, []];
  }
  if (lower.startsWith('insert into investigation_notes')) {
    const id = state.autoIds.investigation_notes++;
    state.investigation_notes.unshift({
      id,
      blotter_id: parseInt(params[0]),
      noted_by: parseInt(params[1]),
      notes: params[2],
      created_at: new Date().toISOString()
    });
    return [{ insertId: id, affectedRows: 1 }, []];
  }
  if (lower.startsWith('insert into activity_logs')) {
    const id = state.autoIds.activity_logs++;
    state.activity_logs.unshift({
      id,
      user_id: parseInt(params[0]),
      action: params[1],
      details: params[2] || null,
      ip_address: params[3] || '127.0.0.1',
      created_at: new Date().toISOString()
    });
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  // 12. SELECT from blotter_records
  if (lower.includes('from blotter_records b') && lower.includes('where b.id = ?')) {
    const id = parseInt(params[0]);
    const b = state.blotter_records.find(item => item.id === id);
    if (!b) return [[], []];
    const u1 = state.users.find(u => u.id === b.assigned_to);
    const u2 = state.users.find(u => u.id === b.updated_by);
    return [[{ ...b, assigned_to_name: u1 ? u1.full_name : null, updated_by_name: u2 ? u2.full_name : null }], []];
  }

  if (lower.includes('from blotter_records b') || lower.includes('from blotter_records')) {
    if (lower.includes('limit 5') && lower.includes('order by reported_at desc')) {
      const rec = [...state.blotter_records].slice(0, 5);
      return [rec, []];
    }
    // Main blotter list query
    let list = [...state.blotter_records];
    let paramIdx = 0;
    if (lower.includes('b.complainant_id = ?')) {
      const cId = parseInt(params[paramIdx++]);
      list = list.filter(b => b.complainant_id === cId);
    }
    if (lower.includes('b.status = ?')) {
      const st = params[paramIdx++];
      list = list.filter(b => b.status === st);
    }
    if (lower.includes('b.incident_type like ?')) {
      const rawType = String(params[paramIdx++] || '').replace(/%/g, '').toLowerCase();
      list = list.filter(b => String(b.incident_type || '').toLowerCase().includes(rawType));
    }
    if (lower.includes('(b.blotter_id like ? or')) {
      const search = String(params[paramIdx] || '').replace(/%/g, '').toLowerCase();
      paramIdx += 4;
      list = list.filter(b =>
        String(b.blotter_id || '').toLowerCase().includes(search) ||
        String(b.complainant_name || '').toLowerCase().includes(search) ||
        String(b.respondent_name || '').toLowerCase().includes(search) ||
        String(b.incident_location || '').toLowerCase().includes(search)
      );
    }
    // Pagination params
    let limit = 20;
    let offset = 0;
    if (params.length >= paramIdx + 2) {
      limit = parseInt(params[paramIdx]) || 20;
      offset = parseInt(params[paramIdx + 1]) || 0;
    }
    const sliced = list.slice(offset, offset + limit).map(b => {
      const u1 = state.users.find(u => u.id === b.assigned_to);
      const u2 = state.users.find(u => u.id === b.updated_by);
      return {
        ...b,
        assigned_to_name: u1 ? u1.full_name : null,
        updated_by_name: u2 ? u2.full_name : null
      };
    });
    return [sliced, []];
  }

  // 13. Sub-queries for blotter details
  if (lower.includes('from blotter_incident_types where blotter_id = ?')) {
    const bId = parseInt(params[0]);
    const rows = state.blotter_incident_types.filter(t => t.blotter_id === bId);
    return [rows, []];
  }
  if (lower.includes('from barangay_actions where blotter_id = ?')) {
    const bId = parseInt(params[0]);
    const rows = state.barangay_actions.filter(a => a.blotter_id === bId);
    return [rows, []];
  }
  if (lower.includes('from investigation_notes n') && lower.includes('where n.blotter_id = ?')) {
    const bId = parseInt(params[0]);
    const rows = state.investigation_notes
      .filter(n => n.blotter_id === bId)
      .map(n => {
        const u = state.users.find(user => user.id === n.noted_by);
        return { ...n, noted_by_name: u ? u.full_name : null };
      });
    return [rows, []];
  }
  if (lower.includes('from attachments a') && lower.includes('where a.blotter_id = ?')) {
    const bId = parseInt(params[0]);
    const rows = state.attachments
      .filter(a => a.blotter_id === bId)
      .map(a => {
        const u = state.users.find(user => user.id === a.uploaded_by);
        return { ...a, uploaded_by_name: u ? u.full_name : null };
      });
    return [rows, []];
  }

  // 14. UPDATE blotter_records
  if (lower.startsWith('update blotter_records')) {
    if (lower.includes('set status = ?, updated_by = ? where id = ?')) {
      const [status, updated_by, id] = params;
      const record = state.blotter_records.find(b => b.id === parseInt(id));
      if (record) {
        record.status = status;
        record.updated_by = parseInt(updated_by);
      }
      return [{ affectedRows: record ? 1 : 0 }, []];
    }
    if (lower.includes('set assigned_to = ?, updated_by = ? where id = ?')) {
      const [assigned_to, updated_by, id] = params;
      const record = state.blotter_records.find(b => b.id === parseInt(id));
      if (record) {
        record.assigned_to = parseInt(assigned_to);
        record.updated_by = parseInt(updated_by);
      }
      return [{ affectedRows: record ? 1 : 0 }, []];
    }
  }

  // 15. DELETE FROM blotter_records
  if (lower.startsWith('delete from blotter_records')) {
    const id = parseInt(params[0]);
    const idx = state.blotter_records.findIndex(b => b.id === id);
    if (idx !== -1) {
      state.blotter_records.splice(idx, 1);
      state.schedules = state.schedules.filter(s => s.blotter_id !== id);
    }
    return [{ affectedRows: idx !== -1 ? 1 : 0 }, []];
  }

  // 16. Schedules queries
  if (lower.includes('from schedules s') && lower.includes('where s.id = ?')) {
    const id = parseInt(params[0]);
    const s = state.schedules.find(item => item.id === id);
    if (!s) return [[], []];
    const b = state.blotter_records.find(item => item.id === s.blotter_id);
    return [[{
      ...s,
      blotter_id: b ? b.blotter_id : null,
      incident_type: b ? b.incident_type : null,
      complainant_name: b ? b.complainant_name : null,
      respondent_name: b ? b.respondent_name : null
    }], []];
  }

  if (lower.includes('from schedules s') && lower.includes('join blotter_records b')) {
    let list = [...state.schedules];
    if (lower.includes('where b.complainant_id = ?')) {
      const cId = parseInt(params[0]);
      list = list.filter(s => {
        const b = state.blotter_records.find(rec => rec.id === s.blotter_id);
        return b && b.complainant_id === cId;
      });
    }
    const rows = list.map(s => {
      const b = state.blotter_records.find(rec => rec.id === s.blotter_id);
      const u = state.users.find(user => user.id === s.created_by);
      return {
        ...s,
        blotter_id: b ? b.blotter_id : null,
        incident_type: b ? b.incident_type : null,
        complainant_name: b ? b.complainant_name : null,
        respondent_name: b ? b.respondent_name : null,
        created_by_name: u ? u.full_name : null
      };
    });
    return [rows, []];
  }

  if (lower.startsWith('insert into schedules')) {
    const id = state.autoIds.schedules++;
    const [blotter_id, schedule_date, location, action_type, notes, created_by] = params;
    state.schedules.push({
      id,
      blotter_id: parseInt(blotter_id),
      schedule_date,
      location,
      action_type,
      notes: notes || null,
      created_by: parseInt(created_by),
      created_at: new Date().toISOString()
    });
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  if (lower.startsWith('update schedules')) {
    const [schedule_date, location, action_type, notes, id] = params;
    const sched = state.schedules.find(s => s.id === parseInt(id));
    if (sched) {
      sched.schedule_date = schedule_date;
      sched.location = location;
      sched.action_type = action_type;
      sched.notes = notes;
    }
    return [{ affectedRows: sched ? 1 : 0 }, []];
  }

  if (lower.startsWith('delete from schedules')) {
    const id = parseInt(params[0]);
    const idx = state.schedules.findIndex(s => s.id === id);
    if (idx !== -1) state.schedules.splice(idx, 1);
    return [{ affectedRows: idx !== -1 ? 1 : 0 }, []];
  }

  // 17. Activity logs list
  if (lower.includes('from activity_logs')) {
    return [[...state.activity_logs].slice(0, 10), []];
  }

  console.warn('Unhandled mock query:', sql, params);
  return [[], []];
}

// ────────────────────────────────────────────────────────────
// Database Interface with Fallback
// ────────────────────────────────────────────────────────────
const db = {
  async query(sql, params = []) {
    if (useRealDb && realPool) {
      try {
        return await realPool.query(sql, params);
      } catch (err) {
        console.warn('Real DB query error, falling back to mock:', err.message);
      }
    }
    return executeMockQuery(sql, params);
  },

  async getConnection() {
    if (useRealDb && realPool) {
      try {
        return await realPool.getConnection();
      } catch (err) {
        console.warn('Real DB getConnection error, falling back to mock:', err.message);
      }
    }
    return {
      query: async (sql, params) => executeMockQuery(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
};

// Check if real MySQL is reachable, otherwise log mock mode
(async () => {
  if (realPool) {
    try {
      const conn = await realPool.getConnection();
      useRealDb = true;
      console.log('✅ Real MySQL connected successfully');
      conn.release();
      return;
    } catch (err) {
      console.warn('⚠️ MySQL not reachable (' + err.message + '). Using in-memory fallback.');
    }
  } else {
    console.log('ℹ️ Running with in-memory database mock (default test accounts loaded)');
  }
})();

module.exports = db;
