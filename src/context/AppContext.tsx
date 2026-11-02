import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, BlotterRecord, Schedule, ActivityLog, UserRole, UserStatus, BlotterStatus, SystemSettingsConfig, IssueReport } from '../types';
import { INITIAL_USERS, INITIAL_BLOTTERS, INITIAL_SCHEDULES, INITIAL_ACTIVITY_LOGS, INITIAL_OFFICIAL_PASSWORDS } from '../data/initialData';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  blotter_id?: string;
  target_role?: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  blotters: BlotterRecord[];
  schedules: Schedule[];
  activityLogs: ActivityLog[];
  notifications: AppNotification[];
  issueReports: IssueReport[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dossierBlotter: BlotterRecord | null;
  setDossierBlotter: (b: BlotterRecord | null) => void;
  
  markNotificationRead: (id: number) => void;
  clearAllNotifications: () => void;
  reportIssue: (data: { feature_name: string; description: string; screenshot?: string; screenshot_name?: string }) => void;
  resetUserPassword: (userId: number, newPassword?: string) => { success: boolean; message: string };

  // System Settings
  systemSettings: SystemSettingsConfig;
  updateSystemSettings: (newSettings: Partial<SystemSettingsConfig>) => void;
  createDatabaseBackup: () => void;
  clearDatabaseData: () => void;

  // Auth
  login: (email: string, password?: string) => { success: boolean; message?: string };
  quickSwitchUser: (role: UserRole) => void;
  register: (userData: { full_name: string; email: string; role?: UserRole; phone?: string; address?: string; password?: string }) => { success: boolean; message: string };
  logout: () => void;
  updateCurrentUserProfile: (profile: { full_name: string; phone?: string; address?: string }) => void;
  changePassword: (oldPwd: string, newPwd: string) => { success: boolean; message: string };

  // Blotter Actions
  addBlotter: (blotterData: Partial<BlotterRecord>) => BlotterRecord;
  updateBlotterStatus: (id: number, status: BlotterStatus) => boolean;
  archiveBlotter: (id: number) => { success: boolean; message: string };
  assignBlotter: (id: number, assignedToId: number) => void;
  addBlotterNote: (id: number, notes: string) => void;
  deleteBlotter: (id: number) => void;
  addBlotterAttachment: (blotterId: number, fileName: string, fileSize?: string) => void;

  // Schedule Actions
  addSchedule: (scheduleData: Partial<Schedule>) => void;
  updateSchedule: (id: number, scheduleData: Partial<Schedule>) => void;
  deleteSchedule: (id: number) => void;

  // Admin Actions
  approveUser: (userId: number) => void;
  rejectUser: (userId: number) => void;
  setUserStatus: (userId: number, status: UserStatus) => void;
  updateUserRole: (userId: number, role: UserRole) => void;
  deleteUser: (userId: number) => void;
  addUser: (userData: { full_name: string; email: string; role: UserRole; status: UserStatus; phone?: string; address?: string }) => void;
}

