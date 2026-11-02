import { getCurrentUser, getBlotters, saveBlotters, getSchedules, logout, downloadBlotterDocument, saveUsers, getUsers } from '../shared.js';

let currentUser = getCurrentUser();
if (!currentUser || currentUser.role !== 'resident') {
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

window.goToWizardStep = function(stepNum) {
  const w1 = document.getElementById('wizard-step-1');
  const w2 = document.getElementById('wizard-step-2');
  const w3 = document.getElementById('wizard-step-3');
  if (w1) w1.classList.add('hidden');
  if (w2) w2.classList.add('hidden');
  if (w3) w3.classList.add('hidden');

  const targetStep = document.getElementById('wizard-step-' + stepNum);
  if (targetStep) targetStep.classList.remove('hidden');

  for (let i = 1; i <= 3; i++) {
    const badge = document.getElementById('step-badge-' + i);
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
  const welcomeName = document.getElementById('welcome-name');
  if (userDisplayName && currentUser) userDisplayName.textContent = currentUser.full_name;
  if (welcomeName && currentUser) welcomeName.textContent = currentUser.full_name;

  // Set default form values
  const reportDt = document.getElementById('report-datetime-str');
  const compName = document.getElementById('comp-name');
  const compPhone = document.getElementById('comp-phone');
  const compAddr = document.getElementById('comp-address');
  const incDt = document.getElementById('inc-datetime');
  const incLoc = document.getElementById('inc-location');

  if (reportDt) reportDt.value = new Date().toLocaleString();
  if (compName && currentUser) compName.value = currentUser.full_name;
  if (compPhone && currentUser) compPhone.value = currentUser.phone || '';
  if (compAddr && currentUser) compAddr.value = currentUser.address || '';
  if (incDt) incDt.value = new Date().toISOString().slice(0, 16);
  if (incLoc) incLoc.value = 'Alley 1 P. Rosales St., Sta. Ana, Pateros';

  // Navigation listeners
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      window.switchTab(target);
    });
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Load stats and tables
  refreshResidentData();

  // Download draft button in Step 3
  const dlDraftBtn = document.getElementById('download-draft-btn');
  if (dlDraftBtn) {
    dlDraftBtn.addEventListener('click', () => {
      const draft = buildDraftRecord();
      downloadBlotterDocument(draft);
    });
  }

  // Final submit button
  const submitBtn = document.getElementById('submit-report-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const draft = buildDraftRecord();
      const blotters = getBlotters();
      const newId = blotters.length > 0 ? Math.max(...blotters.map(b => b.id)) + 1 : 1;
      draft.id = newId;
      draft.blotter_id = 'BLT-2026-' + String(newId).padStart(4, '0');

      blotters.unshift(draft);
      saveBlotters(blotters);

      alert('Incident reported successfully! Case ID: ' + draft.blotter_id);
      refreshResidentData();
      window.switchTab('resident-complaints');
    });
  }

  // Profile Form
  const pName = document.getElementById('prof-name');
  const pEmail = document.getElementById('prof-email');
  const pRole = document.getElementById('prof-role');
  const pPhone = document.getElementById('prof-phone');
  const pAddr = document.getElementById('prof-address');

  if (pName && currentUser) pName.value = currentUser.full_name;
  if (pEmail && currentUser) pEmail.value = currentUser.email;
  if (pRole && currentUser) pRole.value = currentUser.role;
  if (pPhone && currentUser) pPhone.value = currentUser.phone || '';
  if (pAddr && currentUser) pAddr.value = currentUser.address || '';

  const profForm = document.getElementById('profile-form');
  if (profForm) {
    profForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentUser.full_name = document.getElementById('prof-name').value.trim();
      currentUser.phone = document.getElementById('prof-phone').value.trim();
      currentUser.address = document.getElementById('prof-address').value.trim();

      const users = getUsers();
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx] = currentUser;
        saveUsers(users);
      }
      localStorage.setItem('ba_current_user', JSON.stringify(currentUser));
      alert('Profile updated successfully!');
      if (userDisplayName) userDisplayName.textContent = currentUser.full_name;
      if (welcomeName) welcomeName.textContent = currentUser.full_name;
    });
  }
});

