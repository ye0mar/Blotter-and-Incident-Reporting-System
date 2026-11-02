import { getCurrentUser, getBlotters, saveBlotters, getSchedules, logout, downloadBlotterDocument, saveUsers, getUsers } from '../shared.js';

let currentUser = getCurrentUser();
if (!currentUser || currentUser.role !== 'staff') {
  window.location.href = '/login.html';
}

window.switchTab = function(targetId) {
  document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
  const target = document.getElementById('view-' + targetId);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-target') === targetId) {
      link.classList.add('font-bold', 'text-white');
      link.classList.remove('text-slate-200');
    } else {
      link.classList.remove('font-bold', 'text-white');
      link.classList.add('text-slate-200');
    }
  });
};

window.goToStaffStep = function(stepNum) {
  const s1 = document.getElementById('staff-wizard-1');
  const s2 = document.getElementById('staff-wizard-2');
  const s3 = document.getElementById('staff-wizard-3');
  if (s1) s1.classList.add('hidden');
  if (s2) s2.classList.add('hidden');
  if (s3) s3.classList.add('hidden');

  const targetStep = document.getElementById('staff-wizard-' + stepNum);
  if (targetStep) targetStep.classList.remove('hidden');

  for (let i = 1; i <= 3; i++) {
    const badge = document.getElementById('staff-step-' + i);
    if (!badge) continue;
    if (i === stepNum) {
      badge.className = 'w-8 h-8 rounded-full border-2 border-blue-600 text-blue-600 bg-white flex items-center justify-center text-xs font-semibold';
    } else if (i < stepNum) {
      badge.className = 'w-8 h-8 rounded-full border-2 border-emerald-600 text-emerald-600 bg-white flex items-center justify-center text-xs font-semibold';
    } else {
      badge.className = 'w-8 h-8 rounded-full border-2 border-slate-300 text-slate-500 bg-white flex items-center justify-center text-xs font-semibold';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const userDisplayName = document.getElementById('user-display-name');
  if (userDisplayName && currentUser) {
    userDisplayName.textContent = currentUser.full_name;
  }

  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      window.switchTab(btn.getAttribute('data-target'));
    });
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Set default form values
  const rDatetime = document.getElementById('staff-report-datetime');
  const iDatetime = document.getElementById('staff-inc-datetime');
  const cName = document.getElementById('staff-comp-name');
  const cPhone = document.getElementById('staff-comp-phone');
  const cAddr = document.getElementById('staff-comp-address');
  const iLoc = document.getElementById('staff-inc-location');

  if (rDatetime) rDatetime.value = new Date().toISOString().slice(0, 16);
  if (iDatetime) iDatetime.value = new Date().toISOString().slice(0, 16);
  if (cName) cName.value = 'Juan Dela Cruz';
  if (cPhone) cPhone.value = '09123456786';
  if (cAddr) cAddr.value = 'Alley II, Sta. Ana, Pateros';
  if (iLoc) iLoc.value = 'Alley 1 P. Rosales St., Sta. Ana, Pateros';

  refreshStaffData();

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', refreshStaffData);
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) statusFilter.addEventListener('change', refreshStaffData);

  // Download draft
  const downloadBtn = document.getElementById('staff-download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const draft = buildStaffDraft();
      downloadBlotterDocument(draft);
    });
  }

  // Submit report
  const submitBtn = document.getElementById('staff-submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const draft = buildStaffDraft();
      const blotters = getBlotters();
      const newId = blotters.length > 0 ? Math.max(...blotters.map(b => b.id)) + 1 : 1;
      draft.id = newId;
      draft.blotter_id = 'BLT-2026-' + String(newId).padStart(4, '0');

      blotters.unshift(draft);
      saveBlotters(blotters);

      alert('Blotter report created successfully! Case ID: ' + draft.blotter_id);
      refreshStaffData();
      window.switchTab('staff-dashboard');
    });
  }

  // Profile
  const pName = document.getElementById('staff-prof-name');
  const pEmail = document.getElementById('staff-prof-email');
  const pRole = document.getElementById('staff-prof-role');
  const pPhone = document.getElementById('staff-prof-phone');
  const pAddr = document.getElementById('staff-prof-address');

  if (pName && currentUser) pName.value = currentUser.full_name;
  if (pEmail && currentUser) pEmail.value = currentUser.email;
  if (pRole && currentUser) pRole.value = currentUser.role;
  if (pPhone && currentUser) pPhone.value = currentUser.phone || '';
  if (pAddr && currentUser) pAddr.value = currentUser.address || '';

  const profForm = document.getElementById('staff-profile-form');
  if (profForm) {
    profForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentUser.full_name = document.getElementById('staff-prof-name').value.trim();
      currentUser.phone = document.getElementById('staff-prof-phone').value.trim();
      currentUser.address = document.getElementById('staff-prof-address').value.trim();

      const users = getUsers();
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx] = currentUser;
        saveUsers(users);
      }
      localStorage.setItem('ba_current_user', JSON.stringify(currentUser));
      alert('Profile updated successfully!');
      if (userDisplayName) userDisplayName.textContent = currentUser.full_name;
    });
  }
});