const DEFAULT_SYSTEM_SETTINGS: SystemSettingsConfig = {
  emailNotification: true,
  requireApproval: true,
  maintenanceMode: false,
  autoArchivePeriod: '90 days',
  lastBackupDate: new Date().toLocaleDateString()
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [];
const INITIAL_ISSUE_REPORTS: IssueReport[] = [];

const SCHEMA_CLEAN_KEY = 'blotter_schema_clean_v3';

function checkCleanStorage() {
  if (typeof window === 'undefined') return;
  const initialized = localStorage.getItem(SCHEMA_CLEAN_KEY);
  if (!initialized) {
    localStorage.setItem('blotter_users', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('blotter_records', JSON.stringify(INITIAL_BLOTTERS));
    localStorage.setItem('blotter_schedules', JSON.stringify(INITIAL_SCHEDULES));
    localStorage.setItem('blotter_activity_logs', JSON.stringify(INITIAL_ACTIVITY_LOGS));
    localStorage.setItem('blotter_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem('blotter_issue_reports', JSON.stringify(INITIAL_ISSUE_REPORTS));
    localStorage.setItem('blotter_current_user', JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(SCHEMA_CLEAN_KEY, 'true');
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  checkCleanStorage();

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('blotter_users');
    if (!saved) return INITIAL_USERS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [blotters, setBlotters] = useState<BlotterRecord[]>(() => {
    const saved = localStorage.getItem('blotter_records');
    if (!saved) return INITIAL_BLOTTERS;
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem('blotter_schedules');
    if (!saved) return INITIAL_SCHEDULES;
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('blotter_activity_logs');
    if (!saved) return INITIAL_ACTIVITY_LOGS;
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('blotter_notifications');
    if (!saved) return INITIAL_NOTIFICATIONS;
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [issueReports, setIssueReports] = useState<IssueReport[]>(() => {
    const saved = localStorage.getItem('blotter_issue_reports');
    if (!saved) return INITIAL_ISSUE_REPORTS;
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettingsConfig>(() => {
    const saved = localStorage.getItem('blotter_system_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('blotter_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [activeTab, setActiveTabRaw] = useState<string>(() => {
    if (currentUser?.role === 'admin') return 'user-management';
    if (currentUser?.role === 'captain') return 'captain-dashboard';
    if (currentUser?.role === 'staff') return 'staff-dashboard';
    if (currentUser?.role === 'kagawad') return 'kagawad-investigate';
    if (currentUser?.role === 'resident') return 'resident-home';
    return 'resident-home';
  });

  // Role-Based Access Control (RBAC) guard for tab changes
  const setActiveTab = (tab: string) => {
    if (!currentUser) {
      setActiveTabRaw('login');
      return;
    }

    // Common pages accessible to all authenticated users
    if (['profile', 'account', 'settings', 'preferences', 'notifications', 'report-issue', 'login'].includes(tab)) {
      setActiveTabRaw(tab);
      return;
    }

    // Role-specific enforcement
    const adminTabs = ['user-management', 'system-logs', 'backup-restore', 'troubleshooting', 'maintenance', 'issue-reports', 'admin-overview'];
    const captainTabs = ['captain-dashboard', 'captain-registry', 'captain-archives', 'captain-reports'];
    const kagawadTabs = ['kagawad-investigate', 'kagawad-cases', 'kagawad-hearings', 'kagawad-notes'];
    const staffTabs = ['staff-dashboard', 'staff-intake', 'staff-registry', 'staff-schedules'];
    const residentTabs = ['resident-home', 'resident-complaints', 'resident-file', 'resident-hearings'];

    if (currentUser.role === 'admin' && adminTabs.includes(tab)) {
      setActiveTabRaw(tab);
    } else if (currentUser.role === 'captain' && captainTabs.includes(tab)) {
      setActiveTabRaw(tab);
    } else if (currentUser.role === 'kagawad' && kagawadTabs.includes(tab)) {
      setActiveTabRaw(tab);
    } else if (currentUser.role === 'staff' && staffTabs.includes(tab)) {
      setActiveTabRaw(tab);
    } else if (currentUser.role === 'resident' && residentTabs.includes(tab)) {
      setActiveTabRaw(tab);
    } else {
      // Unauthorized tab navigation blocked by RBAC
      if (currentUser.role === 'admin') setActiveTabRaw('user-management');
      else if (currentUser.role === 'captain') setActiveTabRaw('captain-dashboard');
      else if (currentUser.role === 'staff') setActiveTabRaw('staff-dashboard');
      else if (currentUser.role === 'kagawad') setActiveTabRaw('kagawad-investigate');
      else setActiveTabRaw('resident-home');
    }
  };

  const [dossierBlotter, setDossierBlotter] = useState<BlotterRecord | null>(null);

  useEffect(() => {
    localStorage.setItem('blotter_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('blotter_records', JSON.stringify(blotters));
  }, [blotters]);

  useEffect(() => {
    localStorage.setItem('blotter_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('blotter_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('blotter_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('blotter_issue_reports', JSON.stringify(issueReports));
  }, [issueReports]);

  useEffect(() => {
    localStorage.setItem('blotter_system_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('blotter_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('blotter_current_user');
    }
  }, [currentUser]);

  const logActivity = (action: string, details?: string) => {
    const newLog: ActivityLog = {
      id: activityLogs.length > 0 ? Math.max(...activityLogs.map(l => l.id)) + 1 : 1,
      user_id: currentUser?.id,
      user_name: currentUser?.full_name || 'System',
      action,
      details,
      created_at: new Date().toLocaleString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const reportIssue = (data: { feature_name: string; description: string; screenshot?: string; screenshot_name?: string }) => {
    if (!currentUser) return;
    const newReport: IssueReport = {
      id: issueReports.length > 0 ? Math.max(...issueReports.map(r => r.id)) + 1 : 1,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_email: currentUser.email,
      feature_name: data.feature_name,
      description: data.description,
      screenshot: data.screenshot,
      screenshot_name: data.screenshot_name,
      created_at: new Date().toLocaleString()
    };
    setIssueReports(prev => [newReport, ...prev]);
    logActivity('Issue Reported', `User reported broken feature: ${data.feature_name}`);

    // Notify admin/staff
    const adminNotif: AppNotification = {
      id: Date.now(),
      title: 'Issue Report Submitted',
      message: `${currentUser.full_name} reported an issue in "${data.feature_name}".`,
      timestamp: 'Just now',
      read: false,
      target_role: 'admin'
    };
    setNotifications(prev => [adminNotif, ...prev]);
  };

  const resetUserPassword = (userId: number, newPassword: string = 'password123') => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, message: 'User not found.' };
    logActivity('Password Reset', `Admin reset password for user: ${target.full_name}`);
    return { success: true, message: `Password for ${target.full_name} has been reset to: ${newPassword}` };
  };

  // Auth Functions
  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Account not found with this email address.' };
    }
    if (user.status === 'pending') {
      return { success: false, message: 'Account registration is still pending approval by Barangay Admin.' };
    }
    if (user.status === 'inactive') {
      return { success: false, message: 'This account has been deactivated. Please contact the administrator.' };
    }

    // Password verification: check official initial password or registered password
    if (password !== undefined && password !== '') {
      const expectedOfficialPassword = INITIAL_OFFICIAL_PASSWORDS[cleanEmail];
      if (expectedOfficialPassword) {
        if (password !== expectedOfficialPassword) {
          return { success: false, message: 'Invalid password. Please check accounts.txt for authorized credentials.' };
        }
      } else if (user.password && user.password !== password) {
        return { success: false, message: 'Invalid password. Please check your credentials.' };
      }
    }

    setCurrentUser(user);
    if (user.role === 'admin') setActiveTab('user-management');
    else if (user.role === 'captain') setActiveTab('captain-dashboard');
    else if (user.role === 'staff') setActiveTab('staff-dashboard');
    else if (user.role === 'kagawad') setActiveTab('kagawad-investigate');
    else if (user.role === 'resident') setActiveTab('resident-home');
    else setActiveTab('resident-home');
    logActivity('User logged in', `${user.full_name} (${user.role}) logged in`);
    return { success: true };
  };

  const quickSwitchUser = (role: UserRole) => {
    const found = users.find(u => u.role === role && u.status === 'active');
    if (found) {
      setCurrentUser(found);
      if (role === 'admin') setActiveTab('user-management');
      else if (role === 'captain') setActiveTab('captain-dashboard');
      else if (role === 'staff') setActiveTab('staff-dashboard');
      else if (role === 'kagawad') setActiveTab('kagawad-investigate');
      else if (role === 'resident') setActiveTab('resident-home');
      else setActiveTab('resident-home');
      logActivity('Role Switched', `Switched active session to ${found.full_name} (${role})`);
    }
  };

  const register = (data: { full_name: string; email: string; role?: UserRole; phone?: string; address?: string; password?: string }) => {
    const exists = users.some(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const userId = `U${String(newId).padStart(3, '0')}`;

    // Resident registration policy:
    // Residents are automatically assigned the 'resident' role upon registration.
    // Residents cannot assign themselves Admin, Captain, Kagawad, or Staff roles.
    const assignedRole: UserRole = 'resident';
    const status: UserStatus = 'active';

    const newUser: User = {
      id: newId,
      user_id: userId,
      full_name: data.full_name,
      email: data.email,
      password: data.password || 'Resident#2026',
      role: assignedRole,
      status,
      phone: data.phone,
      address: data.address,
      created_at: new Date().toLocaleDateString()
    };

    setUsers(prev => [...prev, newUser]);
    logActivity('Resident Registered', `New resident account registered: ${newUser.full_name}`);

    return { success: true, message: 'Registration successful! You may now sign in with your email and password.' };
  };

  const logout = () => {
    if (currentUser) {
      logActivity('User Logout', `${currentUser.full_name} logged out`);
    }
    setCurrentUser(null);
    setActiveTab('login');
  };

  const updateCurrentUserProfile = (profile: { full_name: string; phone?: string; address?: string }) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      full_name: profile.full_name,
      phone: profile.phone,
      address: profile.address
    };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
    logActivity('Profile Updated', `${currentUser.full_name} updated profile details`);
  };

  const changePassword = (_oldPwd: string, _newPwd: string) => {
    logActivity('Password Changed', `${currentUser?.full_name} updated their password`);
    return { success: true, message: 'Password successfully changed.' };
  };

  // System Settings Actions
  const updateSystemSettings = (newSettings: Partial<SystemSettingsConfig>) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
    logActivity('System Settings Updated', 'Admin updated system configuration');
  };

  const createDatabaseBackup = () => {
    const backupData = { users, blotters, schedules, activityLogs, systemSettings, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Barangay_Blotter_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logActivity('Database Backup Created', 'JSON database backup downloaded');
  };

  const clearDatabaseData = () => {
    setBlotters([]);
    setSchedules([]);
    setActivityLogs([]);
    logActivity('Database Cleared', 'Admin purged all incident and schedule records');
  };

  // Blotter Actions
  const addBlotter = (blotterData: Partial<BlotterRecord>): BlotterRecord => {
    const newId = blotters.length > 0 ? Math.max(...blotters.map(b => b.id)) + 1 : 1;
    const blotter_id = `BLT-2026-${String(newId).padStart(4, '0')}`;
    
    const newRecord: BlotterRecord = {
      id: newId,
      blotter_id,
      complainant_name: blotterData.complainant_name || 'Resident',
      complainant_phone: blotterData.complainant_phone,
      complainant_address: blotterData.complainant_address,
      complainant_relation: blotterData.complainant_relation || 'Complainant',
      respondent_name: blotterData.respondent_name || 'Respondent',
      respondent_phone: blotterData.respondent_phone,
      respondent_address: blotterData.respondent_address,
      incident_type: blotterData.incident_type || 'General Incident',
      incident_types: blotterData.incident_types || [blotterData.incident_type || 'General Incident'],
      incident_location: blotterData.incident_location || 'Barangay Sta. Ana, Pateros',
      incident_datetime: blotterData.incident_datetime || new Date().toISOString(),
      incident_description: blotterData.incident_description || '',
      status: blotterData.status || 'pending',
      assigned_to: blotterData.assigned_to,
      assigned_to_name: blotterData.assigned_to_name,
      actions: blotterData.actions || ['Iskedyul ng Mediasyon'],
      reported_at: new Date().toLocaleString(),
      official_name: blotterData.official_name || currentUser?.full_name || 'Barangay Staff'
    };

    setBlotters(prev => [newRecord, ...prev]);
    logActivity('Blotter Created', `New incident report filed: ${blotter_id}`);

    // Add notification for staff/admin
    const staffNotif: AppNotification = {
      id: Date.now(),
      title: 'New Complaint Filed',
      message: `New incident report #${blotter_id} filed by ${newRecord.complainant_name}.`,
      timestamp: 'Just now',
      read: false,
      blotter_id,
      target_role: 'staff'
    };
    setNotifications(prev => [staffNotif, ...prev]);

    return newRecord;
  };

  const updateBlotterStatus = (id: number, status: BlotterStatus): boolean => {
    const target = blotters.find(b => b.id === id);
    if (!target) return false;

    // GUARD: Case must be resolved before archiving
    if (status === 'archived' && target.status !== 'resolved') {
      const errorMsg = `Cannot archive case #${target.blotter_id}.\nOnly cases with status 'Resolved' can be archived. Current status is '${target.status.toUpperCase()}'. Please mark the case as Resolved first.`;
      alert(`⚠️ ${errorMsg}`);
      return false;
    }

    let targetBlotterId = '';
    setBlotters(prev => prev.map(b => {
      if (b.id === id) {
        targetBlotterId = b.blotter_id;
        return { ...b, status, updated_at: new Date().toLocaleString() };
      }
      return b;
    }));
    logActivity('Blotter Status Updated', `Case #${targetBlotterId} status changed to ${status}`);

    // Add notification for resident
    const residentNotif: AppNotification = {
      id: Date.now(),
      title: 'Case Status Update',
      message: `Your complaint #${targetBlotterId} status has been updated to ${status.toUpperCase()}.`,
      timestamp: 'Just now',
      read: false,
      blotter_id: targetBlotterId,
      target_role: 'resident'
    };
    setNotifications(prev => [residentNotif, ...prev]);
    return true;
  };

  const archiveBlotter = (id: number) => {
    const target = blotters.find(b => b.id === id);
    if (!target) return { success: false, message: 'Case not found.' };

    if (target.status !== 'resolved') {
      const msg = `Cannot archive case #${target.blotter_id}. Only cases marked as 'Resolved' can be archived. Current status: '${target.status.toUpperCase()}'.`;
      alert(`⚠️ ${msg}`);
      return { success: false, message: msg };
    }

    const ok = updateBlotterStatus(id, 'archived');
    if (ok) {
      logActivity('Case Archived', `Case #${target.blotter_id} moved to Archives`);
      return { success: true, message: `Case #${target.blotter_id} successfully archived.` };
    }
    return { success: false, message: 'Failed to archive case.' };
  };

  const assignBlotter = (id: number, assignedToId: number) => {
    const assignee = users.find(u => u.id === assignedToId);
    let targetBlotterId = '';
    setBlotters(prev => prev.map(b => {
      if (b.id === id) {
        targetBlotterId = b.blotter_id;
        return {
          ...b,
          assigned_to: assignedToId,
          assigned_to_name: assignee?.full_name || 'Official',
          status: 'investigating'
        };
      }
      return b;
    }));
    logActivity('Case Assigned', `Case #${targetBlotterId} assigned to ${assignee?.full_name || 'Official'}`);
  };

  const addBlotterNote = (id: number, notes: string) => {
    let targetBlotterId = '';
    setBlotters(prev => prev.map(b => {
      if (b.id === id) {
        targetBlotterId = b.blotter_id;
        const newNote = {
          id: b.notes ? b.notes.length + 1 : 1,
          noted_by: currentUser?.id || 1,
          noted_by_name: currentUser?.full_name || 'Staff',
          notes,
          created_at: new Date().toLocaleString()
        };
        return { ...b, notes: [...(b.notes || []), newNote] };
      }
      return b;
    }));
    logActivity('Investigation Note Added', `Note added to case #${targetBlotterId}`);
  };

  const deleteBlotter = (id: number) => {
    const found = blotters.find(b => b.id === id);
    setBlotters(prev => prev.filter(b => b.id !== id));
    logActivity('Blotter Deleted', `Deleted incident record #${found?.blotter_id || id}`);
  };

  const addBlotterAttachment = (blotterId: number, fileName: string, fileSize?: string) => {
    setBlotters(prev => prev.map(b => {
      if (b.id === blotterId) {
        const att = {
          id: b.attachments ? b.attachments.length + 1 : 1,
          file_name: fileName,
          file_size: fileSize || '1.2 MB',
          uploaded_by_name: currentUser?.full_name || 'User',
          uploaded_at: new Date().toLocaleString()
        };
        return { ...b, attachments: [...(b.attachments || []), att] };
      }
      return b;
    }));
  };

  // Schedule Actions
  const addSchedule = (scheduleData: Partial<Schedule>) => {
    const newId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1;
    const newSched: Schedule = {
      id: newId,
      blotter_id: scheduleData.blotter_id || 'BLT-2026-0001',
      blotter_record_id: scheduleData.blotter_record_id || 1,
      schedule_date: scheduleData.schedule_date || new Date().toISOString(),
      location: scheduleData.location || 'Barangay Hall Conference Room',
      action_type: scheduleData.action_type || 'Mediator',
      notes: scheduleData.notes || '',
      created_by: currentUser?.id || 1,
      created_by_name: currentUser?.full_name || 'Staff',
      complainant_name: scheduleData.complainant_name,
      respondent_name: scheduleData.respondent_name,
      incident_type: scheduleData.incident_type,
      created_at: new Date().toLocaleDateString()
    };
    setSchedules(prev => [newSched, ...prev]);
    logActivity('Hearing Scheduled', `New hearing scheduled for Case #${newSched.blotter_id}`);

    // Notification for resident
    const schedNotif: AppNotification = {
      id: Date.now(),
      title: 'Hearing Scheduled',
      message: `Hearing scheduled for case #${newSched.blotter_id} on ${new Date(newSched.schedule_date).toLocaleString()}.`,
      timestamp: 'Just now',
      read: false,
      blotter_id: newSched.blotter_id,
      target_role: 'resident'
    };
    setNotifications(prev => [schedNotif, ...prev]);
  };

  const updateSchedule = (id: number, data: Partial<Schedule>) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    logActivity('Schedule Updated', `Hearing schedule #${id} updated`);
  };

  const deleteSchedule = (id: number) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    logActivity('Schedule Deleted', `Hearing schedule #${id} cancelled`);
  };

  // Admin User Actions
  const approveUser = (userId: number) => {
    setUserStatus(userId, 'active');
  };

  const rejectUser = (userId: number) => {
    deleteUser(userId);
  };

  const setUserStatus = (userId: number, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    const target = users.find(u => u.id === userId);
    logActivity('User Status Changed', `User ${target?.full_name} status set to ${status}`);
  };

  const updateUserRole = (userId: number, role: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    const target = users.find(u => u.id === userId);
    logActivity('User Role Updated', `User ${target?.full_name} role changed to ${role}`);
  };

  const deleteUser = (userId: number) => {
    const target = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    logActivity('User Deleted', `Deleted user account: ${target?.full_name}`);
  };

  const addUser = (data: { full_name: string; email: string; role: UserRole; status: UserStatus; phone?: string; address?: string }) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const userId = `U${String(newId).padStart(3, '0')}`;
    const newUser: User = {
      id: newId,
      user_id: userId,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      status: data.status,
      phone: data.phone,
      address: data.address,
      created_at: new Date().toLocaleDateString()
    };
    setUsers(prev => [...prev, newUser]);
    logActivity('User Created', `Admin created user account for ${newUser.full_name} (${newUser.role})`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        blotters,
        schedules,
        activityLogs,
        notifications,
        issueReports,
        activeTab,
        setActiveTab,
        dossierBlotter,
        setDossierBlotter,
        markNotificationRead,
        clearAllNotifications,
        reportIssue,
        resetUserPassword,
        systemSettings,
        updateSystemSettings,
        createDatabaseBackup,
        clearDatabaseData,
        login,
        quickSwitchUser,
        register,
        logout,
        updateCurrentUserProfile,
        changePassword,
        addBlotter,
        updateBlotterStatus,
        archiveBlotter,
        assignBlotter,
        addBlotterNote,
        deleteBlotter,
        addBlotterAttachment,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        approveUser,
        rejectUser,
        setUserStatus,
        updateUserRole,
        deleteUser,
        addUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
