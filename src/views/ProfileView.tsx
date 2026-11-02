import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Mail, Phone, MapPin, CheckCircle, Shield, Key } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, updateCurrentUserProfile, changePassword } = useApp();
  const [name, setName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (newPassword !== confirmPassword) {
      setMsg({ text: 'New passwords do not match.', error: true });
      return;
    }
    const res = changePassword(oldPassword, newPassword);
    setMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setTimeout(() => setMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xs border ${
            msg.error 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Card 1: User Information */}
      <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 text-[#3730A3]">
            <User className="w-5 h-5" />
            <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              User Information
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3730A3] bg-[#E0E7FF] px-3.5 py-1 rounded-full border border-indigo-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Shield className="w-3.5 h-3.5 text-[#6366F1]" /> {currentUser.role}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>Email Address (Read-only)</label>
              <div className="flex items-center px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-[#64748B] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <Mail className="w-4 h-4 mr-2.5 text-[#94A3B8] shrink-0" />
                {currentUser.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>Contact Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Barangay Sta. Ana, Pateros"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-bold text-xs sm:text-sm rounded-full transition-all shadow-xs cursor-pointer"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Save Profile Details
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Security & Password */}
      <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center gap-2.5 text-[#3730A3]">
          <Key className="w-5 h-5" />
          <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            Security &amp; Password
          </h3>
        </div>

        <form onSubmit={handleChangePwd} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>Current Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
                <input
                  type="password"
                  placeholder="At least 6 chars"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5" style={{ fontFamily: "'Quicksand', sans-serif" }}>Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#3730A3] hover:bg-[#2e2882] text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-xs cursor-pointer"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default ProfileView;
