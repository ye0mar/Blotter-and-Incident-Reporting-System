import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, User, Phone, MapPin, Shield } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('resident');
  const [regMessage, setRegMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.message || 'Invalid login details.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegMessage(null);
    const res = register({
      full_name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim(),
      phone: regPhone.trim(),
      address: regAddress.trim()
    });
    setRegMessage({ text: res.message, success: res.success });
    if (res.success) {
      setTimeout(() => {
        setIsRegister(false);
        setLoginEmail(regEmail);
      }, 1500);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl ${isRegister ? 'max-w-2xl' : 'max-w-md'} w-full p-8 shadow-xl border border-slate-200/80 text-center transition-all duration-300`}>
        
        {/* Barangay Seal */}
        <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden flex items-center justify-center">
          <img 
            src="/santa-ana-logo.png" 
            alt="Barangay Sta. Ana Seal" 
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-[20px] font-extrabold text-[#0d3461] tracking-wide uppercase font-heading">
          BLOTTER AND INCIDENT REPORTING SYSTEM
        </h1>
        <p className="text-[12px] text-slate-500 font-medium mb-6 font-sans">
          Barangay Sta. Ana, Pateros
        </p>

        {!isRegister ? (
          /* ================= SIGN IN ================= */
          <div className="space-y-4 text-left">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-[13px] text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0d3461] hover:bg-blue-900 text-white font-semibold text-[14px] rounded-lg transition-colors shadow-sm mt-3 flex items-center justify-center gap-2 font-btn"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-[13px] text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setLoginError('');
                    setRegMessage(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300 underline-offset-2"
                >
                  Signup
                </button>
              </p>
            </div>

          </div>
        ) : (
          /* ================= REGISTER (Wider Two-Column Grid Layout) ================= */
          <form onSubmit={handleRegister} className="space-y-3.5 text-left">
            {regMessage && (
              <div
                className={`p-3 rounded-lg text-[13px] flex items-center gap-2 ${
                  regMessage.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {regMessage.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{regMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Juan Dela Cruz"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="juandelacruz@gmail.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Contact Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="09123456789"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1 font-label">Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Street / Barangay Sta. Ana, Pateros"
                  value={regAddress}
                  onChange={e => setRegAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[12px] font-semibold text-slate-700 block">Account Role</span>
                <span className="text-[11px] text-slate-500">Public registration is assigned to Barangay Residents</span>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                Resident
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0d3461] hover:bg-blue-900 text-white font-semibold text-[14px] rounded-lg transition-colors shadow-sm mt-3 flex items-center justify-center gap-2 font-btn"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-[13px] text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setRegMessage(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300 underline-offset-2"
                >
                  Login
                </button>
              </p>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
