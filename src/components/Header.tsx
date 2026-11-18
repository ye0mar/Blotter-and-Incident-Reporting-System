import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Bell, Check, Settings, User, AlertTriangle, ShieldCheck, Server, Database, Activity, Wrench, Calendar, ClipboardList, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    activeTab, 
    setActiveTab, 
    notifications, 
    markNotificationRead, 
    clearAllNotifications,
    blotters
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderNavLinks = (isMobile = false) => {
    const btnCls = isMobile
      ? (isActive: boolean) => `w-full text-left px-4 py-2.5 rounded-xl transition-all text-sm font-semibold cursor-pointer ${isActive ? 'bg-[#E0E7FF] text-[#3730A3]' : 'text-[#64748B] hover:bg-slate-100 hover:text-[#1E293B]'}`
      : navBtnClass;

    const handleNavClick = (tab: string) => {
      setActiveTab(tab);
      if (isMobile) setMobileMenuOpen(false);
    };

    if (currentUser?.role === 'admin') {
      return (
        <>
          <button onClick={() => handleNavClick('user-management')} className={btnCls(activeTab === 'user-management')}>
            User Management
          </button>
          <button onClick={() => handleNavClick('issue-reports')} className={btnCls(activeTab === 'issue-reports')}>
            Issue Reports
          </button>
        </>
      );
    } else if (currentUser?.role === 'captain') {
      return (
        <>
          <button onClick={() => handleNavClick('captain-dashboard')} className={btnCls(activeTab === 'captain-dashboard' || activeTab === 'dashboard')}>
            Home
          </button>
          <button onClick={() => handleNavClick('captain-analytics')} className={btnCls(activeTab === 'captain-analytics')}>
            Analytics
          </button>
          <button onClick={() => handleNavClick('captain-report')} className={btnCls(activeTab === 'captain-report')}>
            Report
          </button>
        </>
      );
    } else if (currentUser?.role === 'resident') {
      return (
        <>
          <button onClick={() => handleNavClick('resident-home')} className={btnCls(activeTab === 'resident-home')}>
            Home
          </button>
          <button onClick={() => handleNavClick('resident-complaints')} className={btnCls(activeTab === 'resident-complaints')}>
            My Complaints
          </button>
          <button onClick={() => handleNavClick('resident-schedules')} className={btnCls(activeTab === 'resident-schedules')}>
            My Schedule
          </button>
        </>
      );
    } else if (currentUser?.role === 'staff') {
      return (
        <>
          <button onClick={() => handleNavClick('staff-dashboard')} className={btnCls(activeTab === 'staff-dashboard')}>
            Home
          </button>
          <button onClick={() => handleNavClick('staff-create-report')} className={btnCls(activeTab === 'staff-create-report')}>
            Create Report
          </button>
          <button onClick={() => handleNavClick('staff-all-incident')} className={btnCls(activeTab === 'staff-all-incident')}>
            All Incidents
          </button>
          <button onClick={() => handleNavClick('staff-schedule')} className={btnCls(activeTab === 'staff-schedule')}>
            Schedule
          </button>
        </>
      );
    } else {
      return (
        <>
          <button onClick={() => handleNavClick('kagawad-investigate')} className={btnCls(activeTab === 'kagawad-investigate')}>
            Investigate
          </button>
          <button onClick={() => handleNavClick('kagawad-schedule')} className={btnCls(activeTab === 'kagawad-schedule')}>
            My Schedule
          </button>
        </>
      );
    }
  };

  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Role-based notifications filtering ensuring users ONLY see their own targeted notifications or role notifications
  const userNotifications = notifications.filter(n => {
    if (!currentUser) return false;

    // If notification is specifically targeted to a user_id, ONLY that user should receive it
    if (n.user_id !== undefined && n.user_id !== null) {
      return n.user_id === currentUser.id;
    }

    if (n.target_role === 'all') return true;

    if (currentUser.role === 'resident') {
      if (n.target_role && n.target_role !== 'resident') return false;
      if (n.blotter_id) {
        const relatedBlotter = blotters.find(b => b.blotter_id === n.blotter_id);
        if (relatedBlotter) {
          const isOwn = 
            (relatedBlotter.complainant_id && relatedBlotter.complainant_id === currentUser.id) ||
            (relatedBlotter.complainant_name && relatedBlotter.complainant_name.toLowerCase() === currentUser.full_name.toLowerCase());
          if (!isOwn) return false;
        }
      }
      return true;
    }

    if (n.target_role === currentUser.role) return true;
    if (currentUser.role === 'admin' || currentUser.role === 'captain' || currentUser.role === 'kagawad') {
      return n.target_role === 'staff' || n.target_role === 'admin' || n.target_role === 'all';
    }
    return false;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoHomeClick = () => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') setActiveTab('user-management');
    else if (currentUser.role === 'captain') setActiveTab('captain-dashboard');
    else if (currentUser.role === 'staff') setActiveTab('staff-dashboard');
    else if (currentUser.role === 'kagawad') setActiveTab('kagawad-investigate');
    else if (currentUser.role === 'resident') setActiveTab('resident-home');
    else setActiveTab('staff-dashboard');
  };

  // Clean soft pastel active button class
  const navBtnClass = (isActive: boolean) => 
    `px-4 py-1.5 rounded-full transition-all text-xs sm:text-sm font-semibold cursor-pointer ${
      isActive 
        ? 'bg-[#E0E7FF] text-[#3730A3] shadow-xs' 
        : 'text-[#64748B] hover:bg-slate-100/80 hover:text-[#1E293B]'
    }`;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md text-[#1E293B] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] sticky top-0 z-40 border-b border-slate-200/80 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Side: Clickable Barangay Logo & Title */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={handleLogoHomeClick}
              title="Go to Home"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 border border-slate-200/60 shadow-xs">
                <img 
                  src="/santa-ana-logo.png" 
                  alt="Barangay Sta. Ana Seal" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-[13px] sm:text-[15px] font-bold tracking-wide uppercase leading-tight text-[#1E293B] group-hover:text-[#3730A3] transition-colors" style={{ fontFamily: "'Fredoka', 'Nunito', 'Urbanist', sans-serif" }}>
                  BLOTTER AND INCIDENT REPORTING SYSTEM
                </h1>
                <p className="text-[11px] text-[#64748B] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Barangay Sta. Ana, Pateros
                </p>
              </div>
            </div>

            {/* Right Side: Nav Links + Bell + Settings Dropdown + Logout */}
            {currentUser && (
              <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                
                {/* Navigation Links (Desktop: visible on laptop/PC, hidden on phone) */}
                <nav className="hidden md:flex items-center gap-1 text-[13px] sm:text-[14px]" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>
                  {renderNavLinks(false)}
                </nav>

                {/* Hamburger Menu Button (Visible on phone only, hidden on laptop/PC) */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(!mobileMenuOpen);
                    setNotifOpen(false);
                    setSettingsOpen(false);
                  }}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 md:hidden transition-colors cursor-pointer"
                  title="Toggle Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setSettingsOpen(false);
                    }}
                    className="p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 relative transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    )}
                  </button>

                  {/* Notifications Dropdown Panel */}
                  {notifOpen && (
                    <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 text-slate-800 z-50 overflow-hidden font-sans">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="text-[13px] font-bold text-slate-900">Notifications ({unreadCount} unread)</div>
                        <button
                          onClick={clearAllNotifications}
                          className="text-[11px] text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {userNotifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">No notifications yet.</div>
                        ) : (
                          userNotifications.map(n => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                markNotificationRead(n.id);
                                setNotifOpen(false);

                                const text = (n.title + ' ' + n.message).toLowerCase();

                                if (currentUser?.role === 'resident') {
                                  if (text.includes('schedule') || text.includes('hearing') || text.includes('iskedyul') || text.includes('mediasyon')) {
                                    setActiveTab('resident-schedules');
                                  } else {
                                    setActiveTab('resident-complaints');
                                  }
                                } else if (currentUser?.role === 'staff') {
                                  if (text.includes('schedule') || text.includes('hearing') || text.includes('iskedyul')) {
                                    setActiveTab('staff-schedule');
                                  } else {
                                    setActiveTab('staff-all-incident');
                                  }
                                } else if (currentUser?.role === 'kagawad') {
                                  if (text.includes('schedule') || text.includes('hearing') || text.includes('iskedyul')) {
                                    setActiveTab('kagawad-schedule');
                                  } else {
                                    setActiveTab('kagawad-investigate');
                                  }
                                } else if (currentUser?.role === 'captain') {
                                  if (text.includes('report') || text.includes('blotter')) {
                                    setActiveTab('captain-report');
                                  } else {
                                    setActiveTab('captain-dashboard');
                                  }
                                } else if (currentUser?.role === 'admin') {
                                  if (text.includes('issue')) {
                                    setActiveTab('issue-reports');
                                  } else {
                                    setActiveTab('user-management');
                                  }
                                }
                              }}
                              className={`p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer ${n.read ? 'bg-white opacity-75' : 'bg-slate-50'}`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[12px] font-bold text-slate-900">{n.title}</span>
                                <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                              </div>
                              <p className="text-[12px] text-slate-600 leading-snug">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings Gear Icon Dropdown */}
                <div className="relative" ref={settingsRef}>
                  <button
                    onClick={() => {
                      setSettingsOpen(!settingsOpen);
                      setNotifOpen(false);
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      activeTab === 'profile' || activeTab === 'preferences' || activeTab === 'report-issue' || settingsOpen
                        ? 'bg-[#CAE1F7] text-[#1E3A8A]' 
                        : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100'
                    }`}
                    title="Settings & Options"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu below Settings Icon: Separate pages */}
                  {settingsOpen && (
                    <div className="absolute right-0 top-11 w-56 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 z-50 overflow-hidden font-sans py-1.5 animate-in fade-in zoom-in-95 duration-100">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setSettingsOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('preferences');
                          setSettingsOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors"
                      >
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span>Preferences</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <>
                          <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-1">System Administration</div>
                          <button
                            onClick={() => { setActiveTab('system-overview'); setSettingsOpen(false); }}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                          >
                            <Server className="w-4 h-4 text-indigo-500" />
                            <span>Overview &amp; Deployment</span>
                          </button>
                          <button
                            onClick={() => { setActiveTab('system-security'); setSettingsOpen(false); }}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-indigo-500" />
                            <span>System Security</span>
                          </button>
                          <button
                            onClick={() => { setActiveTab('backup-recovery'); setSettingsOpen(false); }}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                          >
                            <Database className="w-4 h-4 text-indigo-500" />
                            <span>Backup &amp; Recovery</span>
                          </button>
                          <button
                            onClick={() => { setActiveTab('system-monitoring'); setSettingsOpen(false); }}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                          >
                            <Activity className="w-4 h-4 text-indigo-500" />
                            <span>Live Monitoring</span>
                          </button>
                          <button
                            onClick={() => { setActiveTab('troubleshooting'); setSettingsOpen(false); }}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                          >
                            <Wrench className="w-4 h-4 text-indigo-500" />
                            <span>Troubleshooting</span>
                          </button>
                          <button
                            onClick={() => { setActiveTab('maintenance-plan'); setSettingsOpen(false); }}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span>Maintenance Plan</span>
                          </button>
                          <button
                            onClick={() => { setActiveTab('system-logs'); setSettingsOpen(false); }}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                          >
                            <ClipboardList className="w-4 h-4 text-indigo-500" />
                            <span>Admin Audit Logs</span>
                          </button>
                        </>
                      )}



                      {/* ONLY show 'Report an Issue' for non-admin users (Resident, Staff, Kagawad, Captain) */}
                      {currentUser.role !== 'admin' && (
                        <button
                          onClick={() => {
                            setActiveTab('report-issue');
                            setSettingsOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2.5 transition-colors border-t border-slate-100 mt-0.5"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Report an Issue</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Redesigned Logout Button - Soft red/pink outline button */}
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg text-[13px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/90 flex items-center gap-1.5 transition-all shadow-xs"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown Panel (Visible on phone when open, hidden on laptop/PC) */}
      {mobileMenuOpen && currentUser && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-4 space-y-1.5 z-30 sticky top-16 print:hidden">
          {renderNavLinks(true)}
        </div>
      )}
    </>
  );
};
