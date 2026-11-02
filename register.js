import { getUsers, saveUsers } from './shared.js';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const messageBox = document.getElementById('message-box');

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    messageBox.className = 'hidden p-3 rounded-lg text-xs';

    const fullName = document.getElementById('full_name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const role = document.getElementById('role').value;
    const address = document.getElementById('address').value.trim();

    if (!fullName || !email || !password) {
      messageBox.textContent = 'Please fill in all required fields.';
      messageBox.className = 'p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700';
      return;
    }

    const users = getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email);
    if (existing) {
      messageBox.textContent = 'Email is already registered. Please sign in instead.';
      messageBox.className = 'p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700';
      return;
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const assignedRole = 'resident'; // Public signups are automatically assigned resident role

    const newUser = {
      id: newId,
      user_id: 'U' + String(newId).padStart(3, '0'),
      full_name: fullName,
      email: email,
      password: password,
      role: assignedRole,
      status: 'active',
      phone: phone || 'N/A',
      address: address || 'Barangay Sta. Ana, Pateros',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    users.push(newUser);
    saveUsers(users);

    messageBox.textContent = 'Registration successful! You may now sign in with your email and password.';
    messageBox.className = 'p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700';

    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1500);
  });
});