function buildStaffDraft() {
  const actions = [];
  document.querySelectorAll('.staff-action-chk:checked').forEach(chk => actions.push(chk.value));

  const compName = document.getElementById('staff-comp-name')?.value || 'Juan Dela Cruz';
  const compPhone = document.getElementById('staff-comp-phone')?.value || '';
  const compAddress = document.getElementById('staff-comp-address')?.value || '';
  const respName = document.getElementById('staff-resp-name')?.value || 'Hindi tinukoy';
  const respPhone = document.getElementById('staff-resp-phone')?.value || '';
  const respAddress = document.getElementById('staff-resp-address')?.value || '';
  const incLocation = document.getElementById('staff-inc-location')?.value || '';
  const incDatetime = document.getElementById('staff-inc-datetime')?.value || '';
  const incNarrative = document.getElementById('staff-inc-narrative')?.value || 'Walang ibinigay na detalyadong salaysay.';

  return {
    id: 0,
    blotter_id: 'DRAFT-' + Math.floor(1000 + Math.random() * 9000),
    complainant_name: compName,
    complainant_phone: compPhone,
    complainant_address: compAddress,
    complainant_relation: 'Complainant',
    respondent_name: respName,
    respondent_phone: respPhone,
    respondent_address: respAddress,
    incident_type: 'Pagnanakaw',
    incident_types: ['Pagnanakaw'],
    incident_location: incLocation,
    incident_datetime: incDatetime,
    incident_description: incNarrative,
    actions: actions,
    reported_at: new Date().toLocaleString(),
    status: 'pending',
    official_name: currentUser ? currentUser.full_name : 'Staff Desk Officer'
  };
}

function refreshStaffData() {
  const blotters = getBlotters();
  const search = document.getElementById('search-input')?.value.toLowerCase() || '';
  const statusF = document.getElementById('status-filter')?.value || 'all';

  const pending = blotters.filter(b => b.status === 'pending').length;
  const investigating = blotters.filter(b => b.status === 'investigating').length;
  const resolved = blotters.filter(b => b.status === 'resolved').length;
  const rate = blotters.length > 0 ? Math.round((resolved / blotters.length) * 100) : 0;

  const statPending = document.getElementById('stat-pending');
  const statInvestigating = document.getElementById('stat-investigating');
  const statResolved = document.getElementById('stat-resolved');
  const statRate = document.getElementById('stat-rate');
  const staffTotalCount = document.getElementById('staff-total-count');
  if (statPending) statPending.textContent = pending;
  if (statInvestigating) statInvestigating.textContent = investigating;
  if (statResolved) statResolved.textContent = resolved;
  if (statRate) statRate.textContent = rate + '%';
  if (staffTotalCount) staffTotalCount.textContent = `${blotters.length} Records`;

  const filtered = blotters.filter(b => {
    const matchSearch = (b.blotter_id && b.blotter_id.toLowerCase().includes(search)) ||
                        (b.complainant_name && b.complainant_name.toLowerCase().includes(search)) ||
                        (b.incident_location && b.incident_location.toLowerCase().includes(search));
    const matchStatus = statusF === 'all' || b.status === statusF;
    return matchSearch && matchStatus;
  });

  const tbody = document.getElementById('incidents-table-body');
  if (tbody) {
    tbody.innerHTML = '';
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">No blotter records found.</td></tr>`;
    } else {
      filtered.forEach(b => {
        let badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
        if (b.status === 'pending') badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200';
        if (b.status === 'resolved') badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50/80 transition-colors';
        tr.innerHTML = `
          <td class="px-4 py-3 font-mono font-bold text-[#0d3461]">${b.blotter_id}</td>
          <td class="px-4 py-3 font-semibold">${b.complainant_name}</td>
          <td class="px-4 py-3">${b.respondent_name}</td>
          <td class="px-4 py-3">${b.incident_type}</td>
          <td class="px-4 py-3">
            <span class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badgeStyle}">${b.status}</span>
          </td>
          <td class="px-4 py-3 text-right space-x-2">
            <button class="download-btn px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md text-xs font-semibold border border-blue-200">Download</button>
          </td>
        `;
        tr.querySelector('.download-btn')?.addEventListener('click', () => downloadBlotterDocument(b));
        tbody.appendChild(tr);
      });
    }
  }

  // Schedule table
  const schTbody = document.getElementById('staff-schedule-body');
  if (schTbody) {
    schTbody.innerHTML = '';
    const schedules = getSchedules();
    schedules.forEach(s => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50/80 transition-colors';
      tr.innerHTML = `
        <td class="px-4 py-3 font-mono font-bold text-[#0d3461]">${s.blotter_id}</td>
        <td class="px-4 py-3 font-semibold">${s.title}</td>
        <td class="px-4 py-3 text-slate-600">${s.date} — ${s.time}</td>
        <td class="px-4 py-3">${s.venue}</td>
        <td class="px-4 py-3"><span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">${s.status}</span></td>
      `;
      schTbody.appendChild(tr);
    });
  }
}
