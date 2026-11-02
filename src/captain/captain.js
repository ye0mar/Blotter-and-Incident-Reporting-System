import { getCurrentUser, getBlotters, getSchedules, logout, downloadBlotterDocument, saveUsers, getUsers } from '../shared.js';

let currentUser = getCurrentUser();
if (!currentUser || currentUser.role !== 'captain') {
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

document.addEventListener('DOMContentLoaded', () => {
  const userDisplayName = document.getElementById('user-display-name');
  if (userDisplayName && currentUser) {
    userDisplayName.textContent = currentUser.full_name;
  }

  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => window.switchTab(btn.getAttribute('data-target')));
  });
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  refreshCaptainData();

  const capName = document.getElementById('cap-name');
  const capEmail = document.getElementById('cap-email');
  const capPhone = document.getElementById('cap-phone');
  if (capName && currentUser) capName.value = currentUser.full_name;
  if (capEmail && currentUser) capEmail.value = currentUser.email;
  if (capPhone && currentUser) capPhone.value = currentUser.phone || '';

  const profileForm = document.getElementById('captain-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentUser.full_name = document.getElementById('cap-name').value.trim();
      currentUser.phone = document.getElementById('cap-phone').value.trim();
      const users = getUsers();
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) { users[idx] = currentUser; saveUsers(users); }
      localStorage.setItem('ba_current_user', JSON.stringify(currentUser));
      alert('Profile updated successfully!');
      if (userDisplayName) userDisplayName.textContent = currentUser.full_name;
    });
  }
});

function refreshCaptainData() {
  const blotters = getBlotters();
  const capTotal = document.getElementById('cap-total');
  const capPending = document.getElementById('cap-pending');
  const capInvestigating = document.getElementById('cap-investigating');
  const capResolved = document.getElementById('cap-resolved');
  if (capTotal) capTotal.textContent = blotters.length;
  if (capPending) capPending.textContent = blotters.filter(b => b.status === 'pending').length;
  if (capInvestigating) capInvestigating.textContent = blotters.filter(b => b.status === 'investigating').length;
  if (capResolved) capResolved.textContent = blotters.filter(b => b.status === 'resolved').length;

  const caseCountSpan = document.getElementById('captain-case-count');
  if (caseCountSpan) caseCountSpan.textContent = `${blotters.length} Cases`;

  const allTbody = document.getElementById('captain-all-body');
  if (allTbody) {
    allTbody.innerHTML = '';
    if (blotters.length === 0) {
      allTbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-400">No blotter records filed yet.</td></tr>';
    } else {
      blotters.forEach(b => {
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
          <td class="px-4 py-3"><span class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border ${badgeStyle}">${b.status}</span></td>
          <td class="px-4 py-3 text-right"><button class="doc-btn px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md text-xs font-semibold border border-blue-200">Download</button></td>
        `;
        tr.querySelector('.doc-btn').addEventListener('click', () => downloadBlotterDocument(b));
        allTbody.appendChild(tr);
      });
    }
  }

  const escTbody = document.getElementById('captain-escalated-body');
  if (escTbody) {
    escTbody.innerHTML = '';
    const escalated = blotters.filter(b => b.status === 'investigating' || b.assigned_to === currentUser?.id);
    escalated.forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-4 py-3 font-mono font-bold text-[#0d3461]">${b.blotter_id}</td>
        <td class="px-4 py-3 font-semibold">${b.complainant_name}</td>
        <td class="px-4 py-3">${b.incident_type}</td>
        <td class="px-4 py-3"><span class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">${b.status}</span></td>
        <td class="px-4 py-3 text-right"><button class="doc-btn px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md text-xs font-semibold border border-blue-200">Download</button></td>
      `;
      tr.querySelector('.doc-btn').addEventListener('click', () => downloadBlotterDocument(b));
      escTbody.appendChild(tr);
    });
  }

  const schTbody = document.getElementById('captain-schedule-body');
  if (schTbody) {
    schTbody.innerHTML = '';
    getSchedules().forEach(s => {
      const tr = document.createElement('tr');
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
