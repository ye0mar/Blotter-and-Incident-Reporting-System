import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Clock, LogOut, CheckCircle2, ArrowRight } from 'lucide-react';

export const PendingApprovalView: React.FC = () => {
  const { currentUser, logout, quickSwitchUser } = useApp();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 sm:p-10 shadow-2xl border border-slate-200 text-center space-y-6">
        
        {/* Barangay Seal */}
        <div className="w-20 h-20 rounded-full mx-auto overflow-hidden flex items-center justify-center">
          <img 
            src="/santa-ana-logo.png" 
            alt="Barangay Sta. Ana Seal" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
            <span>Awaiting Admin Authorization</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0d3461] tracking-tight">
            Account Pending Approval
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans">
            Barangay Sta. Ana security policy requires an Administrator to verify and approve all Staff, Captain, and Kagawad accounts before portal access is granted.
          </p>
        </div>

        {/* User Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Account Name:</span>
            <span className="font-bold text-slate-900">{currentUser?.full_name}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Assigned Role:</span>
            <span className="font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
              {currentUser?.role}
            </span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Account ID:</span>
            <span className="font-mono font-bold text-slate-800">{currentUser?.user_id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Email:</span>
            <span className="font-medium text-slate-700">{currentUser?.email}</span>
          </div>
        </div>

        {/* Policy Notice */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-left flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            Please inform the Barangay System Administrator to approve your account under <strong>User Management</strong>. Once approved, you can immediately access your dashboard.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          {/* Quick Demo button to switch to Admin so the tester can approve immediately */}
          <button
            onClick={() => quickSwitchUser('admin')}
            className="w-full py-3 bg-[#0d3461] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Log In as Administrator to Approve</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={logout}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
