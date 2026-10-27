// ============================================================
//  nav-account.js  —  Unified Top Navigation, Account & Logout
// ============================================================

(function () {
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }

  function setupUserDisplay() {
    const user = getUser();
    const nameEls = document.querySelectorAll('.acc-user-name, #topNavUserName');
    const roleEls = document.querySelectorAll('.acc-user-role, #topNavUserRole');
    const rolePills = document.querySelectorAll('.account-role-pill');

    const displayName = user ? (user.name || user.full_name || user.email.split('@')[0]) : 'User';
    const displayRole = user ? (user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Official') : 'Guest';

    nameEls.forEach(el => el.textContent = displayName);
    roleEls.forEach(el => el.textContent = displayRole);
    rolePills.forEach(el => el.textContent = displayRole);
  }

  function ensureAccountModal() {
    if (document.getElementById('globalAccountModal')) return;

    const modal = document.createElement('div');
    modal.id = 'globalAccountModal';
    modal.className = 'account-modal-overlay';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="account-modal-box">
        <div class="account-modal-header">
          <h3><i class="fa fa-circle-user"></i> User Account Details</h3>
          <button class="account-modal-close" onclick="closeAccountModal()">&times;</button>
        </div>
        <div class="account-modal-body">
          <div class="account-info-grid">
            <div class="account-info-item">
              <label>Full Name</label>
              <span id="modalAccName">—</span>
            </div>
            <div class="account-info-item">
              <label>Role</label>
              <span id="modalAccRole">—</span>
            </div>
            <div class="account-info-item">
              <label>Email</label>
              <span id="modalAccEmail">—</span>
            </div>
            <div class="account-info-item">
              <label>User ID</label>
              <span id="modalAccId">—</span>
            </div>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 12px;">
            <h4 style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 10px;">
              <i class="fa fa-key" style="color: #0d3461;"></i> Change Password
            </h4>
            <form id="globalChangePwForm" onsubmit="submitChangePassword(event)">
              <div style="margin-bottom: 10px;">
                <label style="display:block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">Current Password</label>
                <input type="password" id="modalOldPassword" required placeholder="Enter current password"
                       style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none;" />
              </div>
              <div style="margin-bottom: 12px;">
                <label style="display:block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">New Password</label>
                <input type="password" id="modalNewPassword" required minlength="6" placeholder="Enter new password (min. 6 chars)"
                       style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none;" />
              </div>
              <div id="modalPwMessage" style="font-size: 12px; margin-bottom: 10px; display: none;"></div>
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button type="button" onclick="closeAccountModal()"
                        style="padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; font-size: 13px; font-weight: 600; cursor: pointer;">
                  Cancel
                </button>
                <button type="submit" id="btnSavePw"
                        style="padding: 8px 16px; border: none; border-radius: 6px; background: #0d3461; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  window.openAccountModal = function () {
    ensureAccountModal();
    const user = getUser();
    if (user) {
      document.getElementById('modalAccName').textContent = user.name || user.full_name || '—';
      document.getElementById('modalAccRole').textContent = (user.role ? user.role.toUpperCase() : '—');
      document.getElementById('modalAccEmail').textContent = user.email || '—';
      document.getElementById('modalAccId').textContent = user.user_id || `ID: ${user.id || '—'}`;
    }
    const msg = document.getElementById('modalPwMessage');
    if (msg) {
      msg.style.display = 'none';
      msg.textContent = '';
    }
    document.getElementById('globalChangePwForm')?.reset();
    document.getElementById('globalAccountModal').style.display = 'flex';
  };

  window.closeAccountModal = function () {
    const modal = document.getElementById('globalAccountModal');
    if (modal) modal.style.display = 'none';
  };

  window.submitChangePassword = async function (e) {
    e.preventDefault();
    const old_password = document.getElementById('modalOldPassword').value;
    const new_password = document.getElementById('modalNewPassword').value;
    const msg = document.getElementById('modalPwMessage');
    const btn = document.getElementById('btnSavePw');

    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      if (window.api?.auth?.changePassword) {
        await window.api.auth.changePassword(old_password, new_password);
      } else {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ old_password, new_password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to change password');
      }

      msg.style.display = 'block';
      msg.style.color = '#16a34a';
      msg.textContent = 'Password changed successfully!';
      setTimeout(() => {
        closeAccountModal();
      }, 1200);
    } catch (err) {
      msg.style.display = 'block';
      msg.style.color = '#dc2626';
      msg.textContent = err.message || 'Error updating password';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Update Password';
    }
  };

  window.handleLogout = function () {
    if (window.api?.auth?.logout) {
      window.api.auth.logout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
    }
  };

  // Close modal when clicking background
  document.addEventListener('click', function (e) {
    const modal = document.getElementById('globalAccountModal');
    if (modal && e.target === modal) {
      closeAccountModal();
    }
  });

  // Setup on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupUserDisplay();
      ensureAccountModal();
    });
  } else {
    setupUserDisplay();
    ensureAccountModal();
  }
})();