function buildDraftRecord() {
  const actions = [];
  document.querySelectorAll('.action-chk:checked').forEach(chk => actions.push(chk.value));

  const compName = document.getElementById('comp-name')?.value || currentUser?.full_name || 'Resident';
  const compPhone = document.getElementById('comp-phone')?.value || '';
  const compAddr = document.getElementById('comp-address')?.value || '';
  const compRel = document.getElementById('comp-relation')?.value || 'Biktima';
  const respName = document.getElementById('resp-name')?.value || 'Hindi tinukoy';
  const respPhone = document.getElementById('resp-phone')?.value || '';
  const respAddr = document.getElementById('resp-address')?.value || '';
  const incLoc = document.getElementById('inc-location')?.value || '';
  const incDt = document.getElementById('inc-datetime')?.value || '';
  const incDesc = document.getElementById('inc-narrative')?.value || 'Walang ibinigay na detalyadong salaysay.';
  const reportDt = document.getElementById('report-datetime-str')?.value || new Date().toLocaleString();

  return {
    id: 0,
    blotter_id: 'DRAFT-' + Math.floor(1000 + Math.random() * 9000),
    complainant_id: currentUser ? currentUser.id : 4,
    complainant_name: compName,
    complainant_phone: compPhone,
    complainant_address: compAddr,
    complainant_relation: compRel,
    respondent_name: respName,
    respondent_phone: respPhone,
    respondent_address: respAddr,
    incident_type: 'Pisikal na Pananakit',
    incident_types: ['Pisikal na Pananakit'],
    incident_location: incLoc,
    incident_datetime: incDt,
    incident_description: incDesc,
    actions: actions,
    reported_at: reportDt,
    status: 'pending',
    official_name: 'Duty Desk Officer'
  };
}

function refreshResidentData() {
  const blotters = getBlotters();
  const userName = currentUser ? currentUser.full_name.toLowerCase() : '';
  const userId = currentUser ? currentUser.id : 0;
  const myBlotters = blotters.filter(b => (b.complainant_name && b.complainant_name.toLowerCase() === userName) || b.complainant_id === userId);

  const activeCount = myBlotters.filter(b => b.status === 'pending' || b.status === 'investigating').length;
  const resolvedCount = myBlotters.filter(b => b.status === 'resolved').length;
  
  const schedules = getSchedules();
  const mySchedules = schedules.filter(s => myBlotters.some(b => b.blotter_id === s.blotter_id));

  const statActive = document.getElementById('stat-active-complaints');
  const statResolved = document.getElementById('stat-resolved-complaints');
  const statSched = document.getElementById('stat-scheduled-hearings');
  if (statActive) statActive.textContent = activeCount;
  if (statResolved) statResolved.textContent = resolvedCount;
  if (statSched) statSched.textContent = mySchedules.length;

  // Render Complaints Table
  const tbody = document.getElementById('complaints-table-body');
  if (tbody) {
    tbody.innerHTML = '';
    if (myBlotters.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">No complaints filed yet.</td></tr>`;
    } else {
      myBlotters.forEach(b => {
        let badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200'; // investigating
        if (b.status === 'pending') badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200';
        if (b.status === 'resolved') badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50/80 transition-colors';
        tr.innerHTML = `
          <td class="px-4 py-3 font-mono font-bold text-[#0d3461]">${b.blotter_id}</td>
          <td class="px-4 py-3 font-semibold">${b.incident_type}</td>
          <td class="px-4 py-3">${b.respondent_name}</td>
          <td class="px-4 py-3 text-slate-500">${b.reported_at || b.incident_datetime}</td>
          <td class="px-4 py-3">
            <span class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badgeStyle}">${b.status}</span>
          </td>
          <td class="px-4 py-3 text-right">
            <button class="download-case-btn px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md text-xs font-semibold border border-blue-200 transition-colors">Download</button>
          </td>
        `;
        tr.querySelector('.download-case-btn')?.addEventListener('click', () => {
          downloadBlotterDocument(b);
        });
        tbody.appendChild(tr);
      });
    }
  }

  // Render Schedule Table
  const schTbody = document.getElementById('schedule-table-body');
  if (schTbody) {
    schTbody.innerHTML = '';
    if (mySchedules.length === 0) {
      schTbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">No scheduled hearings.</td></tr>`;
    } else {
      mySchedules.forEach(s => {
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
}
