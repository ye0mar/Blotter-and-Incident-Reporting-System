import { getUsers, setCurrentUser, INITIAL_OFFICIAL_PASSWORDS } from './shared.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorBox = document.getElementById('error-box');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');

    const emailInput = document.getElementById('email').value.trim().toLowerCase();
    const passwordInput = document.getElementById('password').value.trim();

    const users = getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === emailInput);

    if (!foundUser) {
      errorBox.textContent = 'Invalid email or password. Please verify your credentials.';
      errorBox.classList.remove('hidden');
      return;
    }

    const officialPwd = INITIAL_OFFICIAL_PASSWORDS[emailInput];
    if (officialPwd) {
      if (passwordInput !== officialPwd) {
        errorBox.textContent = 'Invalid password. Please check accounts.txt for official credentials.';
        errorBox.classList.remove('hidden');
        return;
      }
    } else if (foundUser.password && foundUser.password !== passwordInput) {
      errorBox.textContent = 'Invalid password. Please verify your login credentials.';
      errorBox.classList.remove('hidden');
      return;
    }

    setCurrentUser(foundUser);

    // Redirect based on role
    if (foundUser.role === 'admin') {
      window.location.href = '/src/admin/admin.html';
    } else if (foundUser.role === 'captain') {
      window.location.href = '/src/captain/captain.html';
    } else if (foundUser.role === 'kagawad') {
      window.location.href = '/src/kagawad/kagawad.html';
    } else if (foundUser.role === 'staff') {
      window.location.href = '/src/staff/staff.html';
    } else if (foundUser.role === 'resident') {
      window.location.href = '/src/resident/resident.html';
    } else {
      window.location.href = '/src/resident/resident.html';
    }
  });
});
