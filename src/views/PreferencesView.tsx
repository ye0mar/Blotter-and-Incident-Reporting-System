import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle, Smartphone, Mail, Calendar, ShieldAlert } from 'lucide-react';

export const PreferencesView: React.FC = () => {
  const { currentUser } = useApp();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [hearingAlerts, setHearingAlerts] = useState(true);
  const [statusAlerts, setStatusAlerts] = useState(true);
  const [maintenanceNotices, setMaintenanceNotices] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  if (!currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {savedMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xs">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Notification preferences have been saved successfully!</span>
        </div>
      )}

      {/* Preferences Settings Card */}
      <form onSubmit={handleSave} className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center gap-2.5 text-[#3730A3]">
          <Bell className="w-5 h-5" />
          <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            Alert &amp; Delivery Channels
          </h3>
        </div>

        <div className="space-y-3.5">
          <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200/80 bg-[#F8FAFC] hover:bg-slate-100/60 cursor-pointer transition-colors">
            <div className="flex gap-3.5">
              <Mail className="w-5 h-5 text-[#3730A3] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Email Notifications</div>
                <div className="text-xs text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Receive email alerts for official summons, case resolutions, and hearing notices.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={() => setEmailNotif(!emailNotif)}
              className="w-4 h-4 accent-[#3730A3] rounded mt-1 cursor-pointer"
            />
          </label>

          <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200/80 bg-[#F8FAFC] hover:bg-slate-100/60 cursor-pointer transition-colors">
            <div className="flex gap-3.5">
              <Smartphone className="w-5 h-5 text-[#3730A3] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>SMS / Text Alerts</div>
                <div className="text-xs text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Receive urgent text messages on your registered mobile number for scheduled sessions.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={smsNotif}
              onChange={() => setSmsNotif(!smsNotif)}
              className="w-4 h-4 accent-[#3730A3] rounded mt-1 cursor-pointer"
            />
          </label>

          <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200/80 bg-[#F8FAFC] hover:bg-slate-100/60 cursor-pointer transition-colors">
            <div className="flex gap-3.5">
              <Calendar className="w-5 h-5 text-[#3730A3] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Hearing &amp; Mediation Reminders</div>
                <div className="text-xs text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Get automatic reminder 24 hours and 2 hours before scheduled barangay hearings.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={hearingAlerts}
              onChange={() => setHearingAlerts(!hearingAlerts)}
              className="w-4 h-4 accent-[#3730A3] rounded mt-1 cursor-pointer"
            />
          </label>

          <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200/80 bg-[#F8FAFC] hover:bg-slate-100/60 cursor-pointer transition-colors">
            <div className="flex gap-3.5">
              <ShieldAlert className="w-5 h-5 text-[#3730A3] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Case Status Updates</div>
                <div className="text-xs text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Notify me whenever a case status changes from Pending to Investigating or Resolved.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={statusAlerts}
              onChange={() => setStatusAlerts(!statusAlerts)}
              className="w-4 h-4 accent-[#3730A3] rounded mt-1 cursor-pointer"
            />
          </label>

          <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200/80 bg-[#F8FAFC] hover:bg-slate-100/60 cursor-pointer transition-colors">
            <div className="flex gap-3.5">
              <Bell className="w-5 h-5 text-[#3730A3] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>System Maintenance &amp; Announcements</div>
                <div className="text-xs text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Receive announcements regarding barangay hall schedules and portal maintenance.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={maintenanceNotices}
              onChange={() => setMaintenanceNotices(!maintenanceNotices)}
              className="w-4 h-4 accent-[#3730A3] rounded mt-1 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-bold text-xs sm:text-sm rounded-full transition-all shadow-xs cursor-pointer"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            Save Preferences
          </button>
        </div>
      </form>

    </div>
  );
};

export default PreferencesView;
