import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Mail, Phone, MapPin, CheckCircle, Shield, Bell, Key } from 'lucide-react';

export const AccountView: React.FC = () => {
  const { currentUser, updateCurrentUserProfile, changePassword } = useApp();
  const [name, setName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  if (!currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({ full_name: name, phone, address });
    setMsg({ text: 'Profile details updated successfully!' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleChangePwd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMsg({ text: 'New password must be at least 6 characters.', error: true });
      return;
    }
    const res = changePassword(oldPassword, newPassword);
    setMsg({ text: res.message, error: !res.success });
    setOldPassword('');
    setNewPassword('');
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-[22px] font-bold text-slate-900 font-heading">Account &amp; Profile Settings</h2>
        <p className="text-[13px] text-slate-500 font-sans">Manage your personal information, contact details, and account preferences.</p>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-xl text-[13px] font-medium flex items-center gap-2 ${
            msg.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* User Information Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#6366F1]" />
            <h3 className="text-[16px] font-bold text-slate-900 font-heading">User Information</h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
            <Shield className="w-3 h-3" /> {currentUser.role}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-[#6366F1] bg-white"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Email Address (Read-only)</label>
              <div className="flex items-center px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                <Mail className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                {currentUser.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Contact Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-[#6366F1] bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Address</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Barangay Sta. Ana, Pateros"
                  className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-[#6366F1] bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-[#6366F1] hover:bg-indigo-700 text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm font-btn"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Account Settings & Preferences Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#6366F1]" />
          <h3 className="text-[16px] font-bold text-slate-900 font-heading">Preferences &amp; Notifications</h3>
        </div>

        <div className="space-y-3 text-[13px] text-slate-700">
          <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200/70 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900">Email Notifications</div>
              <div className="text-[12px] text-slate-500">Receive email alerts when case status or hearing schedules update.</div>
            </div>
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={() => setEmailNotif(!emailNotif)}
              className="w-4 h-4 accent-[#6366F1] rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200/70 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900">SMS / Text Alerts</div>
              <div className="text-[12px] text-slate-500">Get SMS text messages regarding urgent hearings and summons.</div>
            </div>
            <input
              type="checkbox"
              checked={smsNotif}
              onChange={() => setSmsNotif(!smsNotif)}
              className="w-4 h-4 accent-[#6366F1] rounded"
            />
          </label>
        </div>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-[#6366F1]" />
          <h3 className="text-[16px] font-bold text-slate-900 font-heading">Security &amp; Password</h3>
        </div>

        <form onSubmit={handleChangePwd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Current Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-[#6366F1] bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">New Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-[#6366F1] bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm font-btn"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
